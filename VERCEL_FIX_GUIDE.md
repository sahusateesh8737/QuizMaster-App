# Vercel Deployment Fix Guide

## 🚨 Current Problem

Your Vercel deployment has **database migration issues**. The errors show:
- `no such table: users_user`
- `no such table: quizzes_quiz`
- `no such table: quizzes_category`
- `no such table: results_leaderboardentry`

**Root Cause**: SQLite at `/tmp/db.sqlite3` is ephemeral on Vercel. Each serverless function invocation gets a fresh `/tmp` directory, so migrations aren't persisted.

## ✅ Solution: Use Persistent Database

### Option 1: Neon Postgres (Recommended - FREE)

1. **Sign up at [Neon](https://neon.tech)**
   - Click "Sign up" (GitHub login recommended)
   - Create a new project called "quizmaster"
   - Copy the connection string that looks like:
     ```
     postgresql://username:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
     ```

2. **Add to Vercel Environment Variables**
   - Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
   - Add:
     ```
     DATABASE_URL = postgresql://username:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
     ```
   - Select: Production, Preview, Development (all three)

3. **Install Required Package**
   - Add `psycopg2-binary` to `backend/requirements.txt`
   - Run locally: `pip install psycopg2-binary`

4. **Redeploy**
   - Git commit and push, or click "Redeploy" in Vercel dashboard

### Option 2: Vercel Postgres (Paid but Integrated)

1. In Vercel Dashboard:
   - Storage → Create Database → Postgres
   - Follow wizard
   - Vercel automatically adds `POSTGRES_URL` env var

2. Update `backend/config/settings/vercel.py` to use `POSTGRES_URL` instead of `DATABASE_URL`

### Option 3: Supabase Postgres (FREE)

1. **Sign up at [Supabase](https://supabase.com)**
2. Create new project
3. Settings → Database → Connection String (URI)
4. Copy the connection string
5. Add to Vercel env vars as `DATABASE_URL`

## 🔧 Quick Fix Steps

### Step 1: Update requirements.txt

```bash
cd /Users/sateeshsahu/Desktop/quiz/backend
echo "psycopg2-binary==2.9.9" >> requirements.txt
echo "dj-database-url==2.1.0" >> requirements.txt
```

### Step 2: Update vercel.py settings

The settings file already has database URL support, but we need to ensure migrations run.

### Step 3: Create Migration Runner

Create `backend/run_migrations.py`:

```python
#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.vercel')
django.setup()

from django.core.management import call_command

print("Running migrations...")
call_command('migrate', '--noinput')
print("Migrations complete!")

print("Creating categories...")
try:
    call_command('shell', '-c', """
from apps.quizzes.models import Category

categories = [
    {'name': 'Programming', 'description': 'Programming and coding'},
    {'name': 'Science', 'description': 'Science and technology'},
    {'name': 'Mathematics', 'description': 'Math and logic'},
]

for cat_data in categories:
    Category.objects.get_or_create(
        slug=cat_data['name'].lower(),
        defaults=cat_data
    )
print('Categories initialized')
""")
except Exception as e:
    print(f"Categories creation error: {e}")
```

### Step 4: Run Migrations Locally Against Production DB

Once you have `DATABASE_URL` in Vercel:

```bash
cd /Users/sateeshsahu/Desktop/quiz/backend

# Set the production DATABASE_URL locally
export DATABASE_URL="postgresql://your-connection-string-here"

# Run migrations
python manage.py migrate --settings=config.settings.vercel

# Create superuser
python manage.py createsuperuser --settings=config.settings.vercel

# Initialize categories
python manage.py shell --settings=config.settings.vercel
# Then in the shell:
from apps.quizzes.models import Category
categories_data = [
    {'name': 'Programming', 'slug': 'programming', 'description': 'Programming and coding'},
    {'name': 'Science', 'slug': 'science', 'description': 'Science and technology'},
    {'name': 'Mathematics', 'slug': 'mathematics', 'description': 'Mathematics and logic'},
]
for cat in categories_data:
    Category.objects.get_or_create(slug=cat['slug'], defaults=cat)
exit()
```

### Step 5: Security Fix - Turn Off DEBUG

Update `backend/config/settings/vercel.py`:

```python
# Line ~10
DEBUG = False  # CHANGE FROM True TO False
```

### Step 6: Add ALLOWED_HOSTS

In Vercel environment variables, add:
```
ALLOWED_HOSTS = quiz-master-app-h5z5.vercel.app
```

## 🧪 Testing After Fix

1. **Test Root Endpoint**
   ```bash
   curl https://quiz-master-app-h5z5.vercel.app/
   ```
   Expected: `{"message":"QuizMaster API",...}`

2. **Test Categories**
   ```bash
   curl https://quiz-master-app-h5z5.vercel.app/api/quizzes/categories/
   ```
   Expected: JSON array with categories

3. **Test Registration**
   ```bash
   curl -X POST https://quiz-master-app-h5z5.vercel.app/api/users/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "username": "testuser",
       "password": "Test@123456",
       "password2": "Test@123456",
       "first_name": "Test",
       "last_name": "User",
       "role": "student"
     }'
   ```
   Expected: 201 Created with user data

## 📋 Complete Checklist

- [ ] Sign up for Neon/Supabase (free Postgres)
- [ ] Get DATABASE_URL connection string
- [ ] Add DATABASE_URL to Vercel env vars
- [ ] Add `psycopg2-binary` to requirements.txt
- [ ] Add `dj-database-url` to requirements.txt
- [ ] Commit and push to trigger redeploy
- [ ] Run migrations locally against production DB
- [ ] Create superuser
- [ ] Initialize categories
- [ ] Set DEBUG=False in vercel.py
- [ ] Test all endpoints with curl/Postman
- [ ] Import Postman collection and run full test suite

## 🎯 Postman Testing

After fixing:

1. Import collection: `QuizMaster_API_Collection.postman_collection.json`
2. Set variable `base_url` = `https://quiz-master-app-h5z5.vercel.app`
3. Run collection → Should see all tests pass

## 📞 Need Help?

If you encounter issues:
1. Check Vercel logs: Dashboard → Deployments → Click deployment → Runtime Logs
2. Verify DATABASE_URL is set correctly
3. Ensure `psycopg2-binary` is installed
4. Confirm migrations were run successfully

## 🚀 Alternative: Railway (Easier for Django)

If Vercel continues to be problematic, Railway is Django-friendly:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd /Users/sateeshsahu/Desktop/quiz/backend
railway init
railway up

# Railway automatically:
# - Provides PostgreSQL database
# - Runs migrations
# - Handles static files
# - Gives you persistent storage
```

Railway is often better for Django because:
- Built-in PostgreSQL (no setup needed)
- Persistent filesystem
- Automatic migration running
- Better for Django's architecture
