from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsHospitalUser
from .models import HospitalProfile
from .serializers import HospitalProfileDetailSerializer, HospitalProfileUpdateSerializer


class HospitalMeView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]

    def get(self, request):
        try:
            profile = request.user.hospital_profile
        except HospitalProfile.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Hospital profile does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = HospitalProfileDetailSerializer(profile)
        return Response({'success': True, 'data': serializer.data})

    def put(self, request):
        try:
            profile = request.user.hospital_profile
        except HospitalProfile.DoesNotExist:
            return Response(
                {'success': False, 'message': 'Hospital profile does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = HospitalProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        full_data = HospitalProfileDetailSerializer(profile).data
        return Response({
            'success': True,
            'message': 'Hospital profile updated successfully.',
            'data': full_data
        })


class HospitalListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HospitalProfileDetailSerializer

    def get_queryset(self):
        queryset = HospitalProfile.objects.all().select_related('user')
        search = self.request.query_params.get('search', '').strip()
        hospital_type = self.request.query_params.get('hospital_type', '').strip()
        city = self.request.query_params.get('city', '').strip()
        district = self.request.query_params.get('district', '').strip()

        if search:
            queryset = queryset.filter(
                Q(hospital_name__icontains=search) |
                Q(registration_number__icontains=search) |
                Q(doctor_in_charge__icontains=search)
            )
        if hospital_type:
            queryset = queryset.filter(hospital_type__iexact=hospital_type)
        if city:
            queryset = queryset.filter(city__icontains=city)
        if district:
            queryset = queryset.filter(district__icontains=district)

        return queryset


class HospitalDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = HospitalProfile.objects.all().select_related('user')
    serializer_class = HospitalProfileDetailSerializer
    lookup_field = 'id'
