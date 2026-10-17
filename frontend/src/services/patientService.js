import api from './api';

export const patientService = {
  // Get patient's profile & permanent QR data
  async getMyPatient() {
    const response = await api.get('/patient/me/');
    return response.data;
  },

  // Update profile
  async updateMyPatient(data) {
    const response = await api.patch('/patients/me/', data);
    return response.data;
  },

  // Get affiliated hospitals
  async getMyHospitals() {
    const response = await api.get('/patient/me/hospitals/');
    return response.data;
  },

  // Get clinical records
  async getMyRecords() {
    const response = await api.get('/patient/me/records/');
    return response.data;
  },

  // Get uploaded documents
  async getMyDocuments() {
    const response = await api.get('/patient/me/documents/');
    return response.data;
  },

  // Get permanent QR metadata
  async getMyQR() {
    const response = await api.get('/patient/me/qr/');
    return response.data;
  },

  // Download permanent QR PNG image
  async downloadMyQR(filename = 'My_Permanent_QR.png') {
    const response = await api.get('/patient/me/qr/?download=1', {
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

  // Download official ReportLab clinical summary PDF
  async downloadMyPDF(filename = 'My_Health_Summary.pdf') {
    const response = await api.get('/patient/me/pdf/', {
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

  // Get dashboard counters
  async getDashboardStats() {
    const response = await api.get('/patients/dashboard-stats/');
    return response.data;
  }
};
