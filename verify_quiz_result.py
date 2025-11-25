import requests
import json

BASE_URL = "http://localhost:8000/api"

# 1. Login as teacher (to create quiz)
login_payload = {
    "username": "testteacher",
    "password": "password123"
}
try:
    auth_response = requests.post(f"{BASE_URL}/token/", json=login_payload)
    token = auth_response.json()['access']
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a Quiz
    quiz_payload = {
        "title": "Test Quiz for Results",
        "description": "Testing total questions count",
        "status": "published"
    }
    quiz_response = requests.post(f"{BASE_URL}/quizzes/", json=quiz_payload, headers=headers)
    quiz_id = quiz_response.json()['id']
    print(f"Created Quiz ID: {quiz_id}")

    # 3. Add 3 Questions
    for i in range(3):
        q_payload = {
            "text": f"Question {i+1}",
            "type": "mcq",
            "options": [
                {"text": "Option A", "is_correct": True},
                {"text": "Option B", "is_correct": False}
            ]
        }
        requests.post(f"{BASE_URL}/quizzes/{quiz_id}/questions/", json=q_payload, headers=headers)
    
    print("Added 3 questions.")

    # 4. Start Attempt
    attempt_response = requests.post(f"{BASE_URL}/quizzes/{quiz_id}/attempts/", headers=headers)
    attempt_id = attempt_response.json()['id']
    print(f"Started Attempt ID: {attempt_id}")

    # 5. Submit only 1 answer (incomplete)
    # We don't need to submit answers to check the total_questions field in the attempt detail
    # But let's submit one to simulate the user scenario
    
    # 6. Complete Attempt
    # We can't complete via API if we haven't answered? 
    # The complete endpoint doesn't enforce answering all questions.
    requests.post(f"{BASE_URL}/quizzes/attempts/{attempt_id}/complete/", headers=headers)
    print("Completed attempt.")

    # 7. Fetch Attempt Result
    result_response = requests.get(f"{BASE_URL}/quizzes/attempts/{attempt_id}/", headers=headers)
    result_data = result_response.json()
    
    total_questions = result_data.get('total_questions')
    answers_count = len(result_data.get('answers', []))
    
    print(f"Total Questions (from API): {total_questions}")
    print(f"Answers Count: {answers_count}")
    
    if total_questions == 3:
        print("SUCCESS: Total questions count is correct.")
    else:
        print(f"FAILURE: Expected 3 total questions, got {total_questions}")

except Exception as e:
    print(f"Error: {e}")
