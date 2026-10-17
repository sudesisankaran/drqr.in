import json
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import User
from hospitals.models import HospitalProfile
from patients.models import PatientProfile
from records.models import PatientHospitalRecord, MedicalDocument


class MedicalHealthCareApiTests(APITestCase):

    def setUp(self):
        # Create hospital user
        self.hospital_user = User.objects.create_user(
            email='apollo_test@hospital.com',
            password='TestPassword123!',
            full_name='Apollo Test Hospital',
            role=User.ROLE_HOSPITAL,
            phone='+91 99999 11111'
        )
        self.hospital_profile = HospitalProfile.objects.create(
            user=self.hospital_user,
            hospital_name='Apollo Test Hospital',
            registration_number='REG-TEST-1001',
            hospital_type='General Care',
            specializations='General Medicine, Surgery',
            address='10 Test Road',
            city='Chennai',
            district='Chennai',
            state='Tamil Nadu',
            pincode='600001',
            contact_number='+91 99999 11111',
            official_email='info@apollotest.com',
            doctor_in_charge='Dr. Test Doctor',
            facilities='ICU, Pharmacy, Emergency',
            license_number='LIC-TEST-1001'
        )

        # Create patient user
        self.patient_user = User.objects.create_user(
            email='patient_test@test.com',
            password='TestPassword123!',
            full_name='Test Patient One',
            role=User.ROLE_PATIENT,
            phone='+91 88888 22222'
        )
        self.patient_profile = PatientProfile.objects.create(
            user=self.patient_user,
            address='20 Patient Street',
            city='Chennai',
            district='Chennai',
            state='Tamil Nadu',
            pincode='600002'
        )

        # Create record for patient
        self.record = PatientHospitalRecord.objects.create(
            patient=self.patient_user,
            hospital_profile=self.hospital_profile,
            hospital_name=self.hospital_profile.hospital_name,
            registration_number=self.hospital_profile.registration_number,
            hospital_type=self.hospital_profile.hospital_type,
            specializations=self.hospital_profile.specializations,
            address=self.hospital_profile.address,
            city=self.hospital_profile.city,
            district=self.hospital_profile.district,
            state=self.hospital_profile.state,
            pincode=self.hospital_profile.pincode,
            contact_number=self.hospital_profile.contact_number,
            official_email=self.hospital_profile.official_email,
            doctor_in_charge=self.hospital_profile.doctor_in_charge,
            facilities=self.hospital_profile.facilities,
            license_number=self.hospital_profile.license_number
        )

    def test_hospital_registration(self):
        url = reverse('register-hospital')
        data = {
            'email': 'new_hospital@care.org',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'hospital_name': 'New Metro Hospital',
            'registration_number': 'REG-NEW-2024',
            'hospital_type': 'Cardiology Specialist',
            'specializations': 'Cardiology, Cardiac Surgery',
            'address': '55 Heart Way',
            'city': 'Coimbatore',
            'district': 'Coimbatore',
            'state': 'Tamil Nadu',
            'pincode': '641001',
            'contact_number': '+91 422 1234567',
            'official_email': 'contact@newmetro.org',
            'doctor_in_charge': 'Dr. Sarah Heart',
            'facilities': 'Cath Lab, CCU, Cardiac Ambulance',
            'license_number': 'LIC-CARD-55'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['user']['role'], 'hospital')
        self.assertTrue(User.objects.filter(email='new_hospital@care.org').exists())

    def test_patient_registration(self):
        url = reverse('register-patient')
        data = {
            'email': 'new_patient@patientmail.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'full_name': 'Jane Doe',
            'phone': '+91 77777 33333',
            'date_of_birth': '1992-08-25',
            'address': '77 Lake Side Road',
            'city': 'Madurai',
            'district': 'Madurai',
            'state': 'Tamil Nadu',
            'pincode': '625001'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['user']['role'], 'patient')
        self.assertTrue(User.objects.filter(email='new_patient@patientmail.com').exists())

    def test_login_and_token_issue(self):
        url = reverse('login')
        data = {
            'email': 'patient_test@test.com',
            'password': 'TestPassword123!'
        }
        res = self.client.post(url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertIn('refresh', res.data['tokens'])

    def test_patient_records_isolation(self):
        # Patient A should see record
        self.client.force_authenticate(user=self.patient_user)
        res = self.client.get('/api/patient-hospital-records/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

        # Create Patient B
        patient_b = User.objects.create_user(
            email='patient_b@test.com',
            password='TestPassword123!',
            full_name='Patient B',
            role=User.ROLE_PATIENT
        )
        self.client.force_authenticate(user=patient_b)
        res = self.client.get('/api/patient-hospital-records/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 0)

    def test_qr_target_endpoint(self):
        self.client.force_authenticate(user=self.patient_user)
        url = f'/api/records/{self.record.id}/qr/'
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        self.assertIn('qr_target_url', res.data)
        self.assertIn(str(self.record.id), res.data['qr_target_url'])

    def test_pdf_generation_endpoint(self):
        self.client.force_authenticate(user=self.patient_user)
        url = f'/api/records/{self.record.id}/pdf/?download=1'
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        content = b"".join(res.streaming_content)
        self.assertTrue(len(content) > 500)

    def test_public_verify_endpoint(self):
        # Unauthenticated scanner
        self.client.logout()
        url = f'/api/records/verify/{self.record.id}/'
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['verified'])
        self.assertEqual(res.data['hospital_name'], 'Apollo Test Hospital')
        # Ensure private patient name is not disclosed to anonymous scanner
        self.assertNotIn('patient_name', res.data)

    def test_patient_hospital_crud_workflow(self):
        self.client.force_authenticate(user=self.patient_user)

        # 1. Add Hospital Details
        add_url = '/api/patient-hospitals/'
        hospital_data = {
            'hospital_name': 'City Life Healthcare',
            'registration_number': 'REG-CITY-400',
            'hospital_type': 'General Hospital',
            'specialization': 'Orthopedics, Internal Medicine',
            'address': '12 Anna Salai',
            'city': 'Chennai',
            'district': 'Chennai',
            'state': 'Tamil Nadu',
            'pincode': '600002',
            'contact_number': '+91 44 99990000',
            'official_email': 'contact@citylife.org',
            'doctor_in_charge': 'Dr. K. Balaji',
            'visit_date': '2026-04-10',
            'additional_notes': 'Regular health checkup and consultation'
        }
        res = self.client.post(add_url, hospital_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        new_hosp_id = res.data['id']
        self.assertEqual(res.data['hospital_name'], 'City Life Healthcare')

        # 2. Retrieve & Patch
        detail_url = f'/api/patient-hospitals/{new_hosp_id}/'
        patch_res = self.client.patch(detail_url, {'additional_notes': 'Updated follow-up visit scheduled'}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['additional_notes'], 'Updated follow-up visit scheduled')

    def test_medical_document_upload_and_download(self):
        self.client.force_authenticate(user=self.patient_user)

        # 1. Upload mock medical document (PDF)
        mock_pdf_content = b"%PDF-1.4 Mock lab report content for patient test."
        mock_file = SimpleUploadedFile("blood_test_report.pdf", mock_pdf_content, content_type="application/pdf")

        upload_data = {
            'hospital_record': str(self.record.id),
            'title': 'Complete Blood Count (CBC) Report',
            'category': 'Lab Report',
            'record_date': '2026-04-15',
            'description': 'Routine biochemical screening',
            'reference_number': 'LAB-REF-99812',
            'file': mock_file
        }
        upload_res = self.client.post('/api/medical-records/', upload_data, format='multipart')
        self.assertEqual(upload_res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(upload_res.data['success'])
        doc_id = upload_res.data['data']['id']
        self.assertEqual(upload_res.data['data']['title'], 'Complete Blood Count (CBC) Report')

        # 2. Download and verify stream
        download_url = f'/api/medical-records/{doc_id}/download/'
        download_res = self.client.get(download_url)
        self.assertEqual(download_res.status_code, status.HTTP_200_OK)
        streamed_bytes = b"".join(download_res.streaming_content)
        self.assertEqual(streamed_bytes, mock_pdf_content)

        # 3. Verify Patient B cannot access or download Patient A's document
        patient_b = User.objects.create_user(
            email='patient_unauthorized@test.com',
            password='TestPassword123!',
            full_name='Unauthorized Patient',
            role=User.ROLE_PATIENT
        )
        self.client.force_authenticate(user=patient_b)
        forbidden_download = self.client.get(download_url)
        self.assertEqual(forbidden_download.status_code, status.HTTP_404_NOT_FOUND)

        # 4. Check dashboard stats
        self.client.force_authenticate(user=self.patient_user)
        stats_res = self.client.get('/api/patients/dashboard-stats/')
        self.assertEqual(stats_res.status_code, status.HTTP_200_OK)
        self.assertEqual(stats_res.data['total_documents'], 1)
        self.assertTrue(stats_res.data['total_hospitals'] >= 1)
