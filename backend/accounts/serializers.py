from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User
from hospitals.models import HospitalProfile
from patients.models import PatientProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'role', 'phone', 'is_email_verified', 'date_joined')
        read_only_fields = ('id', 'role', 'date_joined')


class HospitalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalProfile
        fields = (
            'id', 'hospital_name', 'registration_number', 'hospital_type',
            'specializations', 'address', 'city', 'district', 'state', 'pincode',
            'contact_number', 'official_email', 'doctor_in_charge', 'facilities',
            'license_number', 'logo_path', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = (
            'id', 'patient_reference_id', 'date_of_birth',
            'address', 'city', 'district', 'state', 'pincode',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'patient_reference_id', 'created_at', 'updated_at')


class HospitalRegistrationSerializer(serializers.Serializer):
    # User fields
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    # Hospital fields
    hospital_name = serializers.CharField(max_length=255)
    registration_number = serializers.CharField(max_length=100)
    hospital_type = serializers.CharField(max_length=100)
    specializations = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=20)
    contact_number = serializers.CharField(max_length=30)
    official_email = serializers.EmailField()
    doctor_in_charge = serializers.CharField(max_length=255)
    facilities = serializers.CharField()
    license_number = serializers.CharField(max_length=100)
    logo_path = serializers.CharField(max_length=500, required=False, allow_blank=True, default='')

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_registration_number(self, value):
        if HospitalProfile.objects.filter(registration_number__iexact=value).exists():
            raise serializers.ValidationError("A hospital with this registration number is already registered.")
        return value.strip().upper()

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        hospital_name = validated_data.get('hospital_name')
        contact_number = validated_data.get('contact_number')

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=password,
                full_name=hospital_name,
                role=User.ROLE_HOSPITAL,
                phone=contact_number,
                is_email_verified=True
            )
            hospital_profile = HospitalProfile.objects.create(
                user=user,
                **validated_data
            )
        return user


class PatientRegistrationSerializer(serializers.Serializer):
    # User fields
    full_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    # Profile fields
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    pincode = serializers.CharField(max_length=20)

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = data.copy()
            if data.get('date_of_birth') == '':
                data['date_of_birth'] = None
        return super().to_internal_value(data)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        full_name = validated_data.pop('full_name')
        phone = validated_data.pop('phone')

        with transaction.atomic():
            user = User.objects.create_user(
                email=email,
                password=password,
                full_name=full_name,
                role=User.ROLE_PATIENT,
                phone=phone,
                is_email_verified=True
            )
            patient_profile = PatientProfile.objects.create(
                user=user,
                **validated_data
            )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email address or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is inactive. Please contact administrator.")

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "New passwords do not match."})
        validate_password(attrs['new_password'])
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})
        validate_password(attrs['new_password'])
        return attrs
