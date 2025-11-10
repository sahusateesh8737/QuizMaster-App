# Quick Testing Guide - Live Quiz Feature

## Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:5173`
- Test users created (see below)

---

## Step 1: Create Test Users

```bash
# In terminal, navigate to backend
cd /Users/sateeshsahu/Desktop/quiz/backend

# Open Django shell
python manage.py shell
```

```python
# Create teacher user
from apps.users.models import User

teacher = User.objects.create_user(
    username='teacher1',
    email='teacher@test.com',
    password='teacher123',
    role='teacher',
    first_name='John',
    last_name='Teacher'
)
print(f"Teacher created: {teacher.username}")

# Create student user
student = User.objects.create_user(
    username='student1',
    email='student@test.com',
    password='student123',
    role='student',
    first_name='Jane',
    last_name='Student'
)
print(f"Student created: {student.username}")

exit()
```

---

## Step 2: Teacher Flow Testing

### 2.1 Login as Teacher
1. Go to http://localhost:5173/auth/login
2. Username: `teacher1`
3. Password: `teacher123`
4. Click **Login**

### 2.2 Access Teacher Dashboard
- You should see "Live Quiz" link in navbar
- Click it or navigate to http://localhost:5173/teacher/dashboard
- You should see your quizzes listed

### 2.3 Create Live Session
1. Click **"Go Live"** button on any quiz
2. Configure settings:
   - Adjust time per question slider (default: 30s)
   - Toggle options as desired
3. Click **"Create Session"**
4. **Copy the join code** (e.g., "ABC123")

### 2.4 Control Panel
1. You should see the join code displayed prominently
2. Wait for students to join (participants list will update)
3. Once ready, click **"Start Quiz"**
4. After each question, click **"Next Question"**
5. At any time, you can click **"End Session"**

---

## Step 3: Student Flow Testing

### 3.1 Join Quiz
1. Open a new browser window (incognito mode)
2. Go to http://localhost:5173/join
3. Enter the join code from teacher
4. Enter a nickname (if guest) or login first
5. Click **"Join Session"**

### 3.2 Answer Questions
1. Wait for teacher to start
2. Answer each question before timer expires
3. View leaderboard after each question
4. Continue until quiz ends

---

## Testing Checklist

### ✅ Teacher Features
- [ ] Can access Teacher Dashboard
- [ ] Can create live session
- [ ] Join code is generated
- [ ] Can see participants in real-time
- [ ] Can start/control quiz
- [ ] Can view statistics

### ✅ Student Features
- [ ] Can join with code
- [ ] Can answer questions
- [ ] Timer works correctly
- [ ] Sees leaderboard updates
- [ ] Reaches results page

---

## Quick Commands

```bash
# Start Backend
cd /Users/sateeshsahu/Desktop/quiz/backend
python manage.py runserver

# Start Frontend
cd /Users/sateeshsahu/Desktop/quiz/frontend
npm run dev
```

---

**Test Credentials:**
- Teacher: `teacher1` / `teacher123`
- Student: `student1` / `student123`

**Ready to test! 🚀**
