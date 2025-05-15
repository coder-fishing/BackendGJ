import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import '../../../styles/auth.scss';
import authService from '../../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({
    password: '',
    confirmPassword: ''
  });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get('token');
    
    if (!resetToken) {
      setError('Token không hợp lệ hoặc đã hết hạn');
    } else {
      setToken(resetToken);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validatePasswords = () => {
    if (credentials.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    
    if (credentials.password !== credentials.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call the API to reset password
      await authService.resetPassword(token, credentials.password);
      
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/user/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Đặt lại mật khẩu</h2>
          </div>
          <div className="auth-error">
            <p>Token không hợp lệ hoặc đã hết hạn.</p>
            <p>Vui lòng yêu cầu đặt lại mật khẩu mới.</p>
          </div>
          <div className="auth-links">
            <Link to="/user/forgot-password">Yêu cầu đặt lại mật khẩu</Link>
            <Link to="/user/login">Quay lại đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đặt lại mật khẩu</h2>
          <p>Nhập mật khẩu mới của bạn</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        
        {success ? (
          <div className="auth-success">
            <p>Mật khẩu đã được đặt lại thành công!</p>
            <p>Bạn sẽ được chuyển đến trang đăng nhập trong vài giây...</p>
            <div className="auth-links">
              <Link to="/user/login">Đăng nhập ngay</Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FaLock /> Mật khẩu mới
              </label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>
                <FaLock /> Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={credentials.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>

            <div className="auth-links">
              <Link to="/user/login">Quay lại đăng nhập</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 