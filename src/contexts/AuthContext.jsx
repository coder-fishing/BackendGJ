import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const 
useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Không thể khởi tạo trạng thái xác thực');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // User Authentication
  const userRegister = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.userRegister(userData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const userLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.userLogin(credentials);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin Authentication
  const adminRegister = async (adminData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.adminRegister(adminData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.adminLogin(credentials);
      setUser(result.user);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Common Authentication Functions
  const verifyOTP = async (email, code, isAdmin = false) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.verifyOTP(email, code, isAdmin);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const result = await authService.resendOTP(email);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/auth/login');
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: authService.isAdmin(),
    userRegister,
    userLogin,
    adminRegister,
    adminLogin,
    verifyOTP,
    resendOTP,
    logout
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 