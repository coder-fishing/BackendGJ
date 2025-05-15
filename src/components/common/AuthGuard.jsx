import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../utils/AuthContext';

const AuthGuard = ({ requireRole }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper function to decode and check JWT token
  const decodeJwt = (token) => {
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      // Decode the payload (middle part)
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
        const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('adminUser') || 'null');

        console.log('Auth verification:', { 
          hasToken: !!token, 
          hasUser: !!user,
          tokenPreview: token ? `${token.substring(0, 15)}...` : null,
          userRole: user?.role
        });

        if (!token || !user) {
          console.log('No token or user found');
          setIsAuthenticated(false);
          return;
        }

        // Check if token is a JWT (from OAuth) or a custom token
        if (token.split('.').length === 3) {
          // JWT token format
          const decoded = decodeJwt(token);
          if (!decoded) {
            console.log('Invalid JWT token format');
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('user');
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
            return;
          }
          
          // Check expiration
          const now = Math.floor(Date.now() / 1000);
          if (decoded.exp && decoded.exp < now) {
            console.log('JWT token has expired');
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('user');
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
            return;
          }
          
          setIsAuthenticated(true);
        } else {
          // Custom token format (your app's format)
          try {
            const tokenData = JSON.parse(atob(token));
            const now = new Date().getTime();
            const tokenAge = now - tokenData.timestamp;
            const isValid = tokenAge < 24 * 60 * 60 * 1000; // 24 hours

            if (!isValid) {
              console.log('Token has expired');
              localStorage.removeItem('token');
              localStorage.removeItem('adminToken');
              localStorage.removeItem('user');
              localStorage.removeItem('adminUser');
              setIsAuthenticated(false);
              return;
            }

            setIsAuthenticated(true);
          } catch (e) {
            console.error('Invalid token format:', e);
            localStorage.removeItem('token');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('user');
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, []);

  if (isVerifying) {
    // Show a loading indicator while verifying
    return (
      <div className="auth-verifying-container">
        <div className="auth-verifying-spinner"></div>
        <p>Đang xác thực...</p>
      </div>
    );
  }

  // Debug logging
  console.log('AuthGuard State:', {
    path: location.pathname,
    isAuthenticated,
    currentUser,
    requireRole,
    userFromStorage: JSON.parse(localStorage.getItem('user') || localStorage.getItem('adminUser') || 'null')
  });

  // Check authentication
  if (!isAuthenticated || !currentUser) {
    // Save the attempted URL
    return <Navigate 
      to="/user/login" 
      state={{ from: location.pathname, message: 'Vui lòng đăng nhập để tiếp tục.' }} 
      replace 
    />;
  }

  // Check role if required
  const userRole = currentUser?.role || '';
  console.log('Role check:', { userRole, requireRole });
  
  // Handle role comparison in a more flexible way
  const roleMatches = () => {
    // If no role required, allow access
    if (!requireRole) return true;
    
    // Direct match
    if (userRole === requireRole) return true;
    
    // Handle ROLE_ prefix cases
    if (requireRole === 'EMPLOYER' && userRole === 'ROLE_EMPLOYER') return true;
    if (requireRole === 'ROLE_EMPLOYER' && userRole === 'EMPLOYER') return true;
    
    if (requireRole === 'USER' && userRole === 'ROLE_USER') return true;
    if (requireRole === 'ROLE_USER' && userRole === 'USER') return true;
    
    if (requireRole === 'ADMIN' && userRole === 'ROLE_ADMIN') return true;
    if (requireRole === 'ROLE_ADMIN' && userRole === 'ADMIN') return true;
    
    return false;
  };
  
  console.log('Role match result:', roleMatches());
  
  if (requireRole && !roleMatches()) {
    // Redirect based on actual role
    let redirectPath = '/user/login';
    
    if (userRole === 'ROLE_EMPLOYER' || userRole === 'EMPLOYER') {
      redirectPath = '/employer/dashboard';
    } else if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
      redirectPath = '/admin/dashboard';
    } else if (userRole === 'ROLE_USER' || userRole === 'USER') {
      redirectPath = '/user/dashboard';
    } else {
      redirectPath = '/jobs';
    }
    
    console.log(`Redirecting to ${redirectPath} due to role mismatch`);
    
    return <Navigate 
      to={redirectPath}
      state={{ message: 'Bạn không có quyền truy cập trang này.' }} 
      replace 
    />;
  }

  return <Outlet />;
};

AuthGuard.propTypes = {
  requireRole: PropTypes.string
};

export default AuthGuard; 