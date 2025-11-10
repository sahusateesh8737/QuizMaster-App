from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LiveQuizSessionViewSet, LiveQuizParticipantViewSet

router = DefaultRouter()
router.register(r'sessions', LiveQuizSessionViewSet, basename='live-session')
router.register(r'participants', LiveQuizParticipantViewSet, basename='live-participant')

urlpatterns = [
    path('', include(router.urls)),
]
