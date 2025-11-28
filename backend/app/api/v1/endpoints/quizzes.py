from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.quiz import Quiz, Category, Question, QuestionOption
from app.models.user import User
from app.schemas.quiz import Quiz as QuizSchema, QuizCreate, Category as CategorySchema, CategoryCreate

router = APIRouter()

@router.get("/", response_model=List[QuizSchema])
async def read_quizzes(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve quizzes.
    """
    result = await db.execute(
        select(Quiz)
        .options(selectinload(Quiz.questions).selectinload(Question.options))
        .offset(skip)
        .limit(limit)
    )
    quizzes = result.scalars().all()
    return quizzes

@router.post("/", response_model=QuizSchema)
async def create_quiz(
    *,
    db: AsyncSession = Depends(deps.get_db),
    quiz_in: QuizCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new quiz.
    """
    quiz = Quiz(
        title=quiz_in.title,
        description=quiz_in.description,
        category_id=quiz_in.category_id,
        creator_id=current_user.id,
        time_limit=quiz_in.time_limit,
        pass_percentage=quiz_in.pass_percentage,
        status=quiz_in.status,
        shuffle_questions=quiz_in.shuffle_questions,
        shuffle_answers=quiz_in.shuffle_answers,
        show_correct_answer=quiz_in.show_correct_answer,
        thumbnail=quiz_in.thumbnail,
        tags=quiz_in.tags,
    )
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    return quiz

@router.get("/categories", response_model=List[CategorySchema])
async def read_categories(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve categories.
    """
    result = await db.execute(select(Category).offset(skip).limit(limit))
    categories = result.scalars().all()
    return categories

@router.post("/categories", response_model=CategorySchema)
async def create_category(
    *,
    db: AsyncSession = Depends(deps.get_db),
    category_in: CategoryCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new category.
    """
    category = Category(
        name=category_in.name,
        slug=category_in.slug,
        description=category_in.description,
        icon=category_in.icon,
        color=category_in.color,
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category
