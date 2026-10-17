import api from './api';

export const recordService = {
  async listRecords(params = {}) {
    const response = await api.get('/patient-hospitals/', { params });
    return response.data;
  },

  async getRecord(id) {
    const response = await api.get(`/patient-hospitals/${id}/`);
    return response.data;
  },

  async createRecord(data) {
    const response = await api.post('/patient-hospitals/', data);
    return response.data;
  },

  async updateRecord(id, data) {
    const response = await api.patch(`/patient-hospitals/${id}/`, data);
    return response.data;
  },

  async deleteRecord(id) {
    const response = await api.delete(`/patient-hospitals/${id}/`);
    return response.data;
  },

  async getDashboardStats() {
    const response = await api.get('/patients/dashboard-stats/');
    return response.data;
  }
};
