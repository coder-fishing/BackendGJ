import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../services/authApi';
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
        console.log('Initializing authentication state...');
        
        // Check if token exists
        const token = localStorage.getItem('adminToken');
        console.log('Token found in localStorage:', !!token);
        
        if (token) {
          // Set token in axios headers
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('Set token in Authorization header');
        }
        
        // Try to get user from localStorage
        const userStr = localStorage.getItem('adminUser');
        console.log('User data in localStorage:', !!userStr);
        
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            console.log('Loaded user from localStorage:', user);
            setCurrentUser(user);
          } catch (err) {
            console.error('Error parsing user JSON:', err);
            localStorage.removeItem('adminUser');
          }
        } else {
          console.log('No user data in localStorage');
        }
        
        console.log('Auth initialization complete');
        authApi.debugLocalStorage();
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError('Failed to retrieve authentication state');
      } finally {
        setLoading(false);
      }
    };

    if (storageAvailable) {
      initializeAuth();
    } else {
      setLoading(false);
    }
  }, [storageAvailable]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authApi.login(credentials);
      setCurrentUser(response.user);
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

  // Verify OTP function
  const verifyOTP = async (email, code) => {
    try {
      setLoading(true);
      const response = await authApi.verifyOTP(email, code);
      
      // If verification returns user info, update the current user
      if (response.user) {
        setCurrentUser(response.user);
      } else {
        // Try to get the user info from local storage
        const user = authApi.getCurrentUser();
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
      return await authApi.resendOTP(email);
    } catch (error) {
      setError(error.message || 'Failed to resend OTP');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authApi.logout();
    setCurrentUser(null);
    navigate('/admin/login');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    const hasToken = !!localStorage.getItem('adminToken');
    const hasUser = !!currentUser || !!localStorage.getItem('adminUser');
    
    console.log('isAuthenticated check:');
    console.log('- Has token:', hasToken);
    console.log('- Has user in state:', !!currentUser);
    console.log('- Has user in localStorage:', !!localStorage.getItem('adminUser'));
    
    // If we have a token but no user in state, try to load it
    if (hasToken && !currentUser && localStorage.getItem('adminUser')) {
      try {
        const userStr = localStorage.getItem('adminUser');
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        console.log('- Loaded user from localStorage:', user);
      } catch (err) {
        console.error('- Failed to parse user from localStorage:', err);
      }
    }
    
    return hasToken && hasUser;
  };

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    verifyOTP,
    resendOTP,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 