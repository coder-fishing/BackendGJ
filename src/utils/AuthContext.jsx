import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../services/authApi';
import authService from '../services/authService';
import { apiClient } from '../services/api';

// Function to test storage functionality
const testBrowserStorage = () => {
  try {
    console.log('Testing browser localStorage functionality...');
    localStorage.setItem('test_storage', 'working');
    const testValue = localStorage.getItem('test_storage');
    console.log('Test storage read:', testValue);
    localStorage.removeItem('test_storage');
    return testValue === 'working';
  } catch (error) {
    console.error('Browser localStorage test failed:', error);
    return false;
  }
};

// Function to check if token is a JWT and decode it
const isJwtToken = (token) => {
  return token && typeof token === 'string' && token.split('.').length === 3;
};

// Function to decode JWT token
const decodeJwt = (token) => {
  try {
    if (!isJwtToken(token)) {
      return null;
    }
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

// Create auth context
const AuthContext = createContext(null);

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Add updateCurrentUser function
  const updateCurrentUser = (userData) => {
    try {
      console.log('Updating current user:', userData);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        console.log('User data updated successfully');
      } else {
        localStorage.removeItem('user');
        setCurrentUser(null);
        console.log('User data cleared');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Check storage availability
  useEffect(() => {
    const storageWorks = testBrowserStorage();
    setStorageAvailable(storageWorks);
    
    if (!storageWorks) {
      console.error('WARNING: Browser localStorage is not available! Authentication will not work correctly.');
      setError('Your browser storage is disabled or not available. Please enable cookies and storage for this site.');
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('=== AUTH INITIALIZATION START ===');
        
        // Get token and user info from localStorage
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
        
        console.log('Storage check:', {
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : null,
          hasUserStr: !!userStr
        });

        if (token && userStr) {
          try {
            // Parse user data first
            const user = JSON.parse(userStr);
            
            // Set the currentUser immediately to ensure it's available
            setCurrentUser(user);
            console.log('Setting current user from storage:', user);
            
            // Check if token is a JWT token
            if (isJwtToken(token)) {
              // JWT token validation
              const decodedToken = decodeJwt(token);
              
              if (!decodedToken) {
                console.log('Invalid JWT token format');
                localStorage.removeItem('token');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('user');
                localStorage.removeItem('adminUser');
                setCurrentUser(null);
                return;
              }
              
              // Check JWT expiration
              const now = Math.floor(Date.now() / 1000);
              if (decodedToken.exp && decodedToken.exp < now) {
                console.log('JWT token has expired');
                localStorage.removeItem('token');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('user');
                localStorage.removeItem('adminUser');
                setCurrentUser(null);
                return;
              }
              
              // Set token in axios headers
              apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              console.log('JWT token set in headers');
            } else {
              // Custom token format validation
              try {
                const tokenData = JSON.parse(atob(token));
                const now = new Date().getTime();
                const tokenAge = now - tokenData.timestamp;
                const isValid = tokenAge < 24 * 60 * 60 * 1000; // 24 hours

                if (!isValid) {
                  console.log('Custom token has expired');
                  localStorage.removeItem('token');
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('user');
                  localStorage.removeItem('adminUser');
                  setCurrentUser(null);
                  return;
                }

                // Set token in axios headers
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('Custom token set in headers');
              } catch (error) {
                console.error('Invalid custom token format:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('user');
                localStorage.removeItem('adminUser');
                setCurrentUser(null);
              }
            }
          } catch (err) {
            console.error('Error during auth initialization:', err);
            // If verification fails, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('user');
            localStorage.removeItem('adminUser');
            setCurrentUser(null);
            delete apiClient.defaults.headers.common['Authorization'];
          }
        } else {
          console.log('No valid auth data found in storage');
          setCurrentUser(null);
          delete apiClient.defaults.headers.common['Authorization'];
        }

        // Wait for state update to complete
        setTimeout(() => {
          const storedUser = JSON.parse(localStorage.getItem('user') || localStorage.getItem('adminUser') || 'null');
          console.log('=== AUTH INITIALIZATION COMPLETE ===');
          console.log('Final auth state:', {
            currentUser: storedUser,
            currentUserInState: currentUser,
            hasToken: !!apiClient.defaults.headers.common['Authorization']
          });
        }, 0);
      } catch (err) {
        console.error('Auth initialization failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');
        setCurrentUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      // Use adminLogin for admin login
      const response = await authService.adminLogin(credentials);
      
      if (response.token && response.user) {
        // Set token in headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        
        // Set user state
        setCurrentUser(response.user);
        
        // Save to localStorage (already done by authService._setAuthData)
      }
      
      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      return await authApi.register(userData);
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // User Registration
  const userRegister = async (userData) => {
    try {
      setLoading(true);
      return await authService.userRegister(userData);
    } catch (error) {
      setError(error.message || 'User registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // User Login
  const userLogin = async (credentials) => {
    try {
      console.log('=== LOGIN ATTEMPT START ===');
      setLoading(true);
      
      const response = await authService.userLogin(credentials);
      console.log('Login response:', {
        hasToken: !!response.token,
        tokenPreview: response.token ? `${response.token.substring(0, 20)}...` : null,
        user: response.user
      });
      
      if (response.token && response.user) {
        // Set token in headers
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        console.log('Token set in headers:', apiClient.defaults.headers.common['Authorization']);
        
        try {
          // Update user status to active
          await apiClient.put(`/api/users/${response.user.id}/status`, { active: true });
          console.log('User status updated to active');
          
          // Update the user object with active status
          response.user.active = true;
        } catch (error) {
          console.error('Failed to update user status:', error);
        }
        
        // Set user state
        setCurrentUser(response.user);
        console.log('Current user set:', response.user);
        
        // Save to localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('Data saved to localStorage');
      }

      console.log('=== LOGIN ATTEMPT COMPLETE ===');
      return response;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'User login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  

  // Verify OTP function
  const verifyOTP = async (email, code) => {
    try {
      setLoading(true);
      const response = await authService.verifyOTP(email, code);
      
      // If verification returns user info, update the current user
      if (response.user) {
        setCurrentUser(response.user);
      } else {
        // Try to get the user info from local storage
        const user = authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      }
      
      return response;
    } catch (error) {
      setError(error.message || 'OTP verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const resendOTP = async (email) => {
    try {
      setLoading(true);
      return await authService.resendOTP(email);
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('=== LOGOUT START ===');
      
      // Get current user ID before clearing data
      const userId = currentUser?.id;
      
      if (userId && currentUser?.role !== 'ADMIN') {
        try {
          // Update user status to inactive (not for admin users)
          await apiClient.put(`/api/users/${userId}/status`, { active: false });
          console.log('User status updated to inactive');
        } catch (error) {
          console.error('Failed to update user status:', error);
        }
      }

      // Clear auth header
      delete apiClient.defaults.headers.common['Authorization'];
      console.log('Auth header cleared');

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      localStorage.removeItem('adminUser');
      console.log('localStorage cleared');

      // Clear current user
      setCurrentUser(null);
      console.log('Current user cleared');

      console.log('=== LOGOUT COMPLETE ===');
      
      // Navigate to login
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear everything even if there's an error
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      localStorage.removeItem('adminUser');
      setCurrentUser(null);
      delete apiClient.defaults.headers.common['Authorization'];
      navigate('/auth/login');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    try {
      // Check if we have token and user data in storage
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const userStr = localStorage.getItem('user') || localStorage.getItem('adminUser');
      
      if (!token || !userStr) {
        return false;
      }
      
      // Parse user data
      const user = JSON.parse(userStr);
      if (!user) {
        return false;
      }
      
      // Validate token based on its type
      if (isJwtToken(token)) {
        // Validate JWT token
        const decoded = decodeJwt(token);
        if (!decoded) {
          return false;
        }
        
        // Check if JWT is expired
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          console.log('JWT token has expired during isAuthenticated check');
          return false;
        }
      } else {
        // Validate custom token
        try {
          const tokenData = JSON.parse(atob(token));
          const now = new Date().getTime();
          const tokenAge = now - tokenData.timestamp;
          if (tokenAge >= 24 * 60 * 60 * 1000) { // 24 hours
            console.log('Custom token has expired during isAuthenticated check');
            return false;
          }
        } catch (error) {
          console.error('Invalid token format in isAuthenticated:', error);
          return false;
        }
      }
      
      // Set token in axios headers if not already there
      if (!apiClient.defaults.headers.common['Authorization']) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      return true;
    } catch (error) {
      console.error('Error in isAuthenticated:', error);
      return false;
    }
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    userRegister,
    userLogin,
    logout,
    verifyOTP,
    resendOTP,
    isAuthenticated,
    updateCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 