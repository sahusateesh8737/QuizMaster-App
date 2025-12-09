from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from datetime import datetime

from app.api import deps
from app.models.quiz import Quiz, Category, Question, QuestionOption, QuizAttempt, UserAnswer
from app.models.user import User
from app.schemas.quiz import Quiz as QuizSchema, QuizCreate, Category as CategorySchema, CategoryCreate
from app.schemas.quiz_attempt import (
    QuizAttempt as QuizAttemptSchema,
    QuizAttemptCreate,
    QuizAttemptComplete,
    UserAnswer as UserAnswerSchema,
    UserAnswerCreate,
)

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

@router.get("/{quiz_id}", response_model=QuizSchema)
async def read_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get quiz by ID.
    """
    result = await db.execute(
        select(Quiz)
        .where(Quiz.id == quiz_id)
        .options(selectinload(Quiz.questions).selectinload(Question.options))
    )
    quiz = result.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
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

# Quiz Attempt Endpoints

@router.post("/{quiz_id}/attempts/", response_model=QuizAttemptSchema)
async def create_quiz_attempt(
    *,
    db: AsyncSession = Depends(deps.get_db),
    quiz_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Start a new quiz attempt.
    """
    # Verify quiz exists
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalars().first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if quiz is published
    if quiz.status != "published":
        raise HTTPException(status_code=400, detail="Quiz is not published")
    
    # Create new attempt
    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=current_user.id,
        status="in_progress",
    )
    db.add(attempt)
    await db.commit()
    
    # Refresh and eagerly load the answers relationship to avoid lazy loading issues
    await db.refresh(attempt, attribute_names=['answers'])
    
    return attempt

@router.get("/attempts/{attempt_id}/", response_model=QuizAttemptSchema)
async def get_quiz_attempt(
    *,
    db: AsyncSession = Depends(deps.get_db),
    attempt_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get quiz attempt details.
    """
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.id == attempt_id)
        .options(selectinload(QuizAttempt.answers))
    )
    attempt = result.scalars().first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Verify user owns this attempt
    if attempt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this attempt")
    
    return attempt

@router.post("/attempts/{attempt_id}/submit_answer/", response_model=UserAnswerSchema)
async def submit_answer(
    *,
    db: AsyncSession = Depends(deps.get_db),
    attempt_id: int,
    answer_in: UserAnswerCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Submit an answer for a question in an attempt.
    """
    # Get attempt
    result = await db.execute(select(QuizAttempt).where(QuizAttempt.id == attempt_id))
    attempt = result.scalars().first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Verify user owns this attempt
    if attempt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Verify attempt is still in progress
    if attempt.status != "in_progress":
        raise HTTPException(status_code=400, detail="Attempt is already completed")
    
    # Verify question belongs to this quiz
    result = await db.execute(
        select(Question)
        .where(Question.id == answer_in.question_id)
        .where(Question.quiz_id == attempt.quiz_id)
    )
    question = result.scalars().first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found in this quiz")
    
    # Check if answer already exists for this question
    result = await db.execute(
        select(UserAnswer)
        .where(UserAnswer.attempt_id == attempt_id)
        .where(UserAnswer.question_id == answer_in.question_id)
    )
    existing_answer = result.scalars().first()
    
    # Determine if answer is correct
    is_correct = False
    if answer_in.selected_option_id:
        result = await db.execute(
            select(QuestionOption)
            .where(QuestionOption.id == answer_in.selected_option_id)
        )
        selected_option = result.scalars().first()
        if selected_option:
            is_correct = selected_option.is_correct
    
    if existing_answer:
        # Update existing answer
        existing_answer.selected_option_id = answer_in.selected_option_id
        existing_answer.answer_text = answer_in.answer_text
        existing_answer.is_correct = is_correct
        existing_answer.answered_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing_answer)
        return existing_answer
    else:
        # Create new answer
        user_answer = UserAnswer(
            attempt_id=attempt_id,
            question_id=answer_in.question_id,
            selected_option_id=answer_in.selected_option_id,
            answer_text=answer_in.answer_text,
            is_correct=is_correct,
        )
        db.add(user_answer)
        await db.commit()
        await db.refresh(user_answer)
        return user_answer

@router.post("/attempts/{attempt_id}/complete/", response_model=QuizAttemptComplete)
async def complete_quiz_attempt(
    *,
    db: AsyncSession = Depends(deps.get_db),
    attempt_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Complete a quiz attempt and calculate the score.
    """
    # Get attempt with answers
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.id == attempt_id)
        .options(selectinload(QuizAttempt.answers))
    )
    attempt = result.scalars().first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Verify user owns this attempt
    if attempt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Verify attempt is in progress
    if attempt.status != "in_progress":
        raise HTTPException(status_code=400, detail="Attempt is already completed")
    
    # Get quiz to check pass percentage
    result = await db.execute(select(Quiz).where(Quiz.id == attempt.quiz_id))
    quiz = result.scalars().first()
    
    # Get total questions count
    result = await db.execute(
        select(func.count(Question.id)).where(Question.quiz_id == attempt.quiz_id)
    )
    total_questions = result.scalar()
    
    # Calculate score
    correct_answers = sum(1 for answer in attempt.answers if answer.is_correct)
    score = correct_answers
    percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    is_passed = percentage >= quiz.pass_percentage
    
    # Update attempt
    attempt.status = "completed"
    attempt.score = float(score)
    attempt.percentage = float(percentage)
    attempt.is_passed = is_passed
    attempt.end_time = datetime.utcnow()
    attempt.time_spent = attempt.end_time - attempt.start_time
    
    # Update quiz statistics
    quiz.total_attempts += 1
    if is_passed:
        quiz.total_passes += 1
    
    # Update average score
    result = await db.execute(
        select(func.avg(QuizAttempt.percentage))
        .where(QuizAttempt.quiz_id == quiz.id)
        .where(QuizAttempt.status == "completed")
    )
    avg_score = result.scalar()
    quiz.average_score = float(avg_score) if avg_score else 0.0
    
    await db.commit()
    await db.refresh(attempt)
    
    # Convert timedelta to seconds for JSON serialization
    time_spent_seconds = int(attempt.time_spent.total_seconds()) if attempt.time_spent else None
    
    return QuizAttemptComplete(
        id=attempt.id,
        quiz_id=attempt.quiz_id,
        user_id=attempt.user_id,
        status=attempt.status,
        score=attempt.score,
        percentage=attempt.percentage,
        is_passed=attempt.is_passed,
        total_questions=total_questions,
        correct_answers=correct_answers,
        start_time=attempt.start_time,
        end_time=attempt.end_time,
        time_spent=time_spent_seconds,
    )

