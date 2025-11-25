# QuizMaster API - Postman Testing Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Import Collection](#import-collection)
3. [Environment Setup](#environment-setup)
4. [Testing Workflow](#testing-workflow)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Common Test Scenarios](#common-test-scenarios)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Prerequisites
- Postman installed (Desktop or Web)
- Backend server running locally or deployed
- Python/Django environment set up

### Starting the Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if using one)
source venv/bin/activate  # On Mac/Linux
# or
venv\Scripts\activate  # On Windows

# Run migrations
python manage.py migrate

# Create a superuser (optional)
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

The server should now be running at `http://localhost:8000`

---

## 📥 Import Collection

### Method 1: Import JSON File
1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `QuizMaster_API_Collection.postman_collection.json`
5. Click **Import**

### Method 2: Drag & Drop
1. Open Postman
2. Drag the JSON file into Postman window
3. Collection will be automatically imported

---

## ⚙️ Environment Setup

### Collection Variables
The collection includes pre-configured variables:

- `base_url`: `http://localhost:8000` (default)
- `access_token`: Auto-populated after login
- `refresh_token`: Auto-populated after login
- `user_id`: Auto-populated after registration/login
- `quiz_id`: Auto-populated after creating a quiz
- `attempt_id`: Auto-populated after starting a quiz attempt
- `session_id`: Auto-populated after creating live session
- `participant_id`: Auto-populated after joining live session

### Changing Base URL
If your backend is running on a different port or deployed:

1. Click on the collection name
2. Go to **Variables** tab
3. Update `base_url` value (e.g., `https://your-api-domain.com`)
4. Click **Save**

---

## 🔄 Testing Workflow

### Complete Testing Flow

#### Phase 1: Authentication & Setup

1. **Initialize Categories** (Optional)
   - Endpoint: `POST /api/quizzes/initialize-categories/`
   - No authentication required
   - Creates default quiz categories

2. **Register a Student User**
   - Endpoint: `POST /api/users/register/`
   - Body: Email, username, password, role
   - Saves `user_id` automatically

3. **Login to Get Token**
   - Endpoint: `POST /api/token/`
   - Body: Username (email) and password
   - Saves `access_token` and `refresh_token` automatically
   - **IMPORTANT**: All subsequent authenticated requests use this token

4. **Get Current User Profile**
   - Endpoint: `GET /api/users/users/me/`
   - Requires authentication
   - Verify user details

#### Phase 2: Quiz Management (Teacher Role)

5. **Register/Login as Teacher**
   - Create another user with `role: "teacher"`
   - Login with teacher credentials

6. **Create a Quiz**
   - Endpoint: `POST /api/quizzes/`
   - Requires authentication (teacher/admin)
   - Saves `quiz_id` automatically

7. **Add Questions to Quiz**
   - Endpoint: `POST /api/quizzes/{quiz_id}/questions/`
   - Add multiple questions with options
   - Mark correct answers

8. **Publish Quiz**
   - Update quiz status to "published"
   - Endpoint: `PATCH /api/quizzes/{quiz_id}/`

#### Phase 3: Taking Quizzes (Student Role)

9. **List Available Quizzes**
   - Endpoint: `GET /api/quizzes/`
   - Browse published quizzes

10. **Start Quiz Attempt**
    - Endpoint: `POST /api/quizzes/attempts/`
    - Body: `quiz_id`
    - Saves `attempt_id` automatically

11. **Submit Answers**
    - Endpoint: `POST /api/quizzes/attempts/{attempt_id}/submit_answer/`
    - Submit for each question
    - Body: `question_id` and `selected_option_id`

12. **Complete Quiz**
    - Endpoint: `POST /api/quizzes/attempts/{attempt_id}/complete/`
    - Calculates final score
    - Awards points if passed

#### Phase 4: Results & Statistics

13. **View My Statistics**
    - Endpoint: `GET /api/results/statistics/my_statistics/`
    - See personal performance metrics

14. **Check Leaderboard**
    - Endpoint: `GET /api/results/leaderboard/global_top/`
    - See top performers

#### Phase 5: Live Quiz (Optional)

15. **Create Live Session** (Teacher)
    - Endpoint: `POST /api/live/sessions/`
    - Body: `quiz_id`, settings
    - Saves `session_id` and displays `join_code`

16. **Start Live Session** (Teacher)
    - Endpoint: `POST /api/live/sessions/{session_id}/start/`

17. **Join Session** (Student)
    - Endpoint: `POST /api/live/sessions/join/`
    - Body: `join_code`, `nickname` (optional)
    - Saves `participant_id`

18. **Submit Live Answers** (Student)
    - Endpoint: `POST /api/live/participants/{participant_id}/submit_answer/`
    - Submit answers with time tracking

19. **View Live Leaderboard**
    - Endpoint: `GET /api/live/sessions/{session_id}/leaderboard/`
    - Real-time rankings

20. **End Session** (Teacher)
    - Endpoint: `POST /api/live/sessions/{session_id}/end/`

---

## 📚 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/users/register/` | No | Register new user |
| POST | `/api/token/` | No | Login & get JWT tokens |
| POST | `/api/token/refresh/` | No | Refresh access token |

### User Management

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/users/users/me/` | Yes | Get current user profile |
| GET | `/api/users/users/` | Optional | List all users |
| GET | `/api/users/users/{id}/` | Optional | Get user by ID |
| PATCH | `/api/users/users/{id}/` | Yes | Update user |
| POST | `/api/users/users/change_password/` | Yes | Change password |
| GET | `/api/users/users/leaderboard/` | No | Get user leaderboard |
| GET | `/api/users/profiles/my_profile/` | Yes | Get my profile |
| PUT | `/api/users/profiles/my_profile/` | Yes | Update my profile |

### Categories

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/quizzes/initialize-categories/` | No | Initialize default categories |
| GET | `/api/quizzes/categories/` | No | List all categories |
| GET | `/api/quizzes/categories/{slug}/` | No | Get category by slug |

### Quizzes

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/quizzes/` | Yes (Teacher) | Create quiz |
| GET | `/api/quizzes/` | Optional | List quizzes |
| GET | `/api/quizzes/{id}/` | Optional | Get quiz details |
| PATCH | `/api/quizzes/{id}/` | Yes (Owner) | Update quiz |
| DELETE | `/api/quizzes/{id}/` | Yes (Owner) | Delete quiz |
| GET | `/api/quizzes/my_quizzes/` | Yes | Get my created quizzes |
| GET | `/api/quizzes/popular/` | No | Get popular quizzes |
| GET | `/api/quizzes/featured/` | No | Get featured quizzes |
| GET | `/api/quizzes/{id}/analytics/` | Yes (Owner) | Get quiz analytics |
| POST | `/api/quizzes/{id}/questions/` | Yes (Owner) | Add question to quiz |

### Quiz Attempts

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/quizzes/attempts/` | Yes | Start quiz attempt |
| GET | `/api/quizzes/attempts/` | Yes | List my attempts |
| GET | `/api/quizzes/attempts/{id}/` | Yes | Get attempt details |
| POST | `/api/quizzes/attempts/{id}/submit_answer/` | Yes | Submit answer |
| POST | `/api/quizzes/attempts/{id}/complete/` | Yes | Complete attempt |
| GET | `/api/quizzes/attempts/history/` | Yes | Get quiz history |

### Results & Statistics

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/results/leaderboard/` | No | Get leaderboard |
| GET | `/api/results/leaderboard/global_top/` | No | Get global top scorers |
| GET | `/api/results/badges/` | No | Get user badges |
| GET | `/api/results/statistics/my_statistics/` | Yes | Get my statistics |
| POST | `/api/results/statistics/recalculate/` | Yes | Recalculate statistics |

### Live Quiz

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/live/sessions/` | Yes (Teacher) | Create live session |
| GET | `/api/live/sessions/` | Yes | List sessions |
| GET | `/api/live/sessions/{id}/` | No | Get session details |
| POST | `/api/live/sessions/{id}/start/` | Yes (Host) | Start session |
| POST | `/api/live/sessions/{id}/next_question/` | Yes (Host) | Next question |
| POST | `/api/live/sessions/{id}/end/` | Yes (Host) | End session |
| GET | `/api/live/sessions/{id}/leaderboard/` | No | Get session leaderboard |
| GET | `/api/live/sessions/{id}/participants/` | No | Get participants |
| GET | `/api/live/sessions/{id}/results/` | Yes (Host) | Get results |
| POST | `/api/live/sessions/join/` | Optional | Join session |
| GET | `/api/live/sessions/verify_code/` | No | Verify join code |
| POST | `/api/live/participants/{id}/submit_answer/` | No | Submit live answer |
| POST | `/api/live/participants/{id}/leave/` | No | Leave session |

---

## 🧪 Common Test Scenarios

### Scenario 1: Student Takes a Quiz

```
1. Register as student
2. Login to get token
3. List available quizzes (GET /api/quizzes/)
4. Start quiz attempt (POST /api/quizzes/attempts/)
5. For each question:
   - Submit answer (POST /api/quizzes/attempts/{id}/submit_answer/)
6. Complete quiz (POST /api/quizzes/attempts/{id}/complete/)
7. View results (GET /api/quizzes/attempts/{id}/)
8. Check updated statistics (GET /api/results/statistics/my_statistics/)
```

### Scenario 2: Teacher Creates and Publishes Quiz

```
1. Register as teacher
2. Login to get token
3. Create quiz (POST /api/quizzes/) - Status: "draft"
4. Add multiple questions (POST /api/quizzes/{id}/questions/)
5. Update quiz status to "published" (PATCH /api/quizzes/{id}/)
6. View quiz analytics (GET /api/quizzes/{id}/analytics/)
```

### Scenario 3: Live Quiz Session

```
Teacher:
1. Login as teacher
2. Create live session (POST /api/live/sessions/)
3. Note the join_code from response
4. Start session (POST /api/live/sessions/{id}/start/)
5. Move through questions (POST /api/live/sessions/{id}/next_question/)
6. End session (POST /api/live/sessions/{id}/end/)

Student:
1. Verify join code (GET /api/live/sessions/verify_code/?code=ABC123)
2. Join session (POST /api/live/sessions/join/)
3. Submit answers (POST /api/live/participants/{id}/submit_answer/)
4. View leaderboard (GET /api/live/sessions/{id}/leaderboard/)
```

### Scenario 4: Authentication Flow

```
1. Register user (POST /api/users/register/)
2. Login (POST /api/token/) - Get access & refresh tokens
3. Access protected endpoint (use Bearer token in header)
4. When token expires: Refresh token (POST /api/token/refresh/)
5. Continue accessing endpoints with new token
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "401 Unauthorized" Error
**Problem**: Access token is missing or expired

**Solutions**:
- Run the "Login (Get Token)" request again
- Check if `access_token` variable is set
- Use "Refresh Token" endpoint to get new access token
- Ensure Bearer token is in Authorization header

#### 2. "403 Forbidden" Error
**Problem**: User doesn't have permission

**Solutions**:
- Check user role (student/teacher/admin)
- Some endpoints require teacher/admin role
- Verify you're the owner of the resource (quiz, attempt, etc.)

#### 3. "404 Not Found" Error
**Problem**: Resource doesn't exist or wrong ID

**Solutions**:
- Verify the ID in the URL (quiz_id, attempt_id, etc.)
- Check if variables are properly set
- Ensure resource was created successfully

#### 4. "400 Bad Request" Error
**Problem**: Invalid data in request body

**Solutions**:
- Check request body format (JSON)
- Verify all required fields are present
- Check field types (string, number, boolean)
- Review validation error messages in response

#### 5. Server Not Responding
**Problem**: Backend server is not running

**Solutions**:
```bash
cd backend
python manage.py runserver
```
- Check server logs for errors
- Verify database migrations are applied
- Check if port 8000 is available

#### 6. CORS Errors
**Problem**: Cross-origin request blocked

**Solutions**:
- Ensure CORS is configured in Django settings
- Add frontend URL to `CORS_ALLOWED_ORIGINS`
- Check if `django-cors-headers` is installed

#### 7. Database Errors
**Problem**: Database tables don't exist

**Solutions**:
```bash
python manage.py migrate
python manage.py makemigrations
python manage.py migrate
```

---

## 📝 Testing Best Practices

### 1. Use Collection Variables
- Variables auto-populate IDs after creation
- No need to manually copy/paste IDs
- Maintains test flow consistency

### 2. Test in Order
- Follow the logical workflow
- Authentication → Setup → CRUD Operations → Cleanup
- Some requests depend on previous ones

### 3. Check Response Status
- 200: Success
- 201: Created
- 204: No Content (Success for DELETE)
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

### 4. Review Response Body
- Check returned data structure
- Verify auto-generated fields (id, timestamps)
- Look for error messages in failed requests

### 5. Clean Up Test Data
- Delete test quizzes after testing
- Remove test user accounts if needed
- Reset database between major test runs

---

## 🎯 Quick Start Checklist

- [ ] Backend server running (`python manage.py runserver`)
- [ ] Postman collection imported
- [ ] Base URL configured (`http://localhost:8000`)
- [ ] Categories initialized (run Initialize Categories)
- [ ] Student user registered and logged in
- [ ] Teacher user registered and logged in
- [ ] Test quiz created with questions
- [ ] Quiz attempt completed successfully
- [ ] Live session tested
- [ ] API documentation reviewed

---

## 📖 Additional Resources

- **Django REST Framework Docs**: https://www.django-rest-framework.org/
- **JWT Authentication**: https://django-rest-framework-simplejwt.readthedocs.io/
- **Postman Learning Center**: https://learning.postman.com/
- **Backend README**: See `backend/README.md`

---

## 🆘 Support

If you encounter issues:
1. Check server logs in terminal
2. Review Django error messages
3. Verify database migrations
4. Check Postman console for request/response details
5. Review this guide's troubleshooting section

---

**Happy Testing! 🚀**
