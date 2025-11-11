# 🚨 Backend 500 Error - Quick Fix Guide

## The Problem

Your backend is getting **500 Internal Server Error** because:
- No database is configured (DATABASE_URL not set)
- Using SQLite in `/tmp` which doesn't persist on Vercel
- Migrations haven't been run

## ⚡ Quick Fix: Set Up Vercel Postgres (FREE)

### Step 1: Create Vercel Postgres Database

1. Go to your backend project in Vercel: https://vercel.com/dashboard
2. Click on your project: **backend** or **quiz-master-app-swart**
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Click **Continue**
7. Name it: `quizmaster-db`
8. Select region closest to you
9. Click **Create**

### Step 2: Connect Database to Project

After creating, Vercel will show you:
- ✅ Database connected automatically
- Environment variables added automatically

The following variables are now in your project:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
```

### Step 3: Update Environment Variables

Go to: **Settings** → **Environment Variables**

**Add this variable:**
```
Name:  DATABASE_URL
Value: (copy from POSTGRES_URL)
```

Make sure it's enabled for: **Production, Preview, Development**

### Step 4: Redeploy

Click **Deployments** → Latest deployment → **Redeploy**

Or just push a small change to trigger redeploy:
```bash
cd /Users/sateeshsahu/Desktop/quiz
echo "# Database configured" >> backend/README.md
git add backend/README.md
git commit -m "Trigger redeploy after database setup"
git push origin main
```

---

## Alternative: Use Supabase (FREE Forever)

If you prefer not to use Vercel Postgres:

### Step 1: Create Supabase Account
1. Go to: https://supabase.com
2. Sign in with GitHub
3. Click **New Project**
4. Name: `quizmaster`
5. Database Password: (create a strong password - SAVE IT!)
6. Region: Choose closest to you
7. Click **Create new project** (takes ~2 minutes)

### Step 2: Get Database URL
1. Go to **Settings** → **Database**
2. Find **Connection string** → **URI**
3. Copy it (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual password

### Step 3: Add to Vercel
1. Go to your Vercel backend project
2. **Settings** → **Environment Variables**
3. Add:
   ```
   Name:  DATABASE_URL
   Value: postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=require
   ```
   ⚠️ Make sure to add `?sslmode=require` at the end!

### Step 4: Redeploy
Same as above - redeploy the project.

---

## After Database is Connected

### Run Migrations

You need to run migrations on your new database:

#### Option 1: Local Connection (Recommended)
```bash
cd backend

# Set the database URL
export DATABASE_URL="your-database-url-here"

# Run migrations
python manage.py migrate --settings=config.settings.vercel

# Create superuser (for admin access)
python manage.py createsuperuser --settings=config.settings.vercel

# Create sample data
python manage.py create_sample_data --settings=config.settings.vercel
```

#### Option 2: Via Django Shell (after deployment)
Create a management command or use Vercel's function logs to debug.

---

## Verify It's Working

After redeploying with database:

1. **Test API root:**
   ```
   https://quiz-master-app-swart.vercel.app/api/
   ```
   Should return JSON with API endpoints

2. **Test categories:**
   ```
   https://quiz-master-app-swart.vercel.app/api/categories/
   ```
   Should return `[]` (empty array, which is fine)

3. **Test registration from frontend:**
   - Go to your frontend
   - Try to sign up
   - Should work without 500 error

4. **Check admin panel:**
   ```
   https://quiz-master-app-swart.vercel.app/admin/
   ```
   Should show login page (not 500 error)

---

## Current Environment Variables Needed

Make sure these are set in your Vercel backend project:

### Required:
```bash
DJANGO_SETTINGS_MODULE=config.settings.vercel
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:pass@host:5432/db
ALLOWED_HOSTS=.vercel.app,.now.sh
```

### Recommended:
```bash
FRONTEND_URL=https://quiz-master-app-roh5.vercel.app
CORS_ALLOWED_ORIGINS=https://quiz-master-app-roh5.vercel.app
CSRF_TRUSTED_ORIGINS=https://quiz-master-app-roh5.vercel.app
```

---

## Common Issues

### Issue: Still getting 500 after adding database
**Solution:** 
- Check Vercel logs: Dashboard → Your Project → Logs
- Look for migration errors
- Ensure DATABASE_URL format is correct

### Issue: Can't connect to database
**Solution:**
- Verify `?sslmode=require` is at the end of DATABASE_URL
- Test connection locally first
- Check database is running (Supabase/Vercel Postgres dashboard)

### Issue: Migrations failed
**Solution:**
- Run migrations locally connected to prod database
- Check for model conflicts
- Start fresh if needed: Drop all tables and re-migrate

---

## Quick Checklist

- [ ] Database created (Vercel Postgres or Supabase)
- [ ] DATABASE_URL environment variable added
- [ ] Backend redeployed
- [ ] Migrations run successfully
- [ ] Categories created (via create_sample_data)
- [ ] Admin user created
- [ ] Can sign up from frontend
- [ ] No more 500 errors

---

## Next Steps After Database Works

1. Test user registration
2. Test user login  
3. Create some quizzes (as teacher)
4. Test taking quizzes
5. Verify results are saved

## Need Help?

Check Vercel logs for specific errors:
```
Vercel Dashboard → Your Project → Logs → Runtime Logs
```

Look for Django error messages that will tell you exactly what's wrong.
