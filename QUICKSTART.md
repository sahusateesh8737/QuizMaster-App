# Quick Start Guide

This guide will help you get the Quiz Application up and running in minutes.

## ⚡ Quickest Start (Using Docker)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Start the entire stack
docker-compose up -d

# 3. Create superuser
docker-compose exec web python manage.py createsuperuser

# 4. Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Admin Panel: http://localhost:8000/admin
# API Docs: http://localhost:8000/api/schema/swagger/
```

---

## 🛠️ Manual Setup (Local Development)

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser account
python manage.py createsuperuser

# Start development server
python manage.py runserver
# Available at: http://localhost:8000
```

### Step 2: Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Available at: http://localhost:3000
```

### Step 3: (Optional) Start Celery for Background Tasks

```bash
# In a new terminal, with venv activated
cd backend

# Install Redis locally or use Docker
# macOS: brew install redis
# Linux: sudo apt-get install redis-server
# Windows: Use Docker or WSL

# Start Redis
redis-server

# Start Celery worker
celery -A config worker -l info

# In another terminal, start Celery Beat (scheduler)
celery -A config beat -l info
```

---

## 🏃 First Steps After Setup

### 1. Access Admin Dashboard
- Go to: http://localhost:8000/admin
- Login with your superuser credentials
- Create quiz categories (e.g., Python, JavaScript, History)

### 2. Create Your First Quiz
Via Admin Panel:
1. Go to "Quizzes" section
2. Click "Add Quiz"
3. Fill in details:
   - Title
   - Description
   - Category
   - Time Limit (optional)
   - Pass Percentage (default: 60%)
4. Save and add questions

### 3. Create Questions
1. In the saved quiz, go to "Questions"
2. Add questions with answer options
3. Mark the correct answer
4. Set difficulty level

### 4. Test the Frontend
1. Go to http://localhost:3000
2. Register a new account
3. Find and attempt your quiz
4. View results and analytics

---

## 🔧 Common Commands

### Backend

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Run specific app migrations
python manage.py migrate users
python manage.py migrate quizzes

# Run development server
python manage.py runserver

# Run tests
pytest

# Create superuser
python manage.py createsuperuser

# Create test data
python manage.py shell < scripts/create_test_data.py

# Collect static files
python manage.py collectstatic

# Access Django shell
python manage.py shell
```

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Format code
npm run format
```

### Docker

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Run command in container
docker-compose exec [service_name] [command]

# Rebuild images
docker-compose up -d --build
```

---

## 📊 Database Seeds & Test Data

Create initial categories and test quizzes:

```bash
# Via Django shell
python manage.py shell

from apps.quizzes.models import Category
Category.objects.create(
    name="Python",
    slug="python",
    description="Python programming language",
    color="#3776ab"
)
```

---

## 🌍 Environment Setup

### Development (.env)
```env
DEBUG=True
SECRET_KEY=dev-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

### Production-like (.env.production)
```env
DEBUG=False
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
DATABASE_URL=postgresql://user:pass@localhost/quiz_db
REDIS_URL=redis://localhost:6379/0
USE_S3=True
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# macOS/Linux: Find and kill process
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
kill -9 <PID>

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Database Errors
```bash
# Reset database (WARNING: Deletes all data)
python manage.py migrate zero apps.users
python manage.py migrate

# Or start fresh
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping  # Should return "PONG"

# Restart Redis
redis-server restart  # macOS/Linux
# Windows: Restart Docker or WSL
```

### Dependencies Issues
```bash
# Clear Python cache
rm -rf __pycache__ .pytest_cache

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# npm cache clear
npm cache clean --force
npm install
```

---

## 📚 API Testing

### Using cURL
```bash
# Register
curl -X POST http://localhost:8000/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","password2":"password123"}'

# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get quizzes
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/quizzes/
```

### Using Postman
1. Download [Postman](https://www.postman.com/)
2. Import the collection from `.postman_collection.json` (if available)
3. Set environment variables (base_url, token)
4. Start testing endpoints

---

## 📖 Next Steps

1. **Customize UI**: Update colors and branding in `frontend/tailwind.config.js`
2. **Add Social Auth**: Install django-allauth and configure OAuth
3. **Set Up Email**: Configure email backend in `.env`
4. **Deploy**: Use Docker and Kubernetes or platforms like Heroku, Railway, etc.
5. **Monitor**: Set up Sentry for error tracking

---

## 🤔 Need Help?

- Check Django Documentation: https://docs.djangoproject.com/
- Check React Documentation: https://react.dev/
- Review API Docs: http://localhost:8000/api/schema/swagger/
- Check logs: `docker-compose logs -f [service]`

---

Happy coding! 🚀
