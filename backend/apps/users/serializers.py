from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer."""

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'username', 'bio', 'avatar', 'role', 'points', 'created_at')
        read_only_fields = ('id', 'created_at', 'points')


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer with profile."""

    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'username', 'bio', 'avatar', 'role', 'is_staff', 'points',
                  'badges', 'is_email_verified', 'profile', 'created_at')
        read_only_fields = ('id', 'created_at', 'points', 'badges')

    def get_profile(self, obj):
        try:
            profile = obj.profile
            return UserProfileSerializer(profile).data
        except Exception:
            return None


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer."""

    class Meta:
        model = UserProfile
        fields = ('id', 'bio', 'social_links', 'preferences', 'created_at', 'updated_at')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'password2', 'username', 'role')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'bio', 'avatar')


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True, required=True, min_length=8)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError({"new_password": "Passwords must match."})
        return data


class LeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for leaderboard display."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'points', 'badges')
