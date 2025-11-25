import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Quiz, Category, Question, QuestionOption, QuizAttempt

User = get_user_model()

@pytest.mark.django_db
class TestQuizFlow:
    @pytest.fixture
    def client(self):
        return APIClient()

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    @pytest.fixture
    def category(self):
        return Category.objects.create(
            name='Test Category',
            slug='test-category'
        )

    @pytest.fixture
    def quiz(self, user, category):
        return Quiz.objects.create(
            title='Test Quiz',
            description='Test Description',
            category=category,
            creator=user,
            status='published',
            pass_percentage=50
        )

    @pytest.fixture
    def question(self, quiz):
        question = Question.objects.create(
            quiz=quiz,
            text='What is 2+2?',
            type='mcq',
            order=1
        )
        QuestionOption.objects.create(
            question=question,
            text='4',
            is_correct=True
        )
        QuestionOption.objects.create(
            question=question,
            text='5',
            is_correct=False
        )
        return question

    def test_get_quizzes(self, client, quiz):
        url = reverse('quiz-list')  # Assuming router name is 'quiz'
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_start_attempt(self, client, user, quiz):
        client.force_authenticate(user=user)
        # Try using the action endpoint
        url = f'/api/quizzes/{quiz.id}/attempts/'
        response = client.post(url)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'in_progress'

    def test_submit_answer(self, client, user, quiz, question):
        client.force_authenticate(user=user)
        # Start attempt
        attempt = QuizAttempt.objects.create(quiz=quiz, user=user, status='in_progress')

        url = f'/api/quizzes/attempts/{attempt.id}/submit_answer/'
        correct_option = question.options.get(is_correct=True)

        data = {
            'question_id': question.id,
            'selected_option_id': correct_option.id
        }

        response = client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_correct'] is True

    def test_complete_quiz(self, client, user, quiz, question):
        client.force_authenticate(user=user)
        attempt = QuizAttempt.objects.create(quiz=quiz, user=user, status='in_progress')

        # Submit correct answer
        from .models import UserAnswer
        correct_option = question.options.get(is_correct=True)
        UserAnswer.objects.create(
            attempt=attempt,
            question=question,
            selected_option=correct_option,
            is_correct=True
        )

        url = f'/api/quizzes/attempts/{attempt.id}/complete/'
        response = client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'completed'
        assert response.data['score'] == 1
        assert response.data['is_passed'] is True
