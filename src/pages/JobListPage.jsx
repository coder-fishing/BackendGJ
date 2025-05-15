import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { jobsApi } from '../services/api';
import SearchFilter from '../components/Search/SearchFilter';
import { 
  JobTable,
  JobStatusTabs 
} from '../components/Job';
import { 
  PageHeader,
  LoadingSpinner, 
  Pagination 
} from '../components/common';
import { 
  getStatusClass, 
  getStatusText, 
  truncateText, 
  formatSalary, 
  formatDate 
} from '../utils/jobUtils';

import '../styles/JobListPage.scss';

const JobListPage = () => {
  // Lấy thông tin từ React Router
  const { status } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Các state quản lý dữ liệu
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    salary: '',
    jobType: '',
    status: ''
  });
  
  // Xác định tab hiện tại dựa vào URL
  const [activeTab, setActiveTab] = useState(() => {
    if (status) {
      return status.toUpperCase();
    }
    return 'ALL';
  });

  // Phân trang
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // Đảm bảo pageSize là số nguyên
  const pageSize = 8;

  // Số lượng job theo từng trạng thái
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
      console.log('Setting status from URL:', status.toUpperCase());
      setActiveTab(status.toUpperCase());
    } else {
      console.log('Setting status to ALL');
      setActiveTab('ALL');
    }
  }, [status]);

  // Lấy danh sách jobs từ API
  const fetchJobs = async () => { 
    try {
      setLoading(true);
      setError(null);

      // Lấy status từ URL
      const currentStatus = status ? status.toUpperCase() : 'ALL';
      console.log('Current status from URL:', currentStatus);

      const response = await jobsApi.getJobspage(page, pageSize, currentStatus);
      console.log('API Response:', response);

      if (response?.content) {
        setJobs(response.content);
        setTotalPages(response.totalPages || 1);
        console.log(`Loaded ${response.content.length} jobs`);
      } else {
        setJobs([]);
        setTotalPages(0);
        console.log('No jobs found');
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

  // Fetch jobs khi status hoặc page thay đổi
  useEffect(() => {
    console.log('Status or page changed, fetching jobs...');
    fetchJobs();
  }, [status, page]);

  // Lấy số lượng job theo từng trạng thái
  const fetchJobCounts = async () => {
    try {
      const response = await jobsApi.getJobsCount();
      console.log('Job counts:', response);
      
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

  // Xử lý khi thay đổi filter
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
    // Ứng dụng có thể thêm gọi API với filters nếu cần
  };

  // Xử lý khi thay đổi trang
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // Xử lý khi click vào tab
  const handleTabChange = (tab) => {
    console.log('Changing tab to:', tab);
    setPage(0);
    
    if (tab === 'ALL') {
      navigate('/jobs');
    } else {
      navigate(`/admin/jobs/status/${tab.toLowerCase()}`);
    }
  };

  // Danh sách các tab hiển thị
  const tabs = [
    { id: 'ALL', label: 'Tất cả', count: statusCounts.ALL },
    { id: 'PENDING', label: 'Đang chờ', count: statusCounts.PENDING, className: 'pending' },
    { id: 'APPROVED', label: 'Đã duyệt', count: statusCounts.APPROVED, className: 'approved' },
    { id: 'REJECTED', label: 'Từ chối', count: statusCounts.REJECTED, className: 'rejected' },
    { id: 'DELETED', label: 'Đã xóa', count: statusCounts.DELETED, className: 'deleted' }
  ];

  // Hàm này sẽ được truyền xuống JobTable để cập nhật lại dữ liệu khi có thay đổi
  const refreshJobs = () => {
    console.log('Cập nhật lại danh sách bài đăng');
    fetchJobs();
  };

  // Hiển thị loading spinner khi đang tải dữ liệu
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
        data-aos="fade-down"
        data-aos-duration="800" 
      />

      <JobStatusTabs 
        tabs={tabs} 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
        data-aos="fade-up"
        data-aos-delay="100"
      />

      <SearchFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        data-aos="fade-up"
        data-aos-delay="200" 
      />

      {error && <div className="error-message" data-aos="fade-up">{error}</div>}

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
        data-aos="fade-up"
        data-aos-delay="300"
      />

      {/* Debug phân trang */}
      <div style={{margin: '10px 0', fontSize: '12px', color: '#666'}} data-aos="fade-up" data-aos-delay="400">
        Debug: Page {page + 1}/{totalPages} - Số bài đăng: {jobs.length} - PageSize  {pageSize}
      </div>

      {totalPages > 0 && (
        <Pagination 
          page={page}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          data-aos="fade-up"
          data-aos-delay="500"
        />
      )}
    </div>
  );
};

export default JobListPage;
