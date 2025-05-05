import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/auth.scss';

const OAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState('Đang xử lý đăng nhập...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Process the callback from OAuth provider
    const processOAuthCallback = async () => {
      try {
        // Extract token and user info from URL
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');
        const userInfo = urlParams.get('user');

        if (error) {
          setIsError(true);
          setMessage(`Lỗi đăng nhập: ${decodeURIComponent(error)}`);
          return;
        }

        if (!token) {
          setIsError(true);
          setMessage('Không tìm thấy token xác thực. Vui lòng thử lại.');
          return;
        }

        // Store token in localStorage
        localStorage.setItem('adminToken', token);
        console.log('Token saved:', token);

        // Store user info if available
        if (userInfo) {
          try {
            const user = JSON.parse(decodeURIComponent(userInfo));
            localStorage.setItem('adminUser', JSON.stringify(user));
            console.log('User info saved:', user);
          } catch (e) {
            console.error('Error parsing user info:', e);
          }
        }

        // Success message
        setMessage('Đăng nhập thành công! Đang chuyển hướng đến trang quản trị...');

        // After a short delay, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err) {
        console.error('OAuth callback processing error:', err);
        setIsError(true);
        setMessage('Đã xảy ra lỗi trong quá trình xử lý đăng nhập. Vui lòng thử lại.');
      }
    };

    processOAuthCallback();
  }, [location, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isError ? 'Lỗi Đăng Nhập' : 'Đăng Nhập Thành Công'}</h2>
        </div>

        <div className={isError ? 'auth-error' : 'auth-success'}>
          {message}
        </div>

        {isError && (
          <div className="auth-footer">
            <button 
              className="auth-button" 
              onClick={() => navigate('/admin/login')}
            >
              Quay lại trang đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage; 