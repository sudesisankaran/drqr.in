import api from './api';

export const pdfService = {
  getPdfDirectUrl(recordId, download = false) {
    const token = localStorage.getItem('access_token');
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/records/${recordId}/pdf/?download=${download ? '1' : '0'}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  },

  async downloadPdf(recordId, filename = 'Medical_Hospital_Record.pdf') {
    const response = await api.get(`/records/${recordId}/pdf/?download=1`, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 2000);
  },

  async getPdfBlobUrl(recordId) {
    const response = await api.get(`/records/${recordId}/pdf/?download=0`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return window.URL.createObjectURL(blob);
  }
};
