import api from './api';

export const medicalDocumentService = {
  async listDocuments(params = {}) {
    const response = await api.get('/medical-records/', { params });
    return response.data;
  },

  async getDocument(id) {
    const response = await api.get(`/medical-records/${id}/`);
    return response.data;
  },

  async uploadDocument(formData) {
    const response = await api.post('/medical-records/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateDocument(id, data) {
    const response = await api.patch(`/medical-records/${id}/`, data);
    return response.data;
  },

  async deleteDocument(id) {
    const response = await api.delete(`/medical-records/${id}/`);
    return response.data;
  },

  async downloadDocument(id, filename = 'Medical_Document') {
    const response = await api.get(`/medical-records/${id}/download/?download=1`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 2000);
  },

  getDocumentViewUrl(id) {
    const token = localStorage.getItem('access_token');
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/medical-records/${id}/download/?download=0${token ? `&token=${encodeURIComponent(token)}` : ''}`;
  }
};
