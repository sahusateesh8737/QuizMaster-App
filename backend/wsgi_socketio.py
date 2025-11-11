"""
WSGI application that combines Django and Socket.IO for real-time updates.

This creates a hybrid application that serves both:
1. Django HTTP/REST API requests
2. Socket.IO WebSocket connections

The Socket.IO server runs alongside Django, allowing real-time communication
while maintaining all existing Django functionality.
"""
import os
import socketio
from django.core.wsgi import get_wsgi_application

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

# Get the Django WSGI application
django_app = get_wsgi_application()

# Import Socket.IO server after Django is initialized
from apps.live_quiz.socketio_server import sio

# Create a combined WSGI application
# Socket.IO will handle WebSocket connections, Django handles everything else
application = socketio.WSGIApp(sio, django_app)

# For deployment
app = application
