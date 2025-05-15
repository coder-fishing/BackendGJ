import apiClient from './api';

class EmployerService {
  async checkEmployerExists(userId) {
    try {
      const response = await apiClient.get(`/employers/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async setupEmployer(userId, employerData) {
    try {
      const response = await apiClient.post(`/employers/setup?userId=${userId}`, employerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new EmployerService(); 