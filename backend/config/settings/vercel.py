"""
Vercel deployment settings for quiz project.
"""

import os

from .base import *  # noqa: F403

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DEBUG", "False") == "True"

# Vercel provides the VERCEL_URL environment variable
ALLOWED_HOSTS = [
    ".vercel.app",
    ".now.sh",
    "localhost",
    "127.0.0.1",
]

# Add your custom domain when you set it up
if "ALLOWED_HOSTS" in os.environ:
    ALLOWED_HOSTS.extend(os.environ["ALLOWED_HOSTS"].split(","))

# CORS settings for Vercel frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://quiz-master-app-roh5.vercel.app",  # Your frontend URL
]

# Add Vercel frontend URL when deployed
if "FRONTEND_URL" in os.environ:
    frontend_urls = os.environ["FRONTEND_URL"].split(",")
    CORS_ALLOWED_ORIGINS.extend(frontend_urls)

# Allow all Vercel preview deployments
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# Cache Configuration - Use dummy cache for Vercel (no Redis)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# Celery Configuration - Disable for Vercel
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Database - Use SQLite for serverless (or add PostgreSQL connection)
# For production, you should use a managed database like:
# - Vercel Postgres
# - Supabase
# - PlanetScale
# - Neon

if "DATABASE_URL" in os.environ:
    import dj_database_url

    DATABASES = {
        "default": dj_database_url.config(default=os.environ["DATABASE_URL"], conn_max_age=600, ssl_require=True)
    }
else:
    # Fallback to SQLite (not recommended for production)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": "/tmp/db.sqlite3",  # Vercel uses /tmp for writable storage
        }
    }

# Static files configuration for Vercel
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")  # noqa: F405
STATICFILES_DIRS = []

# Media files configuration (use external storage for production)
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")  # noqa: F405

# Security settings (relaxed for serverless)
SECURE_SSL_REDIRECT = False  # Vercel handles SSL
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True

# CSRF settings for Vercel
CSRF_TRUSTED_ORIGINS = [
    "https://*.vercel.app",
    "https://*.now.sh",
]

# Add your custom domain when you set it up
if "CSRF_TRUSTED_ORIGINS" in os.environ:
    CSRF_TRUSTED_ORIGINS.extend(os.environ["CSRF_TRUSTED_ORIGINS"].split(","))

# Logging for Vercel
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
    },
}

# Email configuration (use environment variables)
if "EMAIL_HOST" in os.environ:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.environ["EMAIL_HOST"]
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", 587))
    EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True") == "True"
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
