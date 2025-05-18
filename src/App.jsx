// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import AuthGuard from './components/common/AuthGuard';
import DashboardPage from './pages/admin/DashboardPage';
import JobListPage from './pages/admin/JobListPage';
import JobFormPage from './pages/admin/JobFormPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import UserManagement from './components/admin/UserManagement';
import NotFoundPage from './pages/NotFoundPage';
import { LoginPage, RegisterPage, VerifyOTPPage, OAuthCallbackPage } from './pages/auth';
import { UserRegister } from './pages/auth/user';
import UserLogin from './pages/auth/user/UserLogin';
import ForgotPassword from './pages/auth/user/ForgotPassword';
import ResetPassword from './pages/auth/user/ResetPassword';
import EmployerSetup from './pages/employer/EmployerSetup';
import { NotificationProvider } from './utils/NotificationContext';
import AuthProvider from './utils/AuthContext';
import WebSocketProvider from './utils/WebSocketContext';
import JobDashboard from './pages/employer/JobDashboard';
import PostJob from './components/employer/PostJob';
import EmployerLayout from './components/employer/EmployerLayout';
import JobExpirationChecker from './components/job/JobExpirationChecker';
import ApplicationManagement from './components/employer/ApplicationManagement';
import EmployerProfile from './components/employer/EmployerProfile';
import OAuthCallback from './pages/auth/OAuthCallback';
import UserDashboard from './pages/user/DashBoard';
import UserLayout from './components/user/UserLayout';
import ChangePassword from './pages/user/ChangePassword';
import EditJobForm from './components/employer/EditJobForm';
import EmployerSetting from './pages/employer/EmployerSetting';
import Modal from 'react-modal';
import JobList from './components/JobList';
import SavedJobs from './pages/user/SavedJobs';
import AppliedJobs from './pages/user/AppliedJobs';
import UserProfile from './components/user/UserProfile';

// Set the app element for react-modal
Modal.setAppElement('#root');

const AuthProviderWithRouter = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

const App = () => {
  return (
    <AuthProviderWithRouter>
      <NotificationProvider>
        <JobExpirationChecker />
        <Routes>
          {/* OAuth Callback route - outside of protected routes */}
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          
          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/main" replace />} />
            <Route path="main" element={<UserDashboard />} />
          </Route>

          {/* Auth routes - public */}
          <Route path="/auth">
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="verify" element={<VerifyOTPPage />} />
            <Route path="oauth/callback" element={<OAuthCallback />} />
          </Route>

          {/* User auth routes - public */}
          <Route path="/user">
            <Route path="login" element={<UserLogin />} />
            <Route path="register" element={<UserRegister />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>

          {/* Admin routes - protected */}
          <Route element={<AuthGuard requireRole="ADMIN" />}>
            <Route path="/admin" element={<Layout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<UserManagement />} />
              <Route path="jobs">
                <Route index element={<JobListPage />} />
                <Route path="add" element={<JobFormPage />} />
                <Route path="edit/:id" element={<JobFormPage />} />
                <Route path="status/:status" element={<JobListPage />} />
              </Route>
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* Employer routes - protected */}
          <Route element={<AuthGuard requireRole="ROLE_EMPLOYER" />}>
            <Route path="/employer" element={<EmployerLayout />}>
              <Route index element={<Navigate to="/employer/dashboard" replace />} />
              <Route path="dashboard" element={<JobDashboard />} />
              <Route path="post-job" element={<PostJob />} />
              <Route path="jobs/edit/:id" element={<EditJobForm />} />
              <Route path="my-jobs" element={<JobDashboard />} />
              <Route path="setup" element={<EmployerSetup />} />
              <Route path="applications" element={<ApplicationManagement />} />
              <Route path="profile" element={<EmployerProfile />} />
              <Route path="setting" element={<EmployerSetting />} />
            </Route>
          </Route>

          {/* User routes - protected */}
          <Route element={<AuthGuard requireRole="ROLE_USER" />}>
            <Route path="/user" element={<UserLayout />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="jobs" element={<JobList />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="saved-jobs" element={<SavedJobs />} />
              <Route path="applications" element={<AppliedJobs />} />
              <Route path="notifications" element={<div>Notifications Page</div>} />
              <Route path="settings" element={<div>Settings Page</div>} />
            </Route>
          </Route>

          {/* Not found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </NotificationProvider>
    </AuthProviderWithRouter>
  );
};

export default App;