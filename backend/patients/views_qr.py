import io
from django.http import HttpResponse
from rest_framework import permissions, status, views
from rest_framework.response import Response
from accounts.authentication import QueryParamOrHeaderJWTAuthentication
from patients.models import PatientProfile, PatientQRIdentity, HospitalPatient
from records.models import PatientHospitalRecord, MedicalDocument
from records.serializers import PatientHospitalRecordSerializer, MedicalDocumentSerializer
from qr_documents.services import generate_patient_summary_pdf_bytes
from .serializers import PatientProfileDetailSerializer, PatientQRIdentitySerializer


def mask_string(val: str, show_first=1, show_last=0):
    if not val:
        return ""
    val = val.strip()
    if len(val) <= 2:
        return "*" * len(val)
    first_part = val[:show_first]
    last_part = val[-show_last:] if show_last > 0 else ""
    masked_count = max(len(val) - show_first - show_last, 3)
    return f"{first_part}{'*' * masked_count}{last_part}"


class QRRecordVerificationView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request, public_uuid):
        qr_identity = PatientQRIdentity.objects.filter(public_uuid=public_uuid).select_related('patient', 'patient__user').first()
        if not qr_identity:
            return Response({
                'success': False,
                'is_valid': False,
                'message': 'Invalid or unverified QR Code identity. This QR code does not match any registered patient.'
            }, status=status.HTTP_404_NOT_FOUND)

        patient = qr_identity.patient
        user = request.user

        # All authorized patient records available on scan for in-website view
        records_qs = PatientHospitalRecord.objects.filter(patient_profile=patient).order_by('-created_at')
        docs_qs = MedicalDocument.objects.filter(patient_profile=patient).order_by('-created_at')

        patient_data = PatientProfileDetailSerializer(patient, context={'request': request}).data
        qr_data = PatientQRIdentitySerializer(qr_identity, context={'request': request}).data
        records_data = PatientHospitalRecordSerializer(records_qs, many=True).data
        docs_data = MedicalDocumentSerializer(docs_qs, many=True).data

        return Response({
            'success': True,
            'is_valid': True,
            'is_authorized': True,
            'patient': patient_data,
            'qr_identity': qr_data,
            'records': records_data,
            'documents': docs_data,
            'pdf_url': f"/api/qr/{public_uuid}/pdf/",
            'message': 'Identity verified. Clinical records unlocked for secure in-website viewing.'
        })


class QRRecordImageView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request, public_uuid):
        qr_identity = PatientQRIdentity.objects.filter(public_uuid=public_uuid).select_related('patient').first()
        if not qr_identity:
            return Response({'success': False, 'message': 'QR Identity not found.'}, status=status.HTTP_404_NOT_FOUND)

        png_bytes = qr_identity.generate_qr_png_bytes()
        response = HttpResponse(png_bytes, content_type='image/png')
        filename = f"QR_{qr_identity.patient.patient_reference_id}.png"
        is_download = request.query_params.get('download', '0') == '1'
        disposition = 'attachment' if is_download else 'inline'
        response['Content-Disposition'] = f'{disposition}; filename="{filename}"'
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class QRRecordPDFView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request, public_uuid):
        qr_identity = PatientQRIdentity.objects.filter(public_uuid=public_uuid).select_related('patient', 'patient__user').first()
        if not qr_identity:
            return Response({'success': False, 'message': 'QR Identity not found.'}, status=status.HTTP_404_NOT_FOUND)

        patient = qr_identity.patient
        records = PatientHospitalRecord.objects.filter(patient_profile=patient).order_by('-created_at')
        docs = MedicalDocument.objects.filter(patient_profile=patient).order_by('-created_at')

        pdf_buffer = generate_patient_summary_pdf_bytes(
            patient_profile=patient,
            qr_identity=qr_identity,
            records=records,
            documents=docs
        )

        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f"Patient_Clinical_Report_{patient.patient_reference_id}.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        return response
