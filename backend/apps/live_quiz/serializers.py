from rest_framework import serializers

from apps.quizzes.serializers import QuestionSerializer

from .models import (
    LiveQuizAnswer,
    LiveQuizParticipant,
    LiveQuizQuestionResult,
    LiveQuizSession,
)


class LiveQuizSessionSerializer(serializers.ModelSerializer):
    """Serializer for live quiz sessions."""

    quiz_title = serializers.CharField(source="quiz.title", read_only=True)
    host_name = serializers.CharField(source="host.get_full_name", read_only=True)
    participant_count = serializers.SerializerMethodField()
    current_question = serializers.SerializerMethodField()

    class Meta:
        model = LiveQuizSession
        fields = (
            "id",
            "quiz",
            "quiz_title",
            "host",
            "host_name",
            "join_code",
            "status",
            "allow_late_join",
            "show_leaderboard",
            "randomize_questions",
            "time_per_question",
            "current_question_index",
            "current_question_start_time",
            "created_at",
            "started_at",
            "ended_at",
            "total_participants",
            "participant_count",
            "current_question",
        )
        read_only_fields = (
            "id",
            "join_code",
            "host",
            "created_at",
            "started_at",
            "ended_at",
            "total_participants",
        )

    def get_participant_count(self, obj):
        return obj.participants.filter(status="active").count()

    def get_current_question(self, obj):
        question = obj.get_current_question()
        if question:
            return QuestionSerializer(question).data
        return None


class LiveQuizParticipantSerializer(serializers.ModelSerializer):
    """Serializer for live quiz participants."""

    display_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = LiveQuizParticipant
        fields = (
            "id",
            "session",
            "user",
            "nickname",
            "display_name",
            "avatar",
            "status",
            "score",
            "correct_answers",
            "wrong_answers",
            "last_answer_time",
            "joined_at",
        )
        read_only_fields = ("id", "joined_at", "last_answer_time")

    def get_display_name(self, obj):
        return obj.user.username if obj.user else obj.nickname

    def get_avatar(self, obj):
        if obj.user and obj.user.avatar:
            return obj.user.avatar.url
        return None


class LiveQuizAnswerSerializer(serializers.ModelSerializer):
    """Serializer for live quiz answers."""

    class Meta:
        model = LiveQuizAnswer
        fields = (
            "id",
            "participant",
            "question",
            "selected_option",
            "is_correct",
            "answer_text",
            "time_taken",
            "answered_at",
            "points_awarded",
        )
        read_only_fields = ("id", "answered_at", "points_awarded")


class SubmitLiveAnswerSerializer(serializers.Serializer):
    """Serializer for submitting an answer during live quiz."""

    question_id = serializers.IntegerField()
    selected_option_id = serializers.IntegerField(required=False, allow_null=True)
    answer_text = serializers.CharField(required=False, allow_blank=True)
    time_taken = serializers.FloatField()


class JoinSessionSerializer(serializers.Serializer):
    """Serializer for joining a live quiz session."""

    join_code = serializers.CharField(max_length=10)
    nickname = serializers.CharField(max_length=50, required=False, allow_blank=True)


class LeaderboardEntrySerializer(serializers.Serializer):
    """Serializer for leaderboard entries."""

    rank = serializers.IntegerField()
    username = serializers.CharField()
    score = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    avatar = serializers.CharField(allow_null=True)


class LiveQuizQuestionResultSerializer(serializers.ModelSerializer):
    """Serializer for question results."""

    question_text = serializers.CharField(source="question.text", read_only=True)

    class Meta:
        model = LiveQuizQuestionResult
        fields = (
            "id",
            "question",
            "question_text",
            "total_answers",
            "correct_count",
            "wrong_count",
            "response_distribution",
            "average_time",
        )
