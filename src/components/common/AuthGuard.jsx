import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../utils/AuthContext';

const AuthGuard = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAuth();

  // Add debugging
  console.log('AuthGuard - Current location:', location.pathname);
  console.log('AuthGuard - Is authenticated:', isAuthenticated());
  console.log('AuthGuard - Current user:', currentUser);
  console.log('AuthGuard - Admin token:', localStorage.getItem('adminToken'));

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    console.log('AuthGuard - Not authenticated, redirecting to login');
    return <Navigate to="/admin/login" state={{ message: 'Vui lòng đăng nhập để tiếp tục.', from: location }} replace />;
  }

  console.log('AuthGuard - Authentication successful, rendering children');
  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthGuard; 