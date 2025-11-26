from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import RegisterView, UserProfileViewSet, UserViewSet

router = DefaultRouter()
router.register(r"", UserViewSet, basename="user")
router.register(r"profiles", UserProfileViewSet, basename="user-profile")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("", include(router.urls)),
]
