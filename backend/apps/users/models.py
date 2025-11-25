from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator


class User(AbstractUser):
    """Extended User model with additional fields."""

    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    )

    bio = models.TextField(blank=True, null=True, max_length=500)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    is_email_verified = models.BooleanField(default=False)
    points = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    badges = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_email_verified']),
        ]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    # Specify related names to avoid conflicts with Django's auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_set',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )


class UserProfile(models.Model):
    """Additional user profile information."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text="User preferences (notifications, theme, etc.)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"


class EmailVerificationToken(models.Model):
    """Email verification tokens for new users."""

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"Token for {self.user.email}"
