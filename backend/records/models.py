import uuid
from django.conf import settings
from django.db import models
from hospitals.models import HospitalProfile


class PatientHospitalRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hospital_records',
        null=True,
        blank=True,
        db_index=True
    )
    patient_profile = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='hospital_records_list',
        null=True,
        blank=True,
        db_index=True
    )
    hospital_profile = models.ForeignKey(
        HospitalProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='patient_records',
        db_index=True
    )
    title = models.CharField(max_length=255, default='Hospital Visit Record', db_index=True)
    record_type = models.CharField(max_length=100, default='General Visit', blank=True)
    hospital_name = models.CharField(max_length=255, db_index=True)
    registration_number = models.CharField(max_length=100, blank=True, default='', db_index=True)
    hospital_type = models.CharField(max_length=100, db_index=True)
    specialization = models.TextField(blank=True, default='')
    specializations = models.TextField(blank=True, default='')
    address = models.TextField()
    city = models.CharField(max_length=100, db_index=True)
    district = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    pincode = models.CharField(max_length=20)
    contact_number = models.CharField(max_length=30)
    official_email = models.EmailField(max_length=254)
    doctor_in_charge = models.CharField(max_length=255)
    facilities = models.TextField(blank=True, default='')
    license_number = models.CharField(max_length=100, blank=True, default='')
    visit_date = models.DateField(null=True, blank=True)
    additional_notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patient_hospital_records'
        verbose_name = 'Patient Hospital Record'
        verbose_name_plural = 'Patient Hospital Records'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'created_at']),
            models.Index(fields=['hospital_name']),
            models.Index(fields=['city', 'district', 'state']),
        ]

    def __str__(self):
        pat_name = self.patient_profile.effective_full_name if self.patient_profile else (self.patient.full_name if self.patient else 'Unknown Patient')
        return f"{self.title} ({self.hospital_name}) for {pat_name}"

    def save(self, *args, **kwargs):
        # Synchronize specialization and specializations if one is set
        if self.specialization and not self.specializations:
            self.specializations = self.specialization
        elif self.specializations and not self.specialization:
            self.specialization = self.specializations
        if self.patient and not self.patient_profile and hasattr(self.patient, 'patient_profile'):
            self.patient_profile = self.patient.patient_profile
        elif self.patient_profile and not self.patient and self.patient_profile.user:
            self.patient = self.patient_profile.user
        super().save(*args, **kwargs)


class MedicalDocument(models.Model):
    CATEGORY_LAB_REPORT = 'Lab Report'
    CATEGORY_SCAN = 'Scan/X-ray'
    CATEGORY_DISCHARGE = 'Discharge Summary'
    CATEGORY_PRESCRIPTION = 'Prescription Document'
    CATEGORY_CERTIFICATE = 'Medical Certificate'
    CATEGORY_OTHER = 'Other'

    CATEGORY_CHOICES = (
        (CATEGORY_LAB_REPORT, 'Lab Report'),
        (CATEGORY_SCAN, 'Scan/X-ray'),
        (CATEGORY_DISCHARGE, 'Discharge Summary'),
        (CATEGORY_PRESCRIPTION, 'Prescription Document'),
        (CATEGORY_CERTIFICATE, 'Medical Certificate'),
        (CATEGORY_OTHER, 'Other'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='medical_documents',
        null=True,
        blank=True,
        db_index=True
    )
    patient_profile = models.ForeignKey(
        'patients.PatientProfile',
        on_delete=models.CASCADE,
        related_name='medical_documents_list',
        null=True,
        blank=True,
        db_index=True
    )
    hospital_profile = models.ForeignKey(
        HospitalProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hospital_documents',
        db_index=True
    )
    hospital_record = models.ForeignKey(
        PatientHospitalRecord,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True,
        db_index=True
    )
    title = models.CharField(max_length=255, db_index=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default=CATEGORY_OTHER, db_index=True)
    record_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, default='')
    reference_number = models.CharField(max_length=100, blank=True, default='')
    storage_path = models.CharField(max_length=1000)
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    file_size = models.BigIntegerField(help_text="File size in bytes")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'medical_documents'
        verbose_name = 'Medical Document'
        verbose_name_plural = 'Medical Documents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', 'created_at']),
            models.Index(fields=['hospital_record', 'category']),
            models.Index(fields=['title']),
        ]

    def __str__(self):
        pat_name = self.patient_profile.effective_full_name if self.patient_profile else (self.patient.full_name if self.patient else 'Unknown Patient')
        return f"{self.title} ({self.category}) - {pat_name}"

    def save(self, *args, **kwargs):
        if self.patient and not self.patient_profile and hasattr(self.patient, 'patient_profile'):
            self.patient_profile = self.patient.patient_profile
        elif self.patient_profile and not self.patient and self.patient_profile.user:
            self.patient = self.patient_profile.user
        super().save(*args, **kwargs)
