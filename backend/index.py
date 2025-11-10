import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.vercel')

# Import and setup Django
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Export for Vercel
app = application
