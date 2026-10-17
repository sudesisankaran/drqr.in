import api from './api';

export const hospitalService = {
  async getMyHospital() {
    const response = await api.get('/hospitals/me/');
    return response.data;
  },

  async updateMyHospital(data) {
    const response = await api.put('/hospitals/me/', data);
    return response.data;
  },

  async listHospitals(params = {}) {
    const response = await api.get('/hospitals/', { params });
    return response.data;
  },

  async getHospitalById(id) {
    const response = await api.get(`/hospitals/${id}/`);
    return response.data;
  }
};
