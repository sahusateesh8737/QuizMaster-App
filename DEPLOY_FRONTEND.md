# 🚀 Quick Frontend Deployment to Vercel

Your backend is live at: **https://quiz-master-app-swart.vercel.app**

## Deploy Frontend in 3 Steps:

### Step 1: Go to Vercel Dashboard
👉 https://vercel.com/new

### Step 2: Import & Configure
1. Click "Import Project"
2. Select repository: `sahusateesh8737/QuizMaster-App`
3. Configure:
   - **Root Directory**: `frontend` ⚠️ IMPORTANT
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variable
Add this in "Environment Variables" section:
```
Name:  VITE_API_URL
Value: https://quiz-master-app-swart.vercel.app/api
```
✅ Select: Production, Preview, Development

Click **Deploy** and wait 2-3 minutes! ⏱️

---

## After Frontend Deploys

### 1. Update Backend CORS
Go to your **backend** Vercel project → Settings → Environment Variables

Add/Update:
```
FRONTEND_URL=https://your-frontend-url.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-frontend-url.vercel.app
```

Then redeploy backend or wait for auto-redeploy.

### 2. Test Your App
Visit your frontend URL and test:
- ✅ Home page loads
- ✅ Sign up / Login works
- ✅ Browse quizzes
- ✅ Take a quiz
- ✅ View results

---

## Alternative: Deploy via CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

---

## Your Complete App URLs

After deployment:

| Service | URL |
|---------|-----|
| **Frontend** | `https://your-frontend.vercel.app` |
| **Backend API** | `https://quiz-master-app-swart.vercel.app/api/` |
| **Admin Panel** | `https://quiz-master-app-swart.vercel.app/admin/` |
| **API Docs** | `https://quiz-master-app-swart.vercel.app/api/schema/swagger-ui/` |

---

## Troubleshooting

**CORS Errors?**
- Update backend's `CORS_ALLOWED_ORIGINS` with frontend URL
- Redeploy backend

**API Not Working?**
- Check `VITE_API_URL` in Vercel environment variables
- Verify: `https://quiz-master-app-swart.vercel.app/api/`

**Build Failed?**
- Check build logs in Vercel dashboard
- Test locally: `npm install && npm run build`

---

📖 **Detailed Guide**: See `frontend/VERCEL_DEPLOYMENT.md`

🎉 **You're almost done!**
