import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jobsApi } from '../../services/api';
import SearchFilter from '../../components/Search/SearchFilter';
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
  formatDate,
  formatSalaryUpto
} from '../../utils/jobUtils';

import '../../styles/JobListPage.scss';

const JobListPage = () => {
  const { status } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  
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

  // Cập nhật activeTab khi URL thay đổi
  useEffect(() => {
    if (status) {
      setActiveTab(status.toUpperCase());
    } else {
      setActiveTab('ALL');
    }
  }, [status]);

  // Lấy số lượng job theo từng trạng thái
  useEffect(() => {
    const fetchJobCounts = async () => {
      try {
        const response = await jobsApi.getJobsCount();
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
    fetchJobCounts();
  }, []);

  // Fetch jobs khi các dependency thay đổi
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentStatus = status ? status.toUpperCase() : 'ALL';
        const response = await jobsApi.getJobspage(page, pageSize, currentStatus);

        if (response?.content) {
          setJobs(response.content);
          setTotalPages(response.totalPages || 1);
        } else {
          setJobs([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('Error loading jobs:', err);
        setError('Không thể tải dữ liệu');
        setJobs([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [status, page]);

  // Xử lý search riêng biệt
  const handleSearch = async (filters) => {
    try {
      setLoading(true);
      setError(null);
      setPage(0);

      const currentStatus = status ? status.toUpperCase() : 'ALL';
      let response;

      if (filters.search) {
        response = await jobsApi.getJobspage(0, pageSize, currentStatus, filters.search);
      } else {
        response = await jobsApi.getJobspage(0, pageSize, currentStatus);
      }

      if (response?.content) {
        setJobs(response.content);
        setTotalPages(response.totalPages || 1);
      } else {
        setJobs([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError('Không thể tìm kiếm');
      setJobs([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleTabChange = (tab) => {
    setPage(0);
    setSearchText('');
    
    if (tab === 'ALL') {
      navigate('/jobs');
    } else {
      navigate(`/admin/jobs/status/${tab.toLowerCase()}`);
    }
  };

  const tabs = [
    { id: 'ALL', label: 'Tất cả', count: statusCounts.ALL },
    { id: 'PENDING', label: 'Đang chờ', count: statusCounts.PENDING, className: 'pending' },
    { id: 'APPROVED', label: 'Đã duyệt', count: statusCounts.APPROVED, className: 'approved' },
    { id: 'REJECTED', label: 'Từ chối', count: statusCounts.REJECTED, className: 'rejected' },
    { id: 'DELETED', label: 'Đã xóa', count: statusCounts.DELETED, className: 'deleted' }
  ];

  if (loading) {
    return (
      <div className="job-list-container">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="job-list-container">
      <PageHeader 
        title="Quản lý Bài đăng Tuyển dụng" 
        buttonText="Thêm bài đăng" 
        buttonLink="/jobs/add" 
      />

      <JobStatusTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
      />

      <SearchFilter 
        filters={{ search: searchText }} 
        onFilterChange={handleSearch} 
      />

      {error && <div className="error-message">{error}</div>}

      <JobTable 
        jobs={jobs}
        activeTab={activeTab}
        tabs={tabs}
        formatDate={formatDate}
        formatSalary={formatSalary}
        formatSalaryUpto={formatSalaryUpto}
        truncateText={truncateText}
        getStatusClass={getStatusClass}
        getStatusText={getStatusText}
      />

      <div style={{margin: '10px 0', fontSize: '12px', color: '#666'}}>
        Debug: Page {page + 1}/{totalPages} - Số bài đăng: {jobs.length} - PageSize {pageSize}
      </div>

      {totalPages > 0 && (
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default JobListPage;
