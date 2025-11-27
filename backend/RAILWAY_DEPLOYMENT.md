# Railway Deployment Guide

This guide explains how to deploy the QuizMaster backend to Railway.

## Prerequisites

- Railway account: [railway.app](https://railway.app)
- GitHub repository connected to Railway
- Railway CLI (optional)

## Step-by-Step Deployment

### 1. Create a New Project on Railway

1. Go to your Railway Dashboard.
2. Click "New Project" -> "Deploy from GitHub repo".
3. Select your repository (`QuizMaster-App`).
4. Select the `backend` directory as the root directory if asked (or configure it in settings later).

### 2. Configure Environment Variables

Go to the "Variables" tab in your Railway project and add the following:

| Variable | Value | Description |
|----------|-------|-------------|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` | Use production settings |
| `SECRET_KEY` | `your-secure-secret-key` | Generate a strong key |
| `DEBUG` | `False` | Disable debug mode |
| `ALLOWED_HOSTS` | `.railway.app` | Allow Railway domains |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Frontend URL |
| `CSRF_TRUSTED_ORIGINS` | `https://your-backend.railway.app` | Backend URL |
| `DISABLE_COLLECTSTATIC` | `1` | If using S3 (or set up S3 vars) |

> **Note:** Railway provides a PostgreSQL database plugin. Add it to your project, and `DATABASE_URL` will be automatically set.

### 3. Database Setup

1. In your Railway project view, right-click (or click "New") -> "Database" -> "PostgreSQL".
2. Railway will automatically inject `DATABASE_URL` into your service variables.

### 4. Build & Deploy

Railway detects the `Procfile` and `requirements.txt`.

- **Build Command**: `pip install -r requirements.txt` (Automatic)
- **Start Command**: `gunicorn config.wsgi:application --log-file -` (From Procfile)

### 5. Run Migrations

Once deployed, you need to run migrations.

**Option A: Railway CLI**
```bash
railway run python manage.py migrate
```

**Option B: Custom Start Command (Not Recommended for every deploy)**
Change start command to:
```bash
python manage.py migrate && gunicorn config.wsgi:application --log-file -
```

**Option C: Railway Shell**
Use the Railway dashboard to open a shell in your service and run:
```bash
python manage.py migrate
```

### 6. Create Superuser

Use the Railway Shell:
```bash
python manage.py createsuperuser
```

## Troubleshooting

- **Static Files**: If styles are missing, ensure you have configured AWS S3 variables, as Railway filesystem is ephemeral (like Vercel).
- **Database Connection**: Ensure the PostgreSQL plugin is connected to your service.
