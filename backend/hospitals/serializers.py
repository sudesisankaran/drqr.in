from rest_framework import serializers
from .models import HospitalProfile


class HospitalProfileDetailSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = HospitalProfile
        fields = (
            'id', 'email', 'hospital_name', 'registration_number', 'hospital_type',
            'specializations', 'address', 'city', 'district', 'state', 'pincode',
            'contact_number', 'official_email', 'doctor_in_charge', 'facilities',
            'license_number', 'logo_path', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'registration_number', 'created_at', 'updated_at')


class HospitalProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalProfile
        fields = (
            'hospital_name', 'hospital_type', 'specializations', 'address',
            'city', 'district', 'state', 'pincode', 'contact_number',
            'official_email', 'doctor_in_charge', 'facilities',
            'license_number', 'logo_path'
        )
