import io
from django.db.models import Q
from django.http import HttpResponse, FileResponse
from rest_framework import permissions, status, views
from rest_framework.response import Response
from accounts.authentication import QueryParamOrHeaderJWTAuthentication
from accounts.permissions import IsHospitalUser
from patients.models import PatientProfile, HospitalPatient, PatientQRIdentity
from records.models import PatientHospitalRecord, MedicalDocument
from records.serializers import PatientHospitalRecordSerializer, MedicalDocumentSerializer
from records.storage_service import upload_document_file
from qr_documents.services import generate_patient_summary_pdf_bytes
from .serializers_patients import (
    HospitalPatientRegistrationSerializer,
    HospitalPatientSummarySerializer,
    HospitalAddPatientRecordSerializer,
    HospitalUploadPatientDocumentSerializer
)
from patients.serializers import PatientProfileDetailSerializer, PatientQRIdentitySerializer


class HospitalPatientRegistrationAndListView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]

    def get(self, request):
        hospital_profile = getattr(request.user, 'hospital_profile', None)
        if not hospital_profile:
            return Response({'success': False, 'message': 'Hospital profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        queryset = HospitalPatient.objects.filter(
            hospital=hospital_profile,
            status=HospitalPatient.STATUS_ACTIVE
        ).select_related('patient', 'patient__user', 'patient__qr_identity').order_by('-registered_at')

        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(patient__full_name__icontains=search) |
                Q(patient__user__full_name__icontains=search) |
                Q(patient__patient_reference_id__icontains=search) |
                Q(patient__phone__icontains=search) |
                Q(patient__user__phone__icontains=search) |
                Q(patient__email__icontains=search)
            )

        serializer = HospitalPatientSummarySerializer(queryset, many=True, context={'request': request})
        return Response({
            'success': True,
            'total_patients': queryset.count(),
            'patients': serializer.data
        })

    def post(self, request):
        hospital_profile = getattr(request.user, 'hospital_profile', None)
        if not hospital_profile:
            return Response({'success': False, 'message': 'Hospital profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = HospitalPatientRegistrationSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        patient_profile = result['patient_profile']
        qr_identity = result['qr_identity']
        is_new = result['is_new_patient']

        patient_data = PatientProfileDetailSerializer(patient_profile, context={'request': request}).data
        qr_data = PatientQRIdentitySerializer(qr_identity, context={'request': request}).data

        msg = "Patient successfully registered with permanent QR identity and linked to hospital." if is_new \
            else "Existing patient safely identified and authorized link established without duplicate QR creation."

        return Response({
            'success': True,
            'message': msg,
            'is_new_patient': is_new,
            'patient': patient_data,
            'qr_identity': qr_data
        }, status=status.HTTP_201_CREATED)


class HospitalPatientDetailView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]

    def get(self, request, patient_id):
        hospital_profile = getattr(request.user, 'hospital_profile', None)
        affiliation = HospitalPatient.objects.filter(
            hospital=hospital_profile,
            patient_id=patient_id,
            status=HospitalPatient.STATUS_ACTIVE
        ).select_related('patient', 'patient__user', 'patient__qr_identity').first()

        if not affiliation:
            return Response({
                'success': False,
                'message': 'Patient not found or hospital is not authorized to manage this patient.'
            }, status=status.HTTP_404_NOT_FOUND)

        patient = affiliation.patient
        qr_identity = patient.ensure_qr_identity()

        records_qs = PatientHospitalRecord.objects.filter(
            hospital_profile=hospital_profile,
            patient_profile=patient
        ).order_by('-created_at')

        docs_qs = MedicalDocument.objects.filter(
            hospital_profile=hospital_profile,
            patient_profile=patient
        ).order_by('-created_at')

        patient_data = PatientProfileDetailSerializer(patient, context={'request': request}).data
        qr_data = PatientQRIdentitySerializer(qr_identity, context={'request': request}).data
        records_data = PatientHospitalRecordSerializer(records_qs, many=True).data
        docs_data = MedicalDocumentSerializer(docs_qs, many=True).data

        return Response({
            'success': True,
            'patient': patient_data,
            'qr_identity': qr_data,
            'hospital_records': records_data,
            'medical_documents': docs_data,
            'registered_at': affiliation.registered_at,
            'initial_visit_date': affiliation.initial_visit_date,
        })


class HospitalPatientQRView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]

    def get(self, request, patient_id):
        hospital_profile = getattr(request.user, 'hospital_profile', None)
        affiliation = HospitalPatient.objects.filter(
            hospital=hospital_profile,
            patient_id=patient_id,
            status=HospitalPatient.STATUS_ACTIVE
        ).select_related('patient').first()

        if not affiliation:
            return Response({
                'success': False,
                'message': 'Patient not found or hospital unauthorized.'
            }, status=status.HTTP_404_NOT_FOUND)

        qr_identity = affiliation.patient.ensure_qr_identity()

        # If download requested
        is_download = request.query_params.get('download', '0') == '1'
        if is_download:
            png_bytes = qr_identity.generate_qr_png_bytes()
            response = HttpResponse(png_bytes, content_type='image/png')
            ref = affiliation.patient.patient_reference_id
            response['Content-Disposition'] = f'attachment; filename="QR_{ref}.png"'
            return response

        serializer = PatientQRIdentitySerializer(qr_identity, context={'request': request})
        return Response({
            'success': True,
            'patient_reference_id': affiliation.patient.patient_reference_id,
            'patient_name': affiliation.patient.effective_full_name,
            'qr_identity': serializer.data
        })


