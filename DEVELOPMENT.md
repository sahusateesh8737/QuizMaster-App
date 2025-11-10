# Development Guide

This document provides comprehensive guidelines for developing the Quiz Application.

## 🏗️ Architecture Overview

### Backend Architecture
```
Django REST API
├── Authentication Layer (JWT)
├── Request/Response Serialization
├── Business Logic Layer
├── Data Access Layer (ORM)
└── External Services (Redis, S3, Email)
```

### Database Schema
```
Users
├── User (Extended Django User)
├── UserProfile
└── EmailVerificationToken

Quizzes
├── Category
├── Quiz
├── Question
├── QuestionOption
├── QuizAttempt
└── UserAnswer

Results
├── LeaderboardEntry
├── UserBadge
└── UserStatistics
```

## 🔧 Development Workflow

### 1. Creating a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/quiz-timer

# 2. Create migrations if needed
python manage.py makemigrations

# 3. Write tests first (TDD)
# Create tests in apps/quizzes/tests/

# 4. Implement feature
# Update models, serializers, views

# 5. Run tests
pytest apps/quizzes/

# 6. Commit and push
git add .
git commit -m "feat: Add quiz timer functionality"
git push origin feature/quiz-timer

# 7. Create Pull Request
```

### 2. Code Style Guidelines

#### Python (Backend)
- Follow PEP 8
- Use `black` for code formatting
- Use `isort` for import sorting
- Line length: 120 characters

```bash
# Format code
black apps/

# Sort imports
isort apps/

# Check linting
flake8 apps/
```

#### JavaScript (Frontend)
- Use Prettier for formatting
- Use ESLint for linting
- Use TypeScript where possible

```bash
npm run format
npm run lint
```

### 3. Commit Message Format

Use the following format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(quiz): Add timer functionality
fix(auth): Resolve JWT token refresh issue
docs: Update API documentation
test(results): Add leaderboard tests
```

## 🧪 Testing Guidelines

### Backend Tests

```python
# Example test structure
import pytest
from django.test import TestCase
from rest_framework.test import APIClient

@pytest.mark.django_db
class QuizTestCase:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
    
    def test_quiz_creation(self):
        quiz = Quiz.objects.create(
            title='Test Quiz',
            description='Test Description',
            creator=self.user
        )
        assert quiz.title == 'Test Quiz'
    
    def test_quiz_api_endpoint(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/quizzes/')
        assert response.status_code == 200
```

Run tests:
```bash
# Run all tests
pytest

# Run specific test file
pytest apps/quizzes/tests/

# Run with coverage
pytest --cov=apps --cov-report=html

# Run only fast tests
pytest -m fast
```

### Frontend Tests

```javascript
// Example test structure
import { render, screen } from '@testing-library/react';
import QuizCard from '@/components/QuizCard';

describe('QuizCard', () => {
    it('renders quiz title', () => {
        const quiz = { id: 1, title: 'Test Quiz' };
        render(<QuizCard quiz={quiz} />);
        expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    });
});
```

## 📚 API Development

### Creating New Endpoints

1. **Define the Model**
```python
class Quiz(models.Model):
    title = models.CharField(max_length=255)
    # ... fields
```

2. **Create Serializer**
```python
class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', ...]
```

3. **Create ViewSet**
```python
class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
```

4. **Register URL**
```python
router.register(r'quizzes', QuizViewSet)
urlpatterns = [path('', include(router.urls))]
```

5. **Write Tests**
```python
def test_create_quiz(self):
    response = self.client.post('/api/quizzes/', {...})
    assert response.status_code == 201
```

## 🔐 Security Best Practices

1. **Never commit secrets**
   - Use environment variables
   - Use .env files (not in git)

2. **Input validation**
   - Use serializers
   - Validate all user input

3. **Authentication**
   - Use JWT tokens
   - Implement refresh token rotation

4. **Authorization**
   - Use permission classes
   - Check object permissions

5. **SQL Injection Prevention**
   - Use ORM queries
   - Avoid raw SQL

6. **CSRF Protection**
   - Django handles this automatically
   - Include CSRF token in forms

## 🚀 Performance Optimization

### Database Queries
```python
# ❌ Bad - N+1 queries
quizzes = Quiz.objects.all()
for quiz in quizzes:
    print(quiz.creator.name)

# ✅ Good - Use select_related
quizzes = Quiz.objects.select_related('creator')
for quiz in quizzes:
    print(quiz.creator.name)

# ✅ Good - Use prefetch_related for reverse relations
quizzes = Quiz.objects.prefetch_related('questions')
```

### Caching
```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # Cache for 5 minutes
def expensive_view(request):
    # Process data
    return Response(data)
```

### Frontend Optimization
- Code splitting: Use React.lazy()
- Memoization: Use React.memo()
- Image optimization: Lazy load images
- Bundle size: Monitor with webpack-bundle-analyzer

## 📋 Database Migrations

```bash
# Create migration
python manage.py makemigrations apps.quizzes

# Show pending migrations
python manage.py showmigrations

# Apply migrations
python manage.py migrate

# Apply specific app migrations
python manage.py migrate apps.quizzes

# Roll back migration
python manage.py migrate apps.quizzes 0001

# Show SQL for migration
python manage.py sqlmigrate apps.quizzes 0002

# Create empty migration
python manage.py makemigrations apps.quizzes --empty --name migration_name
```

## 🐛 Debugging

### Django Debugging

```python
# Use Django shell
python manage.py shell

# Or use debugger
import pdb; pdb.set_trace()

# Use print statements (for Celery tasks)
print("Debug message:", variable)

# Check logs
tail -f logs/debug.log
```

### Frontend Debugging

- Use React DevTools browser extension
- Use Console tab in DevTools
- Use Network tab to inspect API calls
- Use Zustand DevTools for state management

## 📖 Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying database schema
- Updating dependencies

Format:
```markdown
# Feature Name

## Description
Brief description of the feature.

## Usage
How to use it.

## Example
Code example.
```

## 🔄 Code Review Checklist

Before submitting a PR:
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] No new security issues
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] No unrelated changes included

## 📦 Dependency Management

### Adding Dependencies

```bash
# Backend
pip install package_name
pip freeze > requirements.txt

# Frontend
npm install package_name
npm install package_name --save-dev  # Dev dependency
```

### Updating Dependencies

```bash
# Backend
pip install --upgrade package_name
pip install -r requirements.txt --upgrade

# Frontend
npm update
npm outdated  # Check for outdated packages
```

## 🚢 Deployment Process

1. Merge to main branch
2. Tag release: `git tag v1.0.0`
3. Push tag: `git push origin v1.0.0`
4. GitHub Actions triggers deployment
5. Monitor application in production

## 📊 Monitoring

- Log files: Check `/var/log/` or Docker logs
- Error tracking: Sentry
- Performance: Django Debug Toolbar (dev only)
- Database: Use `django-silk` for profiling

## 🆘 Common Issues

### Issue: Migrations conflict
```bash
# Resolve by merging migrations
python manage.py makemigrations --merge
```

### Issue: Static files not loading
```bash
# Collect static files
python manage.py collectstatic --noinput
```

### Issue: Import errors
```bash
# Ensure all apps are in INSTALLED_APPS
# Check Python path
python -c "import sys; print(sys.path)"
```

---

For more help, check Django and React documentation or reach out to the team!
