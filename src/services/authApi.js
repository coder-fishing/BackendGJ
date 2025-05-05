import { apiClient } from './api';

const API_BASE_URL = 'http://localhost:8080/api';
const AUTH_ENDPOINT = '/admin/auth';

// Debug function to check localStorage
const debugLocalStorage = () => {
  console.log('==== LOCAL STORAGE DEBUG ====');
  console.log('adminToken:', localStorage.getItem('adminToken'));
  console.log('adminUser:', localStorage.getItem('adminUser'));
  console.log('============================');
};

// Function to reset auth state
const resetAuthState = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('Auth state has been reset');
  debugLocalStorage();
};

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

  // Verify OTP
  verifyOTP: async (email, verificationCode) => {
    try {
      // Validate parameters
      if (!email) {
        throw { message: 'Email là bắt buộc để xác thực OTP' };
      }
      if (!verificationCode) {
        throw { message: 'Mã xác thực là bắt buộc' };
      }

      console.log('Verifying OTP for email:', email);
      
      // Truyền email và otp qua query parameters
      const response = await apiClient.post(
        `${AUTH_ENDPOINT}/verify?email=${encodeURIComponent(email)}&verificationCode=${encodeURIComponent(verificationCode)}`
      );
      
      console.log('OTP verification response:', response.data);
      
      // Handle successful verification
      if (response.data && response.data.success) {
        console.log('OTP verification successful');
        
        // If verification returns a token, save it
        if (response.data.token) {
          localStorage.setItem('adminToken', response.data.token);
          console.log('Token saved to localStorage:', response.data.token);
          
          // Update auth header for future requests
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        } else {
          console.warn('No token received in verification response');
        }
        
        // Save user data if available
        let userData = null;
        if (response.data.user) {
          userData = response.data.user;
        } else {
          // Create basic user object with email
          userData = {
            email: email,
            verified: true
          };
        }
        
        localStorage.setItem('adminUser', JSON.stringify(userData));
        console.log('User data saved to localStorage:', userData);
        
        // Verify data was saved
        setTimeout(() => {
          const storedToken = localStorage.getItem('adminToken');
          const storedUser = localStorage.getItem('adminUser');
          console.log('Verification - Token in localStorage:', !!storedToken);
          console.log('Verification - User in localStorage:', !!storedUser);
        }, 100);
        
        return {
          ...response.data,
          user: userData
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
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
      console.log('4. Response data:', response.data);
      
      if (!response.data) {
        console.error('5A. No data in response');
        throw { message: 'Đăng nhập thất bại: Server không trả về dữ liệu' };
      }
      
      console.log('5. Checking for token in response');
      
      // Check for token in different possible locations
      let token = null;
      let userData = null;
      
      if (response.data.token) {
        token = response.data.token;
        console.log('6A. Found token in response.data.token');
      } else if (response.data.accessToken) {
        token = response.data.accessToken;
        console.log('6B. Found token in response.data.accessToken');
      } else if (response.data.access_token) {
        token = response.data.access_token;
        console.log('6C. Found token in response.data.access_token');
      } else if (response.data.jwt) {
        token = response.data.jwt;
        console.log('6D. Found token in response.data.jwt');
      } else if (response.data.auth && response.data.auth.token) {
        token = response.data.auth.token;
        console.log('6E. Found token in response.data.auth.token');
      } else if (response.headers && response.headers.authorization) {
        token = response.headers.authorization.replace('Bearer ', '');
        console.log('6F. Found token in authorization header');
      } else {
        // Nếu không tìm thấy token, hãy tạo token tạm thời để test frontend
        console.log('6G. No token found, creating temporary token for testing');
        token = "temp_token_" + btoa(credentials.email + "_" + Date.now());
        console.log('Temporary token created:', token);
        
        // Hiển thị cảnh báo cho người dùng biết
        console.warn('CẢNH BÁO: Đang sử dụng token tạm thời vì API không trả về token. ' +
                    'Chức năng này chỉ dùng để test và sẽ không an toàn trong môi trường production.');
      }
      
      console.log('7. Setting token in localStorage:', token);
      localStorage.setItem('adminToken', token);
      
      // Get user data
      if (response.data.user) {
        userData = response.data.user;
        console.log('8A. Using user object from response');
      } else if (response.data.userData) {
        userData = response.data.userData;
        console.log('8B. Using userData object from response');
      } else if (response.data.userInfo) {
        userData = response.data.userInfo;
        console.log('8C. Using userInfo object from response');
      } else if (response.data.admin) {
        userData = response.data.admin;
        console.log('8D. Using admin object from response');
      } else {
        userData = {
          email: credentials.email,
          username: credentials.email.split('@')[0],
          role: 'admin',
          isAuthenticated: true
        };
        console.log('8E. Created basic user object:', userData);
      }
      
      console.log('9. Setting user in localStorage');
      localStorage.setItem('adminUser', JSON.stringify(userData));
      
      console.log('10. Setting auth header for future requests');
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const result = {
        ...response.data,
        token: token,
        user: userData
      };
      
      console.log('11. Returning result:', result);
      return result;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error || { message: 'Đăng nhập thất bại' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Remove auth header
    delete apiClient.defaults.headers.common['Authorization'];
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('adminToken');
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('adminToken');
  }
};

export default authApi; 