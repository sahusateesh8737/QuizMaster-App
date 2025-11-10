# Live Quiz Feature Implementation Guide

## ✅ Backend Complete!

### Models Created:
- `LiveQuizSession` - Main session with join code
- `LiveQuizParticipant` - Students in session
- `LiveQuizAnswer` - Student answers with timing
- `LiveQuizQuestionResult` - Question statistics

### API Endpoints Available:

#### Teacher Endpoints:
- `POST /api/live/sessions/` - Create session
- `POST /api/live/sessions/{id}/start/` - Start quiz
- `POST /api/live/sessions/{id}/next_question/` - Next question
- `POST /api/live/sessions/{id}/end/` - End quiz
- `GET /api/live/sessions/{id}/participants/` - View participants
- `GET /api/live/sessions/{id}/leaderboard/` - View leaderboard
- `GET /api/live/sessions/{id}/results/` - Detailed results

#### Student Endpoints:
- `POST /api/live/sessions/join/` - Join with code
- `GET /api/live/sessions/verify_code/?code=ABC123` - Verify code
- `POST /api/live/participants/{id}/submit_answer/` - Submit answer
- `POST /api/live/participants/{id}/leave/` - Leave session

## Frontend Components Needed:

### 1. Role Selection on Login/Register
File: `frontend/src/pages/auth/LoginPage.jsx`
- Add radio buttons for Teacher/Student selection
- Pass role to registration API

### 2. Teacher Dashboard
File: `frontend/src/pages/teacher/TeacherDashboard.jsx`
- List user's quizzes
- Button to create live session
- Show active sessions

### 3. Create Live Session
File: `frontend/src/pages/teacher/CreateLiveSession.jsx`
- Select quiz
- Configure settings (time per question, late join, etc.)
- Generate join code
- Display join code (large, copyable)

### 4. Teacher Control Panel
File: `frontend/src/pages/teacher/LiveQuizControl.jsx`
- Show join code prominently
- Real-time participant count
- List of joined students
- Start button (when ready)
- Current question display
- Next question button
- Live leaderboard
- End session button

### 5. Student Join Page
File: `frontend/src/pages/student/JoinQuiz.jsx`
- Input field for join code
- Verify code
- Enter nickname (if not logged in)
- Join button

### 6. Student Waiting Room
File: `frontend/src/pages/student/WaitingRoom.jsx`
- Show quiz title
- Show host name
- Show participant count
- "Waiting for teacher to start..." message
- Poll for session start

### 7. Student Quiz Play
File: `frontend/src/pages/student/LiveQuizPlay.jsx`
- Display current question
- Show timer countdown
- Multiple choice options
- Submit answer
- Show if correct/incorrect
- Show points earned
- Wait for next question

### 8. Live Leaderboard
File: `frontend/src/components/live/LiveLeaderboard.jsx`
- Ranking list
- Usernames
- Scores
- Update in real-time
- Animations

### 9. Results Summary
File: `frontend/src/pages/live/LiveQuizResults.jsx`
- Final leaderboard
- Student performance
- Question statistics
- Winner celebration

## Key Features to Implement:

### Real-Time Updates (Polling)
Since WebSocket isn't set up, use polling:

```javascript
// Poll every 2 seconds for updates
useEffect(() => {
  const interval = setInterval(async () => {
    await fetchLeaderboard(sessionId)
    await fetchParticipants(sessionId)
    await fetchSession(sessionId)
  }, 2000)
  
  return () => clearInterval(interval)
}, [sessionId])
```

### Scoring System:
- Correct answer: 1000 points base
- Speed bonus: up to 500 points (faster = more)
- Wrong answer: 0 points

### Additional Features:

1. **Power-ups** (Future):
   - Double points
   - Freeze opponents
   - Skip question

2. **Question Types**:
   - Multiple choice (implemented)
   - True/False
   - Text answer (implement validation)

3. **Session Settings**:
   - Time per question (customizable)
   - Allow late join (yes/no)
   - Show leaderboard (yes/no)
   - Randomize questions (yes/no)

4. **Analytics**:
   - Question difficulty based on % correct
   - Average answer time
   - Response distribution

5. **Gamification**:
   - Achievement badges
   - Streak bonuses
   - Daily challenges

## Routes to Add:

```javascript
// frontend/src/App.jsx or router config

// Teacher routes
<Route path="/teacher/dashboard" element={<TeacherDashboard />} />
<Route path="/teacher/create-session" element={<CreateLiveSession />} />
<Route path="/teacher/live/:sessionId" element={<LiveQuizControl />} />

// Student routes
<Route path="/join" element={<JoinQuiz />} />
<Route path="/waiting/:sessionId" element={<WaitingRoom />} />
<Route path="/play/:sessionId" element={<LiveQuizPlay />} />

// Shared
<Route path="/live/results/:sessionId" element={<LiveQuizResults />} />
```

## Testing Flow:

### Teacher:
1. Login as teacher
2. Go to dashboard
3. Click "Create Live Quiz"
4. Select quiz
5. Configure settings
6. Get join code (e.g., "ABC123")
7. Share code with students
8. Wait for students to join
9. Click "Start Quiz"
10. Click "Next Question" after each question
11. View live leaderboard
12. End session
13. View results

### Student:
1. Go to /join
2. Enter join code
3. Enter nickname (if guest)
4. Join session
5. Wait in waiting room
6. Answer questions when they appear
7. See if correct/incorrect
8. See points earned
9. Wait for next question
10. See final leaderboard

## Sample Data Creation:

```python
# Create test users
python manage.py shell
from apps.users.models import User
teacher = User.objects.create_user(username='teacher1', password='teacher123', role='teacher')
student1 = User.objects.create_user(username='student1', password='student123', role='student')
student2 = User.objects.create_user(username='student2', password='student123', role='student')
```

## Next Steps:

1. ✅ Backend complete (done)
2. ⚠️ Update login/register to include role selection
3. ⚠️ Create teacher dashboard
4. ⚠️ Create live session creation page
5. ⚠️ Create teacher control panel
6. ⚠️ Create student join page
7. ⚠️ Create student quiz play page
8. ⚠️ Add polling for real-time updates
9. ⚠️ Create leaderboard component
10. ⚠️ Test end-to-end flow

## Quick Start Commands:

```bash
# Backend (already running)
cd backend
python manage.py runserver

# Frontend (already running)
cd frontend
npm run dev

# Create test teacher
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "email": "teacher@test.com",
    "password": "teacher123",
    "password2": "teacher123",
    "first_name": "Test",
    "last_name": "Teacher",
    "role": "teacher"
  }'

# Create live session (as teacher)
curl -X POST http://localhost:8000/api/live/sessions/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quiz": 7,
    "time_per_question": 30,
    "allow_late_join": false,
    "show_leaderboard": true
  }'

# Join session (as student)
curl -X POST http://localhost:8000/api/live/sessions/join/ \
  -H "Content-Type: application/json" \
  -d '{
    "join_code": "ABC123",
    "nickname": "Student1"
  }'
```

## Important Notes:

1. **Security**: Only teachers can create/control sessions
2. **Join Code**: 6-character unique code (uppercase letters + digits)
3. **Late Join**: Can be disabled to prevent joining after start
4. **Guest Users**: Can join with nickname (no account needed)
5. **Timing**: Points awarded based on speed (faster = more points)
6. **Leaderboard**: Updates after each question
7. **Session Status**: waiting → in_progress → completed

Your backend is 100% complete and ready to use! The store is also created. Now just need to build the UI components.
