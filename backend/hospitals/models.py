import uuid
from django.conf import settings
from django.db import models


class HospitalProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hospital_profile'
    )
    hospital_name = models.CharField(max_length=255, db_index=True)
    registration_number = models.CharField(max_length=100, unique=True, db_index=True)
    hospital_type = models.CharField(max_length=100, db_index=True)
    specializations = models.TextField(help_text="Comma-separated or formatted list of specializations")
    address = models.TextField()
    city = models.CharField(max_length=100, db_index=True)
    district = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    pincode = models.CharField(max_length=20)
    contact_number = models.CharField(max_length=30)
    official_email = models.EmailField(max_length=254)
    doctor_in_charge = models.CharField(max_length=255)
    facilities = models.TextField(help_text="Available facilities e.g. ICU, Emergency, OPD")
    license_number = models.CharField(max_length=100)
    logo_path = models.CharField(max_length=500, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_profiles'
        verbose_name = 'Hospital Profile'
        verbose_name_plural = 'Hospital Profiles'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['hospital_name']),
            models.Index(fields=['city', 'district', 'state']),
            models.Index(fields=['hospital_type']),
        ]

    def __str__(self):
        return f"{self.hospital_name} ({self.registration_number})"
