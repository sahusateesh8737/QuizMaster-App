from typing import Any, List

from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.api import deps
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.models.quiz import Quiz, QuizAttempt
from app.schemas.user import User as UserSchema, UserUpdate

router = APIRouter()

@router.get("/platform-stats", response_model=dict)
async def read_platform_stats(
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Get platform statistics.
    """
    # Count users
    result_users = await db.execute(select(func.count(User.id)))
    total_users = result_users.scalar()
    
    # Count quizzes
    result_quizzes = await db.execute(select(func.count(Quiz.id)))
    total_quizzes = result_quizzes.scalar()
    
    # Count attempts
    result_attempts = await db.execute(select(func.count(QuizAttempt.id)))
    total_attempts = result_attempts.scalar()
    
    return {
        "total_users": total_users,
        "total_quizzes": total_quizzes,
        "total_attempts": total_attempts,
        "avg_rating": 4.8  # Hardcoded for now as we don't have ratings yet
    }

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    user_data = jsonable_encoder(current_user)
    update_data = user_in.dict(exclude_unset=True)
    
    for field in user_data:
        if field in update_data:
            setattr(current_user, field, update_data[field])
            
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
