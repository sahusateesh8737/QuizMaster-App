import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    user = User.objects.get(username='admin')
    user.set_password('password123')
    user.save()
    print("SUCCESS: Admin password reset to 'password123'")
except User.DoesNotExist:
    print("FAILURE: Admin user does not exist.")
    # Create it
    User.objects.create_superuser('admin', 'admin@example.com', 'password123')
    print("SUCCESS: Admin user created with password 'password123'")
except Exception as e:
    print(f"ERROR: {e}")
