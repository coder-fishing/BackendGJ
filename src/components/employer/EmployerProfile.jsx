import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../utils/AuthContext';
import { FaBuilding, FaGlobe, FaImage, FaMapMarkerAlt, FaUsers, FaIndustry, FaIdCard, FaPhone, FaFacebook, FaLinkedin, FaUpload, FaSpinner, FaEdit, FaTimes } from 'react-icons/fa';
import uploadToCloudinary from '../../utils/uploadImage';
import { IoShareSocialOutline } from 'react-icons/io5';
import NotificationModal from '../common/NotificationModal';
import LoadingOverlay from '../common/LoadingOverlay';
import './EmployerProfile.scss';

const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

const EmployerProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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
    socialLinks: {
      facebook: '',
      linkedin: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    console.log('Current user:', currentUser);
    if (currentUser?.id) {
    fetchEmployerProfile();
    }
  }, [currentUser]);

  const fetchEmployerProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile for user ID:', currentUser.id);
      const response = await axios.get(`http://localhost:8080/api/employers/${currentUser.id}`);
      console.log('API Response:', response.data);
      
      // Kiểm tra nếu employer chưa tồn tại
      if (!response.data) {
        setError('Chưa có thông tin công ty. Vui lòng thiết lập thông tin.');
        return;
      }

      let employerData = response.data;
      
      // Xử lý socialLinks
      if (typeof employerData.socialLinks === 'string') {
        try {
          employerData.socialLinks = JSON.parse(employerData.socialLinks);
        } catch (e) {
          employerData.socialLinks = {
            facebook: '',
            linkedin: ''
          };
        }
      } else if (!employerData.socialLinks) {
        employerData.socialLinks = {
          facebook: '',
          linkedin: ''
        };
      }
      
      // Cập nhật formData với dữ liệu từ API
      setFormData({
        companyName: employerData.companyName || '',
        companyDescription: employerData.companyDescription || '',
        companyWebsite: employerData.companyWebsite || '',
        companyLogo: employerData.companyLogo || '',
        companyAddress: employerData.companyAddress || '',
        companySize: employerData.companySize || '',
        industry: employerData.industry || '',
        taxCode: employerData.taxCode || '',
        contactPhone: employerData.contactPhone || '',
        socialLinks: {
          facebook: employerData.socialLinks?.facebook || '',
          linkedin: employerData.socialLinks?.linkedin || ''
        }
      });
    } catch (err) {
      console.error('Error fetching employer profile:', err);
      setError('Không thể tải thông tin nhà tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const socialNetwork = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialNetwork]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const imageUrl = await uploadToCloudinary(file);
      
      setFormData(prev => ({
        ...prev,
        companyLogo: imageUrl
      }));
    } catch (err) {
      setError('Không thể tải lên logo. Vui lòng thử lại sau.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      companyLogo: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Convert socialLinks object to string for API
      const submitData = {
        ...formData,
        socialLinks: JSON.stringify(formData.socialLinks)
      };

      await axios.put(`http://localhost:8080/api/employers/${currentUser.id}`, submitData);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      setNotification({
        message: 'Thông tin công ty đã được cập nhật thành công!',
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating employer profile:', err);
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

  const renderLogoSection = () => (
      <div className="logo-section">
      <h4>Logo công ty</h4>
        <input
          type="file"
          id="companyLogo"
          accept="image/*"
          onChange={handleLogoUpload}
        style={{ display: 'none' }}
        />
      <div className="logo-preview-container">
        {formData.companyLogo ? (
          <div className="logo-preview">
            <img 
              src={formData.companyLogo} 
              alt="Company Logo" 
              onClick={() => setShowPreview(true)}
            />
              <div className="image-overlay">
              <FaEdit onClick={() => document.getElementById('companyLogo').click()} />
              <FaTimes onClick={handleRemoveLogo} />
            </div>
          </div>
        ) : (
          <div 
            className="upload-placeholder"
            onClick={() => document.getElementById('companyLogo').click()}
          >
            {uploading ? (
              <>
                <FaSpinner className="spin" />
                <span>Đang tải lên...</span>
              </>
            ) : (
              <>
                <FaUpload />
                <span>Tải lên logo công ty</span>
                <small>Kéo thả hoặc click để chọn (Tối đa 5MB)</small>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewModal = () => (
    showPreview && formData.companyLogo && (
      <div className="preview-overlay" onClick={() => setShowPreview(false)}>
        <div className="preview-content" onClick={e => e.stopPropagation()}>
          <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
          <img src={formData.companyLogo} alt="Company Logo Preview" />
        </div>
      </div>
    )
  );

  if (loading) return <div className="loading">Đang tải thông tin công ty...</div>;

  return (
    <div className="employer-profile">
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
        <h2>Thông tin công ty</h2>
        <p className="subtitle">Cập nhật thông tin công ty của bạn để thu hút ứng viên tiềm năng</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Cập nhật thông tin thành công!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-sections">
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            
            {renderLogoSection()}

            <div className="form-group">
              <label htmlFor="companyName">
                <FaBuilding className="icon" />
                Tên công ty
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Nhập tên công ty"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyDescription">
                <FaBuilding className="icon" />
                Mô tả công ty
              </label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleInputChange}
                placeholder="Mô tả về công ty của bạn"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyWebsite">
                <FaGlobe className="icon" />
                Website công ty
              </label>
              <input
                type="url"
                id="companyWebsite"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin chi tiết</h3>

            <div className="form-group">
              <label htmlFor="companyAddress">
                <FaMapMarkerAlt className="icon" />
                Địa chỉ công ty
              </label>
              <input
                type="text"
                id="companyAddress"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ công ty"
              />
            </div>

            <div className="form-group">
              <label htmlFor="companySize">
                <FaUsers className="icon" />
                Quy mô công ty
              </label>
              <select
                id="companySize"
                name="companySize"
                value={formData.companySize || ''}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Chọn quy mô công ty</option>
                <option value="1-10">1-10 nhân viên</option>
                <option value="11-50">11-50 nhân viên</option>
                <option value="51-200">51-200 nhân viên</option>
                <option value="201-500">201-500 nhân viên</option>
                <option value="501-1000">501-1000 nhân viên</option>
                <option value="1000+">1000+ nhân viên</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="industry">
                <FaIndustry className="icon" />
                Lĩnh vực hoạt động
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                placeholder="VD: Công nghệ thông tin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="taxCode">
                <FaIdCard className="icon" />
                Mã số thuế
              </label>
              <input
                type="text"
                id="taxCode"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleInputChange}
                placeholder="Nhập mã số thuế"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">
                <FaPhone className="icon" />
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_facebook">
                <FaFacebook className="icon" />
                Facebook
              </label>
              <input
                type="url"
                id="social_facebook"
                name="social_facebook"
                value={formData.socialLinks.facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/your-page"
              />
            </div>

            <div className="form-group">
              <label htmlFor="social_linkedin">
                <FaLinkedin className="icon" />
                LinkedIn
              </label>
              <input
                type="url"
                id="social_linkedin"
                name="social_linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/company/your-company"
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

export default EmployerProfile; 