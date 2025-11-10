from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.quizzes.models import Category, Quiz, Question, QuestionOption

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample quiz data'

    def handle(self, *args, **options):
        # Get or create admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@quiz.com',
                'is_staff': True,
                'is_superuser': True,
                'is_email_verified': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))
        
        # Create categories
        categories_data = [
            {'name': 'Programming', 'slug': 'programming', 'description': 'Test your programming knowledge', 'icon': '💻'},
            {'name': 'Science', 'slug': 'science', 'description': 'Explore scientific concepts', 'icon': '🔬'},
            {'name': 'History', 'slug': 'history', 'description': 'Journey through time', 'icon': '📚'},
            {'name': 'Mathematics', 'slug': 'mathematics', 'description': 'Solve mathematical problems', 'icon': '🔢'},
        ]
        
        for cat_data in categories_data:
            Category.objects.get_or_create(slug=cat_data['slug'], defaults=cat_data)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(categories_data)} categories'))
        
        # Create sample quizzes
        programming_cat = Category.objects.get(slug='programming')
        science_cat = Category.objects.get(slug='science')
        
        # Python Quiz
        python_quiz, created = Quiz.objects.get_or_create(
            title='Python Basics',
            defaults={
                'description': 'Test your knowledge of Python fundamentals',
                'category': programming_cat,
                'creator': admin,
                'time_limit': 15,
                'pass_percentage': 70,
                'status': 'published'
            }
        )
        
        if created:
            # Add questions
            q1 = Question.objects.create(
                quiz=python_quiz,
                text='What is the correct way to create a function in Python?',
                type='mcq',
                difficulty='easy',
                order=1
            )
            QuestionOption.objects.create(question=q1, text='function myFunc():', is_correct=False, order=1)
            QuestionOption.objects.create(question=q1, text='def myFunc():', is_correct=True, order=2)
            QuestionOption.objects.create(question=q1, text='create myFunc():', is_correct=False, order=3)
            QuestionOption.objects.create(question=q1, text='func myFunc():', is_correct=False, order=4)
            
            q2 = Question.objects.create(
                quiz=python_quiz,
                text='Which of the following is a mutable data type in Python?',
                type='mcq',
                difficulty='easy',
                order=2
            )
            QuestionOption.objects.create(question=q2, text='Tuple', is_correct=False, order=1)
            QuestionOption.objects.create(question=q2, text='String', is_correct=False, order=2)
            QuestionOption.objects.create(question=q2, text='List', is_correct=True, order=3)
            QuestionOption.objects.create(question=q2, text='Integer', is_correct=False, order=4)
            
            q3 = Question.objects.create(
                quiz=python_quiz,
                text='What does the len() function do?',
                type='mcq',
                difficulty='easy',
                order=3
            )
            QuestionOption.objects.create(question=q3, text='Returns the length of an object', is_correct=True, order=1)
            QuestionOption.objects.create(question=q3, text='Converts to lowercase', is_correct=False, order=2)
            QuestionOption.objects.create(question=q3, text='Deletes an object', is_correct=False, order=3)
            QuestionOption.objects.create(question=q3, text='Creates a new list', is_correct=False, order=4)
            
            q4 = Question.objects.create(
                quiz=python_quiz,
                text='What is the output of: print(type(5.0))',
                type='mcq',
                difficulty='easy',
                order=4
            )
            QuestionOption.objects.create(question=q4, text='<class "int">', is_correct=False, order=1)
            QuestionOption.objects.create(question=q4, text='<class "float">', is_correct=True, order=2)
            QuestionOption.objects.create(question=q4, text='<class "number">', is_correct=False, order=3)
            QuestionOption.objects.create(question=q4, text='<class "decimal">', is_correct=False, order=4)
            
            q5 = Question.objects.create(
                quiz=python_quiz,
                text='Which keyword is used to create a loop in Python?',
                type='mcq',
                difficulty='easy',
                order=5
            )
            QuestionOption.objects.create(question=q5, text='loop', is_correct=False, order=1)
            QuestionOption.objects.create(question=q5, text='for', is_correct=True, order=2)
            QuestionOption.objects.create(question=q5, text='repeat', is_correct=False, order=3)
            QuestionOption.objects.create(question=q5, text='iterate', is_correct=False, order=4)
            
        # JavaScript Quiz
        js_quiz, created = Quiz.objects.get_or_create(
            title='JavaScript Fundamentals',
            defaults={
                'description': 'Master JavaScript basics',
                'category': programming_cat,
                'creator': admin,
                'time_limit': 20,
                'pass_percentage': 70,
                'status': 'published'
            }
        )
        
        if created:
            q1 = Question.objects.create(
                quiz=js_quiz,
                text='Which keyword is used to declare a constant in JavaScript?',
                type='mcq',
                difficulty='easy',
                order=1
            )
            QuestionOption.objects.create(question=q1, text='var', is_correct=False, order=1)
            QuestionOption.objects.create(question=q1, text='let', is_correct=False, order=2)
            QuestionOption.objects.create(question=q1, text='const', is_correct=True, order=3)
            QuestionOption.objects.create(question=q1, text='constant', is_correct=False, order=4)
            
            q2 = Question.objects.create(
                quiz=js_quiz,
                text='What is the output of: typeof []',
                type='mcq',
                difficulty='medium',
                order=2
            )
            QuestionOption.objects.create(question=q2, text='"array"', is_correct=False, order=1)
            QuestionOption.objects.create(question=q2, text='"object"', is_correct=True, order=2)
            QuestionOption.objects.create(question=q2, text='"list"', is_correct=False, order=3)
            QuestionOption.objects.create(question=q2, text='"undefined"', is_correct=False, order=4)
            
            q3 = Question.objects.create(
                quiz=js_quiz,
                text='Which method adds one or more elements to the end of an array?',
                type='mcq',
                difficulty='easy',
                order=3
            )
            QuestionOption.objects.create(question=q3, text='push()', is_correct=True, order=1)
            QuestionOption.objects.create(question=q3, text='pop()', is_correct=False, order=2)
            QuestionOption.objects.create(question=q3, text='shift()', is_correct=False, order=3)
            QuestionOption.objects.create(question=q3, text='unshift()', is_correct=False, order=4)
            
            q4 = Question.objects.create(
                quiz=js_quiz,
                text='What is the correct syntax for a single-line comment in JavaScript?',
                type='mcq',
                difficulty='easy',
                order=4
            )
            QuestionOption.objects.create(question=q4, text='# This is a comment', is_correct=False, order=1)
            QuestionOption.objects.create(question=q4, text='// This is a comment', is_correct=True, order=2)
            QuestionOption.objects.create(question=q4, text='<!-- This is a comment -->', is_correct=False, order=3)
            QuestionOption.objects.create(question=q4, text='/* This is a comment */', is_correct=False, order=4)
        
        # Physics Quiz
        physics_quiz, created = Quiz.objects.get_or_create(
            title='Basic Physics',
            defaults={
                'description': 'Test your understanding of physics concepts',
                'category': science_cat,
                'creator': admin,
                'time_limit': 25,
                'pass_percentage': 60,
                'status': 'published'
            }
        )
        
        if created:
            q1 = Question.objects.create(
                quiz=physics_quiz,
                text='What is the SI unit of force?',
                type='mcq',
                difficulty='easy',
                order=1
            )
            QuestionOption.objects.create(question=q1, text='Joule', is_correct=False, order=1)
            QuestionOption.objects.create(question=q1, text='Newton', is_correct=True, order=2)
            QuestionOption.objects.create(question=q1, text='Watt', is_correct=False, order=3)
            QuestionOption.objects.create(question=q1, text='Pascal', is_correct=False, order=4)
            
            q2 = Question.objects.create(
                quiz=physics_quiz,
                text='What is the speed of light in vacuum?',
                type='mcq',
                difficulty='medium',
                order=2
            )
            QuestionOption.objects.create(question=q2, text='300,000 km/s', is_correct=True, order=1)
            QuestionOption.objects.create(question=q2, text='150,000 km/s', is_correct=False, order=2)
            QuestionOption.objects.create(question=q2, text='450,000 km/s', is_correct=False, order=3)
            QuestionOption.objects.create(question=q2, text='600,000 km/s', is_correct=False, order=4)
            
            q3 = Question.objects.create(
                quiz=physics_quiz,
                text='What is the formula for kinetic energy?',
                type='mcq',
                difficulty='medium',
                order=3
            )
            QuestionOption.objects.create(question=q3, text='E = mc²', is_correct=False, order=1)
            QuestionOption.objects.create(question=q3, text='KE = ½mv²', is_correct=True, order=2)
            QuestionOption.objects.create(question=q3, text='F = ma', is_correct=False, order=3)
            QuestionOption.objects.create(question=q3, text='P = mv', is_correct=False, order=4)
            
            q4 = Question.objects.create(
                quiz=physics_quiz,
                text='What is the acceleration due to gravity on Earth?',
                type='mcq',
                difficulty='easy',
                order=4
            )
            QuestionOption.objects.create(question=q4, text='9.8 m/s²', is_correct=True, order=1)
            QuestionOption.objects.create(question=q4, text='10.5 m/s²', is_correct=False, order=2)
            QuestionOption.objects.create(question=q4, text='8.5 m/s²', is_correct=False, order=3)
            QuestionOption.objects.create(question=q4, text='11.2 m/s²', is_correct=False, order=4)
        
        self.stdout.write(self.style.SUCCESS('Successfully created sample quizzes with questions'))
