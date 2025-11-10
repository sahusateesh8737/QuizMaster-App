from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaderboardViewSet, UserBadgeViewSet, UserStatisticsViewSet

router = DefaultRouter()
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')
router.register(r'badges', UserBadgeViewSet, basename='badge')
router.register(r'statistics', UserStatisticsViewSet, basename='statistics')

urlpatterns = [
    path('', include(router.urls)),
]
