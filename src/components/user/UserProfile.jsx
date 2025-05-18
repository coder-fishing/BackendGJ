import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import { FaUser, FaPhone, FaUpload, FaSpinner, FaEdit, FaTimes } from 'react-icons/fa';
import uploadToCloudinary from '../../utils/uploadImage';
import NotificationModal from '../common/NotificationModal';
import LoadingOverlay from '../common/LoadingOverlay';
import './UserProfile.scss';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    avatarUrl: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserProfile();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/users/${currentUser.id}`);
      
      if (!response.data) {
        setError('Chưa có thông tin người dùng. Vui lòng thiết lập thông tin.');
        return;
      }

      let userData = response.data;
      
      setFormData({
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        avatarUrl: userData.avatarUrl || '',
        bio: userData.bio || ''
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        avatarUrl: imageUrl
      }));
    } catch (err) {
      setError('Không thể tải lên ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatarUrl: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await axios.put(`http://localhost:8080/api/users/${currentUser.id}`, formData);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);

      setNotification({
        message: 'Thông tin cá nhân đã được cập nhật thành công!',
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
      setNotification({
        message: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
        type: 'error'
      });
    } finally {
      setSaving(false);
      setIsLoading(false);
    }
  };

  const renderAvatarSection = () => (
    <div className="avatar-section">
      <h4>Ảnh đại diện</h4>
      <input
        type="file"
        id="avatarUrl"
        accept="image/*"
        onChange={handleAvatarUpload}
        style={{ display: 'none' }}
      />
      <div className="avatar-preview-container">
        {formData.avatarUrl ? (
          <div className="avatar-preview">
            <img 
              src={formData.avatarUrl} 
              alt="Avatar" 
              onClick={() => setShowPreview(true)}
            />
            <div className="image-overlay">
              <FaEdit onClick={() => document.getElementById('avatarUrl').click()} />
              <FaTimes onClick={handleRemoveAvatar} />
            </div>
          </div>
        ) : (
          <div 
            className="upload-placeholder"
            onClick={() => document.getElementById('avatarUrl').click()}
          >
            {uploading ? (
              <>
                <FaSpinner className="spin" />
                <span>Đang tải lên...</span>
              </>
            ) : (
              <>
                <FaUpload />
                <span>Tải lên ảnh đại diện</span>
                <small>Kéo thả hoặc click để chọn (Tối đa 5MB)</small>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewModal = () => (
    showPreview && formData.avatarUrl && (
      <div className="preview-overlay" onClick={() => setShowPreview(false)}>
        <div className="preview-content" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
          <img src={formData.avatarUrl} alt="Avatar Preview" />
        </div>
      </div>
    )
  );

  if (loading) return <div className="loading">Đang tải thông tin cá nhân...</div>;

  return (
    <div className="user-profile">
      {renderPreviewModal()}
      {isLoading && <LoadingOverlay />}
      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="header">
        <h2>Thông tin cá nhân</h2>
        <p className="subtitle">Cập nhật thông tin cá nhân của bạn</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Cập nhật thông tin thành công!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-sections">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            {renderAvatarSection()}

            <div className="form-group">
              <label htmlFor="fullName">
                <FaUser className="icon" />
                Họ và tên
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
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
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
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
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Giới thiệu ngắn về bản thân"
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving || uploading}>
            {saving ? (
              <>
                <div className="loading-spinner"></div>
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile; 