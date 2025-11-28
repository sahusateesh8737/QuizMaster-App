from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, Float, Interval
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class LeaderboardEntry(Base):
    __tablename__ = "results_leaderboardentry"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes_quiz.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users_user.id"), nullable=False)
    
    score = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    is_passed = Column(Boolean, default=False)
    time_spent = Column(Interval, nullable=True)
    
    rank = Column(Integer, nullable=False)
    attempt_date = Column(DateTime(timezone=True), server_default=func.now())

    quiz = relationship("app.models.quiz.Quiz", back_populates="leaderboard")
    user = relationship("app.models.user.User")


class UserBadge(Base):
    __tablename__ = "results_userbadge"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_user.id"), nullable=False)
    
    badge_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, default="")
    
    earned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("app.models.user.User", back_populates="badges_earned")


class UserStatistics(Base):
    __tablename__ = "results_userstatistics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_user.id"), unique=True, nullable=False)
    
    total_quizzes_taken = Column(Integer, default=0)
    total_quizzes_passed = Column(Integer, default=0)
    total_quizzes_failed = Column(Integer, default=0)
    
    average_score = Column(Float, default=0.0)
    highest_score = Column(Float, default=0.0)
    lowest_score = Column(Float, default=0.0)
    
    total_time_spent = Column(Interval, nullable=True)
    total_questions_attempted = Column(Integer, default=0)
    total_questions_correct = Column(Integer, default=0)
    
    pass_rate = Column(Float, default=0.0)
    accuracy_rate = Column(Float, default=0.0)
    
    last_attempt = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("app.models.user.User", back_populates="statistics")
