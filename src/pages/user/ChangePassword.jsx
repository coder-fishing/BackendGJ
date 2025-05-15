import React, { useState } from 'react';
import { FaLock } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import authService from '../../services/authService';
import '../../styles/auth.scss';

const ChangePassword = () => {
  const { currentUser } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validatePasswords = () => {
    if (!passwords.currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return false;
    }
    
    if (passwords.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return false;
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
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
      
      // Call API to change password using authService
      await authService.changePassword(
        currentUser.id, 
        passwords.currentPassword, 
        passwords.newPassword
      );
      
      setSuccess(true);
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.message || 'Không thể đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container change-password-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Đổi mật khẩu</h2>
          <p>Cập nhật mật khẩu của bạn</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Mật khẩu đã được cập nhật thành công!</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaLock /> Mật khẩu hiện tại
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>
              <FaLock /> Mật khẩu mới
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
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
              value={passwords.confirmPassword}
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
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword; 