import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ page, totalPages, handlePageChange }) => {
  return (
    <div className="pagination">
      <button 
        disabled={page === 0} 
        onClick={() => handlePageChange(page - 1)}
        className="btn-prev"
      >
        Trang trước
      </button>
      <span className="page-info">{page + 1} / {totalPages}</span>
      <button 
        disabled={page + 1 >= totalPages} 
        onClick={() => handlePageChange(page + 1)}
        className="btn-next"
      >
        Trang sau
      </button>
    </div>
  );
};

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired
};

export default Pagination; 