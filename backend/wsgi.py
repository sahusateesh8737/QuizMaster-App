import os
import sys
from pathlib import Path

# Add the backend directory to the path
path = Path(__file__).resolve().parent.parent
sys.path.append(str(path))

# Set the Django settings module for Vercel
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.vercel')

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()

# Vercel expects the WSGI application to be named 'app'
app = application
