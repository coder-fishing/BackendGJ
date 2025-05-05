// pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>Trang bạn tìm kiếm không tồn tại.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Quay lại Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;