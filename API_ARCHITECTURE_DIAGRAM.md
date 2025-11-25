# QuizMaster API Architecture & Relationships

## 📊 API Structure Overview

```
QuizMaster API
├── Authentication (JWT)
│   ├── Register
│   ├── Login (Get Tokens)
│   └── Refresh Token
│
├── Users Module
│   ├── User Management
│   │   ├── List Users
│   │   ├── Get User Profile
│   │   ├── Update User
│   │   └── Change Password
│   └── User Profile
│       ├── Get My Profile
│       └── Update My Profile
│
├── Categories Module
│   ├── Initialize Categories
│   ├── List Categories
│   └── Get Category Details
│
├── Quizzes Module
│   ├── Quiz CRUD
│   │   ├── Create Quiz
│   │   ├── List Quizzes
│   │   ├── Get Quiz Details
│   │   ├── Update Quiz
│   │   └── Delete Quiz
│   ├── Quiz Management
│   │   ├── My Quizzes
│   │   ├── Popular Quizzes
│   │   ├── Featured Quizzes
│   │   └── Quiz Analytics
│   └── Questions
│       └── Add Question to Quiz
│
├── Quiz Attempts Module
│   ├── Start Quiz Attempt
│   ├── List My Attempts
│   ├── Get Attempt Details
│   ├── Submit Answer
│   ├── Complete Attempt
│   └── Quiz History
│
├── Results Module
│   ├── Leaderboards
│   │   ├── Quiz Leaderboard
│   │   └── Global Leaderboard
│   ├── Badges
│   │   └── User Badges
│   └── Statistics
│       ├── My Statistics
│       └── Recalculate Statistics
│
└── Live Quiz Module
    ├── Session Management
    │   ├── Create Session
    │   ├── List Sessions
    │   ├── Get Session Details
    │   ├── Start Session
    │   ├── Next Question
    │   └── End Session
    ├── Session Info
    │   ├── Session Leaderboard
    │   ├── Session Participants
    │   └── Session Results
    ├── Participation
    │   ├── Join Session
    │   └── Verify Join Code
    └── Participant Actions
        ├── Submit Answer
        └── Leave Session
```

---

## 🔄 Data Flow Diagrams

### Flow 1: User Registration & Authentication
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. POST /api/users/register/
       │    { email, username, password, role }
       ▼
┌─────────────┐
│   Backend   │──────► Create User Account
└──────┬──────┘        Store in Database
       │
       │ 2. Response: { user: {...}, message }
       │
       │ 3. POST /api/token/
       │    { username, password }
       ▼
┌─────────────┐
│   Backend   │──────► Validate Credentials
└──────┬──────┘        Generate JWT Tokens
       │
       │ 4. Response: { access, refresh }
       │
       ▼
┌─────────────┐
│   Client    │──────► Save Tokens
└─────────────┘        Use in Headers
```

### Flow 2: Quiz Creation & Taking
```
Teacher Flow:                     Student Flow:
┌──────────────┐                 ┌──────────────┐
│   Teacher    │                 │   Student    │
└──────┬───────┘                 └──────┬───────┘
       │                                 │
       │ 1. Create Quiz                  │ 1. Browse Quizzes
       │ POST /api/quizzes/              │ GET /api/quizzes/
       ▼                                 ▼
┌─────────────┐                  ┌─────────────┐
│   Backend   │                  │   Backend   │
└──────┬──────┘                  └──────┬──────┘
       │                                 │
       │ 2. Add Questions                │ 2. Start Attempt
       │ POST /api/quizzes/{id}/         │ POST /api/quizzes/attempts/
       │      questions/                 ▼
       ▼                          ┌─────────────┐
┌─────────────┐                  │   Backend   │
│   Backend   │                  └──────┬──────┘
└──────┬──────┘                         │
       │                                 │ 3. Submit Answers (×N)
       │ 3. Publish Quiz                 │ POST /api/quizzes/attempts/
       │ PATCH /api/quizzes/{id}/        │      {id}/submit_answer/
       │       { status: published }     ▼
       ▼                          ┌─────────────┐
┌─────────────┐                  │   Backend   │
│  Database   │◄─────────────────┤ Track Answers│
└─────────────┘                  └──────┬──────┘
       ▲                                 │
       │                                 │ 4. Complete Quiz
       │                                 │ POST /api/quizzes/attempts/
       │                                 │      {id}/complete/
       │                                 ▼
       │                          ┌─────────────┐
       │                          │   Backend   │
       │                          │ Calculate   │
       │                          │ Score &     │
       │                          │ Update      │
       └──────────────────────────┤ Statistics  │
                                  └─────────────┘
```

### Flow 3: Live Quiz Session
```
Teacher:                         Student:
┌──────────────┐                ┌──────────────┐
│   Teacher    │                │   Student    │
└──────┬───────┘                └──────┬───────┘
       │                                │
       │ 1. Create Session              │
       │ POST /api/live/sessions/       │
       ▼                                │
