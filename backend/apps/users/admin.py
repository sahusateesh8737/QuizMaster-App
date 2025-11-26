from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import EmailVerificationToken, User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom user admin."""

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Custom Fields",
            {
                "fields": (
                    "bio",
                    "avatar",
                    "role",
                    "is_email_verified",
                    "points",
                    "badges",
                )
            },
        ),
    )
    list_display = [
        "email",
        "first_name",
        "last_name",
        "role",
        "is_email_verified",
        "points",
    ]
    list_filter = ["role", "is_email_verified", "created_at"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-created_at"]


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User profile admin."""

    list_display = ["user", "created_at", "updated_at"]
    list_filter = ["created_at"]
    search_fields = ["user__email"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """Email verification token admin."""

    list_display = ["user", "created_at", "expires_at"]
    list_filter = ["created_at", "expires_at"]
    search_fields = ["user__email", "token"]
    readonly_fields = ["token", "created_at"]
