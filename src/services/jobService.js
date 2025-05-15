import apiClient from './api';

const JOB_ENDPOINTS = {
  LIST: '/jobs',
  CREATE: '/jobs',
  UPDATE: (id) => `/jobs/${id}`,
  DELETE: (id) => `/jobs/${id}`,
  GET: (id) => `/jobs/${id}`,
  APPLICATIONS: (id) => `/jobs/${id}/applications`,
  CHECK_EXPIRED: '/jobs/expired/check',
  DELETE_EXPIRED: '/jobs/expired/delete'
};

class JobService {
  async getJobs() {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.LIST);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async createJob(jobData) {
    try {
      const response = await apiClient.post(JOB_ENDPOINTS.CREATE, jobData);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async updateJob(jobId, jobData) {
    try {
      const response = await apiClient.put(JOB_ENDPOINTS.UPDATE(jobId), jobData);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async deleteJob(jobId) {
    try {
      const response = await apiClient.delete(JOB_ENDPOINTS.DELETE(jobId));
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async getJob(jobId) {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.GET(jobId));
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async getJobApplications(jobId) {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.APPLICATIONS(jobId));
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async deleteExpiredJobs() {
    try {
      const response = await apiClient.post(JOB_ENDPOINTS.DELETE_EXPIRED);
      return response.data;
    } catch (error) {
      console.error('Error deleting expired jobs:', error);
      throw this._handleError(error);
    }
  }

  async checkExpiredJobs() {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.CHECK_EXPIRED);
      return response.data;
    } catch (error) {
      console.error('Error checking expired jobs:', error);
      throw this._handleError(error);
    }
  }

  _handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'Có lỗi xảy ra';
      throw new Error(message);
    }
    throw error;
  }
}

export default new JobService(); 