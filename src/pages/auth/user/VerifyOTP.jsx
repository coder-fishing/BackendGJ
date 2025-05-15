import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaKey } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../styles/auth.scss';

const VerifyOTP = () => {
  const { verifyOTP, resendOTP, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('registerEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await verifyOTP(email, otp);
      
      setSuccessMessage('Xác thực thành công! Đang chuyển hướng...');
      localStorage.removeItem('registerEmail');
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await resendOTP(email);
      
      setSuccessMessage('Mã OTP mới đã được gửi đến email của bạn');
      setResendDisabled(true);
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Xác thực tài khoản</h2>
          <p>Nhập mã OTP đã được gửi đến email của bạn</p>
        </div>

        {(error || authError) && (
          <div className="auth-error">{error || authError}</div>
        )}
        {successMessage && (
          <div className="auth-success">{successMessage}</div>
        )}

        <form className="auth-form" onSubmit={handleVerify}>
          <div className="form-group">
            <label>
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <FaKey /> Mã OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Xác thực'}
          </button>

          <button
            type="button"
            className="auth-button secondary"
            onClick={handleResendOTP}
            disabled={loading || resendDisabled}
          >
            {resendDisabled 
              ? `Gửi lại sau ${countdown}s` 
              : 'Gửi lại mã OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP; 