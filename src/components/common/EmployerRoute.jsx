import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const EmployerRoute = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirect to the new unified login path
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (currentUser?.role !== 'EMPLOYER') {
    // Redirect to home if not an employer
    return <Navigate to="/" state={{ 
      error: 'Bạn không có quyền truy cập trang này. Chỉ dành cho nhà tuyển dụng.' 
    }} replace />;
  }

  return children;
};

export default EmployerRoute; 