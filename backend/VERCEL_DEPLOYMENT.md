# Django Backend Deployment Guide for Vercel

This guide will help you deploy the QuizMaster Django backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional but recommended):
   ```bash
   npm install -g vercel
   ```

## Important Notes

⚠️ **Database Considerations**:
- Vercel is a serverless platform, so SQLite won't work in production
- You need a managed database service like:
  - **Vercel Postgres** (recommended, built-in)
  - **Supabase** (PostgreSQL, free tier available)
  - **PlanetScale** (MySQL, free tier)
  - **Neon** (PostgreSQL, free tier)
  - **Railway** (PostgreSQL, free tier)

⚠️ **File Storage**:
- Vercel's filesystem is read-only (except `/tmp`)
- For media uploads, use:
  - **Vercel Blob** (recommended)
  - **AWS S3**
  - **Cloudinary**

## Step-by-Step Deployment

### Step 1: Set Up Database

#### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel Dashboard
2. Click on "Storage" → "Create Database"
3. Select "Postgres"
4. Follow the setup wizard
5. Copy the `DATABASE_URL` connection string

#### Option B: Supabase (Free PostgreSQL)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password

### Step 2: Configure Environment Variables

In your Vercel project, add these environment variables:

**Required:**
```
DJANGO_SETTINGS_MODULE=config.settings.vercel
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=postgresql://user:password@host:5432/database
ALLOWED_HOSTS=.vercel.app,.now.sh,yourdomain.com
FRONTEND_URL=https://your-frontend.vercel.app
```

**Optional but Recommended:**
```
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# CORS (if frontend on different domain)
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com

# For media files (AWS S3)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1
```

### Step 3: Deploy via Vercel Dashboard

1. **Import Project**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `backend` folder as the root directory

2. **Configure Build Settings**:
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: Leave empty (handled by `build_files.sh`)
   - Output Directory: Leave empty
   - Install Command: `pip install -r requirements.txt`

3. **Add Environment Variables**:
   - Add all the environment variables from Step 2

4. **Deploy**:
   - Click "Deploy"
   - Wait for the deployment to complete

### Step 4: Deploy via Vercel CLI (Alternative)

```bash
# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? quizmaster-backend
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

### Step 5: Run Database Migrations

After first deployment, you need to run migrations:

1. **Option A: Using Vercel CLI**:
   ```bash
   vercel env pull .env.local
   python manage.py migrate --settings=config.settings.vercel
   ```

2. **Option B: Using Django Shell on Vercel**:
   - You may need to trigger migrations via a custom management command
   - Or run them locally connected to the production database

3. **Create Superuser** (for admin access):
   ```bash
   # Locally, connected to production DB
   export DATABASE_URL=your-production-database-url
   python manage.py createsuperuser --settings=config.settings.vercel
   ```

### Step 6: Create Sample Data

```bash
# Locally, connected to production DB
export DATABASE_URL=your-production-database-url
python manage.py create_sample_data --settings=config.settings.vercel
```

### Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test endpoints:
   - Health check: `https://your-project.vercel.app/api/health/`
   - API docs: `https://your-project.vercel.app/api/schema/swagger-ui/`
   - Admin: `https://your-project.vercel.app/admin/`

## Troubleshooting

### Common Issues

1. **"No module named 'config'"**
   - Solution: Check that `wsgi.py` is in the root of the backend folder

2. **Database connection errors**
   - Solution: Verify `DATABASE_URL` is correct and database is accessible
   - Check if SSL is required: Add `?sslmode=require` to connection string

3. **Static files not loading**
   - Solution: Run `python manage.py collectstatic --noinput` locally
   - Ensure `STATIC_ROOT` is set correctly

4. **CORS errors from frontend**
   - Solution: Add your frontend URL to `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
   - Update `CSRF_TRUSTED_ORIGINS`

5. **500 Internal Server Error**
   - Solution: Check Vercel logs in the dashboard
   - Enable debug logging temporarily to see error details

### Viewing Logs

```bash
# View deployment logs
vercel logs

# View runtime logs
vercel logs --follow
```

## Environment Variables Reference

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `DJANGO_SETTINGS_MODULE` | Yes | `config.settings.vercel` | Django settings module |
| `SECRET_KEY` | Yes | `django-insecure-...` | Django secret key |
| `DATABASE_URL` | Yes | `postgresql://...` | Database connection string |
| `ALLOWED_HOSTS` | Yes | `.vercel.app` | Allowed hostnames |
| `FRONTEND_URL` | Yes | `https://app.vercel.app` | Frontend URL for CORS |
| `EMAIL_HOST` | No | `smtp.gmail.com` | SMTP server |
| `EMAIL_PORT` | No | `587` | SMTP port |
| `EMAIL_HOST_USER` | No | `user@gmail.com` | SMTP username |
| `EMAIL_HOST_PASSWORD` | No | `app-password` | SMTP password |
| `AWS_ACCESS_KEY_ID` | No | `AKIA...` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | No | `secret...` | AWS secret key |
| `AWS_STORAGE_BUCKET_NAME` | No | `my-bucket` | S3 bucket name |

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Superuser created
- [ ] Sample data loaded (optional)
- [ ] Static files serving correctly
- [ ] API endpoints responding
- [ ] Admin panel accessible
- [ ] Email sending working (test forgot password)
- [ ] CORS configured for frontend
- [ ] Environment variables set correctly
- [ ] Custom domain configured (if applicable)

## Custom Domain Setup

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Add domain to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` environment variables

## Continuous Deployment

Vercel automatically deploys when you push to your GitHub repository:
- **main branch** → Production deployment
- **other branches** → Preview deployments

## Performance Tips

1. **Use Database Connection Pooling**:
   - Add `?pool=true` to your `DATABASE_URL`

2. **Enable Caching**:
   - Use Redis for caching (add Redis provider)

3. **Optimize Static Files**:
   - Use CDN for static/media files
   - Enable compression

4. **Monitor Performance**:
   - Use Vercel Analytics
   - Add Sentry for error tracking

## Security Checklist

- [ ] `DEBUG = False` in production settings
- [ ] Strong `SECRET_KEY` generated
- [ ] Database uses SSL connection
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Environment variables secured

## Support

- Vercel Docs: https://vercel.com/docs
- Django on Vercel: https://vercel.com/guides/deploying-django-with-vercel
- Community: https://github.com/vercel/community

## Alternative: Deploy to Railway

If Vercel doesn't meet your needs, consider Railway:
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Railway is often better for Django because:
- Native PostgreSQL support
- Persistent filesystem
- Built-in Redis
- More generous resource limits
