from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class LiveQuizSessionBase(BaseModel):
    join_code: str
    status: str = "waiting"
    allow_late_join: bool = False
    show_leaderboard: bool = True
    randomize_questions: bool = False
    time_per_question: int = 30
    current_question_index: int = 0

class LiveQuizSessionCreate(BaseModel):
    quiz_id: int
    allow_late_join: bool = False
    show_leaderboard: bool = True
    randomize_questions: bool = False
    time_per_question: int = 30

class LiveQuizSession(LiveQuizSessionBase):
    id: int
    quiz_id: int
    host_id: int
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    total_participants: int = 0

    class Config:
        from_attributes = True

class LiveQuizParticipantBase(BaseModel):
    nickname: Optional[str] = None
    status: str = "active"
    score: int = 0

class LiveQuizParticipant(LiveQuizParticipantBase):
    id: int
    session_id: int
    user_id: Optional[int] = None
    joined_at: datetime

    class Config:
        from_attributes = True
