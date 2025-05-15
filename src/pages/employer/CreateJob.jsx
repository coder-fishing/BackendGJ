import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import jobService from '../../services/jobService';
import '../../styles/forms.scss';

const CreateJob = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    location: '',
    salary: {
      min: '',
      max: '',
      currency: 'VND',
      negotiable: false
    },
    employmentType: 'FULL_TIME',
    experienceLevel: 'ENTRY',
    deadline: '',
    skills: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('salary.')) {
      const salaryField = name.split('.')[1];
      setJobData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: value
        }
      }));
    } else {
      setJobData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setJobData(prev => ({
      ...prev,
      skills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await jobService.createJob(jobData);
      navigate('/employer/dashboard', { 
        state: { message: 'Đăng bài tuyển dụng thành công!' }
      });
    } catch (err) {
      setError(err.message);
      console.error('Error creating job:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <FaArrowLeft /> Quay lại
        </button>
        <h1>Đăng Bài Tuyển Dụng</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label htmlFor="title">Tiêu đề công việc *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={jobData.title}
            onChange={handleChange}
            required
            placeholder="VD: Senior React Developer"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả công việc *</label>
          <textarea
            id="description"
            name="description"
            value={jobData.description}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Mô tả chi tiết về công việc..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="requirements">Yêu cầu ứng viên *</label>
          <textarea
            id="requirements"
            name="requirements"
            value={jobData.requirements}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Các yêu cầu đối với ứng viên..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="benefits">Quyền lợi</label>
          <textarea
            id="benefits"
            name="benefits"
            value={jobData.benefits}
            onChange={handleChange}
            rows="4"
            placeholder="Các quyền lợi dành cho ứng viên..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Địa điểm làm việc *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={jobData.location}
              onChange={handleChange}
              required
              placeholder="VD: Hà Nội"
            />
          </div>

          <div className="form-group">
            <label htmlFor="employmentType">Hình thức làm việc *</label>
            <select
              id="employmentType"
              name="employmentType"
              value={jobData.employmentType}
              onChange={handleChange}
              required
            >
              <option value="FULL_TIME">Toàn thời gian</option>
              <option value="PART_TIME">Bán thời gian</option>
              <option value="CONTRACT">Hợp đồng</option>
              <option value="TEMPORARY">Tạm thời</option>
              <option value="INTERN">Thực tập</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salary.min">Mức lương tối thiểu</label>
            <input
              type="number"
              id="salary.min"
              name="salary.min"
              value={jobData.salary.min}
              onChange={handleChange}
              placeholder="VD: 15000000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary.max">Mức lương tối đa</label>
            <input
              type="number"
              id="salary.max"
              name="salary.max"
              value={jobData.salary.max}
              onChange={handleChange}
              placeholder="VD: 25000000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary.negotiable">
              <input
                type="checkbox"
                id="salary.negotiable"
                name="salary.negotiable"
                checked={jobData.salary.negotiable}
                onChange={(e) => handleChange({
                  target: {
                    name: 'salary.negotiable',
                    value: e.target.checked
                  }
                })}
              />
              Thương lượng
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="experienceLevel">Kinh nghiệm *</label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={jobData.experienceLevel}
              onChange={handleChange}
              required
            >
              <option value="ENTRY">Mới đi làm</option>
              <option value="JUNIOR">1-3 năm</option>
              <option value="MID">3-5 năm</option>
              <option value="SENIOR">Trên 5 năm</option>
              <option value="LEAD">Quản lý</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Hạn nộp hồ sơ *</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={jobData.deadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="skills">Kỹ năng yêu cầu</label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={jobData.skills.join(', ')}
            onChange={handleSkillsChange}
            placeholder="VD: React, Node.js, MongoDB (phân cách bằng dấu phẩy)"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng...' : 'Đăng tuyển dụng'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob; 