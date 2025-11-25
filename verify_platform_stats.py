import requests
import json

url = "http://localhost:8000/api/users/platform-stats/"

try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
        print("SUCCESS: Platform stats endpoint is working.")
    else:
        print("FAILURE: Platform stats endpoint returned error.")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
