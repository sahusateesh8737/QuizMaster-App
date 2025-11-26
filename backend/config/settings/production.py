"""
Production settings for quiz project.
"""

import dj_database_url

from .base import *  # noqa: F403

# Production settings override
DEBUG = False
ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv())  # noqa: F405

# PostgreSQL for production
DATABASES = {"default": dj_database_url.config(default=config("DATABASE_URL"), conn_max_age=600)}  # noqa: F405

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
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
USE_S3 = True
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
CELERY_BROKER_URL = config("CELERY_BROKER_URL")  # noqa: F405
CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND")  # noqa: F405
