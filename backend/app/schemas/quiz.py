from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

# Question Option
class QuestionOptionBase(BaseModel):
    text: str
    is_correct: bool = False
    explanation: Optional[str] = None
    order: int = 0

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOption(QuestionOptionBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True

# Question
class QuestionBase(BaseModel):
    text: str
    type: str = "mcq"
    image: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: str = "medium"
    order: int = 0

class QuestionCreate(QuestionBase):
    options: List[QuestionOptionCreate] = []

class Question(QuestionBase):
    id: int
    quiz_id: int
    options: List[QuestionOption] = []

    class Config:
        from_attributes = True

# Category
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = "#3498db"

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Quiz
class QuizBase(BaseModel):
    title: str
    description: str
    category_id: Optional[int] = None
    time_limit: Optional[int] = None
    pass_percentage: int = 60
    status: str = "draft"
    shuffle_questions: bool = False
    shuffle_answers: bool = False
    show_correct_answer: bool = True
    thumbnail: Optional[str] = None
    tags: List[str] = []

class QuizCreate(QuizBase):
    pass

class QuizUpdate(QuizBase):
    pass

class Quiz(QuizBase):
    id: int
    creator_id: int
    total_attempts: int
    total_passes: int
    average_score: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    questions: List[Question] = []

    class Config:
        from_attributes = True
