# QuizMaster API - Sample Test Data

This file contains ready-to-use test data for testing the QuizMaster API in Postman.

---

## 👥 Sample Users

### Student Users

**Student 1**
```json
{
    "email": "student1@example.com",
    "username": "student1",
    "password": "Student@123",
    "password2": "Student@123",
    "first_name": "Alice",
    "last_name": "Johnson",
    "role": "student",
    "bio": "Loves learning through quizzes"
}
```

**Student 2**
```json
{
    "email": "student2@example.com",
    "username": "student2",
    "password": "Student@123",
    "password2": "Student@123",
    "first_name": "Bob",
    "last_name": "Smith",
    "role": "student",
    "bio": "Competitive quiz taker"
}
```

**Student 3**
```json
{
    "email": "student3@example.com",
    "username": "student3",
    "password": "Student@123",
    "password2": "Student@123",
    "first_name": "Charlie",
    "last_name": "Brown",
    "role": "student"
}
```

### Teacher Users

**Teacher 1**
```json
{
    "email": "teacher1@example.com",
    "username": "teacher1",
    "password": "Teacher@123",
    "password2": "Teacher@123",
    "first_name": "Dr. Emily",
    "last_name": "Wilson",
    "role": "teacher",
    "bio": "Computer Science professor"
}
```

**Teacher 2**
```json
{
    "email": "teacher2@example.com",
    "username": "teacher2",
    "password": "Teacher@123",
    "password2": "Teacher@123",
    "first_name": "Prof. Michael",
    "last_name": "Davis",
    "role": "teacher",
    "bio": "Mathematics educator"
}
```

---

## 📝 Sample Quizzes

### Quiz 1: Python Fundamentals

```json
{
    "title": "Python Fundamentals Quiz",
    "description": "Test your understanding of basic Python concepts including data types, operators, and control structures.",
    "category": 1,
    "time_limit": 20,
    "pass_percentage": 70,
    "status": "published",
    "shuffle_questions": true,
    "shuffle_answers": true,
    "show_correct_answer": true,
    "tags": ["python", "programming", "basics", "fundamentals"]
}
```

**Questions for Python Fundamentals:**

**Question 1:**
```json
{
    "text": "What is the output of print(2 ** 3)?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "The ** operator is used for exponentiation in Python. 2^3 = 8",
    "order": 1,
    "options": [
        {
            "text": "6",
            "is_correct": false,
            "explanation": "This would be the result of 2 * 3 (multiplication)"
        },
        {
            "text": "8",
            "is_correct": true,
            "explanation": "Correct! 2 raised to the power of 3 equals 8"
        },
        {
            "text": "9",
            "is_correct": false,
            "explanation": "This would be the result of 3^2"
        },
        {
            "text": "5",
            "is_correct": false,
            "explanation": "This would be the result of 2 + 3"
        }
    ]
}
```

**Question 2:**
```json
{
    "text": "Which of the following is a mutable data type in Python?",
    "type": "mcq",
    "difficulty": "medium",
    "explanation": "Lists are mutable, meaning they can be modified after creation. Tuples and strings are immutable.",
    "order": 2,
    "options": [
        {
            "text": "tuple",
            "is_correct": false,
            "explanation": "Tuples are immutable in Python"
        },
        {
            "text": "list",
            "is_correct": true,
            "explanation": "Correct! Lists can be modified after creation"
        },
        {
            "text": "string",
            "is_correct": false,
            "explanation": "Strings are immutable in Python"
        },
        {
            "text": "integer",
            "is_correct": false,
            "explanation": "Integers are immutable in Python"
        }
    ]
}
```

**Question 3:**
```json
{
    "text": "What keyword is used to define a function in Python?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "The 'def' keyword is used to define functions in Python.",
    "order": 3,
    "options": [
        {
            "text": "function",
            "is_correct": false,
            "explanation": "This is used in JavaScript, not Python"
        },
        {
            "text": "def",
            "is_correct": true,
            "explanation": "Correct! 'def' is the keyword for defining functions"
        },
        {
            "text": "func",
            "is_correct": false,
            "explanation": "This is not a Python keyword"
        },
        {
            "text": "define",
            "is_correct": false,
            "explanation": "This is not the correct Python keyword"
        }
    ]
}
```

