import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.vercel')

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application

# Create WSGI application
application = get_wsgi_application()

# This is what Vercel will call
app = application
