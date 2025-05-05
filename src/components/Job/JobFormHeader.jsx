import React from 'react';
import PropTypes from 'prop-types';
import { FaArrowLeft } from 'react-icons/fa';

const JobFormHeader = ({ title, onBack }) => {
  return (
    <div className="page-header">
      <button 
        onClick={onBack} 
        className="back-button"
      >
        <FaArrowLeft /> <span>Quay lại</span>
      </button>
      <h1>{title}</h1>
    </div>
  );
};

JobFormHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired
};

export default JobFormHeader; 