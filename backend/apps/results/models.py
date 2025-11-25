from django.db import models
from django.contrib.auth import get_user_model
from datetime import timedelta
from apps.quizzes.models import Quiz

User = get_user_model()


class LeaderboardEntry(models.Model):
    """Leaderboard entry for top scorers."""

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='leaderboard')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.FloatField()
    percentage = models.FloatField()
    is_passed = models.BooleanField(default=False)
    time_spent = models.DurationField(null=True, blank=True)

    rank = models.PositiveIntegerField()
    attempt_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['quiz', 'rank']
        unique_together = [['quiz', 'rank', 'attempt_date']]
        indexes = [
            models.Index(fields=['quiz', 'rank']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.quiz.title} (Rank: {self.rank})"


class UserBadge(models.Model):
    """Achievements and badges for users."""

    BADGE_TYPES = (
        ('quiz_master', 'Quiz Master'),
        ('speed_demon', 'Speed Demon'),
        ('perfect_score', 'Perfect Score'),
        ('knowledge_seeker', 'Knowledge Seeker'),
        ('consistent_winner', 'Consistent Winner'),
        ('leaderboard_champion', 'Leaderboard Champion'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges_earned')
    badge_type = models.CharField(max_length=50, choices=BADGE_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, help_text="Icon class for frontend")

    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-earned_at']
        unique_together = [['user', 'badge_type']]

    def __str__(self):
        return f"{self.user.email} - {self.get_badge_type_display()}"


class UserStatistics(models.Model):
    """Aggregated statistics for each user."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='statistics')

    total_quizzes_taken = models.IntegerField(default=0)
    total_quizzes_passed = models.IntegerField(default=0)
    total_quizzes_failed = models.IntegerField(default=0)

    average_score = models.FloatField(default=0)
    highest_score = models.FloatField(default=0)
    lowest_score = models.FloatField(default=0)

    total_time_spent = models.DurationField(default=timedelta)
    total_questions_attempted = models.IntegerField(default=0)
    total_questions_correct = models.IntegerField(default=0)

    pass_rate = models.FloatField(default=0)
    accuracy_rate = models.FloatField(default=0)

    last_attempt = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'User Statistics'

    def __str__(self):
        return f"Statistics for {self.user.email}"

    def update_statistics(self):
        """Recalculate user statistics from attempts."""
        from django.db.models import Avg, Max, Min, Sum
        from apps.quizzes.models import QuizAttempt, UserAnswer

        attempts = QuizAttempt.objects.filter(user=self.user, status='completed')
        answers = UserAnswer.objects.filter(attempt__user=self.user)

        # Count statistics
        self.total_quizzes_taken = attempts.count()
        self.total_quizzes_passed = attempts.filter(is_passed=True).count()
        self.total_quizzes_failed = attempts.filter(is_passed=False).count()

        # Score statistics
        if self.total_quizzes_taken > 0:
            self.average_score = attempts.aggregate(Avg('percentage'))['percentage__avg'] or 0
            self.highest_score = attempts.aggregate(Max('percentage'))['percentage__max'] or 0
            self.lowest_score = attempts.aggregate(Min('percentage'))['percentage__min'] or 0
            self.pass_rate = (self.total_quizzes_passed / self.total_quizzes_taken) * 100

        # Time and question statistics
        time_aggregate = attempts.aggregate(Sum('time_spent'))
        if time_aggregate['time_spent__sum']:
            self.total_time_spent = time_aggregate['time_spent__sum']

        self.total_questions_attempted = answers.count()
        self.total_questions_correct = answers.filter(is_correct=True).count()

        if self.total_questions_attempted > 0:
            self.accuracy_rate = (self.total_questions_correct / self.total_questions_attempted) * 100

        self.last_attempt = attempts.last().start_time if attempts.exists() else None
        self.save()
