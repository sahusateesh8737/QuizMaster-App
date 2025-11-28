from typing import Any, List

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.result import LeaderboardEntry, UserStatistics
from app.models.user import User
from app.schemas.result import LeaderboardEntry as LeaderboardEntrySchema, UserStatistics as UserStatisticsSchema

router = APIRouter()

@router.get("/leaderboard", response_model=List[LeaderboardEntrySchema])
async def read_global_leaderboard(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve global leaderboard.
    """
    result = await db.execute(
        select(LeaderboardEntry)
        .order_by(LeaderboardEntry.score.desc())
        .offset(skip)
        .limit(limit)
    )
    entries = result.scalars().all()
    return entries

@router.get("/leaderboard/{quiz_id}", response_model=List[LeaderboardEntrySchema])
async def read_leaderboard(
    quiz_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve leaderboard for a quiz.
    """
    result = await db.execute(
        select(LeaderboardEntry)
        .where(LeaderboardEntry.quiz_id == quiz_id)
        .order_by(LeaderboardEntry.rank)
        .offset(skip)
        .limit(limit)
    )
    entries = result.scalars().all()
    return entries

@router.get("/stats/me", response_model=UserStatisticsSchema)
async def read_user_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve current user statistics.
    """
    result = await db.execute(
        select(UserStatistics).where(UserStatistics.user_id == current_user.id)
    )
    stats = result.scalars().first()
    if not stats:
        # Create empty stats if not exists
        stats = UserStatistics(user_id=current_user.id)
        db.add(stats)
        await db.commit()
        await db.refresh(stats)
    return stats
