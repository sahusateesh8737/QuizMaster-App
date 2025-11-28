from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base

class LiveQuizSession(Base):
    __tablename__ = "live_quiz_livequizsession"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes_quiz.id"), nullable=False)
    host_id = Column(Integer, ForeignKey("users_user.id"), nullable=False)
    
    join_code = Column(String, unique=True, nullable=False, index=True)
    status = Column(String, default="waiting")  # waiting, in_progress, completed, cancelled
    
    allow_late_join = Column(Boolean, default=False)
    show_leaderboard = Column(Boolean, default=True)
    randomize_questions = Column(Boolean, default=False)
    time_per_question = Column(Integer, default=30)
    
    current_question_index = Column(Integer, default=0)
    current_question_start_time = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    
    total_participants = Column(Integer, default=0)

    quiz = relationship("app.models.quiz.Quiz", back_populates="live_sessions")
    host = relationship("app.models.user.User", back_populates="hosted_sessions")
    participants = relationship("LiveQuizParticipant", back_populates="session", cascade="all, delete-orphan")
    question_results = relationship("LiveQuizQuestionResult", back_populates="session", cascade="all, delete-orphan")


class LiveQuizParticipant(Base):
    __tablename__ = "live_quiz_livequizparticipant"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("live_quiz_livequizsession.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users_user.id"), nullable=True)
    
    nickname = Column(String, nullable=True)
    status = Column(String, default="active")  # active, disconnected, left
    
    score = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    last_answer_time = Column(DateTime(timezone=True), nullable=True)
    
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    session = relationship("LiveQuizSession", back_populates="participants")
    user = relationship("app.models.user.User", back_populates="live_participations")
    answers = relationship("LiveQuizAnswer", back_populates="participant", cascade="all, delete-orphan")


class LiveQuizAnswer(Base):
    __tablename__ = "live_quiz_livequizanswer"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("live_quiz_livequizparticipant.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("quizzes_question.id"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey("quizzes_questionoption.id"), nullable=True)
    
    is_correct = Column(Boolean, default=False)
    answer_text = Column(Text, default="")
    
    time_taken = Column(Float, default=0.0)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())
    points_awarded = Column(Integer, default=0)

    participant = relationship("LiveQuizParticipant", back_populates="answers")
    question = relationship("app.models.quiz.Question")
    selected_option = relationship("app.models.quiz.QuestionOption")


class LiveQuizQuestionResult(Base):
    __tablename__ = "live_quiz_livequizquestionresult"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("live_quiz_livequizsession.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("quizzes_question.id"), nullable=False)
    
    total_answers = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    
    response_distribution = Column(JSON, default=dict)
    average_time = Column(Float, default=0.0)

    session = relationship("LiveQuizSession", back_populates="question_results")
    question = relationship("app.models.quiz.Question")
