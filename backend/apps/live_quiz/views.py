from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import LiveQuizSession, LiveQuizParticipant, LiveQuizAnswer, LiveQuizQuestionResult
from django.utils import timezone
from apps.quizzes.models import Question, QuestionOption
from .serializers import (
    LiveQuizSessionSerializer, LiveQuizParticipantSerializer,
    SubmitLiveAnswerSerializer,
    JoinSessionSerializer, LeaderboardEntrySerializer,
    LiveQuizQuestionResultSerializer
)


class IsTeacherOrHost(permissions.BasePermission):
    """
    Permission to check if user is teacher/host.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['teacher', 'admin']

    def has_object_permission(self, request, view, obj):
        return obj.host == request.user or request.user.is_staff


class LiveQuizSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing live quiz sessions.
    Teachers can create, manage, and control live quiz sessions.
    """
    queryset = LiveQuizSession.objects.all()
    serializer_class = LiveQuizSessionSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'start', 'next_question', 'end']:
            return [IsTeacherOrHost()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        """Filter sessions based on user role."""
        if self.request.user.is_authenticated:
            if self.request.user.role in ['teacher', 'admin']:
                # Teachers see their own sessions
                return LiveQuizSession.objects.filter(host=self.request.user)
        # Public view - only active sessions
        return LiveQuizSession.objects.filter(status__in=['waiting', 'in_progress', 'completed'])

    def perform_create(self, serializer):
        """Create a new live quiz session."""
        serializer.save(host=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsTeacherOrHost])
    def start(self, request, pk=None):
        """Start the live quiz session."""
        session = self.get_object()

        if session.status != 'waiting':
            return Response(
                {'detail': 'Session is not in waiting state.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if session.participants.filter(status='active').count() == 0:
            return Response(
                {'detail': 'No participants have joined yet.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.start_session()
        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsTeacherOrHost])
    def next_question(self, request, pk=None):
        """Move to the next question."""
        session = self.get_object()

        if session.status != 'in_progress':
            return Response(
                {'detail': 'Session is not in progress.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate results for current question
        current_question = session.get_current_question()
        if current_question:
            result, created = LiveQuizQuestionResult.objects.get_or_create(
                session=session,
                question=current_question
            )
            result.update_statistics()

        # Move to next question
        has_next = session.next_question()

        if not has_next:
            # No more questions, end session
            session.end_session()

            return Response({
                'detail': 'Quiz completed. No more questions.',
                'session': self.get_serializer(session).data
            })

        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsTeacherOrHost])
    def end(self, request, pk=None):
        """End the live quiz session."""
        session = self.get_object()

        if session.status == 'completed':
            return Response(
                {'detail': 'Session is already completed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session.end_session()

        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def leaderboard(self, request, pk=None):
        """Get current leaderboard for the session."""
        session = self.get_object()
        leaderboard = session.get_leaderboard()
        serializer = LeaderboardEntrySerializer(leaderboard, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """Get all participants in the session."""
        session = self.get_object()
        participants = session.participants.filter(status='active').order_by('-score')
        serializer = LiveQuizParticipantSerializer(participants, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsTeacherOrHost])
    def results(self, request, pk=None):
        """Get detailed results for all questions."""
        session = self.get_object()
        results = session.question_results.all()
        serializer = LiveQuizQuestionResultSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def join(self, request):
        """Join a live quiz session with a code."""
        serializer = JoinSessionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        join_code = serializer.validated_data['join_code'].upper()
        nickname = serializer.validated_data.get('nickname', '')

        # Find session
        try:
            session = LiveQuizSession.objects.get(join_code=join_code)
        except LiveQuizSession.DoesNotExist:
            return Response(
                {'detail': 'Invalid join code.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if session allows joining
        if session.status == 'completed':
            return Response(
                {'detail': 'This quiz has already ended.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if session.status == 'in_progress' and not session.allow_late_join:
            return Response(
                {'detail': 'Late joining is not allowed for this quiz.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create or get participant
        user = request.user if request.user.is_authenticated else None

        if user:
            participant, created = LiveQuizParticipant.objects.get_or_create(
                session=session,
                user=user,
                defaults={'status': 'active'}
            )
        else:
            if not nickname:
                return Response(
                    {'detail': 'Nickname is required for guest users.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if nickname is already taken
            if LiveQuizParticipant.objects.filter(session=session, nickname=nickname).exists():
                return Response(
                    {'detail': 'This nickname is already taken.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            participant = LiveQuizParticipant.objects.create(
                session=session,
                nickname=nickname,
                status='active'
            )
            created = True

        if created:
            session.total_participants += 1
            session.save()

        return Response({
            'session': LiveQuizSessionSerializer(session).data,
            'participant': LiveQuizParticipantSerializer(participant).data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def verify_code(self, request):
        """Verify if a join code is valid."""
        join_code = request.query_params.get('code', '').upper()

        if not join_code:
            return Response(
                {'detail': 'Join code is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            session = LiveQuizSession.objects.get(join_code=join_code)
            return Response({
                'valid': True,
                'quiz_title': session.quiz.title,
                'host_name': session.host.get_full_name(),
                'status': session.status,
                'participant_count': session.participants.filter(status='active').count()
            })
        except LiveQuizSession.DoesNotExist:
            return Response({'valid': False}, status=status.HTTP_404_NOT_FOUND)


class LiveQuizParticipantViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing participants.
    """
    queryset = LiveQuizParticipant.objects.all()
    serializer_class = LiveQuizParticipantSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """Submit an answer to the current question."""
        participant = self.get_object()
        session = participant.session

        if session.status != 'in_progress':
            return Response(
                {'detail': 'Quiz is not in progress.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = SubmitLiveAnswerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        question_id = serializer.validated_data['question_id']
        time_taken = serializer.validated_data['time_taken']

        # Verify question
        try:
            question = Question.objects.get(id=question_id, quiz=session.quiz)
        except Question.DoesNotExist:
            return Response(
                {'detail': 'Invalid question.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already answered
        if LiveQuizAnswer.objects.filter(participant=participant, question=question).exists():
            return Response(
                {'detail': 'Already answered this question.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Determine correctness
        is_correct = False
        selected_option = None

        if 'selected_option_id' in serializer.validated_data:
            option_id = serializer.validated_data['selected_option_id']
            try:
                selected_option = QuestionOption.objects.get(id=option_id, question=question)
                is_correct = selected_option.is_correct
            except QuestionOption.DoesNotExist:
                pass

        # Create answer
        answer = LiveQuizAnswer.objects.create(
            participant=participant,
            question=question,
            selected_option=selected_option,
            is_correct=is_correct,
            answer_text=serializer.validated_data.get('answer_text', ''),
            time_taken=time_taken
        )

        # Calculate points
        points = answer.calculate_points(max_time=session.time_per_question)
        answer.save()

        # Update participant stats
        if is_correct:
            participant.correct_answers += 1
            participant.score += points
        else:
            participant.wrong_answers += 1

        participant.last_answer_time = timezone.now()
        participant.save()

        return Response({
            'is_correct': is_correct,
            'points_awarded': points,
            'total_score': participant.score,
            'correct_answers': participant.correct_answers
        })

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave the quiz session."""
        participant = self.get_object()
        participant.status = 'left'
        participant.save()

        return Response({'detail': 'Left the quiz session.'})