┌─────────────┐                        │
│   Backend   │                        │
│ Generate    │                        │
│ Join Code   │                        │
└──────┬──────┘                        │
       │                                │
       │ 2. Start Session               │ 1. Join Session
       │ POST /api/live/sessions/       │ POST /api/live/sessions/join/
       │      {id}/start/               │ { join_code }
       ▼                                ▼
┌─────────────┐◄────────────────┌─────────────┐
│   Backend   │                 │   Backend   │
│ Activate    │                 │ Add         │
│ Session     │                 │ Participant │
└──────┬──────┘                 └──────┬──────┘
       │                                │
       │ 3. Display Question            │ 2. View Question
       │ POST /api/live/sessions/       │ (From session data)
       │      {id}/next_question/       │
       │                                │
       │◄───────────────────────────────┤ 3. Submit Answer
       │                                │ POST /api/live/participants/
       │ 4. Collect Answers             │      {id}/submit_answer/
       │    Calculate Points            │
       ▼                                ▼
┌─────────────┐                 ┌─────────────┐
│   Backend   │                 │   Backend   │
│ Update      │                 │ Award       │
│ Leaderboard │────────────────►│ Points      │
└──────┬──────┘                 └──────┬──────┘
       │                                │
       │ 5. End Session                 │ 4. View Results
       │ POST /api/live/sessions/       │ GET /api/live/sessions/
       │      {id}/end/                 │     {id}/leaderboard/
       ▼                                ▼
┌─────────────┐                 ┌─────────────┐
│  Finalize   │                 │   Display   │
│  Results    │                 │   Rankings  │
└─────────────┘                 └─────────────┘
```

---

## 🗃️ Database Relationships

```
┌─────────────┐
│    User     │
│ (Extended)  │
└──────┬──────┘
       │ 1:1
       ├─────────► UserProfile
       │
       │ 1:N
       ├─────────► Quiz (as creator)
       │
       │ 1:N
       ├─────────► QuizAttempt
       │
       │ 1:N
       ├─────────► LiveQuizParticipant
       │
       │ 1:N
       ├─────────► LiveQuizSession (as host)
       │
       │ 1:1
       └─────────► UserStatistics

┌─────────────┐
│  Category   │
└──────┬──────┘
       │ 1:N
       └─────────► Quiz

┌─────────────┐
│    Quiz     │
└──────┬──────┘
       │ 1:N
       ├─────────► Question
       │
       │ 1:N
       ├─────────► QuizAttempt
       │
       │ 1:N
       ├─────────► LiveQuizSession
       │
       │ 1:N
       └─────────► LeaderboardEntry

┌─────────────┐
│  Question   │
└──────┬──────┘
       │ 1:N
       ├─────────► QuestionOption
       │
       │ 1:N
       ├─────────► UserAnswer
       │
       │ 1:N
       └─────────► LiveQuizAnswer

┌─────────────┐
│ QuizAttempt │
└──────┬──────┘
       │ 1:N
       └─────────► UserAnswer

┌──────────────────┐
│ LiveQuizSession  │
└────────┬─────────┘
         │ 1:N
         ├─────────► LiveQuizParticipant
         │
         │ 1:N
         └─────────► LiveQuizQuestionResult

┌────────────────────────┐
│ LiveQuizParticipant    │
└────────┬───────────────┘
         │ 1:N
         └─────────► LiveQuizAnswer
```

---

## 🔐 Permission Matrix

```
┌──────────────┬──────────┬──────────┬──────────┐
│  Endpoint    │ Student  │ Teacher  │  Admin   │
├──────────────┼──────────┼──────────┼──────────┤
│ Register     │    ✓     │    ✓     │    ✓     │
│ Login        │    ✓     │    ✓     │    ✓     │
├──────────────┼──────────┼──────────┼──────────┤
│ List Quizzes │    ✓     │    ✓     │    ✓     │
│ Create Quiz  │    ✗     │    ✓     │    ✓     │
│ Update Quiz  │    ✗     │  Owner   │    ✓     │
│ Delete Quiz  │    ✗     │  Owner   │    ✓     │
├──────────────┼──────────┼──────────┼──────────┤
│ Start Attempt│    ✓     │    ✓     │    ✓     │
│ Submit Answer│    ✓     │    ✓     │    ✓     │
│ Complete Quiz│    ✓     │    ✓     │    ✓     │
├──────────────┼──────────┼──────────┼──────────┤
│ Create Live  │    ✗     │    ✓     │    ✓     │
│ Start Session│    ✗     │  Host    │    ✓     │
│ Join Session │    ✓     │    ✓     │    ✓     │
│ Control Quiz │    ✗     │  Host    │    ✓     │
├──────────────┼──────────┼──────────┼──────────┤
│ View Stats   │   Self   │   Self   │   All    │
│ View Analytics│   ✗     │  Owner   │   All    │
│ Leaderboard  │    ✓     │    ✓     │    ✓     │
└──────────────┴──────────┴──────────┴──────────┘

Legend:
✓ = Allowed
✗ = Not Allowed
Owner = Only resource owner
Host = Only session host
Self = Only own data
All = All data
```

---

## 🔄 State Transitions

### Quiz Status Flow
```
┌────────┐
│ Draft  │
└───┬────┘
    │ publish
    ▼
