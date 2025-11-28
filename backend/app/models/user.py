from datetime import datetime
from typing import Optional, List
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class User(Base):
    __tablename__ = "users_user"  # Keep compatible with Django table name if possible

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Custom fields
    bio = Column(Text, nullable=True)
    avatar = Column(String, nullable=True)  # Store path/URL
    role = Column(String, default="student", index=True)  # student, teacher, admin
    is_email_verified = Column(Boolean, default=False, index=True)
    points = Column(Integer, default=0)
    badges = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    created_quizzes = relationship("Quiz", back_populates="creator")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    hosted_sessions = relationship("LiveQuizSession", back_populates="host")
    live_participations = relationship("LiveQuizParticipant", back_populates="user")
    badges_earned = relationship("UserBadge", back_populates="user")
    statistics = relationship("UserStatistics", back_populates="user", uselist=False)


class UserProfile(Base):
    __tablename__ = "users_userprofile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_user.id"), unique=True)
    bio = Column(Text, default="")
    social_links = Column(JSON, default=dict)
    preferences = Column(JSON, default=dict)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class EmailVerificationToken(Base):
    __tablename__ = "users_emailverificationtoken"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users_user.id"), unique=True)
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))

    user = relationship("User")
