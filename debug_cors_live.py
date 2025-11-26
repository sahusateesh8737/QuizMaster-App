import requests

BACKEND_URL = "https://quiz-master-app-swart.vercel.app"
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
    print("--- Testing Root (/) ---")
    test_cors("/", "GET")
    test_cors("/", "OPTIONS")

    print("\n--- Testing Signin (Token) ---")
    test_cors("/api/token/", "OPTIONS")
    test_cors("/api/token/", "POST")
    
    print("\n--- Testing Signup (Register) ---")
    test_cors("/api/users/register/", "OPTIONS")
    test_cors("/api/users/register/", "POST")
