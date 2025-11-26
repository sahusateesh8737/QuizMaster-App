from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LiveQuizParticipantViewSet, LiveQuizSessionViewSet

router = DefaultRouter()
router.register(r"sessions", LiveQuizSessionViewSet, basename="live-session")
router.register(r"participants", LiveQuizParticipantViewSet, basename="live-participant")

urlpatterns = [
    path("", include(router.urls)),
]
