import React from 'react';
import PropTypes from 'prop-types';
import { FaMoneyBillWave } from 'react-icons/fa';

const JobFormSalary = ({ formData, formErrors, handleChange, handleNumberChange }) => {
  return (
    <div className="form-section">
      <h2>Thông tin lương</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="salaryMin">
            <FaMoneyBillWave /> Lương tối thiểu <span className="required">*</span>
          </label>
          <input
            type="number"
            id="salaryMin"
            name="salaryMin"
            value={formData.salaryMin}
            onChange={handleNumberChange}
            required
            min="0"
            className={formErrors.salaryMin ? 'error' : ''}
          />
          {formErrors.salaryMin && <div className="field-error">{formErrors.salaryMin}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="salaryMax">
            <FaMoneyBillWave /> Lương tối đa <span className="required">*</span>
          </label>
          <input
            type="number"
            id="salaryMax"
            name="salaryMax"
            value={formData.salaryMax}
            onChange={handleNumberChange}
            required
            min="0"
            className={formErrors.salaryMax ? 'error' : ''}
          />
          {formErrors.salaryMax && <div className="field-error">{formErrors.salaryMax}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="salaryCurrency">Loại tiền tệ <span className="required">*</span></label>
          <select
            id="salaryCurrency"
            name="salaryCurrency"
            value={formData.salaryCurrency}
            onChange={handleChange}
            required
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      
      <div className="form-checkbox">
        <input
          type="checkbox"
          id="isSalaryPublic"
          name="isSalaryPublic"
          checked={formData.isSalaryPublic}
          onChange={handleChange}
        />
        <label htmlFor="isSalaryPublic">Công khai mức lương</label>
      </div>
    </div>
  );
};

JobFormSalary.propTypes = {
  formData: PropTypes.shape({
    salaryMin: PropTypes.number.isRequired,
    salaryMax: PropTypes.number.isRequired,
    salaryCurrency: PropTypes.string.isRequired,
    isSalaryPublic: PropTypes.bool.isRequired
  }).isRequired,
  formErrors: PropTypes.shape({
    salaryMin: PropTypes.string,
    salaryMax: PropTypes.string
  }),
  handleChange: PropTypes.func.isRequired,
  handleNumberChange: PropTypes.func.isRequired
};

export default JobFormSalary; 