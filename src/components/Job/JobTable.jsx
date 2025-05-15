import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  AiOutlineClose, 
  AiOutlineFileSearch
} from 'react-icons/ai';
import { 
  FaEye, 
  FaTrashAlt, 
  FaBan, 
  FaUndoAlt,
  FaCheck
} from 'react-icons/fa';
import { MdOutlineRestoreFromTrash } from 'react-icons/md';
import { jobsApi } from '../../services/api';
import ActionButtons, { ActionIcons } from '../UI/ActionButtons';
import './JobTable.scss';

const JobTable = memo(({ jobs: initialJobs, activeTab, tabs, formatDate, formatSalary, truncateText, getStatusClass, getStatusText, refreshJobs, formatSalaryUpto }) => {
  const [jobs, setJobs] = useState(initialJobs);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingJobIds, setDeletingJobIds] = useState([]);
  const [restoringJobIds, setRestoringJobIds] = useState([]);
  const [employerInfo, setEmployerInfo] = useState(null);
  
  // Toast notification state
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Update local jobs when initialJobs changes
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  // Hiển thị toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setToastVisible(true);
    
    // Tự động ẩn toast sau 3 giây
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };
  
  // Hiệu ứng auto hide toast
  useEffect(() => {
    if (!toastVisible) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 300); // Sau khi animation kết thúc
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  // Mở modal từ chối
  const handleOpenRejectModal = (job) => {
    setSelectedJob(job);
    setRejectionReason('');
    setError(null);
    setSuccess(null);
    setShowRejectModal(true);
  };

  // Đóng modal từ chối
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedJob(null);
    setRejectionReason('');
    setError(null);
    setSuccess(null);
  };

  // Fetch employer info
  const fetchEmployerInfo = async (employerId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/employers/${employerId}`);
      setEmployerInfo(response.data);
    } catch (err) {
      console.error('Error fetching employer info:', err);
      showToast('Không thể tải thông tin người đăng', 'error');
    }
  };

  // Mở modal xem chi tiết và fetch employer info
  const handleOpenDetailModal = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
    setEmployerInfo(null); // Reset employer info
    if (job.employerId) {
      fetchEmployerInfo(job.employerId);
    }
  };

  // Đóng modal xem chi tiết và reset employer info
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedJob(null);
    setEmployerInfo(null);
  };

  // Xử lý từ chối job
  const handleRejectJob = async () => {
    if (!rejectionReason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await jobsApi.rejectJob(selectedJob.jobId, { rejectionReason });
      
      // Cập nhật state ngay lập tức
      setJobs(prevJobs => prevJobs.filter(job => job.jobId !== selectedJob.jobId));
      
      setSuccess('Đã từ chối thành công');
      showToast('Đã từ chối bài đăng thành công', 'success');
      
      // Đóng modal sau 1.5 giây
      setTimeout(() => {
        handleCloseRejectModal();
        // Cập nhật lại danh sách job từ server
        if (refreshJobs) refreshJobs();
      }, 1500);
    } catch (err) {
      setError(`Lỗi khi từ chối: ${err.message || 'Không thể từ chối'}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài đăng này?')) {
      return;
    }
    
    setDeletingJobIds(prev => [...prev, jobId]);
    
    try {
      await jobsApi.deleteJob(jobId);
      
      // Cập nhật state ngay lập tức
      setJobs(prevJobs => prevJobs.filter(job => job.jobId !== jobId));
      
      showToast('Đã xóa bài đăng thành công', 'success');
      
      // Cập nhật lại danh sách từ server
      if (refreshJobs) refreshJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      
      let errorMessage = 'Không thể xóa bài đăng';
      if (err.response) {
        if (err.response.status === 405) {
          errorMessage = 'Phương thức xóa không được hỗ trợ. Vui lòng kiểm tra lại API.';
        } else {
          errorMessage = `Lỗi khi xóa: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.message) {
        errorMessage = `Lỗi khi xóa: ${err.message}`;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setDeletingJobIds(prev => prev.filter(id => id !== jobId));
    }
  };

  // Xử lý khôi phục job
  const handleRestoreJob = async (jobId) => {
    setRestoringJobIds(prev => [...prev, jobId]);
    
    try {
      await jobsApi.approveJob(jobId);
      
      // Cập nhật state ngay lập tức
      setJobs(prevJobs => prevJobs.filter(job => job.jobId !== jobId));
      
      showToast('Đã khôi phục bài đăng thành công', 'success');
      
      // Cập nhật lại danh sách từ server
      if (refreshJobs) refreshJobs();
    } catch (err) {
      console.error('Error restoring job:', err);
      
      let errorMessage = 'Không thể khôi phục bài đăng';
      if (err.response) {
        errorMessage = `Lỗi khi khôi phục: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = `Lỗi khi khôi phục: ${err.message}`;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setRestoringJobIds(prev => prev.filter(id => id !== jobId));
    }
  };

  // Xử lý phê duyệt job
  const handleApproveJob = async (jobId) => {
    setRestoringJobIds(prev => [...prev, jobId]);
    
    try {
      await jobsApi.approveJob(jobId);
      
      // Cập nhật state ngay lập tức
      setJobs(prevJobs => prevJobs.filter(job => job.jobId !== jobId));
      
      showToast('Đã phê duyệt bài đăng thành công', 'success');
      
      // Cập nhật lại danh sách từ server
      if (refreshJobs) refreshJobs();
    } catch (err) {
      console.error('Error approving job:', err);
      
      let errorMessage = 'Không thể phê duyệt bài đăng';
      if (err.response) {
        errorMessage = `Lỗi khi phê duyệt: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = `Lỗi khi phê duyệt: ${err.message}`;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setRestoringJobIds(prev => prev.filter(id => id !== jobId));
    }
  };

  // Kiểm tra xem job có đang được xóa không
  const isDeleting = (jobId) => deletingJobIds.includes(jobId);

  // Kiểm tra xem job có đang được khôi phục không
  const isRestoring = (jobId) => restoringJobIds.includes(jobId);

  // Kiểm tra các điều kiện hiển thị cho các nút
  const canReject = (job) => job.status === 'PENDING';
  const canRestore = (job) => job.status === 'DELETED';
  const canDelete = (job) => job.status !== 'DELETED';
  const canApprove = (job) => job.status === 'PENDING';

  console.log("JobTable re-rendered with", jobs.length, "jobs"); // Debug re-render

  return (
    <div className="table-container" >
      {jobs.length === 0 ? (
        <div className="empty-message" >
          <AiOutlineFileSearch />
          <p>Không có bài đăng nào{activeTab !== 'ALL' ? ` trong mục ${tabs.find(tab => tab.id === activeTab)?.label || activeTab}` : ''}</p>
        </div>
      ) : (
        <table className="job-table">
          <thead>
            <tr>
              <th className="title-column">Tiêu đề</th>
              <th className="description-column">Mô tả</th>
              <th className="job-type-column">Loại việc làm</th>
              <th className="date-column">Ngày đăng</th>
              <th className="status-column">Trạng thái</th>
              <th className="view-count-column">Lượt xem</th>
              <th className="apply-count-column">Lượt ứng tuyển</th>
              <th className="salary-column">Mức lương</th>
              <th className="actions-column">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={job.jobId}>
                <td className="job-title" title={job.title}>
                  <Link to={`/jobs/edit/${job.jobId}`}>{truncateText(job.title, 30)}</Link>
                </td>
                <td className="job-description" title={job.description}>{truncateText(job.description, 30)}</td>
                <td>{job.jobType === 'FULL_TIME' ? 'Toàn thời gian' :
                    job.jobType === 'PART_TIME' ? 'Bán thời gian' :
                    job.jobType === 'CONTRACT' ? 'Hợp đồng' :
                    job.jobType === 'INTERNSHIP' ? 'Thực tập' : job.jobType}</td>
                <td>{formatDate(job.postedAt)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(job.status)}`}>
                    {getStatusText(job.status)}
                  </span>
                </td>
                <td className="text-center">{job.viewCount}</td>
                <td className="text-center">{job.applyCount}</td>
                <td title={formatSalaryUpto(job.salaryMax, job.salaryCurrency)}>
                  {truncateText(formatSalaryUpto(job.salaryMax, job.salaryCurrency), 15)}
                </td>
                <td className="action-buttons">
                  <ActionButtons
                    actions={[
                      {
                        icon: ActionIcons.view,
                        onClick: () => handleOpenDetailModal(job),
                        title: 'Xem chi tiết',
                        className: 'btn-view'
                      },
                      ...(canApprove(job) ? [{
                        icon: ActionIcons.approve,
                        onClick: () => handleApproveJob(job.jobId),
                        title: 'Phê duyệt',
                        className: 'btn-approve'
                      }] : []),
                      ...(canReject(job) ? [{
                        icon: ActionIcons.reject,
                        onClick: () => handleOpenRejectModal(job),
                        title: 'Từ chối',
                        className: 'btn-reject'
                      }] : []),
                      ...(canRestore(job) ? [{
                        icon: ActionIcons.restore,
                        onClick: () => handleRestoreJob(job.jobId),
                        title: 'Khôi phục',
                        className: 'btn-restore'
                      }] : []),
                      ...(canDelete(job) ? [{
                        icon: ActionIcons.delete,
                        onClick: () => handleDeleteJob(job.jobId),
                        title: 'Xóa',
                        className: 'btn-delete'
                      }] : [])
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modals */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content" >
            <div className="modal-header">
              <h3>Từ chối bài đăng</h3>
              <button className="close-button" onClick={handleCloseRejectModal}>
                <AiOutlineClose />
              </button>
            </div>
            <div className="modal-body">
              <div className="job-info">
                <h4>{selectedJob.title}</h4>
                <p>ID: {selectedJob.jobId}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="rejectionReason">Lý do từ chối:</label>
                <textarea 
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối bài đăng này..."
                  rows={4}
                  className="form-control"
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseRejectModal}
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleRejectJob}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedJob && (
        <div className="modal-overlay" >
          <div className="modal-content" >
            <div className="modal-header">
              <h3>Chi tiết bài đăng</h3>
              <button className="close-button" onClick={handleCloseDetailModal}>
                <AiOutlineClose />
              </button>
            </div>
            <div className="modal-body">
              <div className="job-detail">
                <h2>{selectedJob.title}</h2>

                {/* Employer Information Section */}
                <div className="employer-info">
                  <h4>Thông tin người đăng</h4>
                  {employerInfo ? (
                    <div className="employer-card">
                      <div className="employer-avatar">
                        <img 
                          src={employerInfo.companyLogo || './../../assets/images/default-avatar.svg'} 
                          alt={employerInfo.companyName}
                          onError={(e) => {
                            e.target.src = './../../assets/images/default-avatar.svg';
                          }}
                        />
                      </div>
                      <div className="employer-details">
                        <p className="employer-name">{employerInfo.companyName}</p>
                        <p className="employer-email">{employerInfo.contactPhone}</p>
                        <p className="employer-email">{employerInfo.companyWebsite}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="employer-loading">
                      <p>Đang tải thông tin người đăng...</p>
                    </div>
                  )}
                </div>
                
                <div className="job-metadata">
                  <p><strong>ID:</strong> {selectedJob.jobId}</p>
                  <p><strong>Trạng thái:</strong> <span className={`status-badge ${getStatusClass(selectedJob.status)}`}>{getStatusText(selectedJob.status)}</span></p>
                  <p><strong>Ngày đăng:</strong> {formatDate(selectedJob.postedAt)}</p>
                  <p><strong>Loại hình:</strong> {
                    selectedJob.jobType === 'FULL_TIME' ? 'Toàn thời gian' :
                    selectedJob.jobType === 'PART_TIME' ? 'Bán thời gian' :
                    selectedJob.jobType === 'CONTRACT' ? 'Hợp đồng' :
                    selectedJob.jobType === 'INTERNSHIP' ? 'Thực tập' : selectedJob.jobType
                  }</p>
                  <p><strong>Mức lương:</strong> {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax, selectedJob.salaryCurrency)}</p>
                </div>

                <div className="job-section">
                  <h4>Mô tả công việc</h4>
                  <p>{selectedJob.description}</p>
                </div>

                <div className="job-section">
                  <h4>Yêu cầu</h4>
                  <p>{selectedJob.requirement}</p>
                </div>

                <div className="job-stats">
                  <p><strong>Lượt xem:</strong> {selectedJob.viewCount}</p>
                  <p><strong>Lượt ứng tuyển:</strong> {selectedJob.applyCount}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={handleCloseDetailModal}
              >
                Đóng
              </button>
              {canApprove(selectedJob) && (
                <button 
                  className="btn btn-success" 
                  onClick={() => {
                    handleCloseDetailModal();
                    handleApproveJob(selectedJob.jobId);
                  }}
                >
                  Phê duyệt bài đăng
                </button>
              )}
              {canReject(selectedJob) && (
                <button 
                  className="btn btn-danger" 
                  onClick={() => {
                    handleCloseDetailModal();
                    handleOpenRejectModal(selectedJob);
                  }}
                >
                  Từ chối bài đăng
                </button>
              )}
              {canRestore(selectedJob) && (
                <button 
                  className="btn btn-success" 
                  onClick={() => {
                    handleCloseDetailModal();
                    handleRestoreJob(selectedJob.jobId);
                  }}
                >
                  Khôi phục bài đăng
                </button>
              )}
              {canDelete(selectedJob) && (
                <button 
                  className="btn btn-danger" 
                  onClick={() => {
                    handleCloseDetailModal();
                    handleDeleteJob(selectedJob.jobId);
                  }}
                >
                  Xóa bài đăng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast ${toastVisible ? 'show' : ''} ${toast.type}`} >
          {toast.message}
        </div>
      )}
    </div>
  );
});

JobTable.propTypes = {
  jobs: PropTypes.arrayOf(
    PropTypes.shape({
      jobId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      requirement: PropTypes.string,
      jobType: PropTypes.string.isRequired,
      postedAt: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      viewCount: PropTypes.number,
      applyCount: PropTypes.number,
      salaryMin: PropTypes.number.isRequired,
      salaryMax: PropTypes.number.isRequired,
      salaryCurrency: PropTypes.string.isRequired
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  tabs: PropTypes.array.isRequired,
  formatDate: PropTypes.func.isRequired,
  formatSalary: PropTypes.func.isRequired,
  formatSalaryUpto: PropTypes.func.isRequired,
  truncateText: PropTypes.func.isRequired,
  getStatusClass: PropTypes.func.isRequired,
  getStatusText: PropTypes.func.isRequired,
  refreshJobs: PropTypes.func
};

export default JobTable; 