# Frontend Deployment Guide for Vercel

This guide will help you deploy the QuizMaster React frontend to Vercel and connect it to your backend.

## Prerequisites

- Backend deployed at: `https://quiz-master-app-swart.vercel.app`
- GitHub repository: `sahusateesh8737/QuizMaster-App`
- Vercel account

## Step-by-Step Deployment

### Step 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**: https://vercel.com/new

2. **Import Repository**:
   - Click "Import Project"
   - Select your GitHub repository: `sahusateesh8737/QuizMaster-App`
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ← IMPORTANT
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)

4. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://quiz-master-app-swart.vercel.app/api
     ```
   - Select: Production, Preview, Development

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

### Step 2: Deploy via Vercel CLI (Alternative)

```bash
# Navigate to frontend directory
cd frontend

# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? quizmaster-frontend (or your choice)
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://quiz-master-app-swart.vercel.app/api

# Deploy to production
vercel --prod
```

### Step 3: Update Backend CORS Settings

After getting your frontend URL (e.g., `https://quizmaster-frontend.vercel.app`), update backend environment variables in Vercel:

1. Go to your **backend** project in Vercel
2. Settings → Environment Variables
3. Update or add:
   ```
   FRONTEND_URL=https://your-frontend-url.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   CSRF_TRUSTED_ORIGINS=https://your-frontend-url.vercel.app
   ALLOWED_HOSTS=.vercel.app,.now.sh
   ```
4. Redeploy backend (or it will auto-redeploy)

### Step 4: Test Your Deployment

1. Visit your frontend URL: `https://your-frontend.vercel.app`

2. Test these features:
   - Home page loads
   - Browse quizzes
   - Sign up / Login
   - Create quiz (as teacher)
   - Take quiz
   - View results

3. Check browser console for any errors

## Environment Variables

### Required

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://quiz-master-app-swart.vercel.app/api` | Backend API URL |

### Optional

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_GA_ID` | `G-XXXXXXXXXX` | Google Analytics ID |
| `VITE_SENTRY_DSN` | `https://...@sentry.io/...` | Sentry error tracking |

## Troubleshooting

### Issue: CORS Errors

**Symptoms**: 
- Console shows: `Access to XMLHttpRequest blocked by CORS policy`
- API requests fail with CORS error

**Solution**:
1. Verify backend environment variables include your frontend URL
2. Update backend's `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`
3. Redeploy backend
4. Clear browser cache

### Issue: API Requests Fail (404)

**Symptoms**:
- API requests return 404
- Console shows: `Failed to fetch`

**Solution**:
1. Verify `VITE_API_URL` is correct: `https://quiz-master-app-swart.vercel.app/api`
2. Test backend directly: `https://quiz-master-app-swart.vercel.app/api/categories/`
3. Ensure environment variable is set in Vercel dashboard
4. Redeploy frontend

### Issue: Build Fails

**Symptoms**:
- Vercel deployment fails during build
- Error: `Command "npm run build" failed`

**Solution**:
1. Check for missing dependencies in `package.json`
2. Verify Node.js version compatibility
3. Run `npm install && npm run build` locally to test
4. Check build logs in Vercel dashboard

### Issue: Blank Page After Deployment

**Symptoms**:
- Deployment succeeds but shows blank page
- No errors in console

**Solution**:
1. Check browser console for JavaScript errors
2. Verify `vercel.json` rewrites configuration
3. Test routes manually: `/login`, `/signup`, `/quizzes`
4. Check if assets are loading (inspect Network tab)

### Issue: Environment Variables Not Working

**Symptoms**:
- `VITE_API_URL` is undefined
- Requests go to `localhost:8000`

**Solution**:
1. Ensure variable name starts with `VITE_`
2. Verify it's added in Vercel dashboard
3. Redeploy after adding variables
4. Check variable is set for all environments (Production, Preview, Development)

## Vercel Configuration Files

### `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This ensures all routes redirect to index.html for client-side routing.

### `.env.production`
```bash
VITE_API_URL=https://quiz-master-app-swart.vercel.app/api
```
Local production build testing.

## Custom Domain Setup (Optional)

1. **Add Domain in Vercel**:
   - Go to project Settings → Domains
   - Click "Add"
   - Enter your domain (e.g., `quizmaster.com`)

2. **Update DNS Records**:
   - Follow Vercel's instructions to update DNS
   - Usually add A or CNAME records

3. **Update Backend CORS**:
   - Add your custom domain to backend's `ALLOWED_HOSTS`
   - Add to `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`

4. **SSL Certificate**:
   - Vercel automatically provisions SSL
   - Usually ready within minutes

## Performance Optimization

### 1. Enable Edge Network
Vercel automatically uses its global CDN.

### 2. Image Optimization
```javascript
// Use Vercel's image optimization
import Image from 'next/image' // If using Next.js

// Or for Vite, use lazy loading
<img loading="lazy" src="..." alt="..." />
```

### 3. Code Splitting
Already configured with Vite's automatic code splitting.

### 4. Caching
Vercel automatically caches static assets.

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

- **main branch** → Production deployment
- **other branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

To disable auto-deploy:
1. Settings → Git
2. Toggle "Production Branch" or "Preview Branches"

## Monitoring & Analytics

### 1. Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### 2. Check Deployment Status
```bash
# View deployments
vercel ls

# View logs
vercel logs
```

### 3. Performance Insights
- Go to project dashboard
- Click "Analytics" tab
- View Core Web Vitals, page views, etc.

## Security Best Practices

- ✅ HTTPS enforced by default
- ✅ Environment variables secured
- ✅ API requests use authentication tokens
- ✅ CORS properly configured
- ✅ No sensitive data in frontend code

## Post-Deployment Checklist

- [ ] Frontend deployed successfully
- [ ] Environment variables set
- [ ] Backend CORS updated with frontend URL
- [ ] Test all major features:
  - [ ] User registration
  - [ ] User login
  - [ ] Browse quizzes
  - [ ] Take quiz
  - [ ] View results
  - [ ] Teacher dashboard (create quiz)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance is good (test on slow connection)
- [ ] Custom domain configured (optional)

## Useful Commands

```bash
# View current deployment
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs --follow

# Pull environment variables
vercel env pull

# List all deployments
vercel ls

# Inspect a deployment
vercel inspect <deployment-url>

# Rollback to previous deployment
vercel rollback <deployment-url>
```

## Support & Resources

- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev
- React Documentation: https://react.dev
- Your Backend: https://quiz-master-app-swart.vercel.app/api/schema/swagger-ui/

## Complete URLs

After deployment, you'll have:

- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://quiz-master-app-swart.vercel.app`
- **Backend API**: `https://quiz-master-app-swart.vercel.app/api/`
- **Admin Panel**: `https://quiz-master-app-swart.vercel.app/admin/`
- **API Docs**: `https://quiz-master-app-swart.vercel.app/api/schema/swagger-ui/`

## Next Steps

1. Share your app!
2. Monitor for errors
3. Gather user feedback
4. Plan new features
5. Keep dependencies updated

Good luck! 🚀
