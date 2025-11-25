import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Ensure admin exists
login_payload = {
    "username": "admin",
    "password": "password123"
}
auth_response = requests.post(f"{BASE_URL}/token/", json=login_payload)

if auth_response.status_code != 200:
    print("Admin user not found. Creating admin user...")
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
    # Try login again
    auth_response = requests.post(f"{BASE_URL}/token/", json=login_payload)

if auth_response.status_code != 200:
    print("Failed to login as admin even after creation attempt.")
    print(auth_response.text)
    exit(1)
    
token = auth_response.json()['access']
headers = {"Authorization": f"Bearer {token}"}
print("Logged in as admin.")

# 2. Create a test user to delete
test_user = {
    "username": "todelete",
    "first_name": "To",
    "last_name": "Delete",
    "email": "todelete@example.com",
    "password": "password123",
    "password2": "password123",
    "role": "student"
}
create_response = requests.post(f"{BASE_URL}/users/register/", json=test_user)
if create_response.status_code == 201:
    user_id = create_response.json()['user']['id']
    print(f"Created test user with ID: {user_id}")
else:
    # User might already exist, try to find it
    print("User might already exist, trying to find...")
    users_response = requests.get(f"{BASE_URL}/users/?search=todelete", headers=headers)
    if users_response.json():
            user_id = users_response.json()[0]['id']
            print(f"Found existing test user ID: {user_id}")
    else:
        print("Could not create or find test user.")
        exit(1)

# 3. Delete the user
print(f"Attempting to delete user {user_id}...")
delete_response = requests.delete(f"{BASE_URL}/users/{user_id}/", headers=headers)

if delete_response.status_code == 204:
    print("SUCCESS: User deleted successfully.")
else:
    print(f"FAILURE: Delete failed with status {delete_response.status_code}")
    print(delete_response.text)
