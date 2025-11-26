import os
import sys
import django
from django.conf import settings
from django.test import RequestFactory
from django.core.handlers.wsgi import WSGIHandler

# Add backend to path
sys.path.append("/Users/sateeshsahu/Desktop/quiz/backend")

# Mock environment to force SQLite fallback
if "DATABASE_URL" in os.environ:
    del os.environ["DATABASE_URL"]

# Setup Django with Vercel settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.vercel")

# Ensure we use a fresh DB path to simulate Vercel's ephemeral /tmp
# We need to monkeypatch or just rely on vercel.py using /tmp/db.sqlite3
# Let's delete /tmp/db.sqlite3 if it exists to ensure it's fresh/empty
db_path = "/tmp/db.sqlite3"
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"Deleted {db_path}")

try:
    django.setup()
except Exception as e:
    print(f"Setup failed: {e}")
    sys.exit(1)

# Create a request with valid host
factory = RequestFactory()
request = factory.get('/', HTTP_HOST='test.vercel.app')

# Process request
handler = WSGIHandler()
try:
    # Force DB access by using a view that touches session/user?
    # Or just rely on middleware.
    # Let's just run it.
    response = handler(request.environ, lambda x, y: None)
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 500:
        print("✅ Reproduced 500 error")
    else:
        print(f"❌ Failed to reproduce 500. Got {response.status_code}")
        
except Exception as e:
    print(f"✅ Crashed as expected: {e}")