┌────────────┐
│ Published  │
└───┬────────┘
    │ archive
    ▼
┌──────────┐
│ Archived │
└──────────┘
```

### Quiz Attempt Status Flow
```
┌──────────────┐
│ In Progress  │
└───┬──────────┘
    │ complete / abandon
    ▼
┌─────────────┐       ┌────────────┐
│ Completed   │   or  │ Abandoned  │
└─────────────┘       └────────────┘
```

### Live Session Status Flow
```
┌──────────┐
│ Waiting  │ ◄──── Created
└────┬─────┘
     │ start
     ▼
┌────────────┐
│In Progress │
└────┬───────┘
     │ end / complete
     ▼
┌────────────┐
│ Completed  │
└────────────┘
```

### Live Participant Status Flow
```
┌─────────┐
│ Active  │ ◄──── Joined
└────┬────┘
     │ leave / disconnect
     ▼
┌─────────┐
│  Left   │
└─────────┘
```

---

## 📈 Request/Response Flow

### Typical API Request
```
┌──────────────────────────────────────────┐
│           Client (Postman)               │
└────────────────┬─────────────────────────┘
                 │
                 │ HTTP Request
                 │ ├── Method: POST/GET/PATCH/DELETE
                 │ ├── URL: /api/endpoint/
                 │ ├── Headers:
                 │ │   └── Authorization: Bearer {token}
                 │ └── Body: JSON data
                 ▼
┌────────────────────────────────────────────┐
│           Django REST Framework            │
│                                            │
│  1. URL Router                             │
│     └──► Match endpoint to view            │
│                                            │
│  2. Authentication                         │
│     └──► Verify JWT token                  │
│                                            │
│  3. Permissions                            │
│     └──► Check user permissions            │
│                                            │
│  4. Serializer                             │
│     └──► Validate data                     │
│                                            │
│  5. View/ViewSet                           │
│     └──► Business logic                    │
│                                            │
│  6. Database                               │
│     └──► Query/Update data                 │
│                                            │
│  7. Serializer                             │
│     └──► Format response                   │
└────────────────┬───────────────────────────┘
                 │
                 │ HTTP Response
                 │ ├── Status Code: 200/201/400/401/etc
                 │ ├── Headers: Content-Type
                 │ └── Body: JSON data
                 ▼
┌────────────────────────────────────────────┐
│           Client (Postman)                 │
│                                            │
│  ├── Save variables (if test script)       │
│  ├── Display response                      │
│  └── Run assertions                        │
└────────────────────────────────────────────┘
```

---

## 🎯 Key Endpoints by Use Case

### Use Case: User Management
```
Register → Login → Get Profile → Update Profile → Change Password
   │         │          │              │                │
   POST     POST        GET          PATCH            POST
   /api/    /api/      /api/         /api/           /api/users/
   users/   token/     users/        users/          users/
   register/           users/me/     users/{id}/     change_password/
```

### Use Case: Quiz Creation
```
Login → List Categories → Create Quiz → Add Questions → Publish
  │           │               │              │            │
 POST        GET             POST           POST        PATCH
 /api/       /api/          /api/          /api/       /api/
 token/      quizzes/       quizzes/       quizzes/    quizzes/
             categories/                   {id}/       {id}/
                                          questions/
```

### Use Case: Taking Quiz
```
Browse → Select Quiz → Start Attempt → Answer Questions → Complete
  │           │             │                │              │
 GET         GET           POST            POST           POST
 /api/       /api/         /api/           /api/          /api/
 quizzes/    quizzes/      quizzes/        quizzes/       quizzes/
             {id}/         attempts/       attempts/      attempts/
                                          {id}/          {id}/
                                          submit_        complete/
                                          answer/
```

### Use Case: Live Quiz
```
Create Session → Start → Join → Answer → View Leaderboard → End
      │            │       │       │            │            │
     POST         POST    POST    POST         GET          POST
     /api/        /api/   /api/   /api/        /api/        /api/
     live/        live/   live/   live/        live/        live/
     sessions/    sessions/ sessions/ participants/ sessions/ sessions/
                  {id}/   join/   {id}/        {id}/        {id}/
                  start/          submit_      leaderboard/ end/
                                  answer/
```

---

## 📊 Response Structure Patterns

### Success Response (200/201)
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  "created_at": "2025-11-18T10:00:00Z",
  "updated_at": "2025-11-18T10:00:00Z"
}
```

### List Response (200)
```json
{
  "count": 10,
  "next": "http://api/endpoint/?page=2",
  "previous": null,
  "results": [
    { /* item 1 */ },
    { /* item 2 */ }
  ]
}
```

### Error Response (400/401/403/404)
```json
{
  "detail": "Error message",
  "field_errors": {
    "field_name": ["Error for this field"]
  }
}
```

### Authentication Response (200)
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhb...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhb..."
}
```

---

**This diagram provides a comprehensive overview of the QuizMaster API architecture, data flows, and relationships to help you understand how everything connects together.**
