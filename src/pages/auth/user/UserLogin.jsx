import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../../../utils/AuthContext';
import axios from 'axios';
import '../../../styles/auth.scss';

const UserLogin = () => {
  const navigate = useNavigate();
  const { userLogin } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    if (error) setError('');
  };

  const checkEmployerStatus = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/employers/${userId}`);
      
      // Nếu có dữ liệu và không phải là { exists: false }, return true
      return response.data && response.data.exists !== false;
    } catch (error) {
      console.error('Error checking employer status:', error);
      // Nếu lỗi 404 hoặc không có dữ liệu, trả về false
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await userLogin(credentials);
      
      // Set user status to active before redirecting
      try {
        await axios.put(`http://localhost:8080/api/users/${response.user.id}/status`, {
          active: true
        });
        console.log('User status set to active');
      } catch (err) {
        console.error('Failed to update user status:', err);
      }

      if (response.user?.role === 'EMPLOYER') {
        // Kiểm tra trạng thái employer
        const hasEmployerInfo = await checkEmployerStatus(response.user.id);
        console.log('Employer status check:', hasEmployerInfo);
        
        if (!hasEmployerInfo) {
          navigate(`/employer/setup?userId=${response.user.id}`);
        } else {
          navigate('/employer/dashboard');
        }
      } else {
        navigate('/user/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đăng nhập qua Google
  const handleGoogleLogin = () => {
    setSocialLoading('google');
    try {
      window.location.href = `http://localhost:8080/oauth2/authorization/google?redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}`;
    } catch (error) {
      console.error('Google login error:', error);
      setError('Đăng nhập qua Google thất bại');
      setSocialLoading('');
    }
  };

  // Hàm xử lý đăng nhập qua Facebook
  const handleFacebookLogin = () => {
    setSocialLoading('facebook');
    try {
      window.location.href = `http://localhost:8080/oauth2/authorization/facebook?redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}`;
    } catch (error) {
      console.error('Facebook login error:', error);
      setError('Đăng nhập qua Facebook thất bại');
      setSocialLoading('');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng nhập</h2>
          <p>Đăng nhập để tiếp tục sử dụng hệ thống</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaEnvelope /> Username
            </label>
            <input
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Nhập username"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading || !!socialLoading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>

          <div className="auth-links">
            <Link to="/user/forgot-password">Quên mật khẩu?</Link>
            <Link to="/user/register">Chưa có tài khoản? Đăng ký ngay</Link>
          </div>
        </form>

        <div className="auth-divider">
          <span>hoặc đăng nhập với</span>
        </div>

        <div className="social-login-buttons">
          <button 
            type="button" 
            className="social-button google-button"
            onClick={handleGoogleLogin}
            disabled={loading || !!socialLoading}
          >
            <FaGoogle className="google-icon" />
            <span>{socialLoading === 'google' ? 'Đang xử lý...' : 'Google'}</span>
          </button>
          <button 
            type="button" 
            className="social-button facebook-button"
            onClick={handleFacebookLogin}
            disabled={loading || !!socialLoading}
          >
            <FaFacebook />
            <span>{socialLoading === 'facebook' ? 'Đang xử lý...' : 'Facebook'}</span>
          </button>
        </div>

        <div className="auth-divider">
          <span>hoặc</span>
        </div>

        <button 
          type="button" 
          className="switch-auth-button"
          onClick={() => navigate('/auth/login')}
        >
          Đăng nhập dành cho Admin
        </button>
      </div>
    </div>
  );
};

export default UserLogin; 