from django.contrib import admin

from .models import (
    LiveQuizAnswer,
    LiveQuizParticipant,
    LiveQuizQuestionResult,
    LiveQuizSession,
)


@admin.register(LiveQuizSession)
class LiveQuizSessionAdmin(admin.ModelAdmin):
    list_display = [
        "join_code",
        "quiz",
        "host",
        "status",
        "total_participants",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["join_code", "quiz__title", "host__username"]
    readonly_fields = ["join_code", "created_at", "started_at", "ended_at"]


@admin.register(LiveQuizParticipant)
class LiveQuizParticipantAdmin(admin.ModelAdmin):
    list_display = [
        "get_name",
        "session",
        "score",
        "correct_answers",
        "status",
        "joined_at",
    ]
    list_filter = ["status", "joined_at"]
    search_fields = ["user__username", "nickname", "session__join_code"]

    def get_name(self, obj):
        return obj.user.username if obj.user else obj.nickname

    get_name.short_description = "Name"


@admin.register(LiveQuizAnswer)
class LiveQuizAnswerAdmin(admin.ModelAdmin):
    list_display = [
        "participant",
        "question",
        "is_correct",
        "points_awarded",
        "time_taken",
        "answered_at",
    ]
    list_filter = ["is_correct", "answered_at"]
    search_fields = ["participant__user__username", "participant__nickname"]


@admin.register(LiveQuizQuestionResult)
class LiveQuizQuestionResultAdmin(admin.ModelAdmin):
    list_display = [
        "session",
        "question",
        "total_answers",
        "correct_count",
        "wrong_count",
        "average_time",
    ]
    list_filter = ["session__status"]
    search_fields = ["session__join_code", "question__text"]