**Question 4:**
```json
{
    "text": "What is the correct way to create a dictionary in Python?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "Dictionaries in Python are created using curly braces {} with key-value pairs.",
    "order": 4,
    "options": [
        {
            "text": "{'name': 'John', 'age': 25}",
            "is_correct": true,
            "explanation": "Correct! This is the proper dictionary syntax"
        },
        {
            "text": "['name': 'John', 'age': 25]",
            "is_correct": false,
            "explanation": "Square brackets are used for lists"
        },
        {
            "text": "('name': 'John', 'age': 25)",
            "is_correct": false,
            "explanation": "Parentheses are used for tuples"
        },
        {
            "text": "<'name': 'John', 'age': 25>",
            "is_correct": false,
            "explanation": "This is not valid Python syntax"
        }
    ]
}
```

**Question 5:**
```json
{
    "text": "Which method is used to add an element to the end of a list?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "The append() method adds an element to the end of a list.",
    "order": 5,
    "options": [
        {
            "text": "add()",
            "is_correct": false,
            "explanation": "This method is used for sets"
        },
        {
            "text": "append()",
            "is_correct": true,
            "explanation": "Correct! append() adds elements to the end of a list"
        },
        {
            "text": "insert()",
            "is_correct": false,
            "explanation": "insert() is used to add elements at a specific position"
        },
        {
            "text": "push()",
            "is_correct": false,
            "explanation": "This is used in JavaScript, not Python"
        }
    ]
}
```

### Quiz 2: JavaScript Essentials

```json
{
    "title": "JavaScript Essentials",
    "description": "Master the basics of JavaScript including variables, functions, and DOM manipulation.",
    "category": 1,
    "time_limit": 25,
    "pass_percentage": 65,
    "status": "published",
    "shuffle_questions": false,
    "shuffle_answers": true,
    "show_correct_answer": true,
    "tags": ["javascript", "programming", "web-development"]
}
```

**Questions for JavaScript Essentials:**

**Question 1:**
```json
{
    "text": "Which keyword is used to declare a constant in JavaScript?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "The 'const' keyword declares constants that cannot be reassigned.",
    "order": 1,
    "options": [
        {
            "text": "var",
            "is_correct": false,
            "explanation": "var declares a variable, not a constant"
        },
        {
            "text": "let",
            "is_correct": false,
            "explanation": "let declares a block-scoped variable"
        },
        {
            "text": "const",
            "is_correct": true,
            "explanation": "Correct! const is used for constants"
        },
        {
            "text": "constant",
            "is_correct": false,
            "explanation": "This is not a JavaScript keyword"
        }
    ]
}
```

**Question 2:**
```json
{
    "text": "What is the correct syntax for a for loop in JavaScript?",
    "type": "mcq",
    "difficulty": "medium",
    "explanation": "The correct for loop syntax is: for (initialization; condition; increment)",
    "order": 2,
    "options": [
        {
            "text": "for (i = 0; i < 5; i++)",
            "is_correct": true,
            "explanation": "Correct! This is the proper for loop syntax"
        },
        {
            "text": "for i = 0 to 5",
            "is_correct": false,
            "explanation": "This syntax is used in other languages like Visual Basic"
        },
        {
            "text": "for (i in range(5))",
            "is_correct": false,
            "explanation": "This is Python syntax"
        },
        {
            "text": "loop (i < 5)",
            "is_correct": false,
            "explanation": "This is not valid JavaScript syntax"
        }
    ]
}
```

**Question 3:**
```json
{
    "text": "How do you select an element with id='demo' in JavaScript?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "document.getElementById() is used to select elements by their ID.",
    "order": 3,
    "options": [
        {
            "text": "document.querySelector('.demo')",
            "is_correct": false,
            "explanation": "This selects elements by class, not ID"
        },
        {
            "text": "document.getElementById('demo')",
            "is_correct": true,
            "explanation": "Correct! This is the proper way to select by ID"
        },
        {
            "text": "document.getElement('demo')",
            "is_correct": false,
            "explanation": "This method does not exist"
        },
        {
            "text": "$('#demo')",
            "is_correct": false,
            "explanation": "This is jQuery syntax, not vanilla JavaScript"
        }
    ]
}
```

### Quiz 3: General Knowledge

