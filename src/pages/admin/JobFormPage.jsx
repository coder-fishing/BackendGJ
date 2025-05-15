// pages/JobFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jobsApi } from '../../services/api';
import '../../styles/JobFormPage.scss';

import { LoadingSpinner } from '../../components/common';
import { 
  JobFormHeader,
  JobFormBasicInfo,
  JobFormSalary,
  JobFormStatus,
  JobFormDetails,
  JobFormActions
} from '../../components/Job';

const JobFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    employerName: '',
    description: '',
    requirement: '',
    location: '',
    jobType: 'FULL_TIME',
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'VND',
    expireAt: '',
    isSalaryPublic: true,
    isActive: true,
    status: 'PENDING'
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getJobById(id);
      setFormData(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải thông tin bài đăng. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user changes it
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0
    });
    
    // Clear error for this field when user changes it
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Vui lòng nhập tên công việc';
    }
    
    if (!formData.employerName.trim()) {
      errors.employerName = 'Vui lòng nhập tên công ty';
    }
    
    if (formData.salaryMin < 0) {
      errors.salaryMin = 'Lương tối thiểu không được nhỏ hơn 0';
    }
    
    if (formData.salaryMax < formData.salaryMin) {
      errors.salaryMax = 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Vui lòng nhập địa điểm';
    }
    
    if (!formData.expireAt) {
      errors.expireAt = 'Vui lòng chọn hạn nộp hồ sơ';
    }
    
    
    if (!formData.requirement.trim()) {
      errors.requirement = 'Vui lòng nhập yêu cầu công việc';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (isEditMode) {
        // Update existing job
        await jobsApi.updateJob(id, formData);
      } else {
        // Create new job
        await jobsApi.createJob(formData);
      }
      
      navigate('/admin/dashboard'); // Redirect to job list
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu bài đăng. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="job-form-container">
        <LoadingSpinner text="Đang tải thông tin" />
      </div>
    );
  }

  return (
    <div className="job-form-container">
      <JobFormHeader 
        title={isEditMode ? 'Chỉnh sửa Bài đăng' : 'Thêm Bài đăng Mới'}
        onBack={() => navigate('/admin/dashboard')}
      />
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="job-form">
        <JobFormBasicInfo 
          formData={formData}
          formErrors={formErrors}
          handleChange={handleChange}
        />
        
        <JobFormSalary 
          formData={formData}
          formErrors={formErrors}
          handleChange={handleChange}
          handleNumberChange={handleNumberChange}
        />
        
        <JobFormStatus 
          formData={formData}
          formErrors={formErrors}
          handleChange={handleChange}
          isEditMode={isEditMode}
        />
        
        <JobFormDetails 
          formData={formData}
          formErrors={formErrors}
          handleChange={handleChange}
        />
        
        <JobFormActions 
          onCancel={() => navigate('/admin/dashboard')}
          submitting={submitting}
          isEditMode={isEditMode}
        />
      </form>
    </div>
  );
};

export default JobFormPage;