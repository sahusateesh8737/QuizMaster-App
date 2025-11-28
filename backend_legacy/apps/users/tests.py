"""Tests for users app."""

import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration:
    """Test user registration."""

    def test_user_registration(self):
        """Test successful user registration."""
        user = User.objects.create_user(email="test@example.com", username="testuser", password="testpass123")
        assert user.email == "test@example.com"
        assert user.username == "testuser"
