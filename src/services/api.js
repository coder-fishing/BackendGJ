// services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; 

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Helper function for API requests
export async function apiRequest(method, url, data = null, params = null) {
  try {
    const response = await apiClient({
      method,
      url,
      data,
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// API Jobs
export const jobsApi = {
  // Get jobs with pagination and status filtering
  getJobspage: async (page = 0, size = 8, status = '') => {
    try {
      const params = {
        page: parseInt(page, 10),
        size: parseInt(size, 10)
      };
  
      let response;
  
      // Nếu status là ALL hoặc rỗng, gọi API lấy tất cả jobs có phân trang
      if (!status || status === 'ALL') {
        response = await apiRequest('get', '/jobs', null, params);
      } else {
        // Nếu có status cụ thể, gọi API lọc theo status
        response = await apiRequest(
          'get', 
          `/jobs/status/${status.toUpperCase()}`,
          null,
          params
        );
      }

      // Xử lý response
      if (response && typeof response === 'object' && 'content' in response) {
        return response;
      }

      if (Array.isArray(response)) {
        const start = page * size;
        const paginatedContent = response.slice(start, start + size);
        return {
          content: paginatedContent,
          totalPages: Math.ceil(response.length / size),
          totalElements: response.length,
          number: page,
          size: size,
          empty: paginatedContent.length === 0
        };
      }

      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: page,
        size: size,
        empty: true
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: page,
        size: size,
        empty: true
      };
    }
  },

  // Get employer's jobs with pagination and status filtering
  getEmployerJobs: async (page = 0, size = 8, status = '') => {
    try {
      const params = {
        page: parseInt(page, 10),
        size: parseInt(size, 10)
      };
  
      let response;
  
      // Nếu status là ALL hoặc rỗng, lấy tất cả jobs của employer
      if (!status || status === 'ALL') {
        response = await apiRequest('get', '/employer/jobs', null, params);
      } else {
        // Nếu có status cụ thể, lọc theo status
        response = await apiRequest(
          'get', 
          `/employer/jobs/status/${status.toUpperCase()}`,
          null,
          params
        );
      }

      // Xử lý response
      if (response && typeof response === 'object' && 'content' in response) {
        return response;
      }

      if (Array.isArray(response)) {
        const start = page * size;
        const paginatedContent = response.slice(start, start + size);
        return {
          content: paginatedContent,
          totalPages: Math.ceil(response.length / size),
          totalElements: response.length,
          number: page,
          size: size,
          empty: paginatedContent.length === 0
        };
      }

      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: page,
        size: size,
        empty: true
      };
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: page,
        size: size,
        empty: true
      };
    }
  },

  // Get employer's job counts by status
  getEmployerJobCounts: async () => {
    try {
      const response = await apiRequest('get', '/employer/jobs/status/count', null, null);
      
      if (Array.isArray(response)) {
        return {
          total: response.reduce((sum, item) => sum + item.count, 0),
          pending: response.find(item => item.status === 'PENDING')?.count || 0,
          approved: response.find(item => item.status === 'APPROVED')?.count || 0,
          rejected: response.find(item => item.status === 'REJECTED')?.count || 0,
          deleted: response.find(item => item.status === 'DELETED')?.count || 0
        };
      }
      
      if (response && typeof response === 'object') {
        return {
          total: response.total || 0,
          pending: response.pending || 0,
          approved: response.approved || 0,
          rejected: response.rejected || 0,
          deleted: response.deleted || 0
        };
      }
      
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        deleted: 0
      };
    } catch (error) {
      console.error('Error fetching employer job counts:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        deleted: 0
      };
    }
  },

  // Get job counts by status
  getJobsCount: async () => {
    try {
      const response = await apiRequest('get', '/jobs/status/count', null, null);
      
      if (Array.isArray(response)) {
        return {
          total: response.reduce((sum, item) => sum + item.count, 0),
          pending: response.find(item => item.status === 'PENDING')?.count || 0,
          approved: response.find(item => item.status === 'APPROVED')?.count || 0,
          rejected: response.find(item => item.status === 'REJECTED')?.count || 0,
          deleted: response.find(item => item.status === 'DELETED')?.count || 0
        };
      }
      
      if (response && typeof response === 'object') {
        return {
          total: response.total || 0,
          pending: response.pending || 0,
          approved: response.approved || 0,
          rejected: response.rejected || 0,
          deleted: response.deleted || 0
        };
      }
      
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        deleted: 0
      };
    } catch (error) {
      console.error('Error in getJobsCount:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        deleted: 0
      };
    }
  },

  // Get job statistics
  getJobStatistics: async () => {
    try {
      const response = await apiRequest('get', '/jobs/statistics', null, null);
      return {
        totalViews: response?.totalViews || 0,
        totalApplies: response?.totalApplies || 0
      };
    } catch (error) {
      console.error('Error in getJobStatistics:', error);
      return {
        totalViews: 0,
        totalApplies: 0
      };
    }
  },

  // Other job APIs
  getJobs: async () => await apiRequest('get', '/jobs/all'),
  getJobsByStatus: async (status) => await apiRequest('get', `/jobs/status/${status}`),
  getJobById: async (id) => await apiRequest('get', `/jobs/${id}`),
  createJob: async (jobData) => await apiRequest('post', '/jobs', jobData),
  updateJob: async (id, jobData) => await apiRequest('put', `/jobs/${id}`, jobData),
  
  // Delete job (using POST instead of DELETE)
  deleteJob: async (id) => {
    try {
      return await apiRequest('post', `/admin/jobs/${id}/delete`, {});
    } catch (error) {
      console.error(`Lỗi khi xóa bài đăng ID: ${id}`, error);
      throw error;
    }
  },
  
  // Approve job
  approveJob: async (id) => {
    try {
      return await apiRequest('post', `/admin/jobs/${id}/approve`, {});
    } catch (error) {
      console.error(`Lỗi khi khôi phục bài đăng ID: ${id}`, error);
      throw error;
    }
  },
  
  // Reject job
  rejectJob: async (id, rejectData) => {
    try {
      return await apiRequest('post', `/admin/jobs/${id}/reject`, rejectData);
    } catch (error) {
      console.error(`Lỗi khi từ chối bài đăng ID: ${id}`, error);
      throw error;
    }
  },
  
  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    try {
      return await apiRequest('get', '/admin/notifications/recent', null, { limit });
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }
};

