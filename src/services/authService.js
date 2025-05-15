import apiClient from './api';

const AUTH_ENDPOINTS = {
  USER: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    RESEND_OTP: '/auth/otp/resend',
    FORGOT_PASSWORD: '/auth/reset-password/request',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/password'
  },
  ADMIN: {
    REGISTER: '/admin/auth/register',
    LOGIN: '/admin/auth/login',
    VERIFY: '/admin/auth/verify'
  }
};

function encodeBase64Unicode(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  const binary = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
  return btoa(binary);
}

class AuthService {
  // USER
  async userRegister(userData) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.USER.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async userLogin(credentials) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.USER.LOGIN, credentials);
      const user = response.data;

      if (!user) throw new Error('Server không trả về dữ liệu');

      // Set user status to active
      try {
        await apiClient.put(`/api/users/${user.id}/status`, { active: true });
        user.active = true;
      } catch (error) {
        console.error('Failed to update user status:', error);
      }

      const token = encodeBase64Unicode(JSON.stringify({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        timestamp: new Date().getTime()
      }));

      this._setAuthData(token, user);
      return { token, user };
    } catch (error) {
      throw this._handleError(error);
    }
  }

  // Password reset
  async forgotPassword(email) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.USER.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.USER.RESET_PASSWORD, { token, newPassword });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  // Password management
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.USER.CHANGE_PASSWORD, {
        userId,
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  // ADMIN
  async adminRegister(adminData) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.ADMIN.REGISTER, adminData);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async adminLogin(credentials) {
    try {
      console.log('Attempting admin login with:', credentials.email);
      const response = await apiClient.post(AUTH_ENDPOINTS.ADMIN.LOGIN, credentials);
      console.log('Full server response:', response);
      console.log('Response data:', response.data);

      // Extract user data
      const userData = response.data;
      console.log('User data:', userData);

      // Validate role
      if (userData.role !== 'ADMIN') {
        console.log('Role validation failed. Expected ADMIN, got:', userData.role);
        throw new Error('Unauthorized: Not an admin');
      }

      // Generate token if not provided
      const token = encodeBase64Unicode(JSON.stringify({
        id: userData.id,
        email: userData.username || userData.email,
        role: userData.role,
        timestamp: new Date().getTime()
      }));

      console.log('Generated token:', token);

      // Create normalized user object
      const normalizedUser = {
        id: userData.id,
        email: userData.username || userData.email,
        fullName: userData.fullName,
        role: userData.role,
        avatarUrl: userData.avatarUrl,
        phoneNumber: userData.phoneNumber
      };

      this._setAuthData(token, normalizedUser, true);
      return { token, user: normalizedUser };
    } catch (error) {
      console.error('Admin login error:', error);
      throw this._handleError(error);
    }
  }

  // COMMON
  async verifyOTP(email, code, isAdmin = false) {
    try {
      const endpoint = isAdmin ? AUTH_ENDPOINTS.ADMIN.VERIFY : AUTH_ENDPOINTS.USER.VERIFY;
      const response = await apiClient.post(endpoint, { email, verificationCode: code });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async resendOTP(email) {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.USER.RESEND_OTP, { email });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      this.logout();
      return null;
    }
  }

  isAuthenticated() {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const user = this.getCurrentUser();

      if (!token || !user) return false;

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } catch (error) {
      console.error('isAuthenticated error:', error);
      return false;
    }
  }

  isAdmin() {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  async verifyToken() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const tokenData = JSON.parse(atob(token));
      const now = Date.now();
      const age = now - tokenData.timestamp;

      if (age > 24 * 60 * 60 * 1000) {
        this.logout();
        return false;
      }

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } catch (error) {
      console.error('verifyToken error:', error);
      this.logout();
      return false;
    }
  }

  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh-token');
      const { token, user } = response.data;

      if (token && user) {
        this._setAuthData(token, user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('refreshToken error:', error);
      this.logout();
      return false;
    }
  }

  // PRIVATE
  _setAuthData(token, user, isAdmin = false) {
    const tokenKey = isAdmin ? 'adminToken' : 'token';
    const userKey = isAdmin ? 'adminUser' : 'user';

    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(user));

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  _handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'Có lỗi xảy ra';
      return new Error(message);
    }
    return error;
  }
}

export default new AuthService();
