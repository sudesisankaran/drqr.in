from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientHospitalRecordViewSet,
    MedicalDocumentViewSet,
    PatientDashboardStatsView
)

hospitals_router = DefaultRouter()
hospitals_router.register(r'', PatientHospitalRecordViewSet, basename='patient-hospital')

medical_records_router = DefaultRouter()
medical_records_router.register(r'', MedicalDocumentViewSet, basename='medical-record')

urlpatterns = [
    path('patient-hospitals/', include(hospitals_router.urls)),
    path('patient-hospital-records/', include(hospitals_router.urls)),
    path('medical-records/', include(medical_records_router.urls)),
]
