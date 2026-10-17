import uuid
import io
import secrets
import qrcode
from django.conf import settings
from django.db import models


import socket


def get_network_ip():
    """Dynamically determines the host machine's Wi-Fi / LAN IP so mobile QR scans succeed."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '10.220.156.149'


def generate_patient_reference_id():
    token = secrets.token_hex(4).upper()
    return f"PAT-{token}"


class PatientProfile(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='patient_profile'
    )
    patient_reference_id = models.CharField(
        max_length=64,
        unique=True,
        default=generate_patient_reference_id,
        db_index=True
    )
    full_name = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='', db_index=True)
    email = models.EmailField(max_length=254, blank=True, default='', db_index=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=30, choices=GENDER_CHOICES, blank=True, default='')
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='', db_index=True)
    district = models.CharField(max_length=100, blank=True, default='', db_index=True)
    state = models.CharField(max_length=100, blank=True, default='', db_index=True)
    pincode = models.CharField(max_length=20, blank=True, default='')
    emergency_contact = models.CharField(max_length=100, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patient_profiles'
        verbose_name = 'Patient Profile'
        verbose_name_plural = 'Patient Profiles'
        ordering = ['-created_at']

    def __str__(self):
        display_name = self.full_name or (self.user.full_name if self.user else 'Unnamed Patient')
        return f"{display_name} ({self.patient_reference_id})"

    @property
    def effective_full_name(self):
        if self.full_name:
            return self.full_name
        if self.user and self.user.full_name:
            return self.user.full_name
        return "Patient"

    @property
    def effective_email(self):
        if self.email:
            return self.email
        if self.user and self.user.email:
            return self.user.email
        return ""

    @property
    def effective_phone(self):
        if self.phone:
            return self.phone
        if self.user and self.user.phone:
            return self.user.phone
        return ""

    def ensure_qr_identity(self):
        """Ensures this patient has exactly one permanent QR identity."""
        qr_obj, created = PatientQRIdentity.objects.get_or_create(patient=self)
        return qr_obj


class PatientQRIdentity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.OneToOneField(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='qr_identity'
    )
    public_uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patient_qr_identities'
        verbose_name = 'Patient QR Identity'
        verbose_name_plural = 'Patient QR Identities'

    def __str__(self):
        return f"QR Identity for {self.patient.patient_reference_id} ({self.public_uuid})"

    def get_target_url(self, base_url=None):
        """Generates the permanent target verification landing URL for this patient.
        Automatically substitutes loopback addresses (127.0.0.1/localhost) with the
        host Wi-Fi IP so camera QR scans from phones connect immediately.
        """
        net_ip = get_network_ip()
        if base_url:
            domain = str(base_url).rstrip('/')
        else:
            configured = getattr(settings, 'FRONTEND_APP_URL', '')
            if configured and not any(h in configured for h in ['127.0.0.1', 'localhost']):
                domain = configured.rstrip('/')
            else:
                domain = f"http://{net_ip}:5173"

        domain = domain.replace('127.0.0.1', net_ip).replace('localhost', net_ip)
        return f"{domain}/patient/qr/{self.public_uuid}"

    def generate_qr_png_bytes(self, base_url=None):
        """Renders the QR code as high-resolution PNG bytes."""
        url = self.get_target_url(base_url)
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return buf.getvalue()


class HospitalPatient(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_ARCHIVED = 'archived'
    STATUS_CHOICES = (
        (STATUS_ACTIVE, 'Active'),
        (STATUS_ARCHIVED, 'Archived'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital = models.ForeignKey(
        'hospitals.HospitalProfile',
        on_delete=models.CASCADE,
        related_name='hospital_patients'
    )
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='hospital_affiliations'
    )
    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registered_hospital_patients'
    )
    initial_visit_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        db_index=True
    )
    consent_acknowledged = models.BooleanField(default=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_patients'
        verbose_name = 'Hospital Patient'
        verbose_name_plural = 'Hospital Patients'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['hospital', 'patient'],
                name='unique_hospital_patient'
            )
        ]

    def __str__(self):
        return f"{self.patient} affiliated with {self.hospital.hospital_name}"
