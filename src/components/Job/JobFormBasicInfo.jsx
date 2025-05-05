import React from 'react';
import PropTypes from 'prop-types';
import { FaBriefcase, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';

const JobFormBasicInfo = ({ formData, formErrors, handleChange }) => {
  return (
    <div className="form-section">
      <h2>Thông tin cơ bản</h2>
      
      <div className="form-group">
        <label htmlFor="title">
          <FaBriefcase /> Tên công việc <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="VD: Senior Frontend Developer"
          className={formErrors.title ? 'error' : ''}
        />
        {formErrors.title && <div className="field-error">{formErrors.title}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="employerName">
          <FaBuilding /> Tên công ty <span className="required">*</span>
        </label>
        <input
          type="text"
          id="employerName"
          name="employerName"
          value={formData.employerName}
          onChange={handleChange}
          required
          placeholder="VD: GoodJob Company"
          className={formErrors.employerName ? 'error' : ''}
        />
        {formErrors.employerName && <div className="field-error">{formErrors.employerName}</div>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="location">
            <FaMapMarkerAlt /> Địa điểm <span className="required">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="VD: Hà Nội"
            className={formErrors.location ? 'error' : ''}
          />
          {formErrors.location && <div className="field-error">{formErrors.location}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="jobType">
            <FaBriefcase /> Loại hình công việc <span className="required">*</span>
          </label>
          <select
            id="jobType"
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            required
          >
            <option value="FULL_TIME">Toàn thời gian</option>
            <option value="PART_TIME">Bán thời gian</option>
            <option value="CONTRACT">Hợp đồng</option>
            <option value="INTERNSHIP">Thực tập</option>
            <option value="FREELANCE">Tự do</option>
          </select>
        </div>
      </div>
    </div>
  );
};

JobFormBasicInfo.propTypes = {
  formData: PropTypes.shape({
    title: PropTypes.string.isRequired,
    employerName: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    jobType: PropTypes.string.isRequired
  }).isRequired,
  formErrors: PropTypes.shape({
    title: PropTypes.string,
    employerName: PropTypes.string,
    location: PropTypes.string
  }),
  handleChange: PropTypes.func.isRequired
};

export default JobFormBasicInfo; 