// Notifications API
export const notificationApi = {
  // Get notifications for admin
  getNotifications: async (page = 0, size = 10) => {
    try {
      const response = await apiRequest('get', '/admin/notifications', null, { page, size });
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { content: [], totalPages: 0, totalElements: 0, number: page, size: size };
    }
  },
  
  // Get recent notifications
  getRecentNotifications: async () => {
    try {
      return await apiRequest('get', '/admin/notifications/recent');
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      return [];
    }
  },
  
  // Get unread notifications
  getUnreadNotifications: async () => {
    try {
      return await apiRequest('get', '/admin/notifications/unread');
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  },
  
  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await apiRequest('get', '/admin/notifications/unread/count');
      return response.count || 0;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  },
  
  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      return await apiRequest('put', `/admin/notifications/${notificationId}/read`);
    } catch (error) {
      console.error(`Lỗi khi đánh dấu đã đọc cho thông báo ID: ${notificationId}`, error);
      throw error;
    }
  },
  
  // Mark multiple notifications as read
  markMultipleAsRead: async (ids) => {
    try {
      return await apiRequest('put', '/admin/notifications/read', ids);
    } catch (error) {
      console.error('Lỗi khi đánh dấu nhiều thông báo đã đọc', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      return await apiRequest('put', '/admin/notifications/read/all');
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc cho tất cả thông báo', error);
      throw error;
    }
  },
  
  // Get notifications by type
  getNotificationsByType: async (type, page = 0, size = 10) => {
    try {
      return await apiRequest('get', '/admin/notifications/byType', null, { type, page, size });
    } catch (error) {
      console.error(`Error fetching notifications by type ${type}:`, error);
      return { content: [], totalPages: 0, totalElements: 0, number: page, size: size };
    }
  },
  
  // Get notifications by job ID
  getNotificationsByJob: async (jobId, page = 0, size = 10) => {
    try {
      return await apiRequest('get', `/admin/notifications/byJob/${jobId}`, null, { page, size });
    } catch (error) {
      console.error(`Error fetching notifications for job ${jobId}:`, error);
      return { content: [], totalPages: 0, totalElements: 0, number: page, size: size };
    }
  },
  
  // Get notifications by read status
  getNotificationsByReadStatus: async (read, page = 0, size = 10) => {
    try {
      return await apiRequest('get', '/admin/notifications/byReadStatus', null, { read, page, size });
    } catch (error) {
      console.error(`Error fetching notifications by read status (${read}):`, error);
      return { content: [], totalPages: 0, totalElements: 0, number: page, size: size };
    }
  },
  
  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      return await apiRequest('delete', `/admin/notifications/${notificationId}`);
    } catch (error) {
      console.error(`Lỗi khi xóa thông báo ID: ${notificationId}`, error);
      throw error;
    }
  }
};

