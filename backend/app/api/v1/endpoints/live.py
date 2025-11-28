import random
import string
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api import deps
from app.models.live import LiveQuizSession, LiveQuizParticipant
from app.models.user import User
from app.schemas.live import LiveQuizSession as LiveQuizSessionSchema, LiveQuizSessionCreate, LiveQuizParticipant as LiveQuizParticipantSchema

router = APIRouter()

def generate_join_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

@router.post("/sessions", response_model=LiveQuizSessionSchema)
async def create_session(
    *,
    db: AsyncSession = Depends(deps.get_db),
    session_in: LiveQuizSessionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new live quiz session.
    """
    join_code = generate_join_code()
    # Ensure uniqueness loop could be added here
    
    session = LiveQuizSession(
        quiz_id=session_in.quiz_id,
        host_id=current_user.id,
        join_code=join_code,
        allow_late_join=session_in.allow_late_join,
        show_leaderboard=session_in.show_leaderboard,
        randomize_questions=session_in.randomize_questions,
        time_per_question=session_in.time_per_question,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.post("/join/{join_code}", response_model=LiveQuizParticipantSchema)
async def join_session(
    join_code: str,
    nickname: str = None,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Join a live quiz session.
    """
    result = await db.execute(select(LiveQuizSession).where(LiveQuizSession.join_code == join_code))
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status != "waiting" and not session.allow_late_join:
        raise HTTPException(status_code=400, detail="Session already started")
        
    participant = LiveQuizParticipant(
        session_id=session.id,
        user_id=current_user.id,
        nickname=nickname or current_user.username,
    )
    db.add(participant)
    session.total_participants += 1
    await db.commit()
    await db.refresh(participant)
    return participant
