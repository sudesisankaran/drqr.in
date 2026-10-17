import io
from django.http import HttpResponse
from rest_framework import permissions, status, views
from rest_framework.response import Response
from accounts.authentication import QueryParamOrHeaderJWTAuthentication
from accounts.permissions import IsPatientUser
from patients.models import PatientProfile, HospitalPatient, PatientQRIdentity
from records.models import PatientHospitalRecord, MedicalDocument
from records.serializers import PatientHospitalRecordSerializer, MedicalDocumentSerializer
from qr_documents.services import generate_patient_summary_pdf_bytes
from .serializers import (
    PatientProfileDetailSerializer,
    PatientQRIdentitySerializer,
    HospitalAffiliationSerializer
)


def get_or_link_patient_profile(user):
    """Safely retrieves, links, or initializes a PatientProfile and permanent QR identity."""
    try:
        if hasattr(user, 'patient_profile') and user.patient_profile:
            return user.patient_profile
    except PatientProfile.DoesNotExist:
        pass

    # Try matching existing profile by email or phone
    profile = None
    if user.email:
        profile = PatientProfile.objects.filter(email__iexact=user.email).first()
    if not profile and user.phone:
        profile = PatientProfile.objects.filter(phone=user.phone).first()

    if profile:
        if profile.user != user:
            profile.user = user
            profile.save(update_fields=['user'])
        profile.ensure_qr_identity()
        return profile

    # Create new profile for this authenticated patient
    profile = PatientProfile.objects.create(
        user=user,
        full_name=user.full_name or "Patient",
        email=user.email,
        phone=user.phone or "",
        address="Tamil Nadu",
        city="Chennai",
        district="Chennai",
        state="Tamil Nadu",
        pincode="600001"
    )
    profile.ensure_qr_identity()
    return profile


class PatientMeProfileView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get(self, request):
        profile = get_or_link_patient_profile(request.user)
        serializer = PatientProfileDetailSerializer(profile, context={'request': request})
        return Response({'success': True, 'data': serializer.data})


class PatientMeHospitalsView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get(self, request):
        profile = get_or_link_patient_profile(request.user)
        affiliations = HospitalPatient.objects.filter(
            patient=profile,
            status=HospitalPatient.STATUS_ACTIVE
        ).select_related('hospital')

        serializer = HospitalAffiliationSerializer(affiliations, many=True)
        return Response({'success': True, 'hospitals': serializer.data})


class PatientMeRecordsView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get(self, request):
        profile = get_or_link_patient_profile(request.user)
        records = PatientHospitalRecord.objects.filter(
            patient_profile=profile
        ).order_by('-created_at')

        serializer = PatientHospitalRecordSerializer(records, many=True)
        return Response({'success': True, 'records': serializer.data})


class PatientMeDocumentsView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get(self, request):
        profile = get_or_link_patient_profile(request.user)
        docs = MedicalDocument.objects.filter(
            patient_profile=profile
        ).order_by('-created_at')

        serializer = MedicalDocumentSerializer(docs, many=True)
        return Response({'success': True, 'documents': serializer.data})


class PatientMeQRView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get(self, request):
        profile = get_or_link_patient_profile(request.user)
        qr_identity = profile.ensure_qr_identity()

        # If download image requested
        is_download = request.query_params.get('download', '0') == '1'
        if is_download:
            png_bytes = qr_identity.generate_qr_png_bytes()
            response = HttpResponse(png_bytes, content_type='image/png')
            response['Content-Disposition'] = f'attachment; filename="QR_{profile.patient_reference_id}.png"'
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            return response

        serializer = PatientQRIdentitySerializer(qr_identity, context={'request': request})
        return Response({
            'success': True,
            'patient_reference_id': profile.patient_reference_id,
            'qr_identity': serializer.data
        })


class PatientMePDFView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPatientUser]

    def get(self, request):
        profile = get_or_link_patient_profile(request.user)
        qr_identity = profile.ensure_qr_identity()

        records = PatientHospitalRecord.objects.filter(patient_profile=profile).order_by('-created_at')
        docs = MedicalDocument.objects.filter(patient_profile=profile).order_by('-created_at')

        pdf_buffer = generate_patient_summary_pdf_bytes(
            patient_profile=profile,
            qr_identity=qr_identity,
            records=records,
            documents=docs
        )

        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f"Patient_Health_Summary_{profile.patient_reference_id}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
