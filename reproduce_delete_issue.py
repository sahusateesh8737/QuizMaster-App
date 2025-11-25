import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def ensure_admin():
    login_payload = {
        "username": "admin",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/token/", json=login_payload)
    
    if response.status_code != 200:
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
        response = requests.post(f"{BASE_URL}/token/", json=login_payload)
        
    if response.status_code != 200:
        print("Failed to login as admin even after creation attempt.")
        exit(1)
        
    return response.json()['access']

def create_user(token, username):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "username": username,
        "first_name": "Test",
        "last_name": "User",
        "email": f"{username}@example.com",
        "password": "password123",
        "password2": "password123",
        "role": "student"
    }
    response = requests.post(f"{BASE_URL}/users/register/", json=payload)
    if response.status_code == 201:
        return response.json()['user']['id']
    elif response.status_code == 400 and "already exists" in response.text:
        # Try to find user
        response = requests.get(f"{BASE_URL}/users/?search={username}", headers=headers)
        if response.json():
            return response.json()[0]['id']
    print(f"Failed to create user {username}: {response.text}")
    return None

def delete_user(token, user_id):
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Deleting user {user_id}...")
    response = requests.delete(f"{BASE_URL}/users/{user_id}/", headers=headers)
    if response.status_code == 204:
        print(f"SUCCESS: User {user_id} deleted.")
        return True
    else:
        print(f"FAILURE: Failed to delete user {user_id}. Status: {response.status_code}")
        print(response.text)
        return False

# Main execution
token = ensure_admin()
print("Logged in as admin.")

user1_id = create_user(token, "delete_test_1")
user2_id = create_user(token, "delete_test_2")

if user1_id and user2_id:
    print(f"Created users: {user1_id}, {user2_id}")
    
    if delete_user(token, user1_id):
        print("First deletion successful. Waiting 1 second...")
        time.sleep(1)
        if delete_user(token, user2_id):
            print("Second deletion successful.")
        else:
            print("Second deletion FAILED.")
    else:
        print("First deletion FAILED.")
else:
    print("Failed to create test users.")
