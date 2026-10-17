from django.urls import path
from .views_qr import QRRecordVerificationView, QRRecordImageView, QRRecordPDFView

urlpatterns = [
    path('<uuid:public_uuid>/', QRRecordVerificationView.as_view(), name='qr-verification-detail'),
    path('<uuid:public_uuid>/image/', QRRecordImageView.as_view(), name='qr-verification-image'),
    path('<uuid:public_uuid>/pdf/', QRRecordPDFView.as_view(), name='qr-verification-pdf'),
]
