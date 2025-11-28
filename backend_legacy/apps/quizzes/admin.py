from django.contrib import admin

from .models import Category, Question, QuestionOption, Quiz, QuizAttempt, UserAnswer


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "created_at"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 4


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        "text",
        "quiz",
        "type",
        "difficulty",
        "created_at",
    )
    list_filter = ["quiz", "type", "difficulty"]
    search_fields = ["text", "quiz__title"]
    inlines = [QuestionOptionInline]
    ordering = ["quiz", "order"]


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "creator",
        "status",
        "question_count",
        "average_score",
        "created_at",
    )
    list_filter = ["status", "category", "created_at", "shuffle_questions"]
    search_fields = ["title", "description", "creator__email"]
    readonly_fields = [
        "total_attempts",
        "total_passes",
        "average_score",
        "created_at",
        "updated_at",
    ]
    fieldsets = (
        ("Basic Info", {"fields": ("title", "description", "category", "creator")}),
        (
            "Settings",
            {
                "fields": (
                    "status",
                    "time_limit",
                    "pass_percentage",
                    "shuffle_questions",
                    "shuffle_answers",
                    "show_correct_answer",
                )
            },
        ),
        ("Display", {"fields": ("thumbnail", "tags")}),
        (
            "Statistics",
            {
                "fields": ("total_attempts", "total_passes", "average_score"),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "quiz",
        "status",
        "score",
        "percentage",
        "is_passed",
        "start_time",
    ]
    list_filter = ["status", "is_passed", "start_time"]
    search_fields = ["user__email", "quiz__title"]
    readonly_fields = ["start_time", "end_time", "time_spent"]
    date_hierarchy = "start_time"


@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ["attempt", "question", "is_correct", "answered_at"]
    list_filter = ["is_correct", "answered_at"]
    search_fields = ["attempt__user__email", "question__text"]
    readonly_fields = ["answered_at"]
    date_hierarchy = "answered_at"
