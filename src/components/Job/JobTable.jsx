import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
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

const JobTable = ({ jobs, activeTab, tabs, formatDate, formatSalary, truncateText, getStatusClass, getStatusText, refreshJobs }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingJobIds, setDeletingJobIds] = useState([]);
  const [restoringJobIds, setRestoringJobIds] = useState([]);
  
  // Toast notification state
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

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

  // Mở modal xem chi tiết
  const handleOpenDetailModal = (job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  // Đóng modal xem chi tiết
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedJob(null);
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
      setSuccess('Đã từ chối thành công');
      setLoading(false);
      
      // Đóng modal sau 1.5 giây
      setTimeout(() => {
        handleCloseRejectModal();
        // Cập nhật lại danh sách job
        if (refreshJobs) refreshJobs();
        // Hiển thị toast sau khi đóng modal
        showToast('Đã từ chối bài đăng thành công', 'success');
      }, 1500);
    } catch (err) {
      setError(`Lỗi khi từ chối: ${err.message || 'Không thể từ chối'}`);
      setLoading(false);
    }
  };

  // Xử lý xóa job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài đăng này?')) {
      return;
    }
    
    // Thêm jobId vào danh sách đang xóa
    setDeletingJobIds(prev => [...prev, jobId]);
    
    try {
      // Đổi method từ DELETE sang PUT hoặc POST nếu server yêu cầu
      await jobsApi.deleteJob(jobId);
      
      // Hiển thị toast và cập nhật danh sách
      setTimeout(() => {
        // Xóa jobId khỏi danh sách đang xóa
        setDeletingJobIds(prev => prev.filter(id => id !== jobId));
        // Cập nhật lại danh sách job
        if (refreshJobs) refreshJobs();
        // Hiển thị toast message
        showToast('Đã xóa bài đăng thành công', 'success');
      }, 1000);
    } catch (err) {
      console.error('Error deleting job:', err);
      
      // Xử lý lỗi 405 Method Not Allowed
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
      
      // Hiển thị toast thông báo lỗi
      showToast(errorMessage, 'error');
      
      // Xóa jobId khỏi danh sách đang xóa
      setDeletingJobIds(prev => prev.filter(id => id !== jobId));
    }
  };

  // Xử lý khôi phục job (approve)
  const handleRestoreJob = async (jobId) => {
    // Thêm jobId vào danh sách đang khôi phục
    setRestoringJobIds(prev => [...prev, jobId]);
    
    try {
      // Gọi API để khôi phục (approve) job
      await jobsApi.approveJob(jobId);
      
      // Hiển thị toast và cập nhật danh sách
      setTimeout(() => {
        // Xóa jobId khỏi danh sách đang khôi phục
        setRestoringJobIds(prev => prev.filter(id => id !== jobId));
        // Cập nhật lại danh sách job
        if (refreshJobs) refreshJobs();
        // Hiển thị toast message
        showToast('Đã khôi phục bài đăng thành công', 'success');
      }, 1000);
    } catch (err) {
      console.error('Error restoring job:', err);
      
      // Xử lý lỗi
      let errorMessage = 'Không thể khôi phục bài đăng';
      
      if (err.response) {
        errorMessage = `Lỗi khi khôi phục: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = `Lỗi khi khôi phục: ${err.message}`;
      }
      
      // Hiển thị toast thông báo lỗi
      showToast(errorMessage, 'error');
      
      // Xóa jobId khỏi danh sách đang khôi phục
      setRestoringJobIds(prev => prev.filter(id => id !== jobId));
    }
  };

  // Kiểm tra xem job có đang được xóa không
  const isDeleting = (jobId) => {
    return deletingJobIds.includes(jobId);
  };

  // Kiểm tra xem job có đang được khôi phục không
  const isRestoring = (jobId) => {
    return restoringJobIds.includes(jobId);
  };

  // Kiểm tra các điều kiện hiển thị cho các nút
  const canReject = (job) => {
    return job.status === 'PENDING';
  };

  const canRestore = (job) => {
    return job.status === 'DELETED';
  };
  
  const canDelete = (job) => {
    return job.status !== 'DELETED'; // Không hiển thị nút xóa cho bài đăng đã xóa
  };

  // Thêm điều kiện hiển thị nút phê duyệt (chỉ cho bài PENDING)
  const canApprove = (job) => {
    return job.status === 'PENDING';
  };

  // Xử lý phê duyệt bài đăng
  const handleApproveJob = async (jobId) => {
    // Thêm jobId vào danh sách đang khôi phục (dùng cùng state)
    setRestoringJobIds(prev => [...prev, jobId]);
    
    try {
      // Gọi API để phê duyệt job
      await jobsApi.approveJob(jobId);
      
      // Hiển thị toast và cập nhật danh sách
      setTimeout(() => {
        // Xóa jobId khỏi danh sách đang xử lý
        setRestoringJobIds(prev => prev.filter(id => id !== jobId));
        // Cập nhật lại danh sách job
        if (refreshJobs) refreshJobs();
        // Hiển thị toast message
        showToast('Đã phê duyệt bài đăng thành công', 'success');
      }, 1000);
    } catch (err) {
      console.error('Error approving job:', err);
      
      // Xử lý lỗi
      let errorMessage = 'Không thể phê duyệt bài đăng';
      
      if (err.response) {
        errorMessage = `Lỗi khi phê duyệt: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = `Lỗi khi phê duyệt: ${err.message}`;
      }
      
      // Hiển thị toast thông báo lỗi
      showToast(errorMessage, 'error');
      
      // Xóa jobId khỏi danh sách đang khôi phục
      setRestoringJobIds(prev => prev.filter(id => id !== jobId));
    }
  };

  return (
    <div className="table-container">
      {/* Toast notification */}
      {toast && (
        <div className={`toast-container ${toastVisible ? 'visible' : ''} ${toast.type}`}>
          <div className="toast-content">
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToastVisible(false)}>
              <AiOutlineClose />
            </button>
          </div>
        </div>
      )}

      <table className="job-table">
        <thead>
          <tr>
            <th className="title-column">Tiêu đề</th>
            <th className="requirement-column">Yêu cầu</th>
            <th className="job-type-column">Loại hình</th>
            <th className="date-column">Ngày đăng</th>
            <th className="status-column">Trạng thái</th>
            <th className="view-count-column">Lượt xem</th>
            <th className="apply-count-column">Ứng tuyển</th>
            <th className="salary-column">Mức lương</th>
            <th className="actions-column">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan="9" className="empty-message">
                <div>
                  <AiOutlineFileSearch size={32} />
                  <p>Không có bài đăng nào{activeTab !== 'ALL' ? ` trong mục ${tabs.find(tab => tab.value === activeTab)?.label || activeTab}` : ''}</p>
                </div>
              </td>
            </tr>
          ) : (
            jobs.map(job => (
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
                <td title={formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}>
                  {truncateText(formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency), 15)}
                </td>
                <td className="action-buttons">
                  <ActionButtons 
                    actions={[
                      {
                        icon: ActionIcons.view,
                        onClick: () => handleOpenDetailModal(job),
                        title: 'Xem chi tiết',
                        className: 'btn-view',
                        disabled: isDeleting(job.jobId) || isRestoring(job.jobId)
                      },
                      {
                        icon: ActionIcons.reject,
                        onClick: () => handleOpenRejectModal(job),
                        title: 'Từ chối bài đăng',
                        className: 'btn-reject',
                        disabled: isDeleting(job.jobId) || isRestoring(job.jobId),
                        show: canReject(job)
                      },
                      {
                        icon: ActionIcons.restore,
                        onClick: () => handleRestoreJob(job.jobId),
                        title: isRestoring(job.jobId) ? 'Đang khôi phục...' : 'Khôi phục bài đăng',
                        className: 'btn-restore',
                        disabled: isDeleting(job.jobId) || isRestoring(job.jobId),
                        loading: isRestoring(job.jobId),
                        show: canRestore(job)
                      },
                      {
                        icon: ActionIcons.delete,
                        onClick: () => handleDeleteJob(job.jobId),
                        title: isDeleting(job.jobId) ? 'Đang xóa...' : 'Xóa bài đăng',
                        className: 'btn-delete',
                        disabled: isDeleting(job.jobId) || isRestoring(job.jobId),
                        loading: isDeleting(job.jobId),
                        show: canDelete(job)
                      }
                    ]}
                    variant="with-dividers"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal từ chối */}
      {showRejectModal && selectedJob && (
        <div className="modal-overlay" onClick={handleCloseRejectModal}>
          <div className="modal-container reject-modal" onClick={e => e.stopPropagation()}>
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

      {/* Modal xem chi tiết */}
      {showDetailModal && selectedJob && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-container detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết bài đăng</h3>
              <button className="close-button" onClick={handleCloseDetailModal}>
                <AiOutlineClose />
              </button>
            </div>
            <div className="modal-body">
              <div className="job-detail">
                <h2>{selectedJob.title}</h2>
                
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
    </div>
  );
};

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
  truncateText: PropTypes.func.isRequired,
  getStatusClass: PropTypes.func.isRequired,
  getStatusText: PropTypes.func.isRequired,
  refreshJobs: PropTypes.func
};

export default JobTable; 