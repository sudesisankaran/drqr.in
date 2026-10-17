from django.urls import path
from .views import PatientMeView
from records.views import PatientDashboardStatsView

urlpatterns = [
    path('me/', PatientMeView.as_view(), name='patient-me'),
    path('dashboard-stats/', PatientDashboardStatsView.as_view(), name='patient-dashboard-stats'),
]