// WebSocket Service for real-time notifications
export const websocketService = {
  socket: null,
  callbacks: {},
  isEnabled: false, // Flag to control whether WebSocket is enabled

  // Connect to WebSocket server
  connect: (userId) => {
    // Skip if not enabled or no userId
    if (!websocketService.isEnabled || !userId) {
      console.log('WebSocket is disabled or no user ID provided');
      return null;
    }
    
    const wsUrl = `ws://localhost:8080/ws/notifications/${userId}`;
    console.log(`WebSocket connecting to: ${wsUrl}`);
    
    try {
      websocketService.socket = new WebSocket(wsUrl);
      
      websocketService.socket.onopen = () => {
        console.log('WebSocket connection established');
        websocketService.trigger('connected', {});
      };
      
      websocketService.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Trigger appropriate event based on message type
          if (data.type) {
            websocketService.trigger(data.type.toLowerCase(), data);
          }
          
          // Also trigger a generic notification event for all messages
          websocketService.trigger('message', data);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      websocketService.socket.onclose = () => {
        console.log('WebSocket connection closed');
        websocketService.trigger('disconnected', {});
        // Don't try to reconnect automatically
      };
      
      websocketService.socket.onerror = (error) => {
        // Just log the error but don't spam the console with multiple errors
        console.log('WebSocket connection error - notifications will not be available');
        websocketService.trigger('error', error);
        // Close the socket to prevent further errors
        if (websocketService.socket) {
          websocketService.socket.close();
        }
      };
      
      return websocketService.socket;
    } catch (error) {
      console.log('WebSocket connection failed - notifications will not be available');
      return null;
    }
  },
  
  // Disconnect WebSocket
  disconnect: () => {
    if (websocketService.socket) {
      websocketService.socket.close();
      websocketService.socket = null;
      console.log('WebSocket disconnected');
    }
  },
  
  // Register event callback
  on: (event, callback) => {
    if (!websocketService.callbacks[event]) {
      websocketService.callbacks[event] = [];
    }
    websocketService.callbacks[event].push(callback);
  },
  
  // Remove event callback
  off: (event, callback) => {
    if (websocketService.callbacks[event]) {
      websocketService.callbacks[event] = websocketService.callbacks[event]
        .filter(cb => cb !== callback);
    }
  },
  
  // Trigger callbacks for an event
  trigger: (event, data) => {
    if (websocketService.callbacks[event]) {
      websocketService.callbacks[event].forEach(callback => callback(data));
    }
  },
  
  // Send message to server
  send: (message) => {
    if (websocketService.socket && websocketService.socket.readyState === WebSocket.OPEN) {
      websocketService.socket.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      console.error('WebSocket not connected, cannot send message');
    }
  }
};

export default apiClient;
