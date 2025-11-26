import random
import string

from django.db import models
from django.utils import timezone

from apps.quizzes.models import Question, QuestionOption, Quiz
from apps.users.models import User


def generate_join_code():
    """Generate a unique 6-character join code."""
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


class LiveQuizSession(models.Model):
    """
    Represents a live quiz game session created by a teacher.
    Students can join using a unique code.
    """

    STATUS_CHOICES = [
        ("waiting", "Waiting for Players"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="live_sessions")
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hosted_sessions")

    # Unique join code for students
    join_code = models.CharField(max_length=10, unique=True, default=generate_join_code)

    # Session settings
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="waiting")
    allow_late_join = models.BooleanField(default=False)
    show_leaderboard = models.BooleanField(default=True)
    randomize_questions = models.BooleanField(default=False)
    time_per_question = models.IntegerField(default=30, help_text="Seconds per question")

    # Current state
    current_question_index = models.IntegerField(default=0)
    current_question_start_time = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    # Statistics
    total_participants = models.IntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["join_code"]),
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self):
        return f"{self.quiz.title} - {self.join_code} ({self.status})"

    def start_session(self):
        """Start the live quiz session."""
        self.status = "in_progress"
        self.started_at = timezone.now()
        self.current_question_start_time = timezone.now()
        self.save()

    def next_question(self):
        """Move to the next question."""
        questions = list(self.quiz.questions.all().order_by("order"))
        if self.current_question_index < len(questions) - 1:
            self.current_question_index += 1
            self.current_question_start_time = timezone.now()
            self.save()
            return True
        return False

    def end_session(self):
        """End the live quiz session."""
        self.status = "completed"
        self.ended_at = timezone.now()
        self.save()

    def get_current_question(self):
        """Get the current question being displayed."""
        questions = list(self.quiz.questions.all().order_by("order"))
        if 0 <= self.current_question_index < len(questions):
            return questions[self.current_question_index]
        return None

    def get_leaderboard(self):
        """Get current leaderboard standings."""
        participants = self.participants.filter(status="active").order_by("-score", "last_answer_time")
        return [
            {
                "rank": idx + 1,
                "username": p.user.username if p.user else p.nickname,
                "score": p.score,
                "correct_answers": p.correct_answers,
                "avatar": p.user.avatar.url if p.user and p.user.avatar else None,
            }
            for idx, p in enumerate(participants)
        ]


class LiveQuizParticipant(models.Model):
    """
    Represents a participant (student) in a live quiz session.
    Can be authenticated user or guest with nickname.
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("disconnected", "Disconnected"),
        ("left", "Left"),
    ]

    session = models.ForeignKey(LiveQuizSession, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="live_participations",
    )

    # For guest users
    nickname = models.CharField(max_length=50, blank=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    # Performance
    score = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    wrong_answers = models.IntegerField(default=0)
    last_answer_time = models.DateTimeField(null=True, blank=True)

    # Timestamps
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-score", "last_answer_time"]
        unique_together = [["session", "user"], ["session", "nickname"]]

    def __str__(self):
        name = self.user.username if self.user else self.nickname
        return f"{name} in {self.session.join_code}"


class LiveQuizAnswer(models.Model):
    """
    Represents an answer submitted by a participant during a live quiz.
    """

    participant = models.ForeignKey(LiveQuizParticipant, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(QuestionOption, on_delete=models.SET_NULL, null=True, blank=True)

    # Answer details
    is_correct = models.BooleanField(default=False)
    answer_text = models.TextField(blank=True)

    # Timing (for bonus points based on speed)
    time_taken = models.FloatField(help_text="Seconds taken to answer")
    answered_at = models.DateTimeField(auto_now_add=True)

    # Points awarded (including speed bonus)
    points_awarded = models.IntegerField(default=0)

    class Meta:
        ordering = ["answered_at"]
        unique_together = ["participant", "question"]

    def __str__(self):
        return f"{self.participant} - Q{self.question.id} - {'✓' if self.is_correct else '✗'}"

    def calculate_points(self, max_time=30):
        """
        Calculate points based on correctness and speed.
        Correct answer: 1000 points base
        Speed bonus: up to 500 points (faster = more points)
        """
        if not self.is_correct:
            self.points_awarded = 0
            return 0

        base_points = 1000
        time_ratio = max(0, (max_time - self.time_taken) / max_time)
        speed_bonus = int(500 * time_ratio)

        self.points_awarded = base_points + speed_bonus
        return self.points_awarded


class LiveQuizQuestionResult(models.Model):
    """
    Aggregate results for each question in a live quiz session.
    Shows how many students selected each option.
    """

    session = models.ForeignKey(LiveQuizSession, on_delete=models.CASCADE, related_name="question_results")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    # Statistics
    total_answers = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    wrong_count = models.IntegerField(default=0)

    # Response distribution (JSON field with option_id: count)
    response_distribution = models.JSONField(default=dict)

    # Average time to answer
    average_time = models.FloatField(default=0)

    class Meta:
        unique_together = ["session", "question"]

    def __str__(self):
        return f"{self.session.join_code} - Q{self.question.id} Results"

    def update_statistics(self):
        """Recalculate statistics based on all answers."""
        answers = LiveQuizAnswer.objects.filter(participant__session=self.session, question=self.question)

        self.total_answers = answers.count()
        self.correct_count = answers.filter(is_correct=True).count()
        self.wrong_count = answers.filter(is_correct=False).count()

        # Calculate response distribution
        distribution = {}
        for answer in answers:
            if answer.selected_option:
                option_id = str(answer.selected_option.id)
                distribution[option_id] = distribution.get(option_id, 0) + 1

        self.response_distribution = distribution

        # Calculate average time
        if self.total_answers > 0:
            total_time = sum(a.time_taken for a in answers)
            self.average_time = total_time / self.total_answers

        self.save()
