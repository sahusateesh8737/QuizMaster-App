from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend

from .models import UserProfile, EmailVerificationToken
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
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
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
    
    @action(detail=True, methods=['post'])
    def verify_email(self, request, pk=None):
        """Mark user email as verified."""
        user = self.get_object()
        if request.user != user and not request.user.is_staff:
            return Response(
                {'detail': 'You cannot verify other users.'},
                status=status.HTTP_403_FORBIDDEN
            )
        user.is_email_verified = True
        user.save()
        return Response({'detail': 'Email verified.'})


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
