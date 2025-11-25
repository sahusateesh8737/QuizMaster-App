from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Category(models.Model):
    """Quiz categories."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icon class for frontend")
    color = models.CharField(max_length=7, default='#3498db', help_text="Hex color code")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Quiz(models.Model):
    """Quiz model."""

    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='quizzes')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_quizzes')

    # Quiz settings
    time_limit = models.IntegerField(null=True, blank=True, help_text="Time limit in minutes")
    pass_percentage = models.IntegerField(default=60, validators=[MinValueValidator(0), MaxValueValidator(100)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # Display settings
    shuffle_questions = models.BooleanField(default=False)
    shuffle_answers = models.BooleanField(default=False)
    show_correct_answer = models.BooleanField(default=True)

    # Metadata
    thumbnail = models.ImageField(upload_to='quiz_thumbnails/', blank=True, null=True)
    tags = models.JSONField(default=list, blank=True)

    # Statistics
    total_attempts = models.IntegerField(default=0)
    total_passes = models.IntegerField(default=0)
    average_score = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['creator']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.title

    @property
    def question_count(self):
        return self.questions.count()

    @property
    def pass_rate(self):
        if self.total_attempts == 0:
            return 0
        return (self.total_passes / self.total_attempts) * 100


class Question(models.Model):
    """Question model for questions bank."""

    QUESTION_TYPES = (
        ('mcq', 'Multiple Choice'),
        ('tf', 'True/False'),
        ('fill', 'Fill in the Blank'),
        ('match', 'Matching'),
    )

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='mcq')
    image = models.ImageField(upload_to='question_images/', blank=True, null=True)

    # For MCQ and T/F
    explanation = models.TextField(blank=True, help_text="Explanation shown after answer")
    difficulty = models.CharField(
        max_length=20,
        choices=(('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')),
        default='medium'
    )

    # Statistics
    attempt_count = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)

    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['quiz', 'order']
        indexes = [
            models.Index(fields=['quiz']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}"

    @property
    def correct_percentage(self):
        if self.attempt_count == 0:
            return 0
        return (self.correct_count / self.attempt_count) * 100


class QuestionOption(models.Model):
    """Options/Answers for MCQ questions."""

    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['question', 'order']

    def __str__(self):
        return f"{self.question.text[:50]} - {self.text[:30]}"


class QuizAttempt(models.Model):
    """Record of a user attempting a quiz."""

    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    )

    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    score = models.FloatField(null=True, blank=True)
    percentage = models.FloatField(null=True, blank=True)
    is_passed = models.BooleanField(null=True, blank=True)

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    time_spent = models.DurationField(null=True, blank=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', 'quiz']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.quiz.title} - {self.status}"


class UserAnswer(models.Model):
    """User's answer to a specific question."""

    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)

    selected_option = models.ForeignKey(QuestionOption, null=True, blank=True, on_delete=models.SET_NULL)
    answer_text = models.TextField(blank=True, help_text="For fill-in-the-blank questions")
    is_correct = models.BooleanField(null=True, blank=True)

    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['question__order']
        indexes = [
            models.Index(fields=['attempt']),
            models.Index(fields=['question']),
        ]

    def __str__(self):
        return f"{self.attempt.user.email} - {self.question.text[:50]}"
