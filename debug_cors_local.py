import requests
import time
import sys

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_ORIGIN = "https://quiz-master-app-roh5.vercel.app"

def test_cors(path, method="OPTIONS"):
    url = f"{BACKEND_URL}{path}"
    headers = {
        "Origin": FRONTEND_ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    
    print(f"Testing {method} {url} with Origin: {FRONTEND_ORIGIN}")
    try:
        if method == "OPTIONS":
            response = requests.options(url, headers=headers)
        else:
            response = requests.post(url, headers=headers, json={})
            
        print(f"Status Code: {response.status_code}")
        print("Headers:")
        for k, v in response.headers.items():
            if "access-control" in k.lower():
                print(f"  {k}: {v}")
                
        if "Access-Control-Allow-Origin" not in response.headers:
             print("❌ CORS Header missing!")
        elif response.headers["Access-Control-Allow-Origin"] != FRONTEND_ORIGIN and response.headers["Access-Control-Allow-Origin"] != "*":
             print(f"❌ CORS Header mismatch: {response.headers['Access-Control-Allow-Origin']}")
        else:
             print("✅ CORS Header present and correct.")
             
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)

if __name__ == "__main__":
    # Wait for server to start if run immediately
    print("Waiting for server to be ready...")
    try:
        requests.get(BACKEND_URL)
    except:
        print("Server not reachable yet. Please ensure it is running.")
        # We will try anyway
        
    print("--- Testing Signin (Token) ---")
    test_cors("/api/token/", "OPTIONS")
    
    print("\n--- Testing Signup (Register) ---")
    test_cors("/api/users/register/", "OPTIONS")
