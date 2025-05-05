import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaCheck, FaRedo } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/auth.scss';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP, isAuthenticated, error: authError } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const emailFromParam = searchParams.get('email');

  const [email, setEmail] = useState(emailFromParam || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      setError('Email không được cung cấp. Vui lòng quay lại trang đăng ký.');
    } 

    // Redirect if already logged in
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
    
    if (authError) {
      setError(authError);
    }
  }, [email, navigate, isAuthenticated, authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !verificationCode) {
      setError('Vui lòng nhập mã xác thực');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOTP(email, verificationCode);
      
      setVerificationSuccess(true);
      
      // Check if the user is now authenticated
      if (response.token || isAuthenticated()) {
        // Redirect to dashboard after successful verification if authenticated
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Otherwise redirect to login page
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Xác thực thất bại. Vui lòng kiểm tra lại mã xác thực.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      if (!email || email.trim() === '') {
        setError('Email là bắt buộc để gửi lại mã OTP');
        return;
      }
      
      setResending(true);
      setError('');
      
      // Call the resendOTP function from AuthContext
      await resendOTP(email);
      
      setResending(false);
      alert('Mã OTP mới đã được gửi đến email của bạn.');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.');
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Xác thực Tài khoản</h2>
          <p>Nhập mã OTP đã được gửi đến email của bạn</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {verificationSuccess && (
          <div className="auth-success">
            Xác thực thành công! Đang chuyển hướng đến trang đăng nhập...
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              disabled={!!emailFromParam}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="verificationCode">
              <FaCheck /> Mã xác thực
            </label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Nhập mã OTP"
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading || !email}
          >
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </button>

          <button 
            type="button" 
            className="auth-button secondary" 
            onClick={handleResendOTP}
            disabled={resending || !email}
          >
            {resending ? 'Đang gửi...' : (
              <>
                <FaRedo /> Gửi lại mã OTP
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/admin/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage; 