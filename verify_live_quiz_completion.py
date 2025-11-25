import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Login as teacher
login_payload = {
    "username": "testteacher",
    "password": "password123"
}
try:
    auth_response = requests.post(f"{BASE_URL}/token/", json=login_payload)
    if auth_response.status_code != 200:
        print("Failed to login as teacher. Creating new teacher...")
        # Create teacher if not exists (handling the case where previous debug script didn't run or DB was flushed)
        reg_payload = {
            "username": "testteacher",
            "first_name": "Test",
            "last_name": "Teacher",
            "email": "teacher@example.com",
            "password": "password123",
            "password2": "password123",
            "role": "teacher"
        }
        requests.post(f"{BASE_URL}/users/register/", json=reg_payload)
        auth_response = requests.post(f"{BASE_URL}/token/", json=login_payload)
        
    token = auth_response.json()['access']
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a Quiz (needed for session)
    quiz_payload = {
        "title": "Test Quiz for Live Session",
        "description": "Testing completion visibility",
        "status": "published"
    }
    quiz_response = requests.post(f"{BASE_URL}/quizzes/", json=quiz_payload, headers=headers)
    quiz_id = quiz_response.json()['id']

    # 3. Create a Live Session
    session_payload = {
        "quiz": quiz_id
    }
    session_response = requests.post(f"{BASE_URL}/live/sessions/", json=session_payload, headers=headers)
    session_id = session_response.json()['id']
    print(f"Created Session ID: {session_id}")

    # 4. End the session (mark as completed)
    # We need to start it first usually, but let's see if we can just end it or force update it
    # The 'end' endpoint requires it to be started? Let's check views.py... 
    # views.py says: if session.status == 'completed': return error.
    # It doesn't explicitly require 'in_progress' to call end(), but logically it should be.
    # Let's just force update it via PATCH if possible, or go through the flow.
    # The viewset allows partial_update for teacher.
    
    patch_payload = {"status": "completed"}
    requests.patch(f"{BASE_URL}/live/sessions/{session_id}/", json=patch_payload, headers=headers)
    print("Marked session as completed.")

    # 5. Try to fetch as GUEST (no headers)
    print("Attempting to fetch session as guest...")
    guest_response = requests.get(f"{BASE_URL}/live/sessions/{session_id}/")
    
    print(f"Guest Fetch Status: {guest_response.status_code}")
    if guest_response.status_code == 200:
        print("SUCCESS: Completed session is visible to guest.")
    else:
        print("FAILURE: Completed session is NOT visible to guest.")
        print(guest_response.text)

except Exception as e:
    print(f"Error: {e}")