```json
{
    "title": "World Geography Challenge",
    "description": "Test your knowledge about countries, capitals, and geographical features around the world.",
    "category": 5,
    "time_limit": 15,
    "pass_percentage": 60,
    "status": "published",
    "shuffle_questions": true,
    "shuffle_answers": true,
    "show_correct_answer": true,
    "tags": ["geography", "general-knowledge", "world"]
}
```

**Questions for World Geography:**

**Question 1:**
```json
{
    "text": "What is the capital of France?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "Paris is the capital and largest city of France.",
    "order": 1,
    "options": [
        {
            "text": "London",
            "is_correct": false,
            "explanation": "London is the capital of the United Kingdom"
        },
        {
            "text": "Paris",
            "is_correct": true,
            "explanation": "Correct! Paris is the capital of France"
        },
        {
            "text": "Berlin",
            "is_correct": false,
            "explanation": "Berlin is the capital of Germany"
        },
        {
            "text": "Madrid",
            "is_correct": false,
            "explanation": "Madrid is the capital of Spain"
        }
    ]
}
```

**Question 2:**
```json
{
    "text": "Which is the largest ocean on Earth?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "The Pacific Ocean is the largest and deepest ocean on Earth.",
    "order": 2,
    "options": [
        {
            "text": "Atlantic Ocean",
            "is_correct": false,
            "explanation": "This is the second largest ocean"
        },
        {
            "text": "Indian Ocean",
            "is_correct": false,
            "explanation": "This is the third largest ocean"
        },
        {
            "text": "Pacific Ocean",
            "is_correct": true,
            "explanation": "Correct! The Pacific is the largest ocean"
        },
        {
            "text": "Arctic Ocean",
            "is_correct": false,
            "explanation": "This is the smallest ocean"
        }
    ]
}
```

**Question 3:**
```json
{
    "text": "What is the longest river in the world?",
    "type": "mcq",
    "difficulty": "medium",
    "explanation": "The Nile River in Africa is generally considered the longest river at about 6,650 km.",
    "order": 3,
    "options": [
        {
            "text": "Amazon River",
            "is_correct": false,
            "explanation": "The Amazon is the second longest but has the largest discharge"
        },
        {
            "text": "Nile River",
            "is_correct": true,
            "explanation": "Correct! The Nile is the longest river"
        },
        {
            "text": "Yangtze River",
            "is_correct": false,
            "explanation": "The Yangtze is the third longest river"
        },
        {
            "text": "Mississippi River",
            "is_correct": false,
            "explanation": "This is one of the longest rivers in North America"
        }
    ]
}
```

### Quiz 4: Science Quiz

```json
{
    "title": "Basic Science Knowledge",
    "description": "Test your understanding of fundamental science concepts from physics, chemistry, and biology.",
    "category": 2,
    "time_limit": 30,
    "pass_percentage": 70,
    "status": "published",
    "shuffle_questions": true,
    "shuffle_answers": true,
    "show_correct_answer": true,
    "tags": ["science", "physics", "chemistry", "biology"]
}
```

**Questions for Science Quiz:**

**Question 1:**
```json
{
    "text": "What is the chemical symbol for water?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "Water is composed of two hydrogen atoms and one oxygen atom, hence H2O.",
    "order": 1,
    "options": [
        {
            "text": "H2O",
            "is_correct": true,
            "explanation": "Correct! Water is H2O"
        },
        {
            "text": "CO2",
            "is_correct": false,
            "explanation": "This is carbon dioxide"
        },
        {
            "text": "O2",
            "is_correct": false,
            "explanation": "This is oxygen gas"
        },
        {
            "text": "H2O2",
            "is_correct": false,
            "explanation": "This is hydrogen peroxide"
        }
    ]
}
```

**Question 2:**
```json
{
    "text": "What is the speed of light in vacuum?",
    "type": "mcq",
    "difficulty": "medium",
    "explanation": "The speed of light in vacuum is approximately 299,792 kilometers per second.",
    "order": 2,
    "options": [
        {
            "text": "300,000 km/s",
            "is_correct": true,
            "explanation": "Correct! This is approximately the speed of light"
        },
        {
            "text": "150,000 km/s",
            "is_correct": false,
            "explanation": "This is too slow"
        },
        {
            "text": "500,000 km/s",
            "is_correct": false,
            "explanation": "This is faster than light speed"
        },
        {
            "text": "100,000 km/s",
            "is_correct": false,
            "explanation": "This is too slow"
        }
    ]
}
```

