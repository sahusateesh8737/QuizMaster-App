# QuizMaster API (FastAPI)

High-performance, async backend for QuizMaster, built with FastAPI and SQLAlchemy.

## Features

- 🚀 **FastAPI**: Modern, fast (high-performance) web framework.
- 🗄️ **SQLAlchemy (Async)**: Asynchronous ORM for database interactions.
- 🔒 **OAuth2 & JWT**: Secure authentication with role-based access control.
- 📝 **Pydantic**: Data validation and serialization.
- 🔄 **Alembic**: Database migrations.
- ⚡ **Live Quiz**: Real-time quiz sessions (ready for WebSocket implementation).

## Project Structure

```
backend/
├── app/
│   ├── api/            # API endpoints and dependencies
│   ├── core/           # Configuration and security
│   ├── db/             # Database session and base models
│   ├── models/         # SQLAlchemy models
│   ├── schemas/        # Pydantic schemas
│   └── main.py         # App entry point
├── alembic/            # Migration scripts
├── requirements.txt    # Dependencies
└── vercel.json         # Vercel deployment config
```

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL

### Installation

1.  Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Set up environment variables:
    Create a `.env` file in the `backend` directory:
    ```
    DATABASE_URL=postgresql://user:password@localhost/dbname
    SECRET_KEY=your-secret-key
    ```

### Running Locally

```bash
uvicorn app.main:app --reload
```

Access the API documentation at: http://localhost:8000/docs

### Database Migrations

1.  Generate migration script:
    ```bash
    alembic revision --autogenerate -m "Initial migration"
    ```

2.  Apply migrations:
    ```bash
    alembic upgrade head
    ```
