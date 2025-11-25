from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model

from .models import Category, Quiz, Question, QuizAttempt, UserAnswer
from .serializers import (
    CategorySerializer, QuizSerializer, QuizDetailSerializer, QuestionSerializer,
    QuizAttemptSerializer, SubmitAnswerSerializer
)

User = get_user_model()


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def initialize_categories(request):
    """
    Initialize the database with sample categories.
    This endpoint can be called to set up initial categories.
    """
    try:
        # Create categories
        categories_data = [
            {'name': 'Programming', 'slug': 'programming', 'description': 'Test your programming knowledge', 'icon': '💻'},
            {'name': 'Science', 'slug': 'science', 'description': 'Explore scientific concepts', 'icon': '🔬'},
            {'name': 'History', 'slug': 'history', 'description': 'Journey through time', 'icon': '📚'},
            {'name': 'Mathematics', 'slug': 'mathematics', 'description': 'Solve mathematical problems', 'icon': '🔢'},
            {'name': 'General Knowledge', 'slug': 'general-knowledge', 'description': 'Test your general knowledge', 
             'icon': '🌍'},
            {'name': 'Literature', 'slug': 'literature', 'description': 'Explore world of books and authors', 
             'icon': '📖'},
            {'name': 'Geography', 'slug': 'geography', 'description': 'Know your world', 'icon': '🗺️'},
            {'name': 'Technology', 'slug': 'technology', 'description': 'Latest in tech world', 'icon': '⚡'},
            {'name': 'Arts', 'slug': 'arts', 'description': 'Creative and visual arts', 'icon': '🎨'},
            {'name': 'Sports', 'slug': 'sports', 'description': 'Sports and athletics', 'icon': '⚽'},
        ]

        created_categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                created_categories.append(category)

        return Response({
            'message': 'Categories initialized successfully',
            'total_categories': Category.objects.count(),
            'newly_created': len(created_categories),
            'categories': CategorySerializer(Category.objects.all(), many=True).data
        }, status=status.HTTP_201_CREATED if created_categories else status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """View set for quiz categories."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class QuizViewSet(viewsets.ModelViewSet):
    """View set for quizzes."""

    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'status', 'creator']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'total_attempts', 'average_score']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Quiz.objects.all()
        # For non-staff, show only published quizzes or their own quizzes
        queryset = Quiz.objects.filter(status='published')
        if self.request.user.is_authenticated:
            queryset = queryset | Quiz.objects.filter(creator=self.request.user)
        return queryset

    def perform_create(self, serializer):
        """Set the creator when creating a quiz."""
        import logging
        logger = logging.getLogger(__name__)

        # Debug: Log incoming data
        logger.info(f"Creating quiz with data: {serializer.validated_data}")
        logger.info(f"Creator: {self.request.user} (ID: {self.request.user.id})")

        # Check if category exists if provided
        category_id = serializer.validated_data.get('category')
        if category_id:
            from .models import Category
            if not Category.objects.filter(id=category_id.id).exists():
                logger.error(f"Category with ID {category_id.id} does not exist!")

        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['get'])
    def my_quizzes(self, request):
        """Get quizzes created by the current user."""
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        quizzes = Quiz.objects.filter(creator=request.user)
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular quizzes by attempts."""
        limit = int(request.query_params.get('limit', 10))
        quizzes = Quiz.objects.filter(status='published').order_by('-total_attempts')[:limit]
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured quizzes."""
        limit = int(request.query_params.get('limit', 10))
        quizzes = Quiz.objects.filter(status='published', tags__contains='featured')[:limit]
        serializer = QuizSerializer(quizzes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get analytics for a quiz."""
        quiz = self.get_object()

        # Check permission
        if quiz.creator != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to view this analytics.'},
                status=status.HTTP_403_FORBIDDEN
            )

        attempts = quiz.attempts.all()
        questions = quiz.questions.all()

        # Calculate analytics
        analytics = {
            'total_attempts': quiz.total_attempts,
            'total_passes': quiz.total_passes,
            'pass_rate': quiz.pass_rate if quiz.total_attempts > 0 else 0,
            'average_score': quiz.average_score,
            'question_analytics': []
        }

        for question in questions:
            analytics['question_analytics'].append({
                'question_id': question.id,
                'text': question.text,
                'attempt_count': question.attempt_count,
                'correct_percentage': question.correct_percentage,
                'difficulty': question.difficulty,
            })

        return Response(analytics)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def attempts(self, request, pk=None):
        """Start a new quiz attempt for this quiz."""
        quiz = self.get_object()

        # Check if quiz is published
        if quiz.status != 'published':
            return Response(
                {'detail': 'This quiz is not available.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user has an active attempt
        active_attempt = QuizAttempt.objects.filter(
            quiz=quiz,
            user=request.user,
            status='in_progress'
        ).first()

        if active_attempt:
            return Response(
                {
                    'detail': 'You already have an active attempt for this quiz.',
                    'attempt': QuizAttemptSerializer(active_attempt).data
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user,
            status='in_progress'
        )

        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def questions(self, request, pk=None):
        """Create a question for this quiz."""
        quiz = self.get_object()

        # Check if user is the quiz creator or staff
        if quiz.creator != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to add questions to this quiz.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get question data
        question_data = request.data.copy()
        question_data['quiz'] = quiz.id

        # Extract options
        options_data = question_data.pop('options', [])

        # Create question
        from .models import QuestionOption
        question = Question.objects.create(
            quiz=quiz,
            text=question_data.get('text'),
            type=question_data.get('type', 'mcq'),
            difficulty=question_data.get('difficulty', 'medium'),
            explanation=question_data.get('explanation', ''),
            order=question_data.get('order', 0)
        )

        # Create options
        for idx, option_data in enumerate(options_data):
            QuestionOption.objects.create(
                question=question,
                text=option_data.get('text'),
                is_correct=option_data.get('is_correct', False),
                explanation=option_data.get('explanation', ''),
                order=idx
            )

        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """View set for quiz attempts."""

    queryset = QuizAttempt.objects.all()
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['quiz', 'status']
    ordering_fields = ['start_time', 'score']
    ordering = ['-start_time']

    def get_queryset(self):
        """Return only the current user's attempts."""
        return QuizAttempt.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Start a new quiz attempt."""
        quiz_id = request.data.get('quiz_id')

        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({'detail': 'Quiz not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Create new attempt
        attempt = QuizAttempt.objects.create(
            quiz=quiz,
            user=request.user
        )

        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """Submit an answer to a question."""
        attempt = self.get_object()

        # Check if user owns the attempt
        if attempt.user != request.user:
            return Response(
                {'detail': 'You cannot submit answers to this attempt.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if attempt is still in progress
        if attempt.status != 'in_progress':
            return Response(
                {'detail': 'This attempt is no longer in progress.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SubmitAnswerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = Question.objects.get(id=serializer.validated_data['question_id'])
        except Question.DoesNotExist:
            return Response({'detail': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if question belongs to the quiz
        if question.quiz != attempt.quiz:
            return Response(
                {'detail': 'This question does not belong to this quiz.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine if answer is correct
        is_correct = False
        selected_option = None

        if 'selected_option_id' in serializer.validated_data and serializer.validated_data['selected_option_id']:
            try:
                selected_option = question.options.get(id=serializer.validated_data['selected_option_id'])
                is_correct = selected_option.is_correct
            except Exception:
                pass

        # Save answer
        user_answer, created = UserAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                'selected_option': selected_option,
                'answer_text': serializer.validated_data.get('answer_text', ''),
                'is_correct': is_correct
            }
        )

        return Response(
            {'is_correct': is_correct, 'user_answer_id': user_answer.id},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a quiz attempt and calculate score."""
        attempt = self.get_object()

        if attempt.user != request.user:
            return Response(
                {'detail': 'You cannot complete this attempt.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if attempt.status != 'in_progress':
            return Response(
                {'detail': 'This attempt is already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate score
        answers = attempt.answers.all()
        correct_count = answers.filter(is_correct=True).count()
        total_questions = attempt.quiz.questions.count()

        if total_questions == 0:
            score = 0
            percentage = 0
        else:
            score = correct_count
            percentage = (correct_count / total_questions) * 100

        is_passed = percentage >= attempt.quiz.pass_percentage

        # Update attempt
        attempt.status = 'completed'
        attempt.end_time = timezone.now()
        attempt.time_spent = attempt.end_time - attempt.start_time
        attempt.score = score
        attempt.percentage = percentage
        attempt.is_passed = is_passed
        attempt.save()

        # Update quiz statistics
        attempt.quiz.total_attempts += 1
        if is_passed:
            attempt.quiz.total_passes += 1

        # Update average score
        all_attempts = attempt.quiz.attempts.filter(status='completed')
        if all_attempts.exists():
            avg_score = all_attempts.aggregate(avg=models.Avg('percentage'))['avg']
            attempt.quiz.average_score = avg_score or 0

        attempt.quiz.save()

        # Award points to user
        if is_passed:
            request.user.points += 10
            request.user.save()

        # Update user statistics
        from apps.results.models import UserStatistics
        try:
            user_stats = request.user.statistics
        except UserStatistics.DoesNotExist:
            user_stats = UserStatistics.objects.create(user=request.user)

        user_stats.update_statistics()

        serializer = QuizAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """Get user's quiz history."""
        attempts = self.get_queryset().filter(status='completed')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data)
