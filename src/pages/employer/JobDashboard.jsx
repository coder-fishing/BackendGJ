import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import JobCard from '../../components/employer/JobCard';
import '../../styles/employer/dashboard.scss';
import '../../styles/employer/status-filers.scss';

const JobDashboard = () => {
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const statusFilters = [
    { key: 'ALL', label: 'Tất cả ' },
    { key: 'APPROVED', label: 'Đã duyệt ' },
    { key: 'PENDING', label: 'Đang chờ ' },
    { key: 'REJECTED', label: 'Từ chối ' },
    { key: 'DELETED', label: 'Đã xóa ' },
    // { key: 'EXPIRED', label: 'Hết hạn' }
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      const response = await axios.get(`http://localhost:8080/api/jobs?employerId=${userId}`);
      setJobsList(response.data.content);
    } catch (error) {
      setError('Không thể tải danh sách việc làm');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) {
      try {
        await axios.delete(`http://localhost:8080/api/jobs/${jobId}`);
        setJobsList(jobs => jobs.filter(job => job.jobId !== jobId));
      } catch (error) {
        setError('Không thể xóa tin tuyển dụng');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'status-approved';
      case 'PENDING':
        return 'status-pending';
      // case 'EXPIRED':
      //   return 'status-expired';
      case 'REJECTED':
        return 'status-rejected';
      case 'DELETED':
        return 'status-deleted';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredJobs = jobsList.filter(job => 
    activeFilter === 'ALL' ? true : job.status === activeFilter
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Quản Lý Tuyển Dụng</h1>
        <Link to="/employer/post-job" className="add-job-button">
          <FaPlus /> Đăng Tuyển Dụng Mới
        </Link>
      </div>

      <div className="status-filters">
        {statusFilters.map(filter => (
          <button
            key={filter.key}
            className={`filter-tab ${activeFilter === filter.key ? 'active' : ''} ${getStatusColor(filter.key)}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
            <span className="count ">
              {filter.key === 'ALL' 
                ? jobsList.length 
                : jobsList.filter(job => job.status === filter.key).length}
            </span>
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="no-jobs">
          <h3>Chưa có tin tuyển dụng nào{activeFilter !== 'ALL' ? ` ${statusFilters.find(f => f.key === activeFilter).label.toLowerCase()}` : ''}</h3>
          <p>Hãy đăng tin tuyển dụng đầu tiên của bạn</p>
          <Link to="/employer/post-job" className="add-job-button">
            <FaPlus /> Đăng tin tuyển dụng
          </Link>
        </div>
      ) : (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <JobCard
              key={job.jobId}
              job={job}
              onDelete={handleDeleteJob}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobDashboard; 