**Question 3:**
```json
{
    "text": "What is the powerhouse of the cell?",
    "type": "mcq",
    "difficulty": "easy",
    "explanation": "Mitochondria produce energy (ATP) for the cell through cellular respiration.",
    "order": 3,
    "options": [
        {
            "text": "Nucleus",
            "is_correct": false,
            "explanation": "The nucleus contains genetic material"
        },
        {
            "text": "Ribosome",
            "is_correct": false,
            "explanation": "Ribosomes synthesize proteins"
        },
        {
            "text": "Mitochondria",
            "is_correct": true,
            "explanation": "Correct! Mitochondria produce energy"
        },
        {
            "text": "Chloroplast",
            "is_correct": false,
            "explanation": "Chloroplasts are found in plant cells for photosynthesis"
        }
    ]
}
```

---

## 🎮 Sample Live Quiz Sessions

### Live Session 1: Quick Python Challenge

```json
{
    "quiz": 1,
    "time_per_question": 20,
    "show_leaderboard": true,
    "allow_late_join": false,
    "max_participants": 30
}
```

### Live Session 2: Geography Tournament

```json
{
    "quiz": 3,
    "time_per_question": 15,
    "show_leaderboard": true,
    "allow_late_join": true,
    "max_participants": 100
}
```

---

## 📊 Sample Test Scenarios

### Scenario 1: Complete Quiz Flow

1. **Register Student**
   ```json
   POST /api/users/register/
   Body: Use Student 1 data above
   ```

2. **Login**
   ```json
   POST /api/token/
   Body: { "username": "student1@example.com", "password": "Student@123" }
   ```

3. **List Quizzes**
   ```json
   GET /api/quizzes/
   ```

4. **Start Quiz Attempt**
   ```json
   POST /api/quizzes/attempts/
   Body: { "quiz_id": 1 }
   ```

5. **Submit Answers** (Repeat for each question)
   ```json
   POST /api/quizzes/attempts/{attempt_id}/submit_answer/
   Body: { "question_id": 1, "selected_option_id": 2 }
   ```

6. **Complete Quiz**
   ```json
   POST /api/quizzes/attempts/{attempt_id}/complete/
   ```

7. **View Statistics**
   ```json
   GET /api/results/statistics/my_statistics/
   ```

### Scenario 2: Teacher Creates Quiz

1. **Register Teacher**
   ```json
   POST /api/users/register/
   Body: Use Teacher 1 data above
   ```

2. **Login**
   ```json
   POST /api/token/
   Body: { "username": "teacher1@example.com", "password": "Teacher@123" }
   ```

3. **Initialize Categories**
   ```json
   POST /api/quizzes/initialize-categories/
   ```

4. **Create Quiz**
   ```json
   POST /api/quizzes/
   Body: Use Python Fundamentals quiz data above
   ```

5. **Add Questions** (Repeat for each question)
   ```json
   POST /api/quizzes/{quiz_id}/questions/
   Body: Use question data above
   ```

6. **View Analytics**
   ```json
   GET /api/quizzes/{quiz_id}/analytics/
   ```

---

## 🔄 Quick Test Script Order

```
1. Initialize Categories
2. Register Teacher
3. Login as Teacher
4. Create Quiz (Python Fundamentals)
5. Add 5 Questions to Quiz
6. Publish Quiz (set status to "published")
7. Register Student
8. Login as Student
9. List Quizzes
10. Start Quiz Attempt
11. Submit 5 Answers
12. Complete Quiz
13. View Results
14. Check Leaderboard
15. View Statistics
```

---

## 💡 Tips for Using Test Data

1. **Category IDs**: After initializing categories, use these IDs:
   - 1: Programming
   - 2: Science
   - 3: History
   - 4: Mathematics
   - 5: General Knowledge

2. **Password Requirements**: All test passwords meet requirements:
   - Minimum 8 characters
   - Contains uppercase, lowercase, number, and special character

3. **Multiple Attempts**: You can create multiple students and have them take the same quiz to test leaderboards

4. **Live Sessions**: Use the join_code returned when creating a live session

5. **Question Order**: Questions will be displayed in the order specified by the "order" field

---

**Happy Testing! 🎉**
