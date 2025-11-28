import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.quiz import Category, Quiz, Question, QuestionOption
from app.models.live import LiveQuizSession  # Fix for relationship loading
from app.models.result import UserBadge, UserStatistics, LeaderboardEntry # Fix for relationship loading
from app.core.security import get_password_hash

async def seed():
    print("Seeding database...")
    async with AsyncSessionLocal() as db:
        # 1. Get or Create User
        result = await db.execute(select(User).where(User.email == "admin@example.com"))
        user = result.scalars().first()
        if not user:
            print("Creating admin user...")
            user = User(
                email="admin@example.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                first_name="Admin",
                last_name="User",
                role="teacher",
                is_active=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            print(f"Found existing user: {user.email}")

        # 2. Create Categories
        categories_data = [
            {"name": "General Knowledge", "slug": "general-knowledge", "description": "Test your general knowledge", "icon": "🌍", "color": "#3498db"},
            {"name": "Science", "slug": "science", "description": "Physics, Chemistry, and Biology", "icon": "🔬", "color": "#2ecc71"},
            {"name": "History", "slug": "history", "description": "World History and Events", "icon": "📜", "color": "#e74c3c"},
            {"name": "Technology", "slug": "technology", "description": "Computers, AI, and Gadgets", "icon": "💻", "color": "#9b59b6"},
        ]

        categories = {}
        for cat_data in categories_data:
            result = await db.execute(select(Category).where(Category.slug == cat_data["slug"]))
            category = result.scalars().first()
            if not category:
                print(f"Creating category: {cat_data['name']}")
                category = Category(**cat_data)
                db.add(category)
                await db.commit()
                await db.refresh(category)
            categories[cat_data["slug"]] = category

        # 3. Create Quizzes
        quizzes_data = [
            {
                "title": "World Capitals",
                "description": "Can you name the capital cities of these countries?",
                "category_slug": "general-knowledge",
                "time_limit": 10,
                "questions": [
                    {
                        "text": "What is the capital of France?",
                        "options": [
                            {"text": "London", "is_correct": False},
                            {"text": "Berlin", "is_correct": False},
                            {"text": "Paris", "is_correct": True},
                            {"text": "Madrid", "is_correct": False},
                        ]
                    },
                    {
                        "text": "What is the capital of Japan?",
                        "options": [
                            {"text": "Seoul", "is_correct": False},
                            {"text": "Beijing", "is_correct": False},
                            {"text": "Tokyo", "is_correct": True},
                            {"text": "Bangkok", "is_correct": False},
                        ]
                    }
                ]
            },
            {
                "title": "Basic Physics",
                "description": "Test your knowledge of basic physics concepts.",
                "category_slug": "science",
                "time_limit": 15,
                "questions": [
                    {
                        "text": "What is the unit of force?",
                        "options": [
                            {"text": "Newton", "is_correct": True},
                            {"text": "Joule", "is_correct": False},
                            {"text": "Watt", "is_correct": False},
                            {"text": "Pascal", "is_correct": False},
                        ]
                    },
                    {
                        "text": "What is the speed of light?",
                        "options": [
                            {"text": "300,000 km/s", "is_correct": True},
                            {"text": "150,000 km/s", "is_correct": False},
                            {"text": "1,000 km/s", "is_correct": False},
                            {"text": "Sound speed", "is_correct": False},
                        ]
                    }
                ]
            }
        ]

        for quiz_data in quizzes_data:
            # Check if quiz exists
            result = await db.execute(select(Quiz).where(Quiz.title == quiz_data["title"]))
            if result.scalars().first():
                print(f"Quiz '{quiz_data['title']}' already exists. Skipping.")
                continue

            print(f"Creating quiz: {quiz_data['title']}")
            category = categories.get(quiz_data["category_slug"])
            
            quiz = Quiz(
                title=quiz_data["title"],
                description=quiz_data["description"],
                category_id=category.id,
                creator_id=user.id,
                time_limit=quiz_data["time_limit"],
                status="published"
            )
            db.add(quiz)
            await db.commit()
            await db.refresh(quiz)

            for q_data in quiz_data["questions"]:
                question = Question(
                    quiz_id=quiz.id,
                    text=q_data["text"],
                    type="mcq"
                )
                db.add(question)
                await db.commit()
                await db.refresh(question)

                for opt_data in q_data["options"]:
                    option = QuestionOption(
                        question_id=question.id,
                        text=opt_data["text"],
                        is_correct=opt_data["is_correct"]
                    )
                    db.add(option)
                await db.commit()

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