class HospitalPatientRecordsView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]

    def post(self, request, patient_id):
        hospital_profile = getattr(request.user, 'hospital_profile', None)
        affiliation = HospitalPatient.objects.filter(
            hospital=hospital_profile,
            patient_id=patient_id,
            status=HospitalPatient.STATUS_ACTIVE
        ).select_related('patient').first()

        if not affiliation:
            return Response({
                'success': False,
                'message': 'Patient not found or unauthorized.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = HospitalAddPatientRecordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        record = PatientHospitalRecord.objects.create(
            patient=affiliation.patient.user,
            patient_profile=affiliation.patient,
            hospital_profile=hospital_profile,
            hospital_name=hospital_profile.hospital_name,
            registration_number=hospital_profile.registration_number,
            hospital_type=hospital_profile.hospital_type,
            specialization=data.get('specialization') or hospital_profile.specializations,
            address=hospital_profile.address,
            city=hospital_profile.city,
            district=hospital_profile.district,
            state=hospital_profile.state,
            pincode=hospital_profile.pincode,
            contact_number=hospital_profile.contact_number,
            official_email=hospital_profile.official_email,
            doctor_in_charge=data.get('doctor_in_charge') or hospital_profile.doctor_in_charge,
            title=data.get('title'),
            record_type=data.get('record_type', 'General Visit'),
            visit_date=data.get('record_date'),
            additional_notes=data.get('additional_notes', '') or data.get('description', '')
        )

        return Response({
            'success': True,
            'message': 'Hospital visit record added successfully.',
            'record': PatientHospitalRecordSerializer(record).data
        }, status=status.HTTP_201_CREATED)


class HospitalPatientDocumentsView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]

    def post(self, request, patient_id):
        hospital_profile = getattr(request.user, 'hospital_profile', None)
        affiliation = HospitalPatient.objects.filter(
            hospital=hospital_profile,
            patient_id=patient_id,
            status=HospitalPatient.STATUS_ACTIVE
        ).select_related('patient').first()

        if not affiliation:
            return Response({
                'success': False,
                'message': 'Patient not found or unauthorized.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = HospitalUploadPatientDocumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        val = serializer.validated_data

        uploaded_file = val['file']
        stored = upload_document_file(affiliation.patient.id, uploaded_file)

        hospital_record = None
        if val.get('hospital_record_id'):
            hospital_record = PatientHospitalRecord.objects.filter(
                id=val['hospital_record_id'],
                hospital_profile=hospital_profile,
                patient_profile=affiliation.patient
            ).first()

        doc = MedicalDocument.objects.create(
            patient=affiliation.patient.user,
            patient_profile=affiliation.patient,
            hospital_profile=hospital_profile,
            hospital_record=hospital_record,
            title=val['title'],
            category=val.get('category', MedicalDocument.CATEGORY_OTHER),
            record_date=val.get('record_date'),
            description=val.get('description', ''),
            reference_number=val.get('reference_number', ''),
            storage_path=stored['storage_path'],
            original_filename=stored['original_filename'],
            mime_type=stored['mime_type'],
            file_size=stored['file_size']
        )

        return Response({
            'success': True,
            'message': 'Medical document securely uploaded and attached.',
            'document': MedicalDocumentSerializer(doc).data
        }, status=status.HTTP_201_CREATED)


class HospitalPatientPDFView(views.APIView):
    authentication_classes = [QueryParamOrHeaderJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsHospitalUser]

    def get(self, request, patient_id):
        hospital_profile = getattr(request.user, 'hospital_profile', None)
        affiliation = HospitalPatient.objects.filter(
            hospital=hospital_profile,
            patient_id=patient_id,
            status=HospitalPatient.STATUS_ACTIVE
        ).select_related('patient').first()

        if not affiliation:
            return Response({
                'success': False,
                'message': 'Patient not found or unauthorized.'
            }, status=status.HTTP_404_NOT_FOUND)

        patient = affiliation.patient
        qr = patient.ensure_qr_identity()

        records = PatientHospitalRecord.objects.filter(
            hospital_profile=hospital_profile,
            patient_profile=patient
        ).order_by('-created_at')

        docs = MedicalDocument.objects.filter(
            hospital_profile=hospital_profile,
            patient_profile=patient
        ).order_by('-created_at')

        pdf_buffer = generate_patient_summary_pdf_bytes(
            patient_profile=patient,
            qr_identity=qr,
            hospitals=[hospital_profile],
            records=records,
            documents=docs,
            requesting_hospital=hospital_profile
        )

        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f"Patient_Report_{patient.patient_reference_id}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
