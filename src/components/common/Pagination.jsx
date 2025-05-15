import React, { memo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Pagination.scss';

const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
  console.log("Pagination re-rendered", { currentPage, totalPages }); // Debug re-render

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Điều chỉnh startPage nếu endPage bị giới hạn
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Trang đầu
    if (startPage > 0) {
      pages.push(
        <li key="0" className="page-item">
          <button onClick={() => onPageChange(0)}>1</button>
        </li>
      );
      if (startPage > 1) {
        pages.push(
          <li key="dots1" className="page-item dots">
            ...
          </li>
        );
      }
    }

    // Các trang giữa
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li key={i} className="page-item">
          <button
            className={currentPage === i ? 'active' : ''}
            onClick={() => onPageChange(i)}
          >
            {i + 1}
          </button>
        </li>
      );
    }

    // Trang cuối
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push(
          <li key="dots2" className="page-item dots">
            ...
          </li>
        );
      }
      pages.push(
        <li key={totalPages - 1} className="page-item">
          <button onClick={() => onPageChange(totalPages - 1)}>
            {totalPages}
          </button>
        </li>
      );
    }

    return pages;
  };

  return (
    <nav className="pagination">
      <li className="page-item">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="nav-button prev"
        >
          <FaChevronLeft />
        </button>
      </li>

      {renderPageNumbers()}

      <li className="page-item">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="nav-button next"
        >
          <FaChevronRight />
        </button>
      </li>
    </nav>
  );
});

export default Pagination;
