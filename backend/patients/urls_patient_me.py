from django.urls import path
from .views_patient_me import (
    PatientMeProfileView,
    PatientMeHospitalsView,
    PatientMeRecordsView,
    PatientMeDocumentsView,
    PatientMeQRView,
    PatientMePDFView
)

urlpatterns = [
    path('', PatientMeProfileView.as_view(), name='patient-me-profile'),
    path('hospitals/', PatientMeHospitalsView.as_view(), name='patient-me-hospitals'),
    path('records/', PatientMeRecordsView.as_view(), name='patient-me-records'),
    path('documents/', PatientMeDocumentsView.as_view(), name='patient-me-documents'),
    path('qr/', PatientMeQRView.as_view(), name='patient-me-qr'),
    path('pdf/', PatientMePDFView.as_view(), name='patient-me-pdf'),
]
