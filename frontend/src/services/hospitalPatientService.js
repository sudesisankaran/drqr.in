import api from './api';

export const hospitalPatientService = {
  // List patients registered or linked with this hospital
  async listPatients(params = {}) {
    const response = await api.get('/hospital/patients/', { params });
    return response.data;
  },

  // Register new patient or link existing patient
  async registerPatient(patientData) {
    const response = await api.post('/hospital/patients/', patientData);
    return response.data;
  },

  // Get full details of a patient for this hospital
  async getPatientDetail(patientId) {
    const response = await api.get(`/hospital/patients/${patientId}/`);
    return response.data;
  },

  // Get patient's permanent QR metadata
  async getPatientQR(patientId) {
    const response = await api.get(`/hospital/patients/${patientId}/qr/`);
    return response.data;
  },

  // Download permanent QR PNG image
  async downloadPatientQRImage(patientId, filename = 'Patient_QR.png') {
    const response = await api.get(`/hospital/patients/${patientId}/qr/?download=1`, {
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

  // Add clinical hospital record for this patient
  async addPatientRecord(patientId, recordData) {
    const response = await api.post(`/hospital/patients/${patientId}/records/`, recordData);
    return response.data;
  },

  // Upload medical document for this patient
  async uploadPatientDocument(patientId, formData) {
    const response = await api.post(`/hospital/patients/${patientId}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download official ReportLab clinical summary PDF with embedded permanent QR
  async downloadPatientSummaryPDF(patientId, filename = 'Patient_Summary.pdf') {
    const response = await api.get(`/hospital/patients/${patientId}/pdf/`, {
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
