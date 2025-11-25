# QuizMaster API - Quick Reference Sheet

## 🔗 Base URL
```
http://localhost:8000
```

## 🔐 Authentication
All authenticated endpoints require Bearer token in header:
```
Authorization: Bearer <access_token>
```

---

## 📋 Quick Endpoint List

### 🔑 Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/register/` | POST | No | Register new user |
| `/api/token/` | POST | No | Login (get tokens) |
| `/api/token/refresh/` | POST | No | Refresh access token |

### 👤 Users
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/users/me/` | GET | Yes | Get current user |
| `/api/users/users/` | GET | Optional | List users |
| `/api/users/users/{id}/` | GET/PATCH | Yes | Get/Update user |
| `/api/users/users/change_password/` | POST | Yes | Change password |
| `/api/users/users/leaderboard/` | GET | No | User leaderboard |
| `/api/users/profiles/my_profile/` | GET/PUT | Yes | Get/Update profile |

### 📚 Categories
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/quizzes/initialize-categories/` | POST | No | Initialize categories |
| `/api/quizzes/categories/` | GET | No | List categories |
| `/api/quizzes/categories/{slug}/` | GET | No | Get category |

### 📝 Quizzes
| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/api/quizzes/` | POST | Yes | Teacher | Create quiz |
| `/api/quizzes/` | GET | Optional | All | List quizzes |
| `/api/quizzes/{id}/` | GET | Optional | All | Get quiz |
| `/api/quizzes/{id}/` | PATCH | Yes | Owner | Update quiz |
| `/api/quizzes/{id}/` | DELETE | Yes | Owner | Delete quiz |
| `/api/quizzes/my_quizzes/` | GET | Yes | All | My quizzes |
| `/api/quizzes/popular/` | GET | No | All | Popular quizzes |
| `/api/quizzes/featured/` | GET | No | All | Featured quizzes |
| `/api/quizzes/{id}/analytics/` | GET | Yes | Owner | Quiz analytics |
| `/api/quizzes/{id}/questions/` | POST | Yes | Owner | Add question |

### ✍️ Quiz Attempts
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/quizzes/attempts/` | POST | Yes | Start attempt |
| `/api/quizzes/attempts/` | GET | Yes | List my attempts |
| `/api/quizzes/attempts/{id}/` | GET | Yes | Get attempt |
| `/api/quizzes/attempts/{id}/submit_answer/` | POST | Yes | Submit answer |
| `/api/quizzes/attempts/{id}/complete/` | POST | Yes | Complete attempt |
| `/api/quizzes/attempts/history/` | GET | Yes | Quiz history |

### 🏆 Results
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/results/leaderboard/` | GET | No | Leaderboard |
| `/api/results/leaderboard/global_top/` | GET | No | Global top |
| `/api/results/badges/` | GET | No | User badges |
| `/api/results/statistics/my_statistics/` | GET | Yes | My statistics |
| `/api/results/statistics/recalculate/` | POST | Yes | Recalculate stats |

### 🎮 Live Quiz
| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/api/live/sessions/` | POST | Yes | Teacher | Create session |
| `/api/live/sessions/` | GET | Yes | Teacher | List sessions |
| `/api/live/sessions/{id}/` | GET | No | All | Get session |
| `/api/live/sessions/{id}/start/` | POST | Yes | Host | Start session |
| `/api/live/sessions/{id}/next_question/` | POST | Yes | Host | Next question |
| `/api/live/sessions/{id}/end/` | POST | Yes | Host | End session |
| `/api/live/sessions/{id}/leaderboard/` | GET | No | All | Session leaderboard |
| `/api/live/sessions/{id}/participants/` | GET | No | All | Get participants |
| `/api/live/sessions/{id}/results/` | GET | Yes | Host | Session results |
| `/api/live/sessions/join/` | POST | Optional | All | Join session |
| `/api/live/sessions/verify_code/` | GET | No | All | Verify join code |
| `/api/live/participants/{id}/submit_answer/` | POST | No | All | Submit answer |
| `/api/live/participants/{id}/leave/` | POST | No | All | Leave session |

---

## 📨 Sample Request Bodies

### Register User
```json
{
    "email": "student@example.com",
    "username": "student1",
    "password": "Test@123456",
    "password2": "Test@123456",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
}
```

### Login
```json
{
    "username": "student@example.com",
    "password": "Test@123456"
}
```

