// services/api.js
import axios from 'axios';

// Create axios instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for request and response
apiClient.interceptors.request.use(
  (config) => {
    console.log(`➡️ [Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params || {});
    
    // Add auth token to headers if available
    const token = localStorage.getItem('adminToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [Request Error]:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [Response] ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ [Response Error]:', error);

    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Token hết hạn hoặc không hợp lệ. Đang chuyển hướng về trang đăng nhập...');
      
      // Clear auth data on 401 Unauthorized
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Redirect to login page
      window.location.href = '/admin/login';
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
      let endpoint = '/jobs';
      
      if (status && status !== 'ALL') {
        endpoint = `/jobs/status/${status}`;
        console.log(`DEBUG API: Gọi API với status: ${status}, endpoint: ${endpoint}, page: ${page}, size: ${size}`);
      } else {
        console.log(`DEBUG API: Gọi API cho tất cả jobs, endpoint: ${endpoint}, page: ${page}, size: ${size}`);
      }
      
      // Ensure proper pagination parameters
      const sizeParam = parseInt(size, 10);
      const pageParam = parseInt(page, 10);
      
      const response = await apiRequest('get', endpoint, null, { 
        page: pageParam, 
        size: sizeParam 
      });
      
      // Handle response
      if (!response) {
        return { content: [], totalPages: 0, totalElements: 0, number: page, size: size };
      }
      
      // Handle non-standard pagination response
      if (!response.content) {
        if (Array.isArray(response)) {
          // Client-side pagination if server doesn't support it
          const totalItems = response.length;
          const totalPages = Math.ceil(totalItems / sizeParam) || 1;
          const startIndex = pageParam * sizeParam;
          const endIndex = Math.min(startIndex + sizeParam, totalItems);
          const paginatedContent = response.slice(startIndex, endIndex);
          
          return {
            content: paginatedContent,
            totalPages: totalPages,
            totalElements: totalItems,
            number: pageParam,
            size: sizeParam
          };
        } else {
          return { content: [], totalPages: 0, totalElements: 0, number: page, size: size };
        }
      }
      
      // Return standard pagination structure
      return {
        content: response.content || [],
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
        number: response.number || page,
        size: response.size || size
      };
    } catch (error) {
      console.error('Error in getJobspage:', error);
      return { content: [], totalPages: 0, totalElements: 0, number: page, size: size };
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

  // Connect to WebSocket server
  connect: (userId) => {
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
      };
      
      websocketService.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        websocketService.trigger('error', error);
      };
      
      return websocketService.socket;
    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
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
