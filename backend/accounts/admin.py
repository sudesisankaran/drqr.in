from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from hospitals.models import HospitalProfile
from patients.models import PatientProfile
from records.models import PatientHospitalRecord


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'full_name', 'role', 'phone', 'is_email_verified', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    ordering = ('-date_joined',)
    search_fields = ('email', 'full_name', 'phone')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'phone', 'role', 'is_email_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'phone', 'password1', 'password2'),
        }),
    )


@admin.register(HospitalProfile)
class HospitalProfileAdmin(admin.ModelAdmin):
    list_display = ('hospital_name', 'registration_number', 'hospital_type', 'city', 'state', 'doctor_in_charge', 'created_at')
    search_fields = ('hospital_name', 'registration_number', 'city', 'doctor_in_charge')
    list_filter = ('hospital_type', 'state')


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'patient_reference_id', 'city', 'state', 'created_at')
    search_fields = ('patient_reference_id', 'user__full_name', 'user__email', 'city')
    list_filter = ('state',)


@admin.register(PatientHospitalRecord)
class PatientHospitalRecordAdmin(admin.ModelAdmin):
    list_display = ('hospital_name', 'registration_number', 'patient', 'hospital_type', 'city', 'doctor_in_charge', 'created_at')
    search_fields = ('hospital_name', 'registration_number', 'patient__full_name', 'patient__email', 'city')
    list_filter = ('hospital_type', 'state')
