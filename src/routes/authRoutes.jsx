import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import UserRegister from '../pages/auth/user/UserRegister';
import VerifyOTP from '../pages/auth/user/VerifyOTP';
import Login from '../pages/auth/user/Login';
import { useAuth } from '../contexts/AuthContext';

// HOC để bảo vệ admin routes
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth/admin/login" />;
  }
  if (!isAdmin) {
    return <Navigate to="/unauthorized" />;
  }
  return children;
};

// HOC để bảo vệ user/employer routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

// HOC cho public routes - chuyển hướng nếu đã đăng nhập
const PublicAuthRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" />;
    }
    return <Navigate to={user?.role === 'EMPLOYER' ? '/employer/dashboard' : '/user/dashboard'} />;
  }
  
  return children;
};

const AuthRoutes = () => {
  return (
    <Routes>
      {/* Public authentication routes */}
      <Route
        path="/register"
        element={
          <PublicAuthRoute>
            <UserRegister />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/verify"
        element={
          <PublicAuthRoute>
            <VerifyOTP />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <Login />
          </PublicAuthRoute>
        }
      />

      {/* Admin authentication - chỉ dùng cho đăng nhập admin */}
      <Route
        path="/admin/login"
        element={
          <PublicAuthRoute>
            <AdminLogin />
          </PublicAuthRoute>
        }
      />

      {/* Redirect auth root to login */}
      <Route
        path="/"
        element={<Navigate to="/auth/login" />}
      />
    </Routes>
  );
};

export default AuthRoutes; 