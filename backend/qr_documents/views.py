from django.conf import settings
from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import views, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from records.models import PatientHospitalRecord
from accounts.permissions import IsRecordOwnerOrAuthorizedHospital
from .services import generate_record_pdf_bytes


def authenticate_user_from_request_or_token(request):
    """Support standard Authorization header or token query parameter for direct PDF downloads."""
    if request.user and request.user.is_authenticated:
        return request.user

    token = request.query_params.get('token')
    if token:
        try:
            jwt_auth = JWTAuthentication()
            validated_token = jwt_auth.get_validated_token(token)
            user = jwt_auth.get_user(validated_token)
            return user
        except Exception:
            return None
    return None


class RecordQRView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, record_id):
        record = get_object_or_404(PatientHospitalRecord, id=record_id)

        # Check ownership or authorized hospital
        perm = IsRecordOwnerOrAuthorizedHospital()
        if not perm.has_object_permission(request, self, record):
            return Response(
                {'success': False, 'message': 'You do not have permission to access this record.'},
                status=status.HTTP_403_FORBIDDEN
            )

        frontend_base = getattr(settings, 'FRONTEND_APP_URL', 'http://localhost:5173').rstrip('/')
        qr_target_url = f"{frontend_base}/verify/{record.id}"

        return Response({
            'success': True,
            'record_id': str(record.id),
            'hospital_name': record.hospital_name,
            'registration_number': record.registration_number,
            'hospital_type': record.hospital_type,
            'doctor_in_charge': record.doctor_in_charge,
            'qr_target_url': qr_target_url,
            'pdf_preview_url': f"/api/records/{record.id}/pdf/?download=0",
            'pdf_download_url': f"/api/records/{record.id}/pdf/?download=1",
            'created_at': record.created_at,
        })


class RecordPDFView(views.APIView):
    permission_classes = [permissions.AllowAny]  # We authenticate manually to support ?token= in URL

    def get(self, request, record_id):
        user = authenticate_user_from_request_or_token(request)
        if not user:
            return Response(
                {'success': False, 'message': 'Authentication credentials were not provided or are invalid.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        record = get_object_or_404(PatientHospitalRecord, id=record_id)

        request.user = user
        perm = IsRecordOwnerOrAuthorizedHospital()
        if not perm.has_object_permission(request, self, record):
            return Response(
                {'success': False, 'message': 'You do not have permission to view or download this record.'},
                status=status.HTTP_403_FORBIDDEN
            )

        frontend_base = getattr(settings, 'FRONTEND_APP_URL', 'http://localhost:5173').rstrip('/')
        target_url = f"{frontend_base}/verify/{record.id}"

        pdf_buffer = generate_record_pdf_bytes(record, target_url)

        is_download = request.query_params.get('download', '0') == '1'
        disposition_type = 'attachment' if is_download else 'inline'
        clean_name = record.hospital_name.replace(' ', '_')
        filename = f"{clean_name}_Record_{str(record.id)[:8]}.pdf"

        response = FileResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'{disposition_type}; filename="{filename}"'
        return response


class RecordPublicVerifyView(views.APIView):
    """
    Public QR verification endpoint that verifies authentic hospital record
    without leaking sensitive patient personal info to anonymous scanners.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, record_id):
        try:
            record = PatientHospitalRecord.objects.select_related('patient', 'hospital_profile').get(id=record_id)
        except (PatientHospitalRecord.DoesNotExist, ValueError):
            return Response({
                'success': False,
                'verified': False,
                'message': 'Record not found or invalid QR verification code.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if caller is authenticated owner or hospital to give full details if authorized
        user = authenticate_user_from_request_or_token(request)
        is_authorized = False
        if user:
            request.user = user
            perm = IsRecordOwnerOrAuthorizedHospital()
            if perm.has_object_permission(request, self, record):
                is_authorized = True

        data = {
            'success': True,
            'verified': True,
            'record_id': str(record.id),
            'hospital_name': record.hospital_name,
            'registration_number': record.registration_number,
            'hospital_type': record.hospital_type,
            'doctor_in_charge': record.doctor_in_charge,
            'license_number': record.license_number,
            'city': record.city,
            'district': record.district,
            'state': record.state,
            'official_email': record.official_email,
            'contact_number': record.contact_number,
            'specializations': record.specializations,
            'facilities': record.facilities,
            'verification_status': 'VERIFIED_ACTIVE',
            'created_at': record.created_at,
            'updated_at': record.updated_at,
            'is_authorized_viewer': is_authorized
        }

        if is_authorized:
            data['patient_name'] = record.patient.full_name
            data['patient_email'] = record.patient.email

        return Response(data, status=status.HTTP_200_OK)
