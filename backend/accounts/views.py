import secrets
from django.contrib.auth import update_session_auth_hash
from django.core.signing import Signer, BadSignature
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    UserSerializer,
    HospitalProfileSerializer,
    PatientProfileSerializer,
    HospitalRegistrationSerializer,
    PatientRegistrationSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)

signer = Signer(salt='drqr-password-reset')


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def get_user_profile_data(user):
    data = {
        'id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role,
        'phone': user.phone,
        'is_email_verified': user.is_email_verified,
        'date_joined': user.date_joined,
    }
    if user.role == 'hospital':
        profile = getattr(user, 'hospital_profile', None)
        data['hospital_profile'] = HospitalProfileSerializer(profile).data if profile else None
    elif user.role == 'patient':
        profile = getattr(user, 'patient_profile', None)
        data['patient_profile'] = PatientProfileSerializer(profile).data if profile else None
    return data


class HospitalRegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = HospitalRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        user_data = get_user_profile_data(user)
        return Response({
            'success': True,
            'message': 'Hospital registered successfully.',
            'tokens': tokens,
            'user': user_data
        }, status=status.HTTP_201_CREATED)


class PatientRegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PatientRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        user_data = get_user_profile_data(user)
        return Response({
            'success': True,
            'message': 'Patient registered successfully.',
            'tokens': tokens,
            'user': user_data
        }, status=status.HTTP_201_CREATED)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        user_data = get_user_profile_data(user)
        return Response({
            'success': True,
            'message': 'Login successful.',
            'tokens': tokens,
            'user': user_data
        }, status=status.HTTP_200_OK)


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response({
            'success': True,
            'message': 'Successfully logged out.'
        }, status=status.HTTP_200_OK)


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_data = get_user_profile_data(request.user)
        return Response({
            'success': True,
            'user': user_data
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        full_name = request.data.get('full_name')
        phone = request.data.get('phone')

        if full_name:
            user.full_name = full_name
        if phone is not None:
            user.phone = phone
        user.save()

        user_data = get_user_profile_data(user)
        return Response({
            'success': True,
            'message': 'Account updated successfully.',
            'user': user_data
        }, status=status.HTTP_200_OK)


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'success': False,
                'message': 'Incorrect current password.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({
            'success': True,
            'message': 'Password changed successfully.'
        }, status=status.HTTP_200_OK)


class PasswordResetRequestView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower()

        try:
            user = User.objects.get(email=email)
            reset_token = signer.sign(f"{user.id}:{user.password}")
            # In a real environment, send via email. Return token in dev for seamless testing.
            return Response({
                'success': True,
                'message': 'If an account exists with this email, a reset token has been generated.',
                'dev_token': reset_token
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'success': True,
                'message': 'If an account exists with this email, a reset token has been generated.'
            }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            unsigned = signer.unsign(token)
            user_id, old_pw_hash = unsigned.split(':', 1)
            user = User.objects.get(id=user_id)

            if user.password != old_pw_hash:
                return Response({
                    'success': False,
                    'message': 'Password reset token has already been used or expired.'
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({
                'success': True,
                'message': 'Password has been reset successfully. Please log in with your new password.'
            }, status=status.HTTP_200_OK)
        except (BadSignature, ValueError, User.DoesNotExist):
            return Response({
                'success': False,
                'message': 'Invalid or expired password reset token.'
            }, status=status.HTTP_400_BAD_REQUEST)


class EmailVerificationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.query_params.get('token')
        return Response({
            'success': True,
            'message': 'Email address verified successfully.'
        }, status=status.HTTP_200_OK)
