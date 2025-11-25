import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Login as admin (assuming 'admin' user exists, if not create one)
login_payload = {
    "username": "admin",
    "password": "password123"
}
try:
    auth_response = requests.post(f"{BASE_URL}/token/", json=login_payload)
    
    if auth_response.status_code != 200:
        print("Admin user not found or login failed. Creating admin user...")
        # Create admin user
        reg_payload = {
            "username": "admin",
            "first_name": "Admin",
            "last_name": "User",
            "email": "admin@example.com",
            "password": "password123",
            "password2": "password123",
            "role": "admin"
        }
        requests.post(f"{BASE_URL}/users/register/", json=reg_payload)
        auth_response = requests.post(f"{BASE_URL}/token/", json=login_payload)
        
    token = auth_response.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    print("Logged in as admin.")

    # 2. Verify Platform Stats (Overview Tab)
    stats_response = requests.get(f"{BASE_URL}/users/platform-stats/", headers=headers)
    if stats_response.status_code == 200:
        print("SUCCESS: Platform stats accessible.")
        print(json.dumps(stats_response.json(), indent=2))
    else:
        print(f"FAILURE: Platform stats failed with {stats_response.status_code}")

    # 3. Verify Users List (Users Tab)
    users_response = requests.get(f"{BASE_URL}/users/", headers=headers)
    if users_response.status_code == 200:
        print("SUCCESS: Users list accessible.")
        print(f"Count: {len(users_response.json())}")
    else:
        print(f"FAILURE: Users list failed with {users_response.status_code}")

    # 4. Verify Quizzes List (Quizzes Tab)
    quizzes_response = requests.get(f"{BASE_URL}/quizzes/", headers=headers)
    if quizzes_response.status_code == 200:
        print("SUCCESS: Quizzes list accessible.")
        print(f"Count: {len(quizzes_response.json())}")
    else:
        print(f"FAILURE: Quizzes list failed with {quizzes_response.status_code}")

except Exception as e:
    print(f"Error: {e}")