### Create Quiz
```json
{
    "title": "Python Basics Quiz",
    "description": "Test your Python knowledge",
    "category": 1,
    "time_limit": 30,
    "pass_percentage": 70,
    "status": "published",
    "shuffle_questions": true,
    "shuffle_answers": true,
    "show_correct_answer": true,
    "tags": ["python", "programming"]
}
```

### Add Question
```json
{
    "text": "What is the output of print(2 ** 3)?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "** is exponentiation operator",
    "order": 1,
    "options": [
        {
            "text": "6",
            "is_correct": false,
            "explanation": "This would be 2 * 3"
        },
        {
            "text": "8",
            "is_correct": true,
            "explanation": "2^3 = 8"
        },
        {
            "text": "9",
            "is_correct": false
        },
        {
            "text": "5",
            "is_correct": false
        }
    ]
}
```

### Start Quiz Attempt
```json
{
    "quiz_id": 1
}
```

### Submit Answer
```json
{
    "question_id": 1,
    "selected_option_id": 2
}
```

### Create Live Session
```json
{
    "quiz": 1,
    "time_per_question": 30,
    "show_leaderboard": true,
    "allow_late_join": true,
    "max_participants": 50
}
```

### Join Live Session
```json
{
    "join_code": "ABC123",
    "nickname": "QuizMaster"
}
```

### Submit Live Answer
```json
{
    "question_id": 1,
    "selected_option_id": 2,
    "time_taken": 15
}
```

### Change Password
```json
{
    "old_password": "Test@123456",
    "new_password": "NewTest@123456",
    "new_password2": "NewTest@123456"
}
```

### Update Profile
```json
{
    "bio": "I love quizzes!",
    "social_links": {
        "twitter": "@johndoe",
        "linkedin": "johndoe"
    },
    "preferences": {
        "theme": "dark",
        "notifications": true
    }
}
```

---

## 🔄 Common Query Parameters

### Filtering
- `?category=1` - Filter by category
- `?status=published` - Filter by status
- `?role=student` - Filter by role

### Search
- `?search=python` - Search in multiple fields

### Ordering
- `?ordering=-created_at` - Order by creation date (desc)
- `?ordering=points` - Order by points (asc)

### Pagination
- `?limit=10` - Limit results
- `?offset=20` - Skip results

### Examples
```
GET /api/quizzes/?category=1&status=published&ordering=-created_at
GET /api/users/users/?role=student&search=john
GET /api/results/leaderboard/global_top/?limit=10
```

---

## 🎯 Response Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Success (DELETE operations) |
| 400 | Bad Request | Validation error or invalid data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## 🛠️ User Roles

| Role | Capabilities |
|------|--------------|
| **student** | Take quizzes, view results, join live sessions |
| **teacher** | All student permissions + create/manage quizzes, host live sessions |
| **admin** | All permissions + manage users |

---

## 🔒 Permission Rules

### Public Endpoints (No Auth)
- List categories
- List published quizzes
- View quiz details
- View leaderboards
- Initialize categories
- Register & Login

### Student Permissions
- Start quiz attempts
- Submit answers
- View own statistics
- Join live quiz sessions
- Update own profile

### Teacher Permissions
- Create/update/delete own quizzes
- Add questions to quizzes
- View quiz analytics
- Create/manage live sessions
- All student permissions

### Admin Permissions
- All operations on all resources
- Manage users
- View all analytics

---

## 💡 Testing Tips

1. **Start with Authentication**
   - Register → Login → Get Token
   - Save token for subsequent requests

2. **Use Collection Variables**
   - IDs auto-populate from responses
   - No manual copying needed

3. **Test in Sequence**
   - Create resources before using them
   - Complete workflows logically

4. **Check Response Bodies**
   - Verify data structure
   - Check for error messages

5. **Test Edge Cases**
   - Invalid data
   - Missing required fields
   - Unauthorized access
   - Non-existent resources

---

## 🚀 Quick Start Commands

```bash
# Start backend
cd backend
python manage.py runserver

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Initialize categories via API
POST /api/quizzes/initialize-categories/
```

---

## 📞 API Root
```
GET http://localhost:8000/
```
Returns available API endpoints overview.

---

## 📖 Documentation
- **Swagger UI**: `http://localhost:8000/api/schema/swagger/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

---

**Last Updated**: November 2025
