from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON, Interval
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class Category(Base):
    __tablename__ = "quizzes_category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, default="")
    icon = Column(String, default="")
    color = Column(String, default="#3498db")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    quizzes = relationship("Quiz", back_populates="category")


class Quiz(Base):
    __tablename__ = "quizzes_quiz"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("quizzes_category.id"), nullable=True)
    creator_id = Column(Integer, ForeignKey("users_user.id"), nullable=False)
    
    # Settings
    time_limit = Column(Integer, nullable=True)  # in minutes
    pass_percentage = Column(Integer, default=60)
    status = Column(String, default="draft")  # draft, published, archived
    
    # Display settings
    shuffle_questions = Column(Boolean, default=False)
    shuffle_answers = Column(Boolean, default=False)
    show_correct_answer = Column(Boolean, default=True)
    
    # Metadata
    thumbnail = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    
    # Stats
    total_attempts = Column(Integer, default=0)
    total_passes = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="quizzes")
    creator = relationship("app.models.user.User", back_populates="created_quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz")
    live_sessions = relationship("LiveQuizSession", back_populates="quiz")
    leaderboard = relationship("LeaderboardEntry", back_populates="quiz")


class Question(Base):
    __tablename__ = "quizzes_question"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes_quiz.id"), nullable=False)
    text = Column(Text, nullable=False)
    type = Column(String, default="mcq")  # mcq, tf, fill, match
    image = Column(String, nullable=True)
    
    explanation = Column(Text, default="")
    difficulty = Column(String, default="medium")
    
    # Stats
    attempt_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    quiz = relationship("Quiz", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan")


class QuestionOption(Base):
    __tablename__ = "quizzes_questionoption"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("quizzes_question.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    explanation = Column(Text, default="")
    order = Column(Integer, default=0)

    question = relationship("Question", back_populates="options")


class QuizAttempt(Base):
    __tablename__ = "quizzes_quizattempt"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes_quiz.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users_user.id"), nullable=False)
    
    status = Column(String, default="in_progress")  # in_progress, completed, abandoned
    score = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)
    is_passed = Column(Boolean, nullable=True)
    
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    time_spent = Column(Interval, nullable=True)

    quiz = relationship("Quiz", back_populates="attempts")
    user = relationship("app.models.user.User", back_populates="quiz_attempts")
    answers = relationship("UserAnswer", back_populates="attempt", cascade="all, delete-orphan")


class UserAnswer(Base):
    __tablename__ = "quizzes_useranswer"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quizzes_quizattempt.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("quizzes_question.id"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey("quizzes_questionoption.id"), nullable=True)
    
    answer_text = Column(Text, default="")
    is_correct = Column(Boolean, nullable=True)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())

    attempt = relationship("QuizAttempt", back_populates="answers")
    question = relationship("Question")
    selected_option = relationship("QuestionOption")
