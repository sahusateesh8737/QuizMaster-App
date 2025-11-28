from rest_framework import serializers

from .models import LeaderboardEntry, UserBadge, UserStatistics


class LeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for leaderboard entries."""

    user_name = serializers.CharField(source="user.get_full_name", read_only=True)
    user_avatar = serializers.CharField(source="user.avatar", read_only=True)

    class Meta:
        model = LeaderboardEntry
        fields = (
            "id",
            "rank",
            "user",
            "user_name",
            "user_avatar",
            "score",
            "percentage",
            "is_passed",
            "time_spent",
            "attempt_date",
        )


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for user badges."""

    class Meta:
        model = UserBadge
        fields = ("id", "badge_type", "title", "description", "icon", "earned_at")


class UserStatisticsSerializer(serializers.ModelSerializer):
    """Serializer for user statistics."""

    category_performance = serializers.SerializerMethodField()
    quizzes_attempted = serializers.IntegerField(source="total_quizzes_taken", read_only=True)
    best_score = serializers.FloatField(source="highest_score", read_only=True)
    current_streak = serializers.SerializerMethodField()
    total_points = serializers.IntegerField(source="user.points", read_only=True)

    class Meta:
        model = UserStatistics
        fields = (
            "total_quizzes_taken",
            "quizzes_attempted",
            "total_quizzes_passed",
            "total_quizzes_failed",
            "average_score",
            "highest_score",
            "best_score",
            "lowest_score",
            "total_time_spent",
            "total_questions_attempted",
            "total_questions_correct",
            "pass_rate",
            "accuracy_rate",
            "last_attempt",
            "updated_at",
            "category_performance",
            "current_streak",
            "total_points",
        )
        read_only_fields = fields

    def get_category_performance(self, obj):
        """Calculate average score per category."""
        from django.db.models import Avg

        from apps.quizzes.models import QuizAttempt

        attempts = (
            QuizAttempt.objects.filter(user=obj.user, status="completed")
            .values("quiz__category__name")
            .annotate(avg_score=Avg("percentage"))
        )

        return {
            attempt["quiz__category__name"]: round(attempt["avg_score"], 1)
            for attempt in attempts
            if attempt["quiz__category__name"]
        }

    def get_current_streak(self, obj):
        """Calculate current streak of consecutive days with quiz attempts."""
        from datetime import date, timedelta

        from apps.quizzes.models import QuizAttempt

        # Get all completed attempts ordered by date
        attempts = QuizAttempt.objects.filter(user=obj.user, status="completed").order_by("-start_time")

        if not attempts.exists():
            return 0

        # Check for consecutive days
        streak = 0
        current_date = date.today()

        for attempt in attempts:
            attempt_date = attempt.start_time.date()
            if attempt_date == current_date:
                streak = max(streak, 1)
                current_date = current_date - timedelta(days=1)
            elif attempt_date == current_date:
                streak += 1
                current_date = current_date - timedelta(days=1)
            else:
                break

        return streak
