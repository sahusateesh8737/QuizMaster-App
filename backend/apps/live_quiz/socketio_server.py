"""
WebSocket server for real-time live quiz updates using Socket.IO.

This provides instant updates for:
- Quiz completion
- Question changes
- Participant joins
- Leaderboard updates
"""
import socketio
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Create Socket.IO server with CORS support
sio = socketio.Server(
    async_mode='threading',
    cors_allowed_origins='*',  # Will be restricted in production
    logger=True,
    engineio_logger=True
)

# Store for managing quiz room connections
quiz_rooms = {}


@sio.event
def connect(sid, environ, auth):
    """Handle client connection"""
    logger.info(f'Client {sid} connected')
    return True


@sio.event
def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f'Client {sid} disconnected')
    
    # Remove from all quiz rooms
    for quiz_id in list(quiz_rooms.keys()):
        if sid in quiz_rooms[quiz_id]:
            quiz_rooms[quiz_id].remove(sid)
            logger.info(f'Client {sid} removed from quiz {quiz_id}')
            
            if not quiz_rooms[quiz_id]:
                del quiz_rooms[quiz_id]


@sio.event
def join_quiz(sid, data):
    """Join a quiz room"""
    try:
        quiz_id = str(data.get('sessionId'))
        if not quiz_id:
            logger.error(f'Client {sid} attempted to join without sessionId')
            return {'success': False, 'error': 'sessionId required'}
        
        # Add to room tracking
        if quiz_id not in quiz_rooms:
            quiz_rooms[quiz_id] = set()
        quiz_rooms[quiz_id].add(sid)
        
        # Join the Socket.IO room
        sio.enter_room(sid, f'quiz_{quiz_id}')
        
        logger.info(f'Client {sid} joined quiz {quiz_id}. Room size: {len(quiz_rooms[quiz_id])}')
        return {'success': True, 'sessionId': quiz_id}
        
    except Exception as e:
        logger.error(f'Error joining quiz: {e}')
        return {'success': False, 'error': str(e)}


@sio.event
def leave_quiz(sid, data):
    """Leave a quiz room"""
    try:
        quiz_id = str(data.get('sessionId'))
        if not quiz_id:
            return {'success': False, 'error': 'sessionId required'}
        
        # Remove from room tracking
        if quiz_id in quiz_rooms and sid in quiz_rooms[quiz_id]:
            quiz_rooms[quiz_id].remove(sid)
            if not quiz_rooms[quiz_id]:
                del quiz_rooms[quiz_id]
        
        # Leave the Socket.IO room
        sio.leave_room(sid, f'quiz_{quiz_id}')
        
        logger.info(f'Client {sid} left quiz {quiz_id}')
        return {'success': True}
        
    except Exception as e:
        logger.error(f'Error leaving quiz: {e}')
        return {'success': False, 'error': str(e)}


# Helper functions for emitting events from Django views
def emit_quiz_completed(session_id, session_data=None):
    """Emit quiz completion event to all participants"""
    try:
        room = f'quiz_{session_id}'
        data = {
            'sessionId': session_id,
            'status': 'completed',
            'timestamp': session_data.get('ended_at') if session_data else None
        }
        
        logger.info(f'Emitting quizCompleted to room {room}')
        sio.emit('quizCompleted', data, room=room)
        return True
        
    except Exception as e:
        logger.error(f'Error emitting quiz completed: {e}')
        return False


def emit_question_changed(session_id, question_data=None):
    """Emit question change event to all participants"""
    try:
        room = f'quiz_{session_id}'
        data = {
            'sessionId': session_id,
            'questionIndex': question_data.get('current_question_index') if question_data else None,
            'questionId': question_data.get('current_question', {}).get('id') if question_data else None,
            'timestamp': question_data.get('current_question_start_time') if question_data else None
        }
        
        logger.info(f'Emitting questionChanged to room {room}')
        sio.emit('questionChanged', data, room=room)
        return True
        
    except Exception as e:
        logger.error(f'Error emitting question changed: {e}')
        return False


def emit_participant_joined(session_id, participant_data=None):
    """Emit participant join event"""
    try:
        room = f'quiz_{session_id}'
        data = {
            'sessionId': session_id,
            'participantId': participant_data.get('id') if participant_data else None,
            'participantName': participant_data.get('display_name') if participant_data else None,
            'participantCount': participant_data.get('participant_count') if participant_data else None
        }
        
        logger.info(f'Emitting participantJoined to room {room}')
        sio.emit('participantJoined', data, room=room)
        return True
        
    except Exception as e:
        logger.error(f'Error emitting participant joined: {e}')
        return False


def emit_leaderboard_updated(session_id, leaderboard_data=None):
    """Emit leaderboard update event"""
    try:
        room = f'quiz_{session_id}'
        data = {
            'sessionId': session_id,
            'leaderboard': leaderboard_data
        }
        
        logger.info(f'Emitting leaderboardUpdated to room {room}')
        sio.emit('leaderboardUpdated', data, room=room)
        return True
        
    except Exception as e:
        logger.error(f'Error emitting leaderboard updated: {e}')
        return False


def get_room_size(session_id):
    """Get number of connected clients in a quiz room"""
    quiz_id = str(session_id)
    return len(quiz_rooms.get(quiz_id, set()))
