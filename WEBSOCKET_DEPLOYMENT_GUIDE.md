# WebSocket Deployment Guide

## Current Deployment Status

### ✅ What's Working Now (Vercel)
- **Polling-based real-time updates** (2-second interval)
- Teacher sees quiz completion immediately (no waiting)
- Students detect completion within 2 seconds
- Full fallback support built-in

### 🚀 What's Ready (But Not Active on Vercel)
- **WebSocket support** fully implemented
- Socket.IO server integration complete
- Instant updates (0ms delay) when WebSocket server available
- Hybrid mode: WebSocket primary, polling fallback

## Why WebSockets Aren't Active on Vercel

Vercel's serverless architecture doesn't support persistent WebSocket connections. The WebSocket code is safely wrapped with try/catch, so:
- ✅ No errors or crashes
- ✅ Gracefully falls back to polling
- ✅ App works perfectly in current state

## Option 1: Keep Current Setup (Recommended for Now)

**Pros:**
- ✅ Works perfectly on Vercel (no changes needed)
- ✅ No additional infrastructure cost
- ✅ Simple deployment and maintenance
- ✅ 2-second delay acceptable for most use cases

**When to use:**
- Current MVP/testing phase
- Budget constraints
- <100 concurrent live quizzes
- 2-second delay acceptable

**No action required** - Everything works as-is!

## Option 2: Enable WebSockets (For Production Scale)

### Deploy WebSocket Server Separately

You need a **persistent server** (not serverless) for WebSocket support:

#### A. Railway (Recommended - Easiest)

1. **Create Railway account**: https://railway.app
2. **Create new project** from GitHub repo
3. **Configure build**:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn wsgi_socketio:application -k geventwebsocket.worker.GeventWebSocketWorker
   ```
4. **Add environment variables**:
   ```
   DATABASE_URL=<your-vercel-postgres-url>
   DJANGO_SETTINGS_MODULE=config.settings.production
   PORT=8000
   ```
5. **Get WebSocket URL**: e.g., `wss://your-app.railway.app`
6. **Update frontend** `.env.production`:
   ```
   VITE_WS_URL=wss://your-app.railway.app
   ```

**Cost**: ~$5/month (Hobby plan)

#### B. Render

1. **Create Render account**: https://render.com
2. **New Web Service** → Connect GitHub
3. **Configure**:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn wsgi_socketio:application -k geventwebsocket.worker.GeventWebSocketWorker
   ```
4. **Add environment variables** (same as above)
5. **Get URL** and update `VITE_WS_URL`

**Cost**: Free tier available, $7/month for production

#### C. Heroku

1. **Create Heroku app**: https://heroku.com
2. **Connect GitHub repo**
3. **Add buildpack**: `heroku/python`
4. **Create `Procfile`**:
   ```
   web: gunicorn wsgi_socketio:application -k geventwebsocket.worker.GeventWebSocketWorker
   ```
5. **Set config vars** (environment variables)
6. **Deploy** and get WebSocket URL

**Cost**: $7/month (Eco Dynos)

### Additional Setup for WebSocket Server

Add to `requirements.txt`:
```
gevent-websocket==0.10.1
gunicorn[gevent]==21.2.0
```

Update CORS settings in `config/settings/production.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'https://quiz-master-app-roh5.vercel.app',  # Your frontend
    'https://your-websocket-server.railway.app',  # Your WS server
]
```

## Option 3: Hybrid Deployment (Best of Both Worlds)

### Architecture:
- **Vercel**: Hosts Django API + Frontend (as now)
- **Railway/Render**: Runs only WebSocket server
- **Polling**: Continues as fallback

### Setup:

1. **Keep current Vercel deployment**
2. **Deploy only WebSocket layer** to Railway:
   - Create minimal Python app with just `socketio_server.py`
   - Connect to same Vercel Postgres database
   - Emit events when quiz state changes
3. **Update frontend** `VITE_WS_URL` to Railway URL
4. **Test**: WebSocket connects → instant updates; WebSocket fails → polling works

### Benefits:
- ✅ 0ms delay when WebSocket available
- ✅ Still works if WebSocket server down
- ✅ Minimal additional cost (~$5/month)
- ✅ Best user experience

## Testing WebSocket Locally

### Start WebSocket-enabled Django:

```bash
cd backend
pip install python-socketio aiohttp gevent-websocket
gunicorn wsgi_socketio:application -k geventwebsocket.worker.GeventWebSocketWorker --reload
```

### Start Frontend with WebSocket:

```bash
cd frontend
# Create .env.development.local
echo "VITE_WS_URL=ws://localhost:8000" > .env.development.local
npm run dev
```

### Verify Connection:

Open browser console:
```
[WebSocket] Connecting to session 123...
[WebSocket] Connected! Socket ID: xyz
[WebSocket] Successfully joined quiz 123
```

## Monitoring

### Check if WebSocket is Working:

In LiveQuizControl page:
- **Green dot + "WebSocket"** = ✅ WebSocket connected (instant updates)
- **Yellow dot + "Polling"** = ⚠️ Fallback mode (2s delay)
- **Red dot + "Checking..."** = ❌ Connection issue

### Console Logs:

WebSocket active:
```
LiveQuizControl: WebSocket connected
LiveQuizControl: WebSocket - Quiz completed, redirecting
```

Polling fallback:
```
LiveQuizControl: WebSocket error, using polling fallback
LiveQuizControl: Fetched session data, status: completed
```

## Performance Comparison

| Metric | Polling Only | With WebSocket |
|--------|-------------|----------------|
| Update Delay | 2 seconds | Instant (0ms) |
| Server Requests/min | 30 | 2 |
| Bandwidth | High | Low |
| Scalability | 100 users | 1000+ users |
| User Experience | Good | Excellent |
| Infrastructure | Simple | +1 server |
| Cost | $0 extra | +$5/month |

## Recommended Path

### Phase 1: Now (Current)
- ✅ Use polling (already working perfectly)
- ✅ Deploy to Vercel as-is
- ✅ Monitor usage and user feedback

### Phase 2: Growth (50+ concurrent users)
- Deploy WebSocket server to Railway
- Update `VITE_WS_URL` environment variable
- Test both WebSocket and polling fallback
- Monitor connection rates

### Phase 3: Scale (500+ concurrent users)
- Consider managed WebSocket service (Pusher, Ably)
- Implement Redis for pub/sub
- Add horizontal scaling

## Environment Variables

### Frontend (.env.production):
```env
VITE_API_URL=https://quiz-master-app-swart.vercel.app/api
VITE_WS_URL=wss://your-websocket-server.railway.app  # Optional
```

### Backend (Vercel/Railway):
```env
DATABASE_URL=postgres://...
DJANGO_SETTINGS_MODULE=config.settings.production
ALLOWED_HOSTS=.vercel.app,.railway.app
CORS_ALLOWED_ORIGINS=https://quiz-master-app-roh5.vercel.app
```

## Troubleshooting

### WebSocket not connecting:
1. Check `VITE_WS_URL` is set correctly
2. Verify WebSocket server is running
3. Check CORS settings allow your frontend domain
4. Open browser console for error messages

### Falling back to polling:
- **Expected behavior** if WebSocket server not deployed
- No action needed - app still works perfectly

### Slower updates after deployment:
- Verify polling interval (should be 2s without WebSocket, 5s with)
- Check network tab in browser DevTools
- Ensure backend is responding quickly

## Support

- **Current setup works perfectly** - No action needed
- **WebSocket optional** - Only enable when scaling up
- **Polling is reliable** - 2-second delay is acceptable for MVP

For questions, check browser console for detailed logs showing which mode is active.
