from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def root_health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'service': 'Medical Health Care Management System API',
        'version': '2.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'hospitals': '/api/hospitals/',
            'patients': '/api/patients/',
            'patient_hospitals': '/api/patient-hospitals/',
            'medical_records': '/api/medical-records/',
            'records_qr_pdf': '/api/records/',
        }
    })


from django.shortcuts import redirect


def redirect_to_frontend_qr(request, public_uuid):
    """Fallback redirect to frontend in case user navigates to backend port 8000."""
    from patients.models import get_network_ip
    raw_host = request.get_host().split(':')[0]
    if raw_host in ['127.0.0.1', 'localhost']:
        raw_host = get_network_ip()
    return redirect(f"{request.scheme}://{raw_host}:5173/patient/qr/{public_uuid}")


urlpatterns = [
    path('', root_health_check, name='health-check'),
    path('api/health/', root_health_check, name='api-health-check'),
    path('admin/', admin.site.urls),
    path('patient/qr/<uuid:public_uuid>', redirect_to_frontend_qr, name='qr-fallback-redirect'),
    path('patient/qr/<uuid:public_uuid>/', redirect_to_frontend_qr, name='qr-fallback-redirect-slash'),

    # Standard /api/ prefix
    path('api/auth/', include('accounts.urls')),
    path('api/hospitals/', include('hospitals.urls')),
    path('api/hospital/patients/', include('hospitals.urls_patients')),
    path('api/patients/', include('patients.urls')),
    path('api/patient/me/', include('patients.urls_patient_me')),
    path('api/qr/', include('patients.urls_qr')),
    path('api/', include('records.urls')),
    path('api/records/', include('qr_documents.urls')),

    # Dual route compatibility without /api/ prefix
    path('auth/', include('accounts.urls')),
    path('hospitals/', include('hospitals.urls')),
    path('hospital/patients/', include('hospitals.urls_patients')),
    path('patients/', include('patients.urls')),
    path('patient/me/', include('patients.urls_patient_me')),
    path('qr/', include('patients.urls_qr')),
    path('records/', include('qr_documents.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
