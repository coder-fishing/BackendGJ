import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaImage, FaTrash, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import './EditJobForm.scss';

const EditJobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    employerId: '',
    title: '',
    description: '',
    requirement: '',
    location: '',
    jobType: 'FULL_TIME',
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'USD',
    isSalaryPublic: true,
    imageUrl: '',
    expireAt: ''
  });

  useEffect(() => {
    fetchJobData();
  }, [id]);

  // Add new useEffect to check expiration date
  useEffect(() => {
    if (formData.expireAt) {
      const expireDate = new Date(formData.expireAt);
      const now = new Date();
      
      if (expireDate < now) {
        // Focus on the expireAt input field
        const expireAtInput = document.getElementById('expireAt');
        if (expireAtInput) {
          expireAtInput.focus();
          expireAtInput.classList.add('expired');
        }
      }
    }
  }, [formData.expireAt]);

  const now = new Date();
  now.setDate(now.getDate() + 2 );
  now.setHours(now.getHours() + 2); // Add 2 hours
  const minDateTime = now.toISOString().slice(0, 16); 

  const fetchJobData = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/jobs/${id}`);
      const jobData = response.data;
      
      // Format expireAt date for input
      const expireDate = new Date(jobData.expireAt);
      const formattedExpireAt = expireDate.toISOString().split('T')[0];
      
      setFormData({
        ...jobData,
        expireAt: formattedExpireAt
      });
      setLoading(false);
    } catch (err) {
      setError('Không thể tải thông tin công việc. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      const submitData = {
        ...formData,
        expireAt: new Date(formData.expireAt).toISOString()
      };

      await axios.put(`http://localhost:8080/api/jobs/${id}`, submitData);
      navigate('/employer/dashboard');
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật công việc. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="edit-job-form">
      <h2>Chỉnh sửa tin tuyển dụng</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-main">
            {/* Image Section */}
            <div className="image-section">
              <div className="section-label">
                Hình ảnh công việc
                <span className="helper-text">Tải lên hình ảnh đại diện cho công việc (Logo công ty hoặc hình ảnh liên quan)</span>
              </div>
              {formData.imageUrl ? (
                <div className="image-preview">
                  <img src={formData.imageUrl} alt="Preview" />
                  <div className="image-overlay">
                    <FaEdit />
                    <span>Thay đổi</span>
                  </div>
                </div>
              ) : (
                <div className="image-placeholder">
                  <FaImage />
                  <span>Tải lên hình ảnh<br/>Kích thước đề xuất: 400x400px</span>
                </div>
              )}
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Nhập URL hình ảnh"
                className="image-url-input"
              />
            </div>

            {/* Content Section */}
            <div className="content-section">
              <div className="form-group">
                <label htmlFor="title" className="required">Tiêu đề công việc</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: Nhân viên kinh doanh toàn thời gian"
                  required
                  className="title-input"
                />
              </div>

              <div className="meta-section">
                <div className="section-label">Thông tin cơ bản</div>
                <div className="form-row dates">
                  <div className="form-group">
                    <label htmlFor="expireAt" className="required">
                      <span>📅 Ngày hết hạn</span>
                      <span className="helper-text">Tin tuyển dụng sẽ tự động ẩn sau ngày này</span>
                    </label>
                    <input
                      id="expireAt"
                      type="date"
                      name="expireAt"
                      value={formData.expireAt}
                      onChange={handleInputChange}
                      required
                      min={minDateTime}
                    />
                  </div>
                </div>

                <div className="form-row salary">
                  <div className="form-group salary-group">
                    <label htmlFor="salaryMin" className="required">Lương tối thiểu</label>
                    <input
                      id="salaryMin"
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      placeholder="VD: 10"
                      required
                    />
                  </div>

                  <div className="form-group salary-group">
                    <label htmlFor="salaryMax" className="required">Lương tối đa</label>
                    <input
                      id="salaryMax"
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      placeholder="VD: 15"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="salaryCurrency" className="required">Đơn vị tiền tệ</label>
                    <select
                      id="salaryCurrency"
                      name="salaryCurrency"
                      value={formData.salaryCurrency}
                      onChange={handleInputChange}
                    >
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="form-row tags">
                  <div className="form-group">
                    <label htmlFor="location" className="required">
                      <span>📍 Địa điểm làm việc</span>
                      {/* <span className="helper-text">Nhập địa chỉ cụ thể của nơi làm việc</span> */}
                    </label>
                    <input
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="VD: 123 Lý Thường Kiệt, Quận 10, TP.HCM"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="jobType" className="required">Loại công việc</label>
                    <select
                      id="jobType"
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="job-type-select"
                    >
                      <option value="FULL_TIME">Toàn thời gian</option>
                      <option value="PART_TIME">Bán thời gian</option>
                      <option value="CONTRACT">Hợp đồng</option>
                      <option value="TEMPORARY">Tạm thời</option>
                      <option value="INTERN">Thực tập</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description" className="required">
                  <span>Mô tả công việc</span>
                  <span className="helper-text">Mô tả chi tiết về công việc, trách nhiệm và quyền lợi</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="VD:
