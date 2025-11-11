# Real-Time Updates Implementation Plan

## Current State (Polling)
- ✅ Frontend polls every 2 seconds
- ✅ Backend updates database correctly
- ⚠️ Up to 2-second delay for status updates
- ⚠️ Increased server load with many concurrent users

## Recommended Solution: Add WebSocket Support

### Phase 1: Install Socket.IO Dependencies

**Backend:**
```bash
pip install python-socketio aiohttp
```

**Frontend:**
```bash
npm install socket.io-client
```

### Phase 2: Backend WebSocket Server

Create `backend/apps/live_quiz/socketio_server.py`:
```python
import socketio
from django.conf import settings

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='aiohttp',
    cors_allowed_origins=settings.CORS_ALLOWED_ORIGINS
)

@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    print(f"Client {sid} connected")
    
@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client {sid} disconnected")

@sio.event
async def join_quiz(sid, data):
    """Join a quiz room"""
    quiz_id = data.get('quizId')
    if quiz_id:
        await sio.enter_room(sid, f'quiz_{quiz_id}')
        print(f"Client {sid} joined quiz {quiz_id}")

@sio.event
async def leave_quiz(sid, data):
    """Leave a quiz room"""
    quiz_id = data.get('quizId')
    if quiz_id:
        await sio.leave_room(sid, f'quiz_{quiz_id}')

# Helper function to emit events
async def emit_quiz_event(quiz_id, event_name, data):
    """Emit event to all clients in a quiz room"""
    await sio.emit(event_name, data, room=f'quiz_{quiz_id}')
```

### Phase 3: Update Backend Views to Emit Events

Modify `backend/apps/live_quiz/views.py`:
```python
from .socketio_server import emit_quiz_event
import asyncio

class LiveQuizSessionViewSet(viewsets.ModelViewSet):
    
    @action(detail=True, methods=['post'])
    def next_question(self, request, pk=None):
        session = self.get_object()
        # ... existing logic ...
        
        has_next = session.next_question()
        
        if not has_next:
            session.end_session()
            
            # 🔥 EMIT WEBSOCKET EVENT
            asyncio.run(emit_quiz_event(
                session.id,
                'quizCompleted',
                {'sessionId': session.id, 'status': 'completed'}
            ))
            
        else:
            # 🔥 EMIT QUESTION CHANGE EVENT
            asyncio.run(emit_quiz_event(
                session.id,
                'questionChanged',
                {'sessionId': session.id, 'question': session.current_question}
            ))
        
        return Response(...)
    
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        session = self.get_object()
        session.end_session()
        
        # 🔥 EMIT WEBSOCKET EVENT
        asyncio.run(emit_quiz_event(
            session.id,
            'quizCompleted',
            {'sessionId': session.id, 'status': 'completed'}
        ))
        
        return Response(...)
```

### Phase 4: Frontend WebSocket Hook

Create `frontend/src/hooks/useQuizSocket.js`:
```javascript
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export const useQuizSocket = (sessionId, callbacks = {}) => {
  const socketRef = useRef(null)

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:8000', {
      transports: ['websocket', 'polling']
    })
    
    socketRef.current = socket

    // Join quiz room
    socket.emit('join_quiz', { quizId: sessionId })

    // Listen for quiz completion
    socket.on('quizCompleted', (data) => {
      console.log('Quiz completed via WebSocket:', data)
      if (callbacks.onQuizCompleted) {
        callbacks.onQuizCompleted(data)
      }
    })

    // Listen for question changes
    socket.on('questionChanged', (data) => {
      console.log('Question changed via WebSocket:', data)
      if (callbacks.onQuestionChanged) {
        callbacks.onQuestionChanged(data)
      }
    })

    // Listen for participant updates
    socket.on('participantJoined', (data) => {
      if (callbacks.onParticipantJoined) {
        callbacks.onParticipantJoined(data)
      }
    })

    // Cleanup
    return () => {
      socket.emit('leave_quiz', { quizId: sessionId })
      socket.disconnect()
    }
  }, [sessionId])

  return socketRef.current
}
```

### Phase 5: Update LiveQuizControl to Use WebSockets

```javascript
import { useQuizSocket } from '../../hooks/useQuizSocket'

export default function LiveQuizControl() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  // 🔥 ADD WEBSOCKET HOOK
  useQuizSocket(sessionId, {
    onQuizCompleted: (data) => {
      console.log('Quiz completed - redirecting immediately!')
      navigate(`/live/results/${sessionId}`)
    },
    onQuestionChanged: (data) => {
      console.log('Question changed - updating UI')
      fetchSessionData()
    },
    onParticipantJoined: (data) => {
      console.log('New participant joined')
      fetchParticipants(sessionId)
    }
  })
  
  // Keep polling as fallback
  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchSessionData()
    }, 5000) // Reduced to 5 seconds since WebSockets handle real-time
    
    return () => clearInterval(interval)
  }, [sessionId])
  
  // ... rest of component
}
```

### Phase 6: Update LiveQuizPlay for Students

```javascript
export default function LiveQuizPlay() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  // 🔥 STUDENTS ALSO GET REAL-TIME UPDATES
  useQuizSocket(sessionId, {
    onQuizCompleted: (data) => {
      console.log('Quiz completed - student redirecting!')
      navigate(`/live/results/${sessionId}`, {
        state: { participantId }
      })
    },
    onQuestionChanged: (data) => {
      console.log('New question available!')
      setSelectedOption(null)
      setAnswered(false)
      fetchSession(sessionId)
    }
  })
  
  // ... rest of component
}
```

## Benefits of WebSocket Implementation

✅ **Instant Updates** - No delay, changes reflect immediately
✅ **Reduced Server Load** - No polling every 2 seconds
✅ **Better UX** - Real-time feels more responsive
✅ **Scalable** - Socket.IO handles thousands of connections
✅ **Fallback Support** - Still works with polling if WebSockets fail

## Deployment Considerations

### Vercel Deployment
- Vercel serverless functions don't support WebSockets natively
- **Solution Options:**
  1. Deploy Socket.IO server separately (Railway, Render, Heroku)
  2. Use Redis Pub/Sub with Vercel Edge Functions
  3. Use third-party service (Pusher, Ably, PubNub)

### Recommended: Hybrid Approach
- Keep current polling implementation (works everywhere)
- Add WebSocket layer for production when deployed to dedicated server
- Use environment variable to toggle: `VITE_ENABLE_WEBSOCKETS=true`

## Implementation Priority

**Current Fix (Already Done):**
- ✅ Immediate redirect on "Finish Quiz" button
- ✅ Polling with 2-second interval
- ✅ Console logging for debugging

**Future Enhancement (When scaling):**
- Add WebSocket support for instant updates
- Reduce polling interval to 5-10 seconds as fallback
- Add connection status indicator

## Testing Checklist

After implementing WebSockets:
- [ ] Teacher clicks "Finish Quiz" → Both teacher and all students redirect within 100ms
- [ ] Teacher clicks "Next Question" → All students see new question within 100ms
- [ ] New participant joins → Teacher sees count update immediately
- [ ] Student submits answer → Leaderboard updates for everyone instantly
- [ ] Connection drops → Fallback to polling works
- [ ] Reconnection → WebSocket re-establishes and syncs state
