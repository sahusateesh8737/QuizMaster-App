from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel, field_serializer

# User Answer Schemas
class UserAnswerBase(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    answer_text: Optional[str] = ""

class UserAnswerCreate(UserAnswerBase):
    pass

class UserAnswer(UserAnswerBase):
    id: int
    attempt_id: int
    is_correct: Optional[bool] = None
    answered_at: datetime

    class Config:
        from_attributes = True

# Quiz Attempt Schemas
class QuizAttemptBase(BaseModel):
    quiz_id: int

class QuizAttemptCreate(QuizAttemptBase):
    pass

class QuizAttempt(QuizAttemptBase):
    id: int
    user_id: int
    status: str
    score: Optional[float] = None
    percentage: Optional[float] = None
    is_passed: Optional[bool] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    time_spent: Optional[int] = None  # Will store seconds
    answers: List[UserAnswer] = []

    @field_serializer('time_spent')
    def serialize_time_spent(self, value: Optional[timedelta], _info) -> Optional[int]:
        """Convert timedelta to seconds for JSON serialization"""
        if value is None:
            return None
        if isinstance(value, timedelta):
            return int(value.total_seconds())
        return value  # Already an int

    class Config:
        from_attributes = True

# Response for completing an attempt
class QuizAttemptComplete(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    status: str
    score: float
    percentage: float
    is_passed: bool
    total_questions: int
    correct_answers: int
    start_time: datetime
    end_time: datetime
    time_spent: Optional[int] = None  # Seconds

    class Config:
        from_attributes = True
