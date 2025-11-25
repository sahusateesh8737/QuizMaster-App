import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.vercel')

# Import and setup Django
from django.core.wsgi import get_wsgi_application  # noqa: E402

# Run migrations on startup (only if DATABASE_URL is set)
if 'DATABASE_URL' in os.environ:
    try:
        from django.core.management import call_command
        import django
        django.setup()
        print("🔄 Running migrations...")
        call_command('migrate', '--noinput')
        print("✅ Migrations completed")
    except Exception as e:
        print(f"⚠️  Migration error (will retry on next cold start): {e}")

application = get_wsgi_application()

# Export for Vercel
app = application
