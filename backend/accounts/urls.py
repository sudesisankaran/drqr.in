from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    HospitalRegisterView,
    PatientRegisterView,
    LoginView,
    LogoutView,
    MeView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    EmailVerificationView
)

urlpatterns = [
    path('register/hospital/', HospitalRegisterView.as_view(), name='register-hospital'),
    path('register/patient/', PatientRegisterView.as_view(), name='register-patient'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('verify-email/', EmailVerificationView.as_view(), name='verify-email'),
]
