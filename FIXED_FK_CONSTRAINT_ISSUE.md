# FOREIGN KEY Constraint Issue - RESOLVED ✅

## Problem Summary
When attempting to create a quiz via the CreateQuizPage.jsx, the backend was consistently throwing:
```
django.db.utils.IntegrityError: FOREIGN KEY constraint failed
```

## Root Cause Analysis

### Initial Investigation
Initially suspected field name mismatches between frontend and backend (which were present and fixed), but the error persisted even after:
- ✅ Fixing all field names (pass_percentage, status, text, type, etc.)
- ✅ Adding proper type conversions for category FK
- ✅ Updating question and option field names

### Actual Root Cause
The **database schema had a broken foreign key constraint**!

#### The Issue:
The `quizzes_quiz` table had:
```sql
"creator_id" integer NOT NULL REFERENCES "auth_user" ("id")
```

But the actual user table was `users_user` (custom User model), not `auth_user`!

#### Why This Happened:
- The project uses a custom User model: `apps.users.models.User`
- `AUTH_USER_MODEL = 'users.User'` is correctly configured in settings
- However, the database was created with migrations that somehow referenced the wrong table
- This created an **impossible FK constraint** - trying to reference a table that didn't have the user records

#### Verification:
Testing quiz creation directly in Django shell confirmed the issue:
```python
quiz = Quiz.objects.create(
    title="Test",
    description="Test",
    category=category,
    creator=user,  # user exists in users_user table
    # ... other fields
)
# Result: FOREIGN KEY constraint failed
```

The FK pointed to `auth_user` table but user was in `users_user` table!

## Solution

### Step 1: Backup and Recreate Database
```bash
cd backend
cp db.sqlite3 db.sqlite3.backup
rm db.sqlite3
python manage.py migrate
```

### Step 2: Verify FK Constraint Fixed
After migration, the table now has:
```sql
"creator_id" bigint NOT NULL REFERENCES "users_user" ("id") 
```
✅ Correct table reference!

### Step 3: Recreate Seed Data
```python
# Created 4 categories
- Programming
- Science  
- History
- Mathematics

# Created 2 test users
- teacher@quiz.com (password: teacher123)
- student@quiz.com (password: student123)
```

### Step 4: Test Quiz Creation
```python
quiz = Quiz.objects.create(...)
# Result: Success! ✅
```

## Changes Made

### Backend Changes

#### 1. Database Schema Fixed
- **File**: `db.sqlite3`
- **Action**: Recreated with proper FK constraints
- **Before**: `creator_id` → `auth_user.id` (BROKEN)
- **After**: `creator_id` → `users_user.id` (CORRECT)

#### 2. Added Question Creation Endpoint
- **File**: `backend/apps/quizzes/views.py`
- **Added**: `@action` method for creating questions
```python
@action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
def questions(self, request, pk=None):
    """Create a question for this quiz."""
    # ... creates Question and QuestionOption objects
```

#### 3. Added Debug Logging
- **File**: `backend/apps/quizzes/views.py`  
- **Added**: Logging in `perform_create()` to help diagnose future issues

### Frontend Changes

#### 1. Fixed Quiz State Structure
- **File**: `frontend/src/pages/quiz/CreateQuizPage.jsx`
- **Fixed**: All field names to match backend models

**Quiz Fields:**
```javascript
// Before → After
passing_score → pass_percentage
is_published → status
difficulty → (removed, doesn't exist on Quiz model)
category: '' → category: null
```

**Question Fields:**
```javascript
// Before → After
question_text → text
question_type: 'multiple_choice' → type: 'mcq'
points → (removed, doesn't exist on Question model)
```

**Option Fields:**
```javascript
// Before → After
option_text → text
```

#### 2. Added Type Conversion
- **File**: `frontend/src/pages/quiz/CreateQuizPage.jsx`
- **Added**: Proper handling for category (empty string → null or integer)
```javascript
if (name === 'category') {
  processedValue = value === '' ? null : parseInt(value, 10)
}
```

#### 3. Updated Form Fields
- Replaced "Difficulty" dropdown with "Status" dropdown (Draft/Published/Archived)
- Replaced "Passing Score" with "Pass Percentage"
- Added Quiz settings checkboxes (shuffle_questions, shuffle_answers, show_correct_answer)
- Removed "Points" field from questions (doesn't exist in model)
- Changed question types to match backend: 'mcq', 'tf', 'fill'

#### 4. Added Better Error Handling
```javascript
// Check content type before parsing response
const contentType = quizResponse.headers.get('content-type')
if (contentType && contentType.includes('application/json')) {
  const error = await quizResponse.json()
  // ... handle JSON error
} else {
  const errorText = await quizResponse.text()
  // ... handle HTML error page
}
```

#### 5. Added Debug Logging
```javascript
console.log('Creating quiz with data:', JSON.stringify(quizData, null, 2))
```

## Testing Results

### ✅ Database Level Test
```python
quiz = Quiz.objects.create(
    title='Test Quiz',
    description='Test Description',
    category=category,
    creator=user,
    time_limit=30,
    pass_percentage=70,
    status='draft'
)
# Result: Success! Created quiz: 1 - Test Quiz
```

### ✅ API Level Test (Ready for Testing)
1. Backend server running with fixed database
2. Frontend updated with correct field names
3. Categories and users exist in database
4. Ready to test via UI

## Test Credentials

### Teacher Account
- Email: `teacher@quiz.com`
- Password: `teacher123`
- Role: teacher (can create quizzes)

### Student Account  
- Email: `student@quiz.com`
- Password: `student123`
- Role: student (can take quizzes)

## Files Modified

### Backend
1. ✅ `backend/db.sqlite3` - Recreated with correct FK constraints
2. ✅ `backend/apps/quizzes/views.py` - Added questions endpoint + logging

### Frontend
1. ✅ `frontend/src/pages/quiz/CreateQuizPage.jsx` - Complete field alignment

## Next Steps

1. **Test Quiz Creation via UI**:
   - Login as teacher@quiz.com
   - Navigate to Create Quiz page
   - Fill form and create quiz with questions
   - Verify success

2. **Update Other Pages**:
   - EditQuizPage.jsx - Apply same fixes
   - ManageQuizzesPage.jsx - Verify API calls

3. **Test End-to-End**:
   - Create quiz
   - Add questions with options
   - Publish quiz
   - Take quiz as student
   - View results

## Lessons Learned

1. **Always verify database schema matches model definitions**
   - Custom User models require careful migration management
   - FK constraints must reference the correct table

2. **Field name consistency is critical**
   - Frontend and backend must use identical field names
   - Document any field name mappings

3. **Test at multiple levels**:
   - Database level (ORM)
   - API level (DRF serializers)
   - Integration level (frontend → backend)

4. **Better error messages**:
   - Added content-type checking to parse errors correctly
   - Added debug logging for troubleshooting

## Status: RESOLVED ✅

The FOREIGN KEY constraint issue is completely fixed. The database now has:
- ✅ Correct FK constraints (`users_user` instead of `auth_user`)
- ✅ Seed data (categories and users)
- ✅ Frontend field names aligned with backend
- ✅ Question creation endpoint available
- ✅ Proper type conversions and validations

**Ready for full end-to-end testing!** 🚀
