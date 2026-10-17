from django.core.management.base import BaseCommand
from accounts.models import User
from hospitals.models import HospitalProfile
from patients.models import PatientProfile
from records.models import PatientHospitalRecord


class Command(BaseCommand):
    help = 'Seeds initial demo hospital, patient, and records for testing'

    def handle(self, *args, **options):
        # 1. Hospital Account
        hosp_email = 'apollo@hospital.com'
        hosp_user = User.objects.filter(email=hosp_email).first()
        if not hosp_user:
            hosp_user = User.objects.create_user(
                email=hosp_email,
                password='Password123!',
                full_name='Apollo Specialty Hospital',
                role=User.ROLE_HOSPITAL,
                phone='+91 98765 43210',
                is_email_verified=True,
                is_staff=True
            )
            hosp_profile = HospitalProfile.objects.create(
                user=hosp_user,
                hospital_name='Apollo Specialty Hospital & Research Institute',
                registration_number='HOSP-TN-2024-8891',
                hospital_type='Multi-Speciality Tertiary Care',
                specializations='Cardiology, Oncology, Neurology, Orthopedics, Nephrology, Intensive Care',
                address='No. 21 Greams Lane, Thousand Lights',
                city='Chennai',
                district='Chennai',
                state='Tamil Nadu',
                pincode='600006',
                contact_number='+91 44 2829 0200',
                official_email='contact@apollochennai.org',
                doctor_in_charge='Dr. K. S. Ramanathan, MD, DM (Cardio)',
                facilities='24/7 Trauma Emergency, 64-Slice CT, 3T MRI, 12 Advanced Modular OTs, 60-bed ICU, Blood Bank',
                license_number='LIC-MED-TN-99824'
            )
            self.stdout.write(self.style.SUCCESS(f'Created Hospital: {hosp_email} (Password: Password123!)'))
        else:
            hosp_profile = hosp_user.hospital_profile

        # 2. Patient Account
        pat_email = 'john@patient.com'
        pat_user = User.objects.filter(email=pat_email).first()
        if not pat_user:
            pat_user = User.objects.create_user(
                email=pat_email,
                password='Password123!',
                full_name='John Doe',
                role=User.ROLE_PATIENT,
                phone='+91 91234 56789',
                is_email_verified=True
            )
            pat_profile = PatientProfile.objects.create(
                user=pat_user,
                patient_reference_id='PAT-7E4A9B1C',
                date_of_birth='1988-05-14',
                address='14/2 Park View Avenue, T. Nagar',
                city='Chennai',
                district='Chennai',
                state='Tamil Nadu',
                pincode='600017'
            )
            self.stdout.write(self.style.SUCCESS(f'Created Patient: {pat_email} (Password: Password123!)'))

            # 3. Patient Hospital Record
            record = PatientHospitalRecord.objects.create(
                patient=pat_user,
                hospital_profile=hosp_profile,
                hospital_name=hosp_profile.hospital_name,
                registration_number=hosp_profile.registration_number,
                hospital_type=hosp_profile.hospital_type,
                specializations=hosp_profile.specializations,
                address=hosp_profile.address,
                city=hosp_profile.city,
                district=hosp_profile.district,
                state=hosp_profile.state,
                pincode=hosp_profile.pincode,
                contact_number=hosp_profile.contact_number,
                official_email=hosp_profile.official_email,
                doctor_in_charge=hosp_profile.doctor_in_charge,
                facilities=hosp_profile.facilities,
                license_number=hosp_profile.license_number
            )
            self.stdout.write(self.style.SUCCESS(f'Created Patient Record: {record.id}'))
        else:
            self.stdout.write(self.style.WARNING('Demo data already exists.'))
