import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/Search/SearchBar';
import './JobManagement.scss';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    filter: 'all'
  });

  // Các filter cho thanh tìm kiếm
  const searchFilters = [
    { value: 'title', label: 'Tiêu đề' },
    { value: 'company', label: 'Công ty' },
    { value: 'location', label: 'Địa điểm' },
    { value: 'status', label: 'Trạng thái' }
  ];

  // Xử lý tìm kiếm
  const handleSearch = ({ searchTerm, filter }) => {
    setSearchParams({ searchTerm, filter });
    // Thực hiện tìm kiếm với API
    // fetchJobs(searchTerm, filter);
  };

  return (
    <div className="job-management">
      <div className="page-header">
        <h1>Quản lý bài tuyển dụng</h1>
      </div>

      <div className="search-section">
        <SearchBar
          placeholder="Tìm kiếm bài tuyển dụng..."
          onSearch={handleSearch}
          filters={searchFilters}
          autoFocus={false}
          debounceTime={500}
        />
      </div>

      {/* Phần nội dung bảng quản lý bài tuyển dụng */}
      <div className="jobs-table-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <h2>Không có bài tuyển dụng nào</h2>
            <p>Hãy thêm bài tuyển dụng mới hoặc thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Công ty</th>
                <th>Địa điểm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>{job.location}</td>
                  <td>
                    <span className={`status ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="actions">
                    {/* Các nút thao tác */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default JobManagement; 