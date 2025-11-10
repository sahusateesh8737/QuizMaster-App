# Quiz Application - Production Level Setup

A comprehensive, production-ready quiz application built with Django REST Framework and React. This application follows industry best practices for scalability, security, and reliability.

## 🎯 Features

### User-Facing Features
- **Authentication**: Sign-up, login, social OAuth, secure password reset, email verification
- **Quiz Discovery**: Featured, new, and popular quizzes with powerful search and category browsing
- **Quiz Experience**: Multiple question types (MCQ, T/F, Fill-in-the-Blank, Matching), quiz timer, progress bar
- **Results & Analytics**: Instant results, answer review, leaderboards, user profile, social sharing
- **Gamification**: User badges, points system, achievement tracking

### Admin-Facing Features
- **Django Admin Panel**: Production-ready admin dashboard
- **Quiz Management**: Create, read, update, delete quizzes with full CRUD operations
- **Question Bank**: Reusable questions across quizzes with multiple question types
- **Analytics Dashboard**: User statistics, quiz performance, detailed question analytics
- **Per-Quiz Analytics**: Track which questions fail most often

## 🏗️ System Architecture

```
Client (React Frontend)
    ↓
Load Balancer (Nginx)
    ↓
Reverse Proxy (Nginx)
    ↓
Application Server (Gunicorn)
    ↓
Django App (REST API)
    ↓
External Services:
  - Database (PostgreSQL)
  - Cache (Redis)
  - Message Broker (Celery)
  - File Storage (AWS S3)
  - Task Queue (Celery Workers)
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (optional, for local development)
- Redis (optional, for local development)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd quiz/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Create .env file**
```bash
cp .env.example .env
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Run development server**
```bash
python manage.py runserver
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file** (if needed)
```bash
REACT_APP_API_URL=http://localhost:8000/api
```

4. **Start development server**
```bash
npm run dev
```

### Docker Setup

**Run entire stack with Docker Compose:**
```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- Django application
- Celery worker
- Celery beat scheduler

## 📁 Project Structure

```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py          # Common settings
│   │   ├── development.py   # Development settings
│   │   └── production.py    # Production settings
│   ├── urls.py
│   ├── wsgi.py
│   └── celery.py
├── apps/
│   ├── users/               # User management
│   ├── quizzes/            # Quiz CRUD, questions
│   └── results/            # Leaderboards, statistics
├── templates/
├── manage.py
└── requirements.txt

frontend/
├── src/
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── store/             # Zustand stores
│   └── App.jsx
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🔑 Key Technologies

### Backend
- **Django 4.2**: Web framework
- **Django REST Framework**: RESTful API
- **PostgreSQL**: Database
- **Redis**: Caching & message broker
- **Celery**: Task queue & background jobs
- **Gunicorn**: WSGI application server
- **Pytest**: Testing framework
- **JWT**: Authentication

### Frontend
- **React 18**: UI library
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Zustand**: State management
- **Framer Motion**: Animations
- **Axios**: HTTP client

## 🔒 Security Features

- ✅ JWT authentication with refresh tokens
- ✅ CORS protection
- ✅ HTTPS/SSL enforcement (production)
- ✅ HSTS headers
- ✅ SQL injection prevention (ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Password hashing
- ✅ Environment variables for secrets
- ✅ Rate limiting capabilities
- ✅ Email verification

## 📊 API Documentation

API documentation is available at:
- **Swagger UI**: `http://localhost:8000/api/schema/swagger/`
- **ReDoc**: `http://localhost:8000/api/schema/redoc/`

### Key Endpoints

#### Authentication
- `POST /api/users/` - Register new user
- `POST /api/token/` - Login
- `POST /api/token/refresh/` - Refresh access token
- `POST /api/users/me/` - Get current user

#### Quizzes
- `GET /api/quizzes/` - List quizzes
- `POST /api/quizzes/` - Create quiz
- `GET /api/quizzes/{id}/` - Get quiz details
- `PUT /api/quizzes/{id}/` - Update quiz
- `DELETE /api/quizzes/{id}/` - Delete quiz

#### Quiz Attempts
- `POST /api/quizzes/attempts/` - Start quiz
- `POST /api/quizzes/attempts/{id}/submit_answer/` - Submit answer
- `POST /api/quizzes/attempts/{id}/complete/` - Complete quiz

#### Results
- `GET /api/results/leaderboard/` - Get leaderboard
- `GET /api/results/statistics/my_statistics/` - Get user statistics

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest --cov=.                 # Run with coverage
pytest --cov=. --cov-report=html  # Generate HTML report
```

### Frontend Tests
```bash
cd frontend
npm run test                    # Run tests
npm run test:coverage          # Run with coverage
```

## 🚢 Deployment

### Using Docker
1. Build image: `docker build -t quiz-backend .`
2. Push to registry: `docker push your-registry/quiz-backend`
3. Deploy using orchestration tool (Kubernetes, Docker Swarm, etc.)

### Using GitHub Actions
Automated CI/CD pipeline is configured in `.github/workflows/ci-cd.yml`

Includes:
- Python linting and formatting
- Database migrations
- Test execution
- Docker image building
- Deployment (configure deploy secrets)

## 📈 Monitoring & Logging

- **Sentry**: Error tracking (configure `SENTRY_DSN`)
- **Logging**: Structured logging to console
- **Performance**: Database query optimization
- **Caching**: Redis for frequently accessed data

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open Pull Request

## 📝 Environment Variables

See `.env.example` for all available configuration options.

## 📄 License

This project is licensed under the MIT License.

## 🎓 Learning Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker Documentation](https://docs.docker.com/)

---

**Build with ❤️ for professional developers**
