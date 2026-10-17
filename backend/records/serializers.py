from rest_framework import serializers
from hospitals.models import HospitalProfile
from .models import PatientHospitalRecord, MedicalDocument
from .storage_service import upload_document_file, delete_document_file


class MedicalDocumentSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital_record.hospital_name', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = MedicalDocument
        fields = (
            'id', 'patient', 'patient_name', 'hospital_record', 'hospital_name',
            'title', 'category', 'record_date', 'description', 'reference_number',
            'original_filename', 'mime_type', 'file_size', 'storage_path',
            'download_url', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'patient', 'storage_path', 'original_filename',
            'mime_type', 'file_size', 'created_at', 'updated_at'
        )

    def get_download_url(self, obj):
        return f"/api/medical-records/{obj.id}/download/"


class MedicalDocumentUploadSerializer(serializers.Serializer):
    hospital_record = serializers.PrimaryKeyRelatedField(
        queryset=PatientHospitalRecord.objects.all(),
        required=True
    )
    title = serializers.CharField(max_length=255)
    category = serializers.ChoiceField(choices=MedicalDocument.CATEGORY_CHOICES, default=MedicalDocument.CATEGORY_OTHER)
    record_date = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, default='')
    reference_number = serializers.CharField(max_length=100, required=False, allow_blank=True, default='')
    file = serializers.FileField(required=True)

    def validate_hospital_record(self, value):
        user = self.context['request'].user
        if value.patient != user:
            raise serializers.ValidationError("You can only upload medical documents to your own hospital records.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        uploaded_file = validated_data.pop('file')

        # Store file via storage service
        file_info = upload_document_file(user.id, uploaded_file)

        document = MedicalDocument.objects.create(
            patient=user,
            hospital_record=validated_data['hospital_record'],
            title=validated_data['title'],
            category=validated_data.get('category', MedicalDocument.CATEGORY_OTHER),
            record_date=validated_data.get('record_date', None),
            description=validated_data.get('description', ''),
            reference_number=validated_data.get('reference_number', ''),
            storage_path=file_info['storage_path'],
            original_filename=file_info['original_filename'],
            mime_type=file_info['mime_type'],
            file_size=file_info['file_size']
        )
        return document


class PatientHospitalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    patient_email = serializers.EmailField(source='patient.email', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone', read_only=True)
    patient_reference_id = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()

    class Meta:
        model = PatientHospitalRecord
        fields = (
            'id', 'patient', 'patient_name', 'patient_email', 'patient_phone',
            'patient_reference_id', 'hospital_profile',
            'hospital_name', 'registration_number', 'hospital_type',
            'specialization', 'specializations',
            'address', 'city', 'district', 'state', 'pincode',
            'contact_number', 'official_email', 'doctor_in_charge',
            'facilities', 'license_number', 'visit_date', 'additional_notes',
            'documents_count', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'patient', 'created_at', 'updated_at')

    def get_patient_reference_id(self, obj):
        if hasattr(obj.patient, 'patient_profile'):
            return obj.patient.patient_profile.patient_reference_id
        return None

    def get_documents_count(self, obj):
        return obj.documents.count()

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['patient'] = user

        # Attempt to auto-link to matching HospitalProfile if exists
        reg_num = validated_data.get('registration_number', '').strip()
        if reg_num and not validated_data.get('hospital_profile'):
            matched_hospital = HospitalProfile.objects.filter(registration_number__iexact=reg_num).first()
            if matched_hospital:
                validated_data['hospital_profile'] = matched_hospital

        return super().create(validated_data)
