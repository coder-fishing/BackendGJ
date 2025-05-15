import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.scss';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState({
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8080/api/auth/reset-password/request', { email });
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess(false);

    try {
      await axios.post('http://localhost:8080/api/auth/reset-password/request', { email });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (verificationData.newPassword !== verificationData.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    if (verificationData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:8080/api/auth/reset-password/verify', {
        email: email,
        verificationCode: verificationData.verificationCode,
        newPassword: verificationData.newPassword
      });
      
      // Redirect to login page with success message
      navigate('/user/login', { 
        state: { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleVerificationInputChange = (e) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>Quên mật khẩu</h2>
        {error && <div className="auth-error">{error}</div>}
        {resendSuccess && <div className="auth-success">Đã gửi lại mã xác thực!</div>}
        
        {success ? (
          <form onSubmit={handleVerificationSubmit} className="auth-form">
            <div className="form-group">
              <label>Mã xác nhận</label>
              <div className="verification-code-group">
                <input
                  type="text"
                  name="verificationCode"
                  value={verificationData.verificationCode}
                  onChange={handleVerificationInputChange}
                  placeholder="Nhập mã xác nhận từ email"
                  required
                />
                <button 
                  type="button" 
                  className="resend-button"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Đang gửi...' : 'Gửi lại mã'}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={verificationData.newPassword}
                onChange={handleVerificationInputChange}
                placeholder="Nhập mật khẩu mới"
                required
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={verificationData.confirmPassword}
                onChange={handleVerificationInputChange}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
            <div className="auth-links">
              <Link to="/user/login">Quay lại đăng nhập</Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
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

export default ForgotPassword; 