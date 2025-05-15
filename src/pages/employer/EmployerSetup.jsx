import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaGlobe, FaImage, FaMapMarkerAlt, FaPhone, FaUsers, FaIndustry, FaIdCard } from 'react-icons/fa';
import employerService from '../../services/employerService';
import uploadToCloudinary from '../../utils/uploadImage';
import NotificationModal from '../../components/common/NotificationModal';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import './EmployerSetup.scss';

const EmployerSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    companyLogo: '',
    companyAddress: '',
    companySize: '',
    industry: '',
    taxCode: '',
    contactPhone: '',
    socialLinks: JSON.stringify({facebook: '', linkedin: ''})
  });

  useEffect(() => {
    // Get userId from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const { id } = JSON.parse(user);
      if (id) {
        setUserId(id);
      } else {
        navigate('/auth/login');
      }
    } else {
      navigate('/auth/login');
    }
  }, [navigate]);

  useEffect(() => {
    const checkEmployer = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const employer = await employerService.checkEmployerExists(userId);
        if (employer) {
          navigate('/employer/dashboard');
        }
      } catch (err) {
        setError('Không thể kiểm tra thông tin công ty. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    checkEmployer();
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'Kích thước file không được vượt quá 5MB'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setNotification({
        type: 'error',
        message: 'Vui lòng chọn file hình ảnh'
      });
      return;
    }

    try {
      // setLoading(true);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
      
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        companyLogo: imageUrl
      }));
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Không thể tải lên logo. Vui lòng thử lại.'
      });
    } finally {
      // setLoading(false);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setNotification({
        type: 'error',
        message: 'Vui lòng đăng nhập lại để tiếp tục'
      });
      navigate('/auth/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await employerService.setupEmployer(userId, formData);
      setNotification({
        type: 'success',
        message: 'Thiết lập thông tin công ty thành công!'
      });
      navigate('/employer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thiết lập thông tin công ty');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="employer-setup-container">
      {notification && (
        <NotificationModal
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="setup-header">
        <h2>Thiết lập thông tin công ty</h2>
        <p>Vui lòng cung cấp thông tin chi tiết về công ty của bạn</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>
              <FaBuilding /> Tên công ty
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Nhập tên công ty"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaGlobe /> Website
            </label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label>
              <FaMapMarkerAlt /> Địa chỉ
            </label>
            <input
              type="text"
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="Nhập địa chỉ công ty"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaPhone /> Số điện thoại
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại liên hệ"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaUsers /> Quy mô công ty
            </label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              required
            >
              <option value="">Chọn quy mô công ty</option>
              <option value="1-10">1-10 nhân viên</option>
              <option value="11-50">11-50 nhân viên</option>
              <option value="51-200">51-200 nhân viên</option>
              <option value="201-500">201-500 nhân viên</option>
              <option value="501+">501+ nhân viên</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <FaIndustry /> Ngành nghề
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="Nhập lĩnh vực hoạt động"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaIdCard /> Mã số thuế
            </label>
            <input
              type="text"
              name="taxCode"
              value={formData.taxCode}
              onChange={handleChange}
              placeholder="Nhập mã số thuế"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>
              <FaImage /> Logo công ty
            </label>
            <div className="logo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="file-input"
                id="logo-input"
              />
              <div 
                className="logo-preview"
                onClick={() => document.getElementById('logo-input').click()}
              >
                {previewImage || formData.companyLogo ? (
                  <>
                    <img 
                      src={previewImage || formData.companyLogo} 
                      alt="Company Logo Preview" 
                    />
                    <div className="image-actions">
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('logo-input').click();
                      }}>
                        <FaImage />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-preview">
                    <FaImage />
                    <p>Chưa có ảnh logo</p>
                    <small>Chọn file để tải lên</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Mô tả công ty</label>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về công ty của bạn"
              rows={4}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Hoàn tất thiết lập'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployerSetup;