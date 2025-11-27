# Railway Deployment Guide

This guide explains how to deploy the QuizMaster backend to Railway.

## Prerequisites

- Railway account: [railway.app](https://railway.app)
- GitHub repository connected to Railway
- Railway CLI installed (`npm i -g @railway/cli`)

## Step-by-Step Deployment

### 1. Create a New Project on Railway

1. Go to your Railway Dashboard.
2. Click "New Project" -> "Deploy from GitHub repo".
3. Select your repository (`QuizMaster-App`).
4. **Important**: Configure the Root Directory.
   - Go to Settings -> General -> Root Directory.
   - Set it to `/backend`.

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
2. Go to your **QuizMaster-App** service -> **Variables**.
3. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `${{ Postgres.DATABASE_URL }}`
   
   *Note: This special syntax tells Railway to automatically pull the connection string from your Postgres service.*

### 4. Build & Deploy

Railway detects the `Procfile` and `requirements.txt`.

- **Build Command**: `pip install -r requirements.txt` (Automatic)
- **Start Command**: `gunicorn config.wsgi:application --log-file -` (From Procfile)

### 5. Run Migrations (Critical Step)

You must run migrations to create the database tables.

**Option A: Using Railway CLI (Recommended)**

1. Open your terminal in the project root.
2. Link your project if you haven't already:
   ```bash
   railway link
   ```
3. Run the migration command **(Note: `manage.py` is in the backend folder, but `railway run` executes in the deployed environment context)**:
   ```bash
   railway run python manage.py migrate
   ```

**Option B: Using Railway Web Shell**

1. Go to your Railway Dashboard.
2. Click on your `QuizMaster-App` service.
3. Click on the "Shell" tab (or "Command" tab).
4. Type and run:
   ```bash
   python manage.py migrate
   ```

### 6. Create Superuser

To access the admin panel, create a superuser:

```bash
# Using CLI
railway run python manage.py createsuperuser

# OR Using Web Shell
python manage.py createsuperuser
```

## Troubleshooting

### "python: can't open file 'manage.py': [Errno 2] No such file or directory"
- This happens if you try to run `python manage.py` locally from the wrong directory.
- **Fix**: `cd backend` before running local commands.
- **Fix for Railway**: If running `railway run`, ensure your service root directory is correctly set to `/backend` in Railway settings, OR if running locally against production DB, make sure you are in the `backend` folder.

### "ALLOWED_HOSTS" Error
- Ensure `ALLOWED_HOSTS` variable includes `.railway.app`.

### Static Files Missing
- Railway's filesystem is ephemeral. Use AWS S3 or Whitenoise for static files.
- If using Whitenoise, ensure `STATIC_ROOT` is set and `collectstatic` runs during build.
