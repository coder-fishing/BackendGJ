import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ text = 'Đang tải dữ liệu' }) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <div className="loading-text">
        <p>{text}</p>
        <div className="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  text: PropTypes.string
};

LoadingSpinner.defaultProps = {
  text: 'Đang tải dữ liệu'
};

export default LoadingSpinner; 