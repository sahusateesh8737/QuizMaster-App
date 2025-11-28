from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, quizzes, results, live

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(results.router, prefix="/results", tags=["results"])
api_router.include_router(live.router, prefix="/live", tags=["live"])
