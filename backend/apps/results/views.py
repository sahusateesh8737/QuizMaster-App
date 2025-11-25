from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import LeaderboardEntry, UserBadge, UserStatistics
from .serializers import LeaderboardSerializer, UserBadgeSerializer, UserStatisticsSerializer


class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """View set for quiz leaderboards."""

    queryset = LeaderboardEntry.objects.all()
    serializer_class = LeaderboardSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['quiz']
    ordering_fields = ['rank', 'score', 'percentage']
    ordering = ['rank']

    @action(detail=False, methods=['get'])
    def global_top(self, request):
        """Get global top scorers across all quizzes."""
        limit = int(request.query_params.get('limit', 10))

        from apps.results.models import UserStatistics

        stats = UserStatistics.objects.all().order_by('-total_quizzes_passed')[:limit]
        data = []
        for idx, stat in enumerate(stats, 1):
            data.append({
                'rank': idx,
                'user_id': stat.user.id,
                'user_name': stat.user.get_full_name(),
                'user_avatar': stat.user.avatar.url if stat.user.avatar else None,
                'total_quizzes_passed': stat.total_quizzes_passed,
                'average_score': stat.average_score,
                'total_points': stat.user.points,
            })
        return Response(data)


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """View set for user badges."""

    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user', 'badge_type']


class UserStatisticsViewSet(viewsets.ViewSet):
    """View set for user statistics."""

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def my_statistics(self, request):
        """Get current user statistics."""
        try:
            stats = request.user.statistics
        except UserStatistics.DoesNotExist:
            stats = UserStatistics.objects.create(user=request.user)
            stats.update_statistics()

        serializer = UserStatisticsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def recalculate(self, request):
        """Recalculate user statistics."""
        try:
            stats = request.user.statistics
        except UserStatistics.DoesNotExist:
            stats = UserStatistics.objects.create(user=request.user)

        stats.update_statistics()
        serializer = UserStatisticsSerializer(stats)
        return Response(serializer.data)
