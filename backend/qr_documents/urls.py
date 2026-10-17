from django.urls import path
from .views import RecordQRView, RecordPDFView, RecordPublicVerifyView

urlpatterns = [
    path('<uuid:record_id>/qr/', RecordQRView.as_view(), name='record-qr'),
    path('<uuid:record_id>/pdf/', RecordPDFView.as_view(), name='record-pdf'),
    path('verify/<uuid:record_id>/', RecordPublicVerifyView.as_view(), name='record-verify'),
]
