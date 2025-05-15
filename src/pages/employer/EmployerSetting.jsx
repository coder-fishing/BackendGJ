import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import { FaUser, FaPhone, FaUpload, FaTimes, FaCamera, FaKey } from 'react-icons/fa';
import NotificationModal from '../../components/common/NotificationModal';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import uploadToCloudinary from '../../utils/uploadImage';
import './EmployerSetting.scss';

const PasswordChangeModal = ({ isOpen, onClose, onSubmit, error }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(passwordData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Đổi mật khẩu</h3>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu mới"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="change-password-btn">
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployerSetting = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);

  const [userData, setUserData] = useState({
    fullName: '',
    phoneNumber: '',
    avatarUrl: '',
    bio: ''
  });

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserData();
      checkLoginType();
    }
  }, [currentUser]);

  const checkLoginType = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${currentUser.id}/login-type`);
      setIsGoogleLogin(response.data.loginType === 'google');
    } catch (err) {
      console.error('Error checking login type:', err);
      // Default to allowing password change if we can't determine login type
      setIsGoogleLogin(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/users/${currentUser.id}`);
      const user = response.data;
      
      setUserData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || ''
      });
    } catch (err) {
      setNotification({
        message: 'Không thể tải thông tin người dùng',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        message: 'Kích thước file không được vượt quá 5MB',
        type: 'error'
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setNotification({
        message: 'Vui lòng chọn file hình ảnh',
        type: 'error'
      });
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      
      setUserData(prev => ({
        ...prev,
        avatarUrl: imageUrl
      }));

      // Automatically update the user's avatar in the backend
      await axios.put(`http://localhost:8080/api/users/${currentUser.id}`, {
        ...userData,
        avatarUrl: imageUrl
      });

      setNotification({
        message: 'Tải ảnh lên thành công!',
        type: 'success'
      });
    } catch (err) {
      console.error('Error uploading image:', err);
      setNotification({
        message: 'Không thể tải lên ảnh. Vui lòng thử lại.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.put(`http://localhost:8080/api/users/${currentUser.id}`, userData);
      setNotification({
        message: 'Cập nhật thông tin thành công!',
        type: 'success'
      });
    } catch (err) {
      setNotification({
        message: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (passwordData) => {
    if (isGoogleLogin) {
      setPasswordError('Tài khoản đang sử dụng đăng nhập bằng Google không thể đổi mật khẩu.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8080/api/users/${currentUser.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      if (response.data) {
        setNotification({
          message: 'Đổi mật khẩu thành công!',
          type: 'success'
        });
        setIsPasswordModalOpen(false);
        setPasswordError(null);
      }
    } catch (err) {
      console.error('Password change error:', err.response?.data);
      setPasswordError(
        err.response?.data?.message || 
        'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.'
      );
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="employer-settings">
      {isLoading && <LoadingOverlay />}
      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="header">
        <h2>Cài đặt tài khoản</h2>
        <p className="subtitle">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="settings-container">
        <div className="settings-section">
          <form onSubmit={handleUpdateUser}>
            <div className="avatar-section">
              <div className="avatar-preview">
                {userData.avatarUrl ? (
                  <>
                    <img src={userData.avatarUrl} alt="Avatar" />
                    <div className="avatar-overlay">
                      <label htmlFor="avatar" className="avatar-icon">
                        <FaCamera />
                      </label>
                      <button 
                        type="button" 
                        className="avatar-icon"
                        onClick={() => {
                          setUserData(prev => ({ ...prev, avatarUrl: '' }));
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="avatar-placeholder">
                    <label htmlFor="avatar" className="upload-placeholder">
                      <FaUser />
                      <span>Tải lên ảnh</span>
                    </label>
                  </div>
                )}
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">
                <FaUser className="icon" />
                Họ và tên
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={userData.fullName}
                onChange={handleUserInputChange}
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">
                <FaPhone className="icon" />
                Số điện thoại
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={userData.phoneNumber}
                onChange={handleUserInputChange}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">
                <FaUser className="icon" />
                Giới thiệu bản thân
              </label>
              <textarea
                id="bio"
                name="bio"
                value={userData.bio}
                onChange={handleUserInputChange}
                placeholder="Nhập thông tin giới thiệu bản thân"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              {!isGoogleLogin && (
                <button 
                  type="button" 
                  className="change-password-btn"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  <FaKey className="icon" />
                  Đổi mật khẩu
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
        error={passwordError}
      />
    </div>
  );
};

export default EmployerSetting;