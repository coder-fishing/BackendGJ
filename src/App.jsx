// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import AuthGuard from './components/common/AuthGuard';
import DashboardPage from './pages/DashboardPage';
import JobListPage from './pages/JobListPage';
import JobFormPage from './pages/JobFormPage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';
import { LoginPage, RegisterPage, VerifyOTPPage, OAuthCallbackPage } from './pages/auth';
import { NotificationProvider } from './utils/NotificationContext';
import AuthProvider from './utils/AuthContext';

// Higher-order component to wrap routes with AuthProvider
const AuthProviderWithRouter = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

function App() {
  return (
    <NotificationProvider>
      <AuthProviderWithRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/register" element={<RegisterPage />} />
          <Route path="/admin/verify" element={<VerifyOTPPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Job routes với các tab trạng thái */}
            <Route path="jobs">
              <Route index element={<JobListPage />} />
              <Route path="add" element={<JobFormPage />} />
              <Route path="edit/:id" element={<JobFormPage />} />
              <Route path="status/:status" element={<JobListPage />} />
            </Route>
            
            {/* Notifications route */}
            <Route path="notifications" element={<NotificationsPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProviderWithRouter>
    </NotificationProvider>
  );
}

export default App;