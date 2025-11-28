"""
Production settings for quiz project.
"""

import dj_database_url

from .base import *  # noqa: F403

# Production settings override
DEBUG = False
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default=".railway.app", cast=Csv())  # noqa: F405

# CORS & CSRF for Railway
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())
CORS_ALLOW_ALL_ORIGINS = True  # Temporary for debugging
CORS_ALLOW_CREDENTIALS = True

# PostgreSQL for production
DATABASES = {
    "default": dj_database_url.config(
        default="sqlite:///" + str(BASE_DIR / "db.sqlite3"),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Security settings
SECURE_SSL_REDIRECT = False  # Railway handles HTTPS at edge
SESSION_COOKIE_SECURE = config("SESSION_COOKIE_SECURE", default=True, cast=bool)
CSRF_COOKIE_SECURE = config("CSRF_COOKIE_SECURE", default=True, cast=bool)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = {
    "default-src": ("'self'",),
}

# HTTPS/SSL
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Static files with CDN
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"  # noqa: F405

# AWS S3 for production
USE_S3 = config("USE_S3", default=True, cast=bool)
AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID", default=None)  # noqa: F405
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY", default=None)  # noqa: F405
AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME", default=None)  # noqa: F405

if all([AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_STORAGE_BUCKET_NAME]):
    AWS_S3_CUSTOM_DOMAIN = f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"
    AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}
    AWS_DEFAULT_ACL = "public-read"

    STATIC_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/static/"
    STATIC_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

    MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/media/"
    MEDIA_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"

# Celery for production
CELERY_BROKER_URL = config("CELERY_BROKER_URL", default="redis://localhost:6379/0")  # noqa: F405
CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND", default="redis://localhost:6379/0")  # noqa: F405
