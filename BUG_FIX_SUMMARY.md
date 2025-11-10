# Bug Fix Summary - Quiz Creation FOREIGN KEY Error

## Issue Identified
When attempting to create a quiz via the CreateQuizPage.jsx, the backend was throwing:
```
django.db.utils.IntegrityError: FOREIGN KEY constraint failed
```

## Root Causes Found

### 1. **Field Name Mismatches (Frontend ↔ Backend)**

#### Quiz Model Fields
- ❌ Frontend was sending: `passing_score` 
- ✅ Backend expects: `pass_percentage`

- ❌ Frontend was sending: `is_published` (boolean)
- ✅ Backend expects: `status` (string: 'draft', 'published', 'archived')

- ❌ Frontend was sending: `difficulty` (on quiz level)
- ✅ Backend has `difficulty` only on Question model, not Quiz

#### Question Model Fields
- ❌ Frontend was sending: `question_text`
- ✅ Backend expects: `text`

- ❌ Frontend was sending: `question_type: 'multiple_choice'`
- ✅ Backend expects: `type: 'mcq'` (choices: 'mcq', 'tf', 'fill', 'match')

- ❌ Frontend was sending: `points` (doesn't exist)
- ✅ Backend doesn't have a points field

#### QuestionOption Model Fields
- ❌ Frontend was sending: `option_text`
- ✅ Backend expects: `text`

### 2. **Category Field Type Issue**
- ❌ Frontend initial state: `category: ''` (empty string)
- ⚠️ Problem: Empty string cannot be converted to integer FK or null
- ✅ Fixed: Changed to `category: null` and added conversion logic

### 3. **Missing Backend Endpoint**
- ❌ Frontend was POSTing to `/api/quizzes/{id}/questions/`
- ⚠️ Problem: This endpoint didn't exist in the backend
- ✅ Fixed: Added `@action` method in QuizViewSet to handle question creation

## Changes Made

### Backend Changes

#### File: `backend/apps/quizzes/views.py`

Added new endpoint for creating questions:

```python
@action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
def questions(self, request, pk=None):
    """Create a question for this quiz."""
    quiz = self.get_object()
    
    # Check if user is the quiz creator or staff
    if quiz.creator != request.user and not request.user.is_staff:
        return Response(
            {'detail': 'You do not have permission to add questions to this quiz.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get question data
    question_data = request.data.copy()
    question_data['quiz'] = quiz.id
    
    # Extract options
    options_data = question_data.pop('options', [])
    
    # Create question
    from .models import QuestionOption
    question = Question.objects.create(
        quiz=quiz,
        text=question_data.get('text'),
        type=question_data.get('type', 'mcq'),
        difficulty=question_data.get('difficulty', 'medium'),
        explanation=question_data.get('explanation', ''),
        order=question_data.get('order', 0)
    )
    
    # Create options
    for idx, option_data in enumerate(options_data):
        QuestionOption.objects.create(
            question=question,
            text=option_data.get('text'),
            is_correct=option_data.get('is_correct', False),
            explanation=option_data.get('explanation', ''),
            order=idx
        )
    
    serializer = QuestionSerializer(question)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
```

**What this does:**
- Creates a nested route: `POST /api/quizzes/{quiz_id}/questions/`
- Validates user permission (only quiz creator or staff can add questions)
- Creates Question and QuestionOption objects
- Returns serialized question data

### Frontend Changes

#### File: `frontend/src/pages/quiz/CreateQuizPage.jsx`

**1. Updated Quiz State Structure**
```javascript
// BEFORE
const [quizData, setQuizData] = useState({
  title: '',
  description: '',
  category: '',  // ❌ Empty string
  time_limit: 30,
  passing_score: 70,  // ❌ Wrong field name
  difficulty: 'medium',  // ❌ Doesn't exist
  is_published: false,  // ❌ Wrong field name
})

// AFTER
const [quizData, setQuizData] = useState({
  title: '',
  description: '',
  category: null,  // ✅ Null for proper FK handling
  time_limit: 30,
  pass_percentage: 70,  // ✅ Correct field name
  status: 'draft',  // ✅ Correct field name
  shuffle_questions: false,  // ✅ Added optional fields
  shuffle_answers: false,
  show_correct_answer: true,
})
```

**2. Updated Question State Structure**
```javascript
// BEFORE
const [questions, setQuestions] = useState([{
  question_text: '',  // ❌
  question_type: 'multiple_choice',  // ❌
  points: 10,  // ❌
  explanation: '',
  options: [
    { option_text: '', is_correct: false },  // ❌
  ],
}])

// AFTER
const [questions, setQuestions] = useState([{
  text: '',  // ✅
  type: 'mcq',  // ✅
  difficulty: 'medium',  // ✅
  explanation: '',
  options: [
    { text: '', is_correct: false },  // ✅
  ],
}])
```

**3. Added Type Conversion in handleQuizChange**
```javascript
const handleQuizChange = (e) => {
  const { name, value, type, checked } = e.target
  let processedValue = value
  
  // Convert category to integer or null
  if (name === 'category') {
    processedValue = value === '' ? null : parseInt(value, 10)
  }
  // Convert numeric fields to integers
  else if (name === 'time_limit' || name === 'pass_percentage') {
    processedValue = parseInt(value, 10)
  }
  
  setQuizData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : processedValue
  }))
}
```

**4. Updated Form Fields**

- **Category Select**: Changed value binding to handle null
```jsx
<select
  name="category"
  value={quizData.category === null ? '' : quizData.category}
  onChange={handleQuizChange}
  required
>
```

- **Replaced Difficulty dropdown with Status dropdown**
```jsx
<select name="status" value={quizData.status} onChange={handleQuizChange}>
  <option value="draft">Draft</option>
  <option value="published">Published</option>
  <option value="archived">Archived</option>
</select>
```

- **Renamed Pass Percentage field**
```jsx
<Input
  label="Pass Percentage (%)"
  name="pass_percentage"  // ✅ Was: passing_score
  value={quizData.pass_percentage}
  ...
/>
```

- **Added Quiz Settings Checkboxes**
```jsx
<div className="flex items-center gap-6 text-slate-300">
  <label className="flex items-center gap-2">
    <input type="checkbox" name="shuffle_questions" checked={quizData.shuffle_questions || false} onChange={handleQuizChange} />
    <span>Shuffle Questions</span>
  </label>
  
  <label className="flex items-center gap-2">
    <input type="checkbox" name="shuffle_answers" checked={quizData.shuffle_answers || false} onChange={handleQuizChange} />
    <span>Shuffle Answers</span>
  </label>
  
  <label className="flex items-center gap-2">
    <input type="checkbox" name="show_correct_answer" checked={quizData.show_correct_answer !== false} onChange={handleQuizChange} />
    <span>Show Correct Answers</span>
  </label>
</div>
```

**5. Updated Question Form Fields**

- **Question Text**: `question.question_text` → `question.text`
- **Question Type**: `question.question_type` → `question.type`
  - Values changed: `'multiple_choice'` → `'mcq'`, `'true_false'` → `'tf'`
- **Replaced Points with Difficulty**
- **Option Text**: `option.option_text` → `option.text`

**6. Updated All Helper Functions**
- `addQuestion()`: Updated to use new field names
- `addOption()`: Changed `option_text` to `text`
- `validateQuiz()`: Updated field name references

## Testing Checklist

### Backend Testing
- [ ] Start Django server: `cd backend && python manage.py runserver`
- [ ] Verify categories exist: `python manage.py shell -c "from apps.quizzes.models import Category; print(Category.objects.all())"`
- [ ] Test quiz creation endpoint: `POST /api/quizzes/`
  ```json
  {
    "title": "Test Quiz",
    "description": "Test Description",
    "category": 1,
    "time_limit": 30,
    "pass_percentage": 70,
    "status": "draft"
  }
  ```
- [ ] Test question creation endpoint: `POST /api/quizzes/{quiz_id}/questions/`
  ```json
  {
    "text": "What is 2+2?",
    "type": "mcq",
    "difficulty": "easy",
    "order": 1,
    "options": [
      {"text": "3", "is_correct": false},
      {"text": "4", "is_correct": true},
      {"text": "5", "is_correct": false}
    ]
  }
  ```

### Frontend Testing
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Login as teacher
- [ ] Navigate to Create Quiz page
- [ ] Verify form fields render correctly:
  - [ ] Category dropdown populated
  - [ ] Status dropdown (Draft/Published/Archived)
  - [ ] Time limit and pass percentage fields
  - [ ] Shuffle checkboxes
- [ ] Create a quiz with valid data:
  - [ ] Fill in title and description
  - [ ] Select a category
  - [ ] Set time limit and pass percentage
  - [ ] Add questions with options
  - [ ] Mark correct answers
- [ ] Submit form and verify:
  - [ ] No console errors
  - [ ] Success toast message
  - [ ] Redirect to quiz detail page
  - [ ] Questions appear in the quiz

### Integration Testing
- [ ] Create draft quiz → verify `status='draft'`
- [ ] Create published quiz → verify `status='published'`
- [ ] Create quiz with null category → should work (nullable FK)
- [ ] Create quiz with invalid category ID → should fail with proper error
- [ ] Create quiz with multiple questions (3-5)
- [ ] Create quiz with different question types (mcq, tf, fill)
- [ ] Create quiz with different difficulties (easy, medium, hard)
- [ ] Verify question order is preserved
- [ ] Verify option order is preserved
- [ ] Verify correct answer flags are saved

### Edge Cases
- [ ] Try creating quiz without category (should work - null allowed)
- [ ] Try creating quiz without time limit (should work - null allowed)
- [ ] Try adding question with no options → backend should handle gracefully
- [ ] Try adding question with no correct answer → frontend validates before submit
- [ ] Try creating quiz as non-teacher user → should be blocked
- [ ] Try adding questions to another teacher's quiz → should be blocked

## Expected Behavior After Fix

1. **Quiz Creation Flow**:
   - User fills form with correct field names
   - Category is sent as integer or null
   - Quiz is created with `status` field instead of `is_published`
   - Questions are created via nested endpoint
   - Options are created with correct `text` field

2. **Data Integrity**:
   - No FK constraint violations
   - All field names match backend models
   - Type conversions happen automatically
   - Null values handled properly

3. **User Experience**:
   - Form submits successfully
   - No errors in console
   - Success message shown
   - Redirected to quiz detail page
   - Can view created quiz with questions

## Files Modified

### Backend
1. ✅ `backend/apps/quizzes/views.py` - Added questions endpoint

### Frontend
1. ✅ `frontend/src/pages/quiz/CreateQuizPage.jsx` - Complete field name alignment

## Next Steps

1. **Test the changes**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python manage.py runserver
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Fix similar issues in other files**:
   - `EditQuizPage.jsx` - Apply same field name fixes
   - `ManageQuizzesPage.jsx` - Verify API calls use correct fields
   - Any other components that create/edit quizzes

3. **Update API Documentation**:
   - Document the new `/api/quizzes/{id}/questions/` endpoint
   - Update request/response examples

4. **Consider Enhancements**:
   - Add bulk question creation endpoint
   - Add question update/delete endpoints
   - Add quiz clone functionality
   - Add question bank feature

## Database Schema Reference

### Quiz Model
```python
title = CharField
description = TextField
category = ForeignKey(Category, null=True)  # ✅ Nullable
creator = ForeignKey(User)
time_limit = IntegerField(null=True, blank=True)
pass_percentage = IntegerField(default=60)  # ✅ Not "passing_score"
status = CharField(choices=[draft, published, archived])  # ✅ Not "is_published"
shuffle_questions = BooleanField(default=False)
shuffle_answers = BooleanField(default=False)
show_correct_answer = BooleanField(default=True)
thumbnail = ImageField(blank=True, null=True)
tags = JSONField(default=list, blank=True)
```

### Question Model
```python
quiz = ForeignKey(Quiz)
text = TextField  # ✅ Not "question_text"
type = CharField(choices=[mcq, tf, fill, match])  # ✅ Not "question_type: multiple_choice"
image = ImageField(blank=True, null=True)
explanation = TextField(blank=True)
difficulty = CharField(choices=[easy, medium, hard], default='medium')
order = PositiveIntegerField(default=0)
```

### QuestionOption Model
```python
question = ForeignKey(Question)
text = TextField  # ✅ Not "option_text"
is_correct = BooleanField(default=False)
explanation = TextField(blank=True)
order = PositiveIntegerField(default=0)
```

## Status: READY FOR TESTING ✅

All code changes have been completed. The bug has been fixed by:
1. ✅ Aligning frontend field names with backend model fields
2. ✅ Fixing data type conversions (category: string → int/null)
3. ✅ Creating missing backend endpoint for questions
4. ✅ Updating form to use correct Quiz model fields
5. ✅ Removing non-existent fields (difficulty, points, is_published)

**Next action**: Test the quiz creation flow end-to-end
