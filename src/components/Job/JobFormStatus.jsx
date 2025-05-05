import React from 'react';
import PropTypes from 'prop-types';
import { FaCalendarAlt } from 'react-icons/fa';

const JobFormStatus = ({ formData, formErrors, handleChange, isEditMode }) => {
  return (
    <div className="form-section">
      <h2>Thời hạn & Trạng thái</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expireAt">
            <FaCalendarAlt /> Hạn nộp hồ sơ <span className="required">*</span>
          </label>
          <input
            type="date"
            id="expireAt"
            name="expireAt"
            value={formData.expireAt ? formData.expireAt.split('T')[0] : ''}
            onChange={handleChange}
            required
            className={formErrors.expireAt ? 'error' : ''}
          />
          {formErrors.expireAt && <div className="field-error">{formErrors.expireAt}</div>}
        </div>
        
        <div className="form-group">
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label htmlFor="isActive">Bài đăng đang hoạt động</label>
          </div>
        </div>
      </div>
      
      {isEditMode && (
        <div className="form-group">
          <label htmlFor="status">Trạng thái</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="status-select"
          >
            <option value="PENDING">Đang chờ</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
            <option value="DELETED">Đã xóa</option>
          </select>
        </div>
      )}
    </div>
  );
};

JobFormStatus.propTypes = {
  formData: PropTypes.shape({
    expireAt: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    status: PropTypes.string
  }).isRequired,
  formErrors: PropTypes.shape({
    expireAt: PropTypes.string
  }),
  handleChange: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired
};

export default JobFormStatus; 