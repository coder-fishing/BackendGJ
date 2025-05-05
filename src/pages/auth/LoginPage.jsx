import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt, FaFacebookF, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/auth.scss';

const LoginPage = () => {
  const location = useLocation();
  const { login, isAuthenticated, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // OAuth URLs
  const oauthUrls = {
    google: `http://localhost:8080/oauth2/authorization/google?redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}`,
    facebook: `http://localhost:8080/oauth2/authorization/facebook?redirect_uri=${encodeURIComponent(window.location.origin + '/oauth/callback')}`
  };

  // Check for redirect messages and OAuth callbacks
  useEffect(() => {
    // Check for OAuth callback tokens in URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('adminToken', token);
      
      // Get user info if available
      const userInfo = params.get('user');
      if (userInfo) {
        try {
          const user = JSON.parse(decodeURIComponent(userInfo));
          localStorage.setItem('adminUser', JSON.stringify(user));
        } catch (e) {
          console.error('Error parsing user info:', e);
        }
      }
      
      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
      return;
    }
    
    if (error) {
      setError(decodeURIComponent(error));
      return;
    }
    
    // Regular redirect message check
    if (location.state?.message) {
      setError(location.state.message);
    }

    // Check if already logged in
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
    
    if (authError) {
      setError(authError);
    }
  }, [location, navigate, isAuthenticated, authError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập');
      return;
    }

    try {
      setLoading(true);
      const result = await login(formData);
      
      setSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');

      // Debug localStorage after login
      console.log('========== LOGIN SUCCESS ==========');
      console.log('Login response:', result);
      console.log('Token after login:', localStorage.getItem('adminToken'));
      console.log('User after login:', localStorage.getItem('adminUser'));
      console.log('isAuthenticated:', isAuthenticated());
      console.log('=================================');
      
      // Force manual token saving if needed
      if (!localStorage.getItem('adminToken') && result.token) {
        console.log('Force saving token to localStorage');
        localStorage.setItem('adminToken', result.token);
        
        if (!localStorage.getItem('adminUser') && result.user) {
          localStorage.setItem('adminUser', JSON.stringify(result.user));
        }
      }
      
      // Navigate to dashboard after successful login
      setTimeout(() => {
        // Check token one more time before navigating
        console.log('Final check before navigation:');
        console.log('- Token:', localStorage.getItem('adminToken'));
        console.log('- User:', localStorage.getItem('adminUser'));
        console.log('- isAuthenticated:', isAuthenticated());
        
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect to OAuth endpoint
  const handleOAuthRedirect = (provider) => {
    window.location.href = oauthUrls[provider.toLowerCase()];
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đăng nhập Admin</h2>
          <p>Đăng nhập để quản lý hệ thống GoodJob</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {successMessage && <div className="auth-success">{successMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock /> Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading || socialLoading}
          >
            {loading ? 'Đang xử lý...' : (
              <>
                <FaSignInAlt /> Đăng nhập
              </>
            )}
          </button>
          
          {/* <div className="social-login-divider">
            <span>Hoặc đăng nhập bằng</span>
          </div>
          
          <div className="social-login-buttons">
            <a 
              href={oauthUrls.facebook}
              className="social-button facebook" 
            >
              <FaFacebookF /> Facebook
            </a>
            
            <a 
              href={oauthUrls.google}
              className="social-button google" 
            >
              <FaGoogle /> Google
            </a>
          </div> */}
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản? <Link to="/admin/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 