from django.contrib import admin
from .models import PatientHospitalRecord, MedicalDocument


@admin.register(MedicalDocument)
class MedicalDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'patient', 'hospital_record', 'record_date', 'file_size', 'created_at')
    search_fields = ('title', 'patient__full_name', 'patient__email', 'hospital_record__hospital_name', 'reference_number')
    list_filter = ('category', 'created_at')
    readonly_fields = ('file_size', 'mime_type', 'storage_path', 'original_filename', 'created_at', 'updated_at')
