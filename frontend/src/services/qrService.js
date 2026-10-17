import api from './api';

export const qrService = {
  async getRecordQRData(recordId) {
    const response = await api.get(`/records/${recordId}/qr/`);
    return response.data;
  },

  async verifyPublicQR(recordId) {
    const response = await api.get(`/records/verify/${recordId}/`);
    return response.data;
  }
};
