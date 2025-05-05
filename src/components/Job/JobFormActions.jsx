import React from 'react';
import PropTypes from 'prop-types';
import { FaSave, FaTimes } from 'react-icons/fa';

const JobFormActions = ({ onCancel, submitting, isEditMode }) => {
  return (
    <div className="form-actions">
      <button 
        type="button" 
        className="btn btn-outline"
        onClick={onCancel}
      >
        <FaTimes /> Hủy
      </button>
      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={submitting}
      >
        <FaSave /> {submitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm bài đăng')}
      </button>
    </div>
  );
};

JobFormActions.propTypes = {
  onCancel: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired
};

export default JobFormActions; 