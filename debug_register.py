import requests
import json

url = "http://localhost:8000/api/users/register/"

payload = {
    "username": "testteacher2",
    "first_name": "Test",
    "last_name": "Teacher",
    "email": "teacher@example.com",
    "password": "password123",
    "password2": "password123",
    "role": "teacher"
}

headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
