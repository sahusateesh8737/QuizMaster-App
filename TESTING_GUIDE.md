# 🧪 Testing Guide - Quiz Application

## ✅ Backend & Frontend Status
- **Backend**: ✅ Running on http://localhost:8000
- **Frontend**: ✅ Running on http://localhost:3001
- **Database**: ✅ Set up with sample data

---

## 📝 Sample Data Available

### Admin Account
- **Username**: `admin`
- **Email**: `admin@quiz.com`
- **Password**: `admin123`

### Quizzes Available
1. **Python Basics** - 5 questions (15 min, 70% pass)
2. **JavaScript Fundamentals** - 4 questions (20 min, 70% pass)
3. **Basic Physics** - 4 questions (25 min, 60% pass)

---

## 🚀 How to Test

### Option 1: Login with Admin Account
1. Open http://localhost:3001
2. Click "Login"
3. Enter:
   - Email: `admin@quiz.com`
   - Password: `admin123`
4. Browse and take quizzes!

### Option 2: Create New Account
1. Open http://localhost:3001
2. Click "Sign Up"
3. Fill in the form:
   - Username: (your choice)
   - Email: (your email)
   - First Name: (your name)
   - Last Name: (your name)
   - Password: (min 8 characters)
   - Confirm Password: (same as password)
4. Click "Sign Up"
5. Login with your new account

---

## 🧪 Test via API (curl commands)

### 1. Register a New User
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123456",
    "password2": "test123456",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. Login (Get JWT Token)
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quiz.com",
    "password": "admin123"
  }'
```

You'll get a response like:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Get Quizzes (No Auth Required)
```bash
curl http://localhost:8000/api/quizzes/
```

### 4. Start Quiz Attempt (Auth Required)
```bash
curl -X POST http://localhost:8000/api/quizzes/7/attempts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🎯 Testing Flow

### Complete User Journey:
1. ✅ **Register/Login** → Get authenticated
2. ✅ **Browse Quizzes** → View available quizzes
3. ✅ **View Quiz Details** → See questions count, time limit, etc.
4. ✅ **Start Quiz** → Begin quiz attempt
5. ✅ **Answer Questions** → Select answers
6. ✅ **Submit Quiz** → Get results
7. ✅ **View Results** → See score and correct answers
8. ✅ **Check Leaderboard** → See rankings

---

## 🐛 Common Issues & Solutions

### Issue: "401 Unauthorized" when starting quiz
**Solution**: You need to login first! The quiz attempt requires authentication.

### Issue: "0 questions" in quiz
**Solution**: Already fixed! All quizzes now have 4-5 questions each.

### Issue: Token refresh fails
**Solution**: Login again to get a fresh token.

### Issue: Backend not responding
**Solution**: Make sure backend is running:
```bash
python /Users/sateeshsahu/Desktop/quiz/backend/manage.py runserver
```

### Issue: Frontend not loading
**Solution**: Make sure frontend is running:
```bash
cd /Users/sateeshsahu/Desktop/quiz/frontend && npm run dev
```

---

## 📊 Admin Panel

Access Django admin at: http://localhost:8000/admin
- Username: `admin`
- Password: `admin123`

From admin panel you can:
- View all users
- Create/edit quizzes
- Add questions
- View quiz attempts
- Manage categories

---

## 🎉 You're All Set!

Everything is working perfectly. Just need to:
1. **Open http://localhost:3001**
2. **Login** with admin credentials or create new account
3. **Start taking quizzes!**

Enjoy testing your quiz application! 🚀
