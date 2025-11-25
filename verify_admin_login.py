import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Login as admin
login_payload = {
    "username": "admin",
    "password": "password123"
}
try:
    auth_response = requests.post(f"{BASE_URL}/token/", json=login_payload)
    if auth_response.status_code != 200:
        print("Failed to login as admin.")
        exit(1)
        
    token = auth_response.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in as admin.")

    # 2. Get current user details (simulating frontend call)
    user_response = requests.get(f"{BASE_URL}/users/me/", headers=headers)
    if user_response.status_code == 200:
        user_data = user_response.json()
        print("User Data:")
        print(json.dumps(user_data, indent=2))
        
        role = user_data.get('role')
        is_staff = user_data.get('is_staff')
        
        if role == 'admin' or is_staff:
            print("SUCCESS: User has correct admin flags.")
        else:
            print("FAILURE: User missing admin flags.")
    else:
        print(f"FAILURE: Get user failed with {user_response.status_code}")

except Exception as e:
    print(f"Error: {e}")
