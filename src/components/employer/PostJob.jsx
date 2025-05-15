import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaUpload, FaCheck, FaCheckCircle, FaImage } from 'react-icons/fa';
import axios from 'axios';
import uploadToCloudinary from '../../utils/uploadImage';
import '../../styles/employer.scss';

const steps = [
  { id: 1, title: 'Thông tin cơ bản' },
  { id: 2, title: 'Mô tả & Yêu cầu' },
  { id: 3, title: 'Lương & Quyền lợi' },
  { id: 4, title: 'Xem trước & Đăng tuyển' }
];

const PostJob = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirement: '',
    location: '',
    jobType: 'FULL_TIME',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'VND',
    isSalaryPublic: true,
    imageUrl: '',
    expireAt: ''
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const now = new Date();
  now.setDate(now.getDate() + 2 );
  now.setHours(now.getHours() + 2); // Add 2 hours
  const minDateTime = now.toISOString().slice(0, 16); 

  useEffect(() => {
    checkEmployerStatus();
  }, []);

  const checkEmployerStatus = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      if (!userId) {
        navigate('/auth/login');
        return;
      }

      const response = await axios.get(`http://localhost:8080/api/employers/${userId}`);
      if (!response.data) {
        navigate(`/employer/setup?userId=${userId}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        const userId = JSON.parse(localStorage.getItem('user'))?.id;
        navigate(`/employer/setup?userId=${userId}`);
      } else {
        setError('Failed to verify employer status');
      }
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          errors.title = 'Vui lòng nhập tiêu đề công việc';
        }
        if (!formData.location.trim()) {
          errors.location = 'Vui lòng nhập địa điểm làm việc';
        }
        break;
        
      case 2:
        if (!formData.description.trim()) {
          errors.description = 'Vui lòng nhập mô tả công việc';
        }
        if (!formData.requirement.trim()) {
          errors.requirement = 'Vui lòng nhập yêu cầu công việc';
        }
        break;
        
      case 3:
        if (!formData.salaryMin) {
          errors.salaryMin = 'Vui lòng nhập mức lương tối thiểu';
        }
        if (!formData.salaryMax) {
          errors.salaryMax = 'Vui lòng nhập mức lương tối đa';
        }
        if (parseFloat(formData.salaryMin) > parseFloat(formData.salaryMax)) {
          errors.salaryMax = 'Mức lương tối đa phải lớn hơn mức lương tối thiểu';
        }
        if (!formData.expireAt) {
          errors.expireAt = 'Vui lòng chọn hạn nộp hồ sơ';
        }
        break;
        
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({
        ...prev,
        imageUrl
      }));
    } catch (error) {
      setError('Không thể tải lên hình ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check confirmation
    if (!isConfirmed) {
      setFormErrors(prev => ({
        ...prev,
        confirmation: 'Vui lòng xác nhận thông tin trước khi đăng tin'
      }));
      return;
    }
    
    // Validate all steps before submitting
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return;
      }
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const jobData = {
        ...formData,
        employerId: userId,
        salaryMin: parseFloat(formData.salaryMin),
        salaryMax: parseFloat(formData.salaryMax)
      };

      await axios.post('http://localhost:8080/api/jobs', jobData);
      setSuccess('Đăng tin tuyển dụng thành công! Bạn sẽ được chuyển hướng sau 2 giây...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/employer/my-jobs');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể đăng tin. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleConfirmation = (e) => {
    setIsConfirmed(e.target.checked);
    if (e.target.checked) {
      setCompletedSteps(prev => [...prev, 4]);
      setShowConfirmation(true);
      // Add animation class after a small delay
      setTimeout(() => {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
          progressBar.classList.add('completed');
        }
      }, 100);
    } else {
      setCompletedSteps(prev => prev.filter(step => step !== 4));
      setShowConfirmation(false);
      const progressBar = document.querySelector('.progress-bar');
      if (progressBar) {
        progressBar.classList.remove('completed');
      }
    }
  };

  const renderProgressBar = () => (
    <div 
      className="progress-bar" 
      style={{ '--progress-step': currentStep }}
    >
      {steps.map(step => (
        <div 
          key={step.id} 
          className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${
            completedSteps.includes(step.id) ? 'completed' : ''
          }`}
        >
          <div className="step-number">
            {completedSteps.includes(step.id) ? <FaCheck /> : step.id}
          </div>
          <div className="step-title">{step.title}</div>
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="form-section">
      <div className="left-column">
      <div className="form-group">
        <label>Tiêu đề công việc <span className="required">*</span></label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="VD: Senior React Developer"
          className={formErrors.title ? 'error' : ''}
        />
        {formErrors.title && <div className="field-error">{formErrors.title}</div>}
      </div>

      <div className="form-group">
        <label>Địa điểm làm việc <span className="required">*</span></label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          placeholder="VD: Hà Nội, Remote,..."
          className={formErrors.location ? 'error' : ''}
        />
        {formErrors.location && <div className="field-error">{formErrors.location}</div>}
      </div>

      <div className="form-group">
        <label>Loại công việc <span className="required">*</span></label>
        <select
          name="jobType"
          value={formData.jobType}
          onChange={handleChange}
          required
        >
          <option value="FULL_TIME">Toàn thời gian</option>
          <option value="PART_TIME">Bán thời gian</option>
          <option value="CONTRACT">Hợp đồng</option>
          <option value="INTERNSHIP">Thực tập</option>
        </select>
      </div>
      </div>

      <div className="right-column">
        <div className="image-preview">
          {imagePreview ? (
            <img src={imagePreview} alt="Job preview" />
          ) : (
            <div className="empty">
              <FaImage />
              <p style={{fontSize: '1.2rem'}}>Chưa có hình ảnh</p>
              {/* <small>Hình ảnh công việc sẽ hiển thị ở đây</small> */}
            </div>
          )}
        </div>

        <label htmlFor="job-image" className="upload-label">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="job-image"
            className="hidden-input"
            hidden
          />
            <FaUpload />
            <span>Chọn hình ảnh</span>
          </label>
      </div>
    </div>
  );

  const renderDescription = () => (
    <>
      <div className="form-group">
        <label>Mô tả công việc <span className="required">*</span></label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="6"
          placeholder="Mô tả chi tiết về công việc, trách nhiệm,..."
          className={formErrors.description ? 'error' : ''}
        />
        {formErrors.description && <div className="field-error">{formErrors.description}</div>}
      </div>

      <div className="form-group">
        <label>Yêu cầu ứng viên <span className="required">*</span></label>
        <textarea
          name="requirement"
          value={formData.requirement}
          onChange={handleChange}
          required
          rows="6"
          placeholder="Các yêu cầu về kinh nghiệm, kỹ năng,..."
          className={formErrors.requirement ? 'error' : ''}
        />
        {formErrors.requirement && <div className="field-error">{formErrors.requirement}</div>}
      </div>
    </>
  );

  const renderSalary = () => (
    <>
      <div className="form-group">
        <label>Mức lương <span className="required">*</span></label>
        <div className="salary-inputs">
          <input
            type="number"
            name="salaryMin"
            value={formData.salaryMin}
            onChange={handleChange}
            placeholder="Tối thiểu"
            required
            className={formErrors.salaryMin ? 'error' : ''}
          />
          <input
            type="number"
            name="salaryMax"
            value={formData.salaryMax}
            onChange={handleChange}
            placeholder="Tối đa"
            required
            className={formErrors.salaryMax ? 'error' : ''}
          />
          <select
            name="salaryCurrency"
            value={formData.salaryCurrency}
            onChange={handleChange}
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </div>
        {formErrors.salaryMin && <div className="field-error">{formErrors.salaryMin}</div>}
        {formErrors.salaryMax && <div className="field-error">{formErrors.salaryMax}</div>}
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            name="isSalaryPublic"
            checked={formData.isSalaryPublic}
            onChange={handleChange}
          />
          Hiển thị mức lương công khai
        </label>
      </div>

      <div className="form-group">
        <label>Hạn nộp hồ sơ <span className="required">*</span></label>
        <input
          type="datetime-local"
          name="expireAt"
          value={formData.expireAt}
          onChange={handleChange}
          required
          className={formErrors.expireAt ? 'error' : ''}
          min={minDateTime} // Set the minimum time
        />
        {formErrors.expireAt && <div className="field-error">{formErrors.expireAt}</div>}
    </div>
    </>
  );

  const renderPreview = () => (
    <div className="job-preview">
      <h3>Xem trước bài đăng</h3>
      
      <div className="preview-section">
        <div className="preview-header">
          {formData.imageUrl && (
            <img src={formData.imageUrl} alt="Job" className="preview-image" />
          )}
          <div className="preview-title">
            <h2>{formData.title}</h2>
            <p className="location">{formData.location}</p>
            <span className="job-type">{formData.jobType}</span>
          </div>
        </div>

        <div className="preview-body">
          <div className="preview-group">
            <h4>Mô tả công việc</h4>
            <p>{formData.description}</p>
          </div>

          <div className="preview-group">
            <h4>Yêu cầu ứng viên</h4>
            <p>{formData.requirement}</p>
          </div>

          <div className="preview-group">
            <h4>Mức lương</h4>
            <p>
              {formData.isSalaryPublic ? (
                `${formData.salaryMin} - ${formData.salaryMax} ${formData.salaryCurrency}`
              ) : (
                'Thương lượng'
              )}
            </p>
          </div>

          <div className="preview-group">
            <h4>Hạn nộp hồ sơ</h4>
            <p>{new Date(formData.expireAt).toLocaleDateString('vi-VN')}</p>
          </div>
        </div>
      </div>

      <div className="preview-confirmation">
        <label className="confirm-checkbox">
          <input
            type="checkbox"
            checked={isConfirmed}
            onChange={handleConfirmation}
          />
          <span>
            <FaCheckCircle className={`confirm-icon ${isConfirmed ? 'active' : ''}`} />
            Tôi đã xem lại thông tin và xác nhận rằng thông tin trên là chính xác
          </span>
        </label>
        {!isConfirmed && formErrors.confirmation && (
          <div className="field-error">{formErrors.confirmation}</div>
        )}
      </div>

      {showConfirmation && (
        <div className="confirmation-success">
          <FaCheckCircle />
          <p>Bạn đã xác nhận thông tin. Bấm "Đăng tuyển" để hoàn tất.</p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderDescription();
      case 3:
        return renderSalary();
      case 4:
        return renderPreview();
      default:
        return null;
    }
  };

  return (
    <div className="post-job-container">
      <h2>Đăng tin tuyển dụng</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {renderProgressBar()}

      <form onSubmit={handleSubmit} className="post-job-form">
        {renderStepContent()}

        <div className="form-actions">
          {currentStep > 1 && (
            <button 
              type="button" 
              onClick={prevStep}
              className="btn-secondary"
            >
              <FaArrowLeft /> Quay lại
            </button>
          )}

          {currentStep < steps.length ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="btn-primary"
            >
              Tiếp theo <FaArrowRight />
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading || !isConfirmed}
            >
              {loading ? 'Đang đăng...' : 'Đăng tuyển'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PostJob; 