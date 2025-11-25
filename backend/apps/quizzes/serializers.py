from rest_framework import serializers
from .models import Category, Quiz, Question, QuestionOption, QuizAttempt, UserAnswer


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for quiz categories."""

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'icon', 'color')


class QuestionOptionSerializer(serializers.ModelSerializer):
    """Serializer for question options."""

    class Meta:
        model = QuestionOption
        fields = ('id', 'text', 'explanation', 'order')

    def to_representation(self, instance):
        """Hide correct answer from non-creators."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            # Only show is_correct to quiz creator or staff
            if hasattr(self, 'parent') and self.parent.parent:
                quiz = self.parent.parent.instance
                if data.get('pass_percentage') and (data['pass_percentage'] < 0 or data['pass_percentage'] > 100):
                    raise serializers.ValidationError({"pass_percentage": "Pass percentage must be between 0 and 100."})
                if quiz and quiz.creator != request.user and not request.user.is_staff:
                    # Don't include is_correct in response
                    pass
                else:
                    data['is_correct'] = instance.is_correct
            else:
                data['is_correct'] = instance.is_correct
        return data


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for questions."""

    options = QuestionOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'type', 'image', 'explanation', 'difficulty', 'order', 'options')


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for quiz list view."""

    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = (
            'id', 'title', 'description', 'category', 'category_name', 'creator', 'creator_name',
            'time_limit', 'pass_percentage', 'status', 'thumbnail', 'questions_count',
            'total_attempts', 'average_score', 'tags', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'creator', 'total_attempts', 'average_score', 'created_at', 'updated_at')

    def get_questions_count(self, obj):
        return obj.questions.count()


class QuizDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for quiz with questions."""

    questions = QuestionSerializer(many=True, read_only=True)
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = (
            'id', 'title', 'description', 'category', 'category_name', 'creator', 'creator_name',
            'time_limit', 'pass_percentage', 'status', 'shuffle_questions', 'shuffle_answers',
            'show_correct_answer', 'thumbnail', 'tags', 'questions', 'questions_count',
            'total_attempts', 'total_passes', 'average_score', 'created_at', 'updated_at'
        )

    def get_questions_count(self, obj):
        return obj.questions.count()


class UserAnswerSerializer(serializers.ModelSerializer):
    """Serializer for user answers."""

    question_text = serializers.CharField(source='question.text', read_only=True)
    selected_option_text = serializers.CharField(source='selected_option.text', read_only=True)
    correct_option = serializers.SerializerMethodField()

    class Meta:
        model = UserAnswer
        fields = ('id', 'question', 'question_text', 'selected_option', 'selected_option_text', 'answer_text', 'is_correct', 'correct_option')

    def get_correct_option(self, obj):
        """Get the correct option for the question."""
        correct_option = obj.question.options.filter(is_correct=True).first()
        if correct_option:
            return {
                'id': correct_option.id,
                'text': correct_option.text,
                'explanation': correct_option.explanation
            }
        return None


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for quiz attempts."""

    answers = UserAnswerSerializer(many=True, read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    total_questions = serializers.IntegerField(source='quiz.questions.count', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = (
            'id', 'quiz', 'quiz_title', 'user', 'status', 'score', 'percentage', 'is_passed',
            'start_time', 'end_time', 'time_spent', 'answers', 'total_questions'
        )
        read_only_fields = ('id', 'user', 'start_time')


class QuizAttemptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating quiz attempts."""

    class Meta:
        model = QuizAttempt
        fields = ('quiz',)


class SubmitAnswerSerializer(serializers.Serializer):
    """Serializer for submitting an answer."""

    question_id = serializers.IntegerField()
    selected_option_id = serializers.IntegerField(required=False, allow_null=True)
    answer_text = serializers.CharField(required=False, allow_blank=True)
