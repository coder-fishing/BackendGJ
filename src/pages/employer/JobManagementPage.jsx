import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsApi } from '../../services/api';
import { 
  JobTable,
  JobStatusTabs 
} from '../../components/Job';
import { 
  PageHeader,
  LoadingSpinner, 
  Pagination 
} from '../../components/common';
import { 
  getStatusClass, 
  getStatusText, 
  truncateText, 
  formatSalary, 
  formatDate 
} from '../../utils/jobUtils';

import './JobManagement.scss';

const JobManagementPage = () => {
  const { status } = useParams();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState(() => {
    if (status) {
      return status.toUpperCase();
    }
    return 'ALL';
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 8;

  const [statusCounts, setStatusCounts] = useState({
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    DELETED: 0
  });

  useEffect(() => {
    if (status) {
      setActiveTab(status.toUpperCase());
    } else {
      setActiveTab('ALL');
    }
  }, [status]);

  const fetchJobs = async () => { 
    try {
      setLoading(true);
      setError(null);

      const currentStatus = status ? status.toUpperCase() : 'ALL';
      const response = await jobsApi.getEmployerJobs(page, pageSize, currentStatus);

      if (response?.content) {
        setJobs(response.content);
        setTotalPages(response.totalPages || 1);
      } else {
        setJobs([]);
        setTotalPages(0);
      }

      await fetchJobCounts();
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Không thể tải dữ liệu');
      setJobs([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [status, page]);

  const fetchJobCounts = async () => {
    try {
      const response = await jobsApi.getEmployerJobCounts();
      
      if (response) {
        setStatusCounts({
          ALL: response.total || 0,
          PENDING: response.pending || 0,
          APPROVED: response.approved || 0,
          REJECTED: response.rejected || 0,
          DELETED: response.deleted || 0
        });
      }
    } catch (err) {
      console.error('Error fetching job counts:', err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleTabChange = (tab) => {
    setPage(0);
    
    if (tab === 'ALL') {
      navigate('/employer/jobs');
    } else {
      navigate(`/employer/jobs/status/${tab.toLowerCase()}`);
    }
  };

  const tabs = [
    { id: 'ALL', label: 'Tất cả', count: statusCounts.ALL },
    { id: 'PENDING', label: 'Đang chờ', count: statusCounts.PENDING, className: 'pending' },
    { id: 'APPROVED', label: 'Đã duyệt', count: statusCounts.APPROVED, className: 'approved' },
    { id: 'REJECTED', label: 'Từ chối', count: statusCounts.REJECTED, className: 'rejected' },
    { id: 'DELETED', label: 'Đã xóa', count: statusCounts.DELETED, className: 'deleted' }
  ];

  const refreshJobs = () => {
    fetchJobs();
  };

  if (loading) {
    return (
      <div className="job-management-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-management-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="job-management-container">
      <PageHeader 
        title="Quản lý Bài đăng Tuyển dụng" 
        buttonText="Thêm bài đăng" 
        buttonLink="/employer/jobs/add"
      />

      <JobStatusTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
      />

      <JobTable 
        jobs={jobs}
        activeTab={activeTab}
        tabs={tabs}
        formatDate={formatDate}
        formatSalary={formatSalary}
        truncateText={truncateText}
        getStatusClass={getStatusClass}
        getStatusText={getStatusText}
        refreshJobs={refreshJobs}
        isEmployerView={true}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default JobManagementPage; 