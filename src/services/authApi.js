import { apiClient } from './api';

const API_BASE_URL = 'http://localhost:8080/api';
const AUTH_ENDPOINT = '/admin/auth';
const USER_ENDPOINT = '/auth';

// Debug function to check localStorage
const debugLocalStorage = () => {
  console.log('==== LOCAL STORAGE DEBUG ====');
  console.log('token:', localStorage.getItem('token'));
  console.log('user:', localStorage.getItem('user'));
  console.log('============================');
};

// Function to reset auth state
const resetAuthState = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Auth state has been reset');
  debugLocalStorage();
};

// Hàm encode base64 an toàn cho Unicode
function encodeBase64Unicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// Hàm decode base64 an toàn cho Unicode
function decodeBase64Unicode(str) {
  return decodeURIComponent(escape(atob(str)));
}

const authApi = {
  // Debug helper
  debugLocalStorage,
  resetAuthState,

  // Admin Registration
  register: async (userData) => {
    try {
      const response = await apiClient.post(`${AUTH_ENDPOINT}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi đăng ký' };
    }
  },

  // User Registration
  userRegister: async (userData) => {
    try {
      const response = await apiClient.post(`${AUTH_ENDPOINT}/register`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Đã xảy ra lỗi khi đăng ký' }; 
    }
  },

  // Verify OTP
  verifyOTP: async (email, verificationCode) => {
    try {
      if (!email || !verificationCode) {
        throw { message: 'Email và mã xác thực là bắt buộc' };
      }

      const response = await apiClient.post(
        `${AUTH_ENDPOINT}/verify?email=${encodeURIComponent(email)}&verificationCode=${encodeURIComponent(verificationCode)}`
      );
      
      if (response.data?.token && response.data?.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Lỗi xác thực OTP' };
    }
  },

  // Resend OTP
  resendOTP: async (email) => {
    try {
      if (!email) {
        throw { message: 'Email is required to resend OTP' };
      }
      
      const response = await apiClient.post(`/auth/otp/resend`, { 
        email: email 
      });
      
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error.response?.data || { message: 'Lỗi khi gửi lại mã OTP' };
    }
  },

  // Admin Login
  login: async (credentials) => {
    console.log('1. Starting login process with:', credentials.email);
    try {
      console.log('2. Sending request to:', `${AUTH_ENDPOINT}/login`);
      const response = await apiClient.post(`${AUTH_ENDPOINT}/login`, credentials);
      console.log('3. Received response:', response);

      if (!response.data) {
        console.error('4. No data in response');
        throw { message: 'Đăng nhập thất bại: Server không trả về dữ liệu' };
      }

      console.log('4. Response data structure:', JSON.stringify(response.data, null, 2));

      let token = null;
      let user = null;

      if (response.data.role === 'ADMIN') {
        user = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role,
          fullName: response.data.fullName || '',
          timestamp: Date.now()
        };
        // Tạo token là JSON base64
        const tokenData = {
          id: user.id,
          email: user.email,
          role: user.role,
          timestamp: user.timestamp
        };
        const safeString = JSON.stringify(tokenData);
        token = encodeBase64Unicode(safeString);
      } else {
        if (response.data.token) {
          token = response.data.token;
        } else if (response.data.accessToken) {
          token = response.data.accessToken;
        }
        if (response.data.user) {
          user = response.data.user;
        }
      }

      if (!user || user.role !== 'ADMIN') {
        console.error('5. Invalid user role');
        throw { message: 'Tài khoản không có quyền truy cập' };
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      console.log('6. Login successful:', {
        hasToken: !!token,
        user
      });

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { message: 'Đăng nhập thất bại' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove auth header
    delete apiClient.defaults.headers.common['Authorization'];
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authApi;