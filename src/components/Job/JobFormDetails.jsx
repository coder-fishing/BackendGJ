import React from 'react';
import PropTypes from 'prop-types';

const JobFormDetails = ({ formData, formErrors, handleChange }) => {
  return (
    <div className="form-section">
      <h2>Nội dung chi tiết</h2>
      
      <div className="form-group">
        <label htmlFor="requirement">Yêu cầu công việc <span className="required">*</span></label>
        <textarea
          id="requirement"
          name="requirement"
          value={formData.requirement}
          onChange={handleChange}
          rows="6"
          required
          placeholder="Các kỹ năng, kinh nghiệm, bằng cấp yêu cầu..."
          className={formErrors.requirement ? 'error' : ''}
        ></textarea>
        {formErrors.requirement && <div className="field-error">{formErrors.requirement}</div>}
      </div>
    </div>
  );
};

JobFormDetails.propTypes = {
  formData: PropTypes.shape({
    description: PropTypes.string.isRequired,
    requirement: PropTypes.string.isRequired
  }).isRequired,
  formErrors: PropTypes.shape({
    description: PropTypes.string,
    requirement: PropTypes.string
  }),
  handleChange: PropTypes.func.isRequired
};

export default JobFormDetails; 