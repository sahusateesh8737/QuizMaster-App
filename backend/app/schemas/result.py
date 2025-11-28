from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

class LeaderboardEntryBase(BaseModel):
    score: float
    percentage: float
    is_passed: bool
    time_spent: Optional[timedelta] = None
    rank: int

class LeaderboardEntry(LeaderboardEntryBase):
    id: int
    quiz_id: int
    user_id: int
    attempt_date: datetime

    class Config:
        from_attributes = True

class UserBadgeBase(BaseModel):
    badge_type: str
    title: str
    description: str
    icon: Optional[str] = None

class UserBadge(UserBadgeBase):
    id: int
    user_id: int
    earned_at: datetime

    class Config:
        from_attributes = True

class UserStatisticsBase(BaseModel):
    total_quizzes_taken: int = 0
    total_quizzes_passed: int = 0
    total_quizzes_failed: int = 0
    average_score: float = 0.0
    highest_score: float = 0.0
    lowest_score: float = 0.0
    total_time_spent: Optional[timedelta] = None
    total_questions_attempted: int = 0
    total_questions_correct: int = 0
    pass_rate: float = 0.0
    accuracy_rate: float = 0.0
    last_attempt: Optional[datetime] = None

class UserStatistics(UserStatisticsBase):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
