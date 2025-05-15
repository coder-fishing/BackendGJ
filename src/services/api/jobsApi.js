import axiosClient from './axiosClient';

// Lấy danh sách jobs theo trang và status
export const getJobspage = async (page = 0, size = 8, status = 'ALL') => {
  try {
    const response = await axiosClient.get(`/jobs?page=${page}&size=${size}&status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Lấy số lượng jobs theo từng trạng thái
export const getJobsCount = async () => {
  try {
    const response = await axiosClient.get('/jobs/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching job counts:', error);
    throw error;
  }
};

// Hàm search jobs đơn giản
export const searchJobs = async (params) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    
    if (params.page !== undefined) {
      queryParams.append('page', params.page);
    }
    
    if (params.size) {
      queryParams.append('size', params.size);
    }
    
    if (params.status && params.status !== 'ALL') {
      queryParams.append('status', params.status);
    }

    const response = await axiosClient.get(`/jobs/search?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};

// Hàm helper để parse salary range
const parseSalaryRange = (salaryRange) => {
  if (!salaryRange) return [null, null];
  
  switch(salaryRange) {
    case 'UNDER_10M':
      return [0, 10000000];
    case '10M_20M':
      return [10000000, 20000000];
    case '20M_30M':
      return [20000000, 30000000];
    case 'ABOVE_30M':
      return [30000000, null];
    default:
      return [null, null];
  }
};

// Export tất cả các hàm
export const jobsApi = {
  getJobspage,
  getJobsCount,
  searchJobs
}; 