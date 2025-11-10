# Quick Vercel Deployment Steps

## 1. Set Up Database (Choose One)

### Option A: Vercel Postgres
```bash
# In Vercel Dashboard:
# Storage → Create Database → Postgres
# Copy the DATABASE_URL
```

### Option B: Supabase (Free)
```bash
# Sign up at supabase.com
# Create project → Settings → Database → Copy connection string
```

## 2. Deploy to Vercel

### Via Dashboard:
1. Go to https://vercel.com/new
2. Import your GitHub repo: `sahusateesh8737/QuizMaster-App`
3. Set Root Directory: `backend`
4. Add environment variables (see below)
5. Click Deploy

### Via CLI:
```bash
cd backend
vercel login
vercel
# Follow prompts
vercel --prod  # Deploy to production
```

## 3. Required Environment Variables

```bash
DJANGO_SETTINGS_MODULE=config.settings.vercel
SECRET_KEY=your-secret-key-min-50-chars
DATABASE_URL=postgresql://user:pass@host:5432/db
ALLOWED_HOSTS=.vercel.app,.now.sh
FRONTEND_URL=https://your-frontend-url.vercel.app
CSRF_TRUSTED_ORIGINS=https://*.vercel.app
```

## 4. Run Migrations

```bash
# Set DATABASE_URL locally
export DATABASE_URL="your-production-database-url"

# Run migrations
python manage.py migrate --settings=config.settings.vercel

# Create superuser
python manage.py createsuperuser --settings=config.settings.vercel

# Load sample data
python manage.py create_sample_data --settings=config.settings.vercel
```

## 5. Test Deployment

```bash
# Your API will be at:
https://your-project.vercel.app/api/

# Test endpoints:
curl https://your-project.vercel.app/api/health/
curl https://your-project.vercel.app/api/categories/

# Admin panel:
https://your-project.vercel.app/admin/
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Check DATABASE_URL format and SSL settings |
| CORS errors | Add frontend URL to CORS_ALLOWED_ORIGINS |
| 500 errors | Check Vercel logs: `vercel logs` |
| Static files not loading | Run collectstatic and check STATIC_ROOT |

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Vercel
3. ⏭️  Deploy frontend to Vercel
4. ⏭️  Update frontend API URL to backend URL
5. ⏭️  Test full application

## Useful Commands

```bash
# View logs
vercel logs --follow

# Pull environment variables locally
vercel env pull

# Redeploy
vercel --prod

# List deployments
vercel ls
```

---

📖 **Full Guide**: See `VERCEL_DEPLOYMENT.md` for detailed instructions
