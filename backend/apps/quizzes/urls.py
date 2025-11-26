from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    QuizAttemptViewSet,
    QuizViewSet,
    initialize_categories,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"", QuizViewSet, basename="quiz")
router.register(r"attempts", QuizAttemptViewSet, basename="quiz-attempt")

urlpatterns = [
    path("initialize-categories/", initialize_categories, name="initialize-categories"),
    path("", include(router.urls)),
]
