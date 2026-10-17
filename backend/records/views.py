import os
import io
import mimetypes
from django.db.models import Q
from django.http import FileResponse, Http404
from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.authentication import QueryParamOrHeaderJWTAuthentication
from accounts.permissions import IsRecordOwnerOrAuthorizedHospital, IsPatientUser
from .models import PatientHospitalRecord, MedicalDocument
from .serializers import (
    PatientHospitalRecordSerializer,
    MedicalDocumentSerializer,
    MedicalDocumentUploadSerializer
)
from .storage_service import delete_document_file, get_document_file_path, get_document_file_bytes


class PatientHospitalRecordViewSet(viewsets.ModelViewSet):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    serializer_class = PatientHospitalRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsRecordOwnerOrAuthorizedHospital]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return PatientHospitalRecord.objects.none()

        if user.role == 'patient':
            queryset = PatientHospitalRecord.objects.filter(patient=user)
        elif user.role == 'hospital':
            hospital_profile = getattr(user, 'hospital_profile', None)
            if not hospital_profile:
                return PatientHospitalRecord.objects.none()
            queryset = PatientHospitalRecord.objects.filter(
                Q(hospital_profile=hospital_profile) |
                Q(registration_number__iexact=hospital_profile.registration_number)
            )
        else:
            queryset = PatientHospitalRecord.objects.none()

        # Apply search and filters
        search = self.request.query_params.get('search', '').strip()
        hospital_type = self.request.query_params.get('hospital_type', '').strip()
        city = self.request.query_params.get('city', '').strip()
        district = self.request.query_params.get('district', '').strip()

        if search:
            queryset = queryset.filter(
                Q(hospital_name__icontains=search) |
                Q(registration_number__icontains=search) |
                Q(doctor_in_charge__icontains=search) |
                Q(specialization__icontains=search) |
                Q(specializations__icontains=search)
            )
        if hospital_type:
            queryset = queryset.filter(hospital_type__iexact=hospital_type)
        if city:
            queryset = queryset.filter(city__icontains=city)
        if district:
            queryset = queryset.filter(district__icontains=district)

        return queryset.select_related('patient', 'patient__patient_profile', 'hospital_profile').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        user = request.user
        queryset = self.get_queryset()
        total_records = queryset.count()
        recent_records = queryset[:5]
        serializer = self.get_serializer(recent_records, many=True)

        return Response({
            'success': True,
            'total_records': total_records,
            'recent_records': serializer.data
        })


class MedicalDocumentViewSet(viewsets.ModelViewSet):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'create':
            return MedicalDocumentUploadSerializer
        return MedicalDocumentSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return MedicalDocument.objects.none()

        queryset = MedicalDocument.objects.filter(patient=user)

        # Filters
        hospital_id = self.request.query_params.get('hospital_id', '').strip()
        category = self.request.query_params.get('category', '').strip()
        search = self.request.query_params.get('search', '').strip()
        start_date = self.request.query_params.get('start_date', '').strip()
        end_date = self.request.query_params.get('end_date', '').strip()

        if hospital_id:
            queryset = queryset.filter(hospital_record_id=hospital_id)
        if category:
            queryset = queryset.filter(category__iexact=category)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(reference_number__icontains=search) |
                Q(hospital_record__hospital_name__icontains=search)
            )
        if start_date:
            queryset = queryset.filter(record_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(record_date__lte=end_date)

        return queryset.select_related('hospital_record', 'patient').order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
            document = serializer.save()
            output_serializer = MedicalDocumentSerializer(document)
            return Response({
                'success': True,
                'message': 'Medical document uploaded and stored securely.',
                'data': output_serializer.data
            }, status=status.HTTP_201_CREATED)
        except ValueError as val_err:
            return Response({
                'success': False,
                'message': str(val_err)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        allowed_fields = {'title', 'category', 'description', 'record_date', 'reference_number'}
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}

        for attr, value in update_data.items():
            setattr(instance, attr, value)
        instance.save()

        serializer = MedicalDocumentSerializer(instance)
        return Response({
            'success': True,
            'message': 'Document details updated successfully.',
            'data': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Delete underlying storage object
        delete_document_file(instance.storage_path)
        instance.delete()
        return Response({
            'success': True,
            'message': 'Medical document permanently deleted.'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, id=None):
        instance = self.get_object()

        local_path = get_document_file_path(instance.storage_path)
        file_obj = None

        if local_path.exists():
            file_obj = open(local_path, 'rb')
        else:
            # Fallback to Supabase Storage if local cache is absent
            file_bytes = get_document_file_bytes(instance.storage_path)
            if file_bytes:
                file_obj = io.BytesIO(file_bytes)
            else:
                return Response({
                    'success': False,
                    'message': 'Requested file not found in storage.'
                }, status=status.HTTP_404_NOT_FOUND)

        is_attachment = request.query_params.get('download', '0') == '1'
        disposition = 'attachment' if is_attachment else 'inline'

        mime_type = instance.mime_type
        if not mime_type or mime_type == 'application/octet-stream':
            guessed, _ = mimetypes.guess_type(instance.original_filename)
            mime_type = guessed or 'application/octet-stream'

        response = FileResponse(
            file_obj,
            content_type=mime_type
        )
        response['Content-Disposition'] = f'{disposition}; filename="{instance.original_filename}"'
        return response


class PatientDashboardStatsView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get(self, request):
        user = request.user
        hospitals_qs = PatientHospitalRecord.objects.filter(patient=user).order_by('-created_at')
        documents_qs = MedicalDocument.objects.filter(patient=user).select_related('hospital_record').order_by('-created_at')

        total_hospitals = hospitals_qs.count()
        total_documents = documents_qs.count()

        recent_hospitals = PatientHospitalRecordSerializer(hospitals_qs[:5], many=True).data
        recent_documents = MedicalDocumentSerializer(documents_qs[:5], many=True).data

        return Response({
            'success': True,
            'total_hospitals': total_hospitals,
            'total_documents': total_documents,
            'recent_hospitals': recent_hospitals,
            'recent_documents': recent_documents,
        })
