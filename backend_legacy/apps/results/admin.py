from django.contrib import admin

from .models import LeaderboardEntry, UserBadge, UserStatistics


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "quiz",
        "rank",
        "score",
        "percentage",
        "is_passed",
        "attempt_date",
    ]
    list_filter = ["quiz", "is_passed", "attempt_date"]
    search_fields = ["user__email", "quiz__title"]
    readonly_fields = ["attempt_date"]
    date_hierarchy = "attempt_date"


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ["user", "badge_type", "title", "earned_at"]
    list_filter = ["badge_type", "earned_at"]
    search_fields = ["user__email", "title"]
    readonly_fields = ["earned_at"]
    date_hierarchy = "earned_at"


@admin.register(UserStatistics)
class UserStatisticsAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "total_quizzes_taken",
        "total_quizzes_passed",
        "average_score",
        "pass_rate",
    ]
    list_filter = ["updated_at"]
    search_fields = ["user__email"]
    readonly_fields = [
        "total_quizzes_taken",
        "total_quizzes_passed",
        "total_quizzes_failed",
        "average_score",
        "highest_score",
        "lowest_score",
        "total_time_spent",
        "total_questions_attempted",
        "total_questions_correct",
        "pass_rate",
        "accuracy_rate",
        "last_attempt",
        "updated_at",
    ]
    fieldsets = (
        ("User", {"fields": ("user",)}),
        (
            "Quiz Statistics",
            {
                "fields": (
                    "total_quizzes_taken",
                    "total_quizzes_passed",
                    "total_quizzes_failed",
                    "pass_rate",
                )
            },
        ),
        (
            "Score Statistics",
            {"fields": ("average_score", "highest_score", "lowest_score")},
        ),
        (
            "Question Statistics",
            {
                "fields": (
                    "total_questions_attempted",
                    "total_questions_correct",
                    "accuracy_rate",
                )
            },
        ),
        (
            "Time & Activity",
            {"fields": ("total_time_spent", "last_attempt", "updated_at")},
        ),
    )
