import os


# Set the Django settings module for Vercel
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.vercel')

from django.core.wsgi import get_wsgi_application  # noqa: E402

application = get_wsgi_application()

# Vercel serverless function handler
app = application
