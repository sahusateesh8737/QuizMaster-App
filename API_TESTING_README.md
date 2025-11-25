# 🎯 QuizMaster API Testing - Complete Package

## 📦 What's Included

This package contains everything you need to thoroughly test all backend APIs for the QuizMaster application using Postman.

### Files Included:

1. **QuizMaster_API_Collection.postman_collection.json**
   - Complete Postman collection with 60+ API requests
   - Organized into logical folders
   - Auto-population of IDs through test scripts
   - Bearer token authentication configured

2. **POSTMAN_TESTING_GUIDE.md**
   - Comprehensive step-by-step testing guide
   - Detailed workflow instructions
   - Troubleshooting section
   - Best practices

3. **API_QUICK_REFERENCE.md**
   - Quick lookup for all endpoints
   - Sample request bodies
   - Query parameters guide
   - Response codes reference

4. **SAMPLE_TEST_DATA.md**
   - Ready-to-use test data
   - Complete sample quizzes with questions
   - Multiple user profiles
   - Common test scenarios

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Backend Server
```bash
cd backend
python manage.py runserver
```

### Step 2: Import Postman Collection
1. Open Postman
2. Click **Import** → Select `QuizMaster_API_Collection.postman_collection.json`
3. Collection appears in left sidebar

### Step 3: Initialize System
Run these requests in order:
1. **Initialize Categories** (API Documentation folder)
2. **Register User** (Authentication folder) - Creates a student
3. **Login (Get Token)** (Authentication folder) - Auto-saves token

### Step 4: Start Testing!
- Token is automatically included in all authenticated requests
- IDs are automatically saved (quiz_id, attempt_id, etc.)
- Follow any workflow from the testing guide

---

## 📚 API Endpoints Summary

### Total Endpoints: 60+

**By Category:**
- 🔐 Authentication: 3 endpoints
- 👤 Users: 9 endpoints  
- 📚 Categories: 3 endpoints
- 📝 Quizzes: 10 endpoints
- ✍️ Quiz Attempts: 6 endpoints
- 🏆 Results & Statistics: 5 endpoints
- 🎮 Live Quiz: 13 endpoints
- 📖 Documentation: 3 endpoints

---

## 🎯 Common Testing Workflows

### Workflow 1: Student Takes Quiz (5-10 min)
```
Register → Login → Browse Quizzes → Start Attempt → 
Submit Answers → Complete Quiz → View Results → Check Statistics
```

**Endpoints Used:**
1. POST `/api/users/register/`
2. POST `/api/token/`
3. GET `/api/quizzes/`
4. POST `/api/quizzes/attempts/`
5. POST `/api/quizzes/attempts/{id}/submit_answer/` (×5)
6. POST `/api/quizzes/attempts/{id}/complete/`
7. GET `/api/results/statistics/my_statistics/`

### Workflow 2: Teacher Creates Quiz (10-15 min)
```
Register as Teacher → Login → Initialize Categories → 
Create Quiz → Add Questions → Publish → View Analytics
```

**Endpoints Used:**
1. POST `/api/users/register/` (role: teacher)
2. POST `/api/token/`
3. POST `/api/quizzes/initialize-categories/`
4. POST `/api/quizzes/`
5. POST `/api/quizzes/{id}/questions/` (×5)
6. PATCH `/api/quizzes/{id}/` (set status: published)
7. GET `/api/quizzes/{id}/analytics/`

### Workflow 3: Live Quiz Session (15-20 min)
```
Teacher: Create Session → Start Session → Control Questions → End Session
Student: Join Session → Answer Questions → View Leaderboard
```

**Endpoints Used:**
1. POST `/api/live/sessions/` (Teacher)
2. POST `/api/live/sessions/{id}/start/` (Teacher)
3. POST `/api/live/sessions/join/` (Student)
4. POST `/api/live/participants/{id}/submit_answer/` (Student)
5. GET `/api/live/sessions/{id}/leaderboard/` (Anyone)
6. POST `/api/live/sessions/{id}/next_question/` (Teacher)
7. POST `/api/live/sessions/{id}/end/` (Teacher)

---

## 🔑 Authentication Flow

### How It Works:
1. **Register** → Creates user account
2. **Login** → Returns `access_token` and `refresh_token`
3. **Auto-Save** → Tokens saved as collection variables
4. **Auto-Use** → All authenticated endpoints automatically use token
5. **Refresh** → When expired, use refresh endpoint to get new token

### Token Configuration:
- Collection uses **Bearer token** authentication
- Token variable: `{{access_token}}`
- Automatically included in Authorization header
- No manual token management needed!

---

## 📊 Complete Feature Coverage

### ✅ Authentication & Authorization
- [x] User registration (student/teacher/admin roles)
- [x] JWT token-based authentication
- [x] Token refresh mechanism
- [x] Role-based access control
- [x] Email verification

### ✅ User Management
- [x] User profiles (CRUD)
- [x] Password management
- [x] User leaderboard
- [x] Search and filter users
- [x] User statistics

### ✅ Quiz Management
- [x] Create/Read/Update/Delete quizzes
- [x] Quiz categories
- [x] Questions with multiple choice options
- [x] Quiz settings (time limit, pass percentage, etc.)
- [x] Quiz analytics
- [x] Popular and featured quizzes
- [x] Search and filter quizzes

### ✅ Quiz Taking
- [x] Start quiz attempts
- [x] Submit answers
- [x] Complete attempts with scoring
- [x] View attempt history
- [x] Resume in-progress attempts
- [x] Time tracking