- Tư vấn và bán hàng trực tiếp tại cửa hàng
- Sắp xếp, trưng bày sản phẩm
- Hỗ trợ kiểm kê hàng hóa định kỳ
- Chăm sóc khách hàng, giải đáp thắc mắc

Quyền lợi:
- Lương cơ bản + hoa hồng
- Được đào tạo nghiệp vụ
- Môi trường làm việc chuyên nghiệp"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="requirement" className="required">
                  <span>Yêu cầu ứng viên</span>
                  <span className="helper-text">Liệt kê các yêu cầu về bằng cấp, kinh nghiệm, kỹ năng...</span>
                </label>
                <textarea
                  id="requirement"
                  name="requirement"
                  value={formData.requirement}
                  onChange={handleInputChange}
                  placeholder="VD:
- Tốt nghiệp THPT trở lên
- Giao tiếp tốt, ngoại hình dễ nhìn
- Ưu tiên có kinh nghiệm bán hàng
- Siêng năng, nhiệt tình, trung thực
- Có thể làm việc vào cuối tuần"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate('/employer/dashboard')}>
              <FaTimes /> Hủy bỏ
            </button>
            <button type="submit" className="save-btn">
              <FaSave /> Xem trước & Lưu
            </button>
          </div>
        </div>
      </form>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>Xem trước bài đăng</h3>
            
            <div className="confirm-content">
              <div className="confirm-item">
                {formData.imageUrl && (
                  <div className="image">
                    <div className="preview-wrapper">
                      <img src={formData.imageUrl} alt="Job" />
                      <div className="edit-overlay" onClick={() => setShowConfirm(false)}>
                        <FaEdit />
                      </div>
                    </div>
                  </div>
                )}

                <h2>{formData.title}</h2>
                
                <div className="meta-info">
                  <div className="dates">
                    <span>📅 Đăng: {new Date().toLocaleDateString('vi-VN')}</span>
                    <span className="divider">–</span>
                    <span>Hết hạn: {new Date(formData.expireAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="salary">
                    <span className="label">Mức lương:</span>
                    <span className="value">
                      {formData.isSalaryPublic ? 
                        `${formData.salaryMin.toLocaleString()} - ${formData.salaryMax.toLocaleString()} ${formData.salaryCurrency}` : 
                        'Thương lượng'}
                    </span>
                  </div>

                  <div className="tags">
                    <span className="location">📍 {formData.location}</span>
                    <span className="job-type">
                      {formData.jobType === 'FULL_TIME' ? 'FULL_TIME' :
                       formData.jobType === 'PART_TIME' ? 'PART_TIME' :
                       formData.jobType === 'CONTRACT' ? 'CONTRACT' :
                       formData.jobType === 'TEMPORARY' ? 'TEMPORARY' : 'INTERN'}
                    </span>
                  </div>
                </div>

                <div className="description">
                  <strong>Mô tả công việc</strong>
                  <p>{formData.description}</p>
                </div>

                <div className="requirements">
                  <strong>Yêu cầu ứng viên</strong>
                  <p>{formData.requirement}</p>
                </div>
              </div>
            </div>

            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowConfirm(false)}>
                <FaTimes /> Chỉnh sửa lại
              </button>
              <button className="confirm-btn" onClick={handleConfirm}>
                <FaSave /> Xác nhận đăng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditJobForm; 