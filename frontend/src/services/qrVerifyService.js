import api from './api';

export const qrVerifyService = {
  // Fetch public verification details or authorized clinical records
  async verifyQR(publicUuid) {
    const response = await api.get(`/qr/${publicUuid}/`);
    return response.data;
  },

  // Get direct permanent QR image URL
  getQRImageUrl(publicUuid) {
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/qr/${publicUuid}/image/`;
  },

  // Download permanent QR image
  async downloadQRImage(publicUuid, filename = 'Permanent_QR.png') {
    const response = await api.get(`/qr/${publicUuid}/image/?download=1`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'image/png' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  },

  // Download authorized clinical PDF
  async downloadAuthorizedPDF(publicUuid, filename = 'Patient_Report.pdf') {
    const response = await api.get(`/qr/${publicUuid}/pdf/`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  },
};
