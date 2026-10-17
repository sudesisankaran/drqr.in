from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsPatientUser
from .models import PatientProfile
from .serializers import PatientProfileDetailSerializer, PatientProfileUpdateSerializer


class PatientMeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get(self, request):
        try:
            profile = request.user.patient_profile
        except PatientProfile.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Patient profile does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PatientProfileDetailSerializer(profile)
        return Response({'success': True, 'data': serializer.data})

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial=True):
        try:
            profile = request.user.patient_profile
        except PatientProfile.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Patient profile does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = PatientProfileUpdateSerializer(profile, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        full_data = PatientProfileDetailSerializer(profile).data
        return Response({
            'success': True,
            'message': 'Profile updated successfully.',
            'data': full_data
        })
