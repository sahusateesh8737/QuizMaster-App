"""
Development settings for quiz project.
"""

from .base import *  # noqa: F403

# Development settings override
DEBUG = True
ALLOWED_HOSTS = ["*"]

# Use SQLite for development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

# Development email backend
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# CORS for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://quiz-master-app-roh5.vercel.app",
    "https://quiz-master-app-swart.vercel.app",
]

# Development caching
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# Celery for development (synchronous)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
