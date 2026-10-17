from django.urls import path
from .views import HospitalMeView, HospitalListView, HospitalDetailView

urlpatterns = [
    path('', HospitalListView.as_view(), name='hospital-list'),
    path('me/', HospitalMeView.as_view(), name='hospital-me'),
    path('<uuid:id>/', HospitalDetailView.as_view(), name='hospital-detail'),
]
