import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production') 
# Note: User might need to change this to 'config.settings.vercel' if on Vercel
# But usually DJANGO_SETTINGS_MODULE is set in env vars.

try:
    django.setup()
except Exception as e:
    # Fallback for local testing if production settings fail
    print(f"Production setup failed: {e}")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    django.setup()

from django.contrib.auth import get_user_model

def create_admin():
    User = get_user_model()
    username = os.environ.get('ADMIN_USERNAME', 'admin')
    email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
    password = os.environ.get('ADMIN_PASSWORD', 'password123')

    try:
        if not User.objects.filter(username=username).exists():
            print(f"Creating admin user: {username}")
            User.objects.create_superuser(username, email, password)
            print("Admin user created successfully.")
        else:
            print(f"Admin user {username} already exists.")
            # Optional: Update password if needed
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            print("Admin password updated.")
            
    except Exception as e:
        print(f"Error creating admin: {e}")

if __name__ == '__main__':
    create_admin()
