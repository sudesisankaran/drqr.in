from django.urls import path
from .views_patients import (
    HospitalPatientRegistrationAndListView,
    HospitalPatientDetailView,
    HospitalPatientQRView,
    HospitalPatientRecordsView,
    HospitalPatientDocumentsView,
    HospitalPatientPDFView
)

urlpatterns = [
    path('', HospitalPatientRegistrationAndListView.as_view(), name='hospital-patient-list-create'),
    path('<uuid:patient_id>/', HospitalPatientDetailView.as_view(), name='hospital-patient-detail'),
    path('<uuid:patient_id>/qr/', HospitalPatientQRView.as_view(), name='hospital-patient-qr'),
    path('<uuid:patient_id>/records/', HospitalPatientRecordsView.as_view(), name='hospital-patient-add-record'),
    path('<uuid:patient_id>/documents/', HospitalPatientDocumentsView.as_view(), name='hospital-patient-add-document'),
    path('<uuid:patient_id>/pdf/', HospitalPatientPDFView.as_view(), name='hospital-patient-pdf'),
]
