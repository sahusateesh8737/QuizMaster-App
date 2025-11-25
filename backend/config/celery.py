"""
Celery configuration for quiz project.
"""

import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('quiz')

# Load configuration from Django settings with CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'update-leaderboards': {
        'task': 'apps.results.tasks.update_leaderboards',
        'schedule': crontab(minute=0, hour='*/1'),  # Every hour
    },
    'update-user-statistics': {
        'task': 'apps.results.tasks.update_all_user_statistics',
        'schedule': crontab(minute=0, hour=2),  # Daily at 2 AM
    },
    'clean-expired-tokens': {
        'task': 'apps.users.tasks.clean_expired_tokens',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
