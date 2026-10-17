from rest_framework import serializers
from .models import PatientProfile, PatientQRIdentity, HospitalPatient, get_network_ip
from hospitals.models import HospitalProfile


class PatientQRIdentitySerializer(serializers.ModelSerializer):
    target_url = serializers.SerializerMethodField()
    qr_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PatientQRIdentity
        fields = ('id', 'public_uuid', 'target_url', 'qr_image_url', 'created_at')
        read_only_fields = fields

    def get_target_url(self, obj):
        request = self.context.get('request')
        if request:
            raw_host = request.get_host().split(':')[0]
            if raw_host in ['127.0.0.1', 'localhost']:
                raw_host = get_network_ip()
            scheme = request.scheme
            frontend_url = f"{scheme}://{raw_host}:5173"
            return obj.get_target_url(frontend_url)
        return obj.get_target_url()

    def get_qr_image_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(f"/api/qr/{obj.public_uuid}/image/")
        return f"/api/qr/{obj.public_uuid}/image/"


class HospitalAffiliationSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source='hospital.hospital_name', read_only=True)
    hospital_type = serializers.CharField(source='hospital.hospital_type', read_only=True)
    city = serializers.CharField(source='hospital.city', read_only=True)
    state = serializers.CharField(source='hospital.state', read_only=True)
    contact_number = serializers.CharField(source='hospital.contact_number', read_only=True)
    doctor_in_charge = serializers.CharField(source='hospital.doctor_in_charge', read_only=True)

    class Meta:
        model = HospitalPatient
        fields = (
            'id', 'hospital_id', 'hospital_name', 'hospital_type',
            'city', 'state', 'contact_number', 'doctor_in_charge',
            'registered_at', 'initial_visit_date', 'status', 'consent_acknowledged'
        )


class PatientProfileDetailSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    qr_identity = serializers.SerializerMethodField()
    affiliated_hospitals = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = (
            'id', 'patient_reference_id', 'email', 'full_name', 'phone',
            'date_of_birth', 'gender', 'address', 'city', 'district', 'state', 'pincode',
            'emergency_contact', 'qr_identity', 'affiliated_hospitals',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'patient_reference_id', 'created_at', 'updated_at')

    def get_email(self, obj):
        return obj.effective_email

    def get_full_name(self, obj):
        return obj.effective_full_name

    def get_phone(self, obj):
        return obj.effective_phone

    def get_qr_identity(self, obj):
        qr = obj.ensure_qr_identity()
        return PatientQRIdentitySerializer(qr, context=self.context).data

    def get_affiliated_hospitals(self, obj):
        affiliations = obj.hospital_affiliations.filter(status='active').select_related('hospital')
        return HospitalAffiliationSerializer(affiliations, many=True).data


class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = PatientProfile
        fields = (
            'full_name', 'phone', 'email', 'date_of_birth', 'gender',
            'address', 'city', 'district', 'state', 'pincode', 'emergency_contact'
        )

    def update(self, instance, validated_data):
        full_name = validated_data.pop('full_name', None)
        phone = validated_data.pop('phone', None)
        email = validated_data.pop('email', None)

        if full_name is not None:
            instance.full_name = full_name
            if instance.user:
                instance.user.full_name = full_name
                instance.user.save(update_fields=['full_name'])

        if phone is not None:
            instance.phone = phone
            if instance.user:
                instance.user.phone = phone
                instance.user.save(update_fields=['phone'])

        if email is not None:
            instance.email = email

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
