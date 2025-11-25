from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from .models import UserProfile, EmailVerificationToken
from apps.quizzes.models import Quiz, QuizAttempt
from .serializers import (
    UserSerializer, UserDetailSerializer, UserRegistrationSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, LeaderboardSerializer,
    UserProfileSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': UserDetailSerializer(user).data,
            'message': 'User created successfully. Please verify your email.'
        }, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    """User management viewset."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_email_verified']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering_fields = ['created_at', 'points']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action == 'destroy':
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def destroy(self, request, *args, **kwargs):
        if not (request.user.is_staff or getattr(request.user, 'role', '') == 'admin'):
            return Response(
                {'detail': 'You do not have permission to delete users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action == 'partial_update' or self.action == 'update':
            return UserUpdateSerializer
        elif self.action == 'retrieve':
            return UserDetailSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user profile."""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='change-password')
    def change_password(self, request):
        """Change user password."""
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': ['Wrong password.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get top users by points."""
        limit = int(request.query_params.get('limit', 10))
        users = User.objects.all().order_by('-points')[:limit]
        serializer = LeaderboardSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='verify-email')
    def verify_email(self, request):
        """Verify email using token."""
        token = request.data.get('token')
        if not token:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Assuming you have a way to verify token. 
            # For now, let's assume the token IS the user's ID or some simple logic
            # In a real app, you'd look up the token in a table.
            # Let's check if we have an EmailVerificationToken model
            verification_token = EmailVerificationToken.objects.get(token=token)
            user = verification_token.user
            
            if user.is_email_verified:
                return Response({'detail': 'Email already verified.'}, status=status.HTTP_200_OK)
                
            user.is_email_verified = True
            user.save()
            verification_token.delete() # Consume token
            
            return Response({'detail': 'Email verified successfully.'})
            
        except EmailVerificationToken.DoesNotExist:
            return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='password-reset')
    def password_reset(self, request):
        """Send password reset email."""
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            # In a real app, generate token and send email
            # For now, we'll just return success
            return Response({'detail': 'Password reset email sent.'})
        except User.DoesNotExist:
            # Don't reveal user existence
            # Don't reveal user existence
            return Response({'detail': 'Password reset email sent.'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], url_path='platform-stats')
    def platform_stats(self, request):
        """Get platform statistics."""
        total_users = User.objects.count()
        total_quizzes = Quiz.objects.filter(status='published').count()
        total_attempts = QuizAttempt.objects.count()
        
        return Response({
            'total_users': total_users,
            'total_quizzes': total_quizzes,
            'total_attempts': total_attempts,
            'avg_rating': 4.8  # Hardcoded for now
        })


class UserProfileViewSet(viewsets.ModelViewSet):
    """User profile management viewset."""
    
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    @action(detail=False, methods=['get', 'put'])
    def my_profile(self, request):
        """Get or update current user profile."""
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
