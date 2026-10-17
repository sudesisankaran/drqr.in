import re
import secrets
import uuid
from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework import serializers
from patients.models import PatientProfile, PatientQRIdentity, HospitalPatient
from records.models import PatientHospitalRecord, MedicalDocument
from patients.serializers import PatientQRIdentitySerializer, PatientProfileDetailSerializer
from records.storage_service import upload_document_file

User = get_user_model()


class HospitalPatientRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, default='')
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=20)
    emergency_contact = serializers.CharField(required=False, allow_blank=True, default='')
    initial_visit_date = serializers.DateField(required=False, allow_null=True)
    consent_acknowledged = serializers.BooleanField(default=True)

    def validate_phone(self, value):
        cleaned = re.sub(r'[^0-9+]', '', value)
        if len(cleaned) < 8:
            raise serializers.ValidationError("Please provide a valid phone number (at least 8 digits).")
        return cleaned

    def create(self, validated_data):
        hospital_user = self.context['request'].user
        hospital_profile = hospital_user.hospital_profile

        phone = validated_data.get('phone')
        email = validated_data.get('email', '').strip()
        full_name = validated_data.get('full_name')
        initial_visit_date = validated_data.get('initial_visit_date')
        consent_acknowledged = validated_data.get('consent_acknowledged', True)

        with transaction.atomic():
            # 1. Check for existing patient profile by phone or non-empty email
            existing_patient = None
            if phone:
                existing_patient = PatientProfile.objects.filter(phone=phone).first()
                if not existing_patient:
                    existing_user = User.objects.filter(phone=phone, role=User.ROLE_PATIENT).first()
                    if existing_user and hasattr(existing_user, 'patient_profile'):
                        existing_patient = existing_user.patient_profile

            if not existing_patient and email:
                existing_patient = PatientProfile.objects.filter(email__iexact=email).first()
                if not existing_patient:
                    existing_user = User.objects.filter(email__iexact=email, role=User.ROLE_PATIENT).first()
                    if existing_user and hasattr(existing_user, 'patient_profile'):
                        existing_patient = existing_user.patient_profile

            is_new_patient = False

            if existing_patient:
                patient_profile = existing_patient
                # Update any missing address or demographic info if patient agrees
                if not patient_profile.emergency_contact and validated_data.get('emergency_contact'):
                    patient_profile.emergency_contact = validated_data.get('emergency_contact')
                    patient_profile.save(update_fields=['emergency_contact'])
            else:
                is_new_patient = True
                # Create user credentials safely
                clean_phone_slug = re.sub(r'[^0-9]', '', phone) or uuid.uuid4().hex[:8]
                user_email = email if email else f"patient.{clean_phone_slug}@drqr.local"

                # Ensure unique email for user table
                if User.objects.filter(email__iexact=user_email).exists():
                    user_email = f"patient.{clean_phone_slug}.{secrets.token_hex(3)}@drqr.local"

                generated_password = secrets.token_urlsafe(16)
                user = User.objects.create_user(
                    email=user_email,
                    password=generated_password,
                    full_name=full_name,
                    phone=phone,
                    role=User.ROLE_PATIENT,
                    is_email_verified=True
                )

                patient_profile = PatientProfile.objects.create(
                    user=user,
                    full_name=full_name,
                    phone=phone,
                    email=email,
                    date_of_birth=validated_data.get('date_of_birth'),
                    gender=validated_data.get('gender', ''),
                    address=validated_data.get('address'),
                    city=validated_data.get('city'),
                    district=validated_data.get('district'),
                    state=validated_data.get('state'),
                    pincode=validated_data.get('pincode'),
                    emergency_contact=validated_data.get('emergency_contact', '')
                )

            # 2. MANDATORY: Ensure Exactly ONE Permanent QR Identity
            qr_identity = patient_profile.ensure_qr_identity()

            # 3. Create or reactivate HospitalPatient link
            hospital_patient_link, link_created = HospitalPatient.objects.get_or_create(
                hospital=hospital_profile,
                patient=patient_profile,
                defaults={
                    'registered_by': hospital_user,
                    'initial_visit_date': initial_visit_date,
                    'consent_acknowledged': consent_acknowledged,
                    'status': HospitalPatient.STATUS_ACTIVE
                }
            )

            if not link_created and hospital_patient_link.status != HospitalPatient.STATUS_ACTIVE:
                hospital_patient_link.status = HospitalPatient.STATUS_ACTIVE
                hospital_patient_link.consent_acknowledged = consent_acknowledged
                hospital_patient_link.save(update_fields=['status', 'consent_acknowledged'])

            return {
                'patient_profile': patient_profile,
                'qr_identity': qr_identity,
                'hospital_link': hospital_patient_link,
                'is_new_patient': is_new_patient
            }


class HospitalPatientSummarySerializer(serializers.ModelSerializer):
    patient_reference_id = serializers.CharField(source='patient.patient_reference_id', read_only=True)
    full_name = serializers.CharField(source='patient.effective_full_name', read_only=True)
    phone = serializers.CharField(source='patient.effective_phone', read_only=True)
    email = serializers.CharField(source='patient.effective_email', read_only=True)
    city = serializers.CharField(source='patient.city', read_only=True)
    state = serializers.CharField(source='patient.state', read_only=True)
    gender = serializers.CharField(source='patient.gender', read_only=True)
    date_of_birth = serializers.DateField(source='patient.date_of_birth', read_only=True)
    public_uuid = serializers.SerializerMethodField()
    qr_target_url = serializers.SerializerMethodField()
    total_records = serializers.SerializerMethodField()
    total_documents = serializers.SerializerMethodField()

    class Meta:
        model = HospitalPatient
        fields = (
            'id', 'patient_id', 'patient_reference_id', 'full_name', 'phone', 'email',
            'city', 'state', 'gender', 'date_of_birth', 'registered_at',
            'initial_visit_date', 'status', 'public_uuid', 'qr_target_url',
            'total_records', 'total_documents'
        )

    def get_public_uuid(self, obj):
        qr = obj.patient.ensure_qr_identity()
        return str(qr.public_uuid)

    def get_qr_target_url(self, obj):
        qr = obj.patient.ensure_qr_identity()
        request = self.context.get('request')
        base_url = request.build_absolute_uri('/') if request else None
        return qr.get_target_url(base_url)

    def get_total_records(self, obj):
        return PatientHospitalRecord.objects.filter(
            hospital_profile=obj.hospital,
            patient_profile=obj.patient
        ).count()

    def get_total_documents(self, obj):
        return MedicalDocument.objects.filter(
            hospital_profile=obj.hospital,
            patient_profile=obj.patient
        ).count()


class HospitalAddPatientRecordSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    record_type = serializers.CharField(max_length=100, default='General Visit')
    record_date = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    doctor_in_charge = serializers.CharField(required=False, allow_blank=True, default='')
    specialization = serializers.CharField(required=False, allow_blank=True, default='')
    additional_notes = serializers.CharField(required=False, allow_blank=True, default='')


class HospitalUploadPatientDocumentSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=MedicalDocument.CATEGORY_CHOICES, default=MedicalDocument.CATEGORY_OTHER)
    record_date = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    reference_number = serializers.CharField(required=False, allow_blank=True, default='')
    hospital_record_id = serializers.UUIDField(required=False, allow_null=True)
    file = serializers.FileField()
