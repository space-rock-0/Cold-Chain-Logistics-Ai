from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import LoginView, MeView

urlpatterns = [
    path("login/", LoginView.as_view(), name="token_obtain_pair"),
    path("me/", MeView.as_view()),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