### ✅ Results & Leaderboards
- [x] Quiz-specific leaderboards
- [x] Global leaderboards
- [x] User badges
- [x] Detailed statistics
- [x] Performance analytics

### ✅ Live Quiz Features
- [x] Create live sessions
- [x] Join with code
- [x] Real-time participation
- [x] Live leaderboards
- [x] Question control (next/previous)
- [x] Session management
- [x] Participant tracking
- [x] Time-based scoring

---

## 🛠️ Collection Features

### Auto-Population Scripts
The collection includes JavaScript test scripts that automatically:
- Save `user_id` after registration
- Save `access_token` and `refresh_token` after login
- Save `quiz_id` after creating a quiz
- Save `attempt_id` after starting an attempt
- Save `session_id` after creating a live session
- Save `participant_id` after joining a session

### No Manual Work Needed!
```javascript
// Example: Auto-save after login
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('access_token', response.access);
    pm.collectionVariables.set('refresh_token', response.refresh);
}
```

### Collection Variables
```
base_url         → http://localhost:8000
access_token     → Auto-populated
refresh_token    → Auto-populated
user_id          → Auto-populated
quiz_id          → Auto-populated
attempt_id       → Auto-populated
session_id       → Auto-populated
participant_id   → Auto-populated
```

---

## 📖 Documentation Access

### Built-in API Documentation:
- **API Root**: `http://localhost:8000/`
- **Swagger UI**: `http://localhost:8000/api/schema/swagger/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

### Included in Collection:
- Endpoint in "API Documentation" folder
- View interactive API documentation
- Test directly from Swagger UI

---

## 🎓 Testing Best Practices

### 1. Start Simple
- Begin with authentication endpoints
- Test user registration and login
- Verify token is saved correctly

### 2. Follow Workflows
- Use the documented workflows
- Test in logical sequences
- Complete full user journeys

### 3. Test Edge Cases
- Invalid credentials
- Missing required fields
- Unauthorized access attempts
- Non-existent resources
- Expired tokens

### 4. Verify Responses
- Check status codes (200, 201, 400, 401, 403, 404)
- Review response bodies
- Verify data structure
- Check error messages

### 5. Clean Up
- Delete test resources when done
- Reset database if needed
- Clear collection variables if starting fresh

---

## 🐛 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Re-login to refresh token |
| 403 Forbidden | Check user role/permissions |
| 404 Not Found | Verify resource ID exists |
| 400 Bad Request | Check request body format |
| Server not responding | Ensure backend is running (`python manage.py runserver`) |
| Variables not saving | Check test scripts in request |
| CORS errors | Configure Django CORS settings |

---

## 📈 Testing Statistics

With this collection, you can test:
- **60+ API endpoints** across 8 categories
- **5 complete user workflows** from start to finish
- **3 user roles** with different permissions
- **4 sample quizzes** with 15+ questions
- **Multiple test scenarios** for comprehensive coverage

---

## 🎯 What to Test

### Priority 1: Core Functionality
1. ✅ User authentication (register, login, token refresh)
2. ✅ Quiz creation and management
3. ✅ Quiz taking (start, answer, complete)
4. ✅ Results and scoring
5. ✅ Basic leaderboards

### Priority 2: Advanced Features
6. ✅ Live quiz sessions
7. ✅ User statistics and analytics
8. ✅ Quiz analytics for teachers
9. ✅ Badge system
10. ✅ Search and filtering

### Priority 3: Edge Cases
11. ✅ Permission checks
12. ✅ Validation errors
13. ✅ Invalid data handling
14. ✅ Resource not found scenarios
15. ✅ Concurrent operations

---

## 🎉 Success Checklist

After completing testing, you should have:
- [ ] Registered multiple users (students and teachers)
- [ ] Created at least 2-3 quizzes with questions
- [ ] Completed quiz attempts with different scores
- [ ] Viewed leaderboards and statistics
- [ ] Created and completed a live quiz session
- [ ] Tested all CRUD operations
- [ ] Verified permission controls
- [ ] Checked error handling
- [ ] Reviewed all documentation endpoints

---

## 📞 Need Help?

1. **Check the Testing Guide**: `POSTMAN_TESTING_GUIDE.md`
2. **Review Quick Reference**: `API_QUICK_REFERENCE.md`
3. **Use Sample Data**: `SAMPLE_TEST_DATA.md`
4. **Check Server Logs**: Backend terminal output
5. **View API Docs**: Swagger UI at `/api/schema/swagger/`

---

## 🚀 Next Steps

After testing the API:
1. ✅ Document any bugs or issues found
2. ✅ Create test reports
3. ✅ Test with frontend integration
4. ✅ Perform load testing
5. ✅ Set up automated testing
6. ✅ Deploy to staging environment

---

## 📝 Notes

- All test data uses dummy information
- Passwords meet security requirements
- Collection works with default Django settings
- Can be adapted for production environment
- Includes complete error handling tests

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Backend Framework**: Django REST Framework  
**Authentication**: JWT (Simple JWT)

---

## 🎊 Happy Testing!

You now have everything needed to thoroughly test the QuizMaster backend API. Start with the Quick Start section and follow the workflows in the testing guide. All endpoints are documented, organized, and ready to use!

**Questions?** Refer to the detailed guides or check the API documentation endpoints.

---

**Made with ❤️ for comprehensive API testing**
