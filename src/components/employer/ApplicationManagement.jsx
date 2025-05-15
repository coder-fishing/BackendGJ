import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import defaultAvatar from '../../assets/images/default-avatar.svg';
import './ApplicationManagement.scss';
import AOS from 'aos';
import 'aos/dist/aos.css';

const STATUS_COLORS = {
    PENDING: '#ffd700',    // Vàng
  REVIEWING: '#2196f3',  // Xanh dương
  APPROVED: '#4caf50',   // Xanh lá
  REJECTED: '#f44336',   // Đỏ
  WITHDRAWN: '#9e9e9e'   // Xám
};

const STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  REVIEWING: 'Đang xem xét',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  WITHDRAWN: 'Đã rút'
};

const ApplicationStatus = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};

const ApplicationManagement = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState({
    applicationId: null,
    action: null
  });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    applicationId: null,
    status: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    fetchEmployerApplications();
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });
  }, [currentUser]);

  const fetchEmployerApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/api/applications/employer/${currentUser.id}`);
      setApplications(response.data);
    } catch (err) {
      setError('Không thể tải danh sách ứng tuyển');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = async (applicationId) => {
    try {
      await axios.put(`http://localhost:8080/api/applications/${applicationId}/view`);
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, employerViewed: true }
            : app
        )
      );
    } catch (err) {
      console.error('Error marking application as viewed:', err);
    }
  };

  const showConfirmDialog = (applicationId, status) => {
    const application = applications.find(app => app.id === applicationId);
    const title = status === ApplicationStatus.APPROVED ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối';
    const message = status === ApplicationStatus.APPROVED 
      ? `Bạn có chắc chắn muốn duyệt đơn ứng tuyển của ${application?.applicantName || 'ứng viên'} không?`
      : `Bạn có chắc chắn muốn từ chối đơn ứng tuyển của ${application?.applicantName || 'ứng viên'} không?`;

    setConfirmDialog({
      show: true,
      applicationId,
      status,
      title,
      message
    });
  };

  const handleUpdateStatus = async () => {
    const { applicationId, status } = confirmDialog;
    if (!applicationId) {
      console.error('No application ID provided');
      return;
    }

    setActionLoading({
      applicationId,
      action: status
    });

    try {
      const url = `http://localhost:8080/api/applications/${applicationId.toString()}/status`;
      console.log('Calling API:', url, 'with status:', status);

      const response = await axios.put(url, null, {
        params: {
          status: status
        }
      });
      
      console.log('Response:', response.data);
      
      setApplications(apps =>
        apps.map(app =>
          app.id === applicationId
            ? { ...app, status: status }
            : app
        )
      );

      const application = applications.find(app => app.id === applicationId);
      if (application?.applicantName) {
        const notification = {
          id: Date.now(),
          message: `Đơn ứng tuyển của ${application.applicantName} đã được ${STATUS_LABELS[status].toLowerCase()}`,
          type: status.toLowerCase()
        };
        setNotifications(prev => [notification, ...prev]);
      }

    } catch (err) {
      console.error('Error updating application status:', err);
      console.error('Error details:', err.response?.data);
      setNotifications(prev => [{
        id: Date.now(),
        message: `Không thể cập nhật trạng thái: ${err.response?.data?.message || 'Vui lòng thử lại sau'}`,
        type: 'error'
      }, ...prev]);
    } finally {
      setActionLoading({
        applicationId: null,
        action: null
      });
      setConfirmDialog({ show: false, applicationId: null, status: null, title: '', message: '' });
    }
  };

  const handleViewResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  const filteredApplications = selectedStatus === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === selectedStatus);

  const getStatusCount = (status) => {
    if (status === 'ALL') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="application-management">
      <div className="header" data-aos="fade-down">
        <h2>Quản lý đơn ứng tuyển</h2>
      </div>

      <div className="status-tabs" data-aos="fade-up" data-aos-delay="200">
        <button 
          className={`tab ${selectedStatus === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedStatus('ALL')}
        >
          Tất cả ({getStatusCount('ALL')})
        </button>
        <button 
          className={`tab ${selectedStatus === ApplicationStatus.PENDING ? 'active' : ''}`}
          onClick={() => setSelectedStatus(ApplicationStatus.PENDING)}
        >
          Chờ duyệt ({getStatusCount(ApplicationStatus.PENDING)})
        </button>
        <button 
          className={`tab ${selectedStatus === ApplicationStatus.APPROVED ? 'active' : ''}`}
          onClick={() => setSelectedStatus(ApplicationStatus.APPROVED)}
        >
          Đã duyệt ({getStatusCount(ApplicationStatus.APPROVED)})
        </button>
        <button 
          className={`tab ${selectedStatus === ApplicationStatus.REJECTED ? 'active' : ''}`}
          onClick={() => setSelectedStatus(ApplicationStatus.REJECTED)}
        >
          Đã từ chối ({getStatusCount(ApplicationStatus.REJECTED)})
        </button>
      </div>

      <div className="notifications">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        ))}
      </div>

      <div className="applications-container">
      <div className="applications-grid">
          {filteredApplications.map((application, index) => (
          <div 
            key={application.id} 
            className={`application-card ${!application.employerViewed ? 'unviewed' : ''}`}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              data-aos-anchor-placement="top-bottom"
          >
            <div className="applicant-info">
              <img 
                src={defaultAvatar}
                alt={application.applicantName || 'Ứng viên'}
                className="avatar"
              />
              <div className="details">
                <h3>{application.applicantName || 'Chưa cập nhật'}</h3>
                <p className="email">{application.applicantEmail || 'Chưa cập nhật'}</p>
                <div className="resume-section">
                  <button 
                    className="resume-btn"
                    onClick={() => handleViewResume(application.resumeUrl)}
                    title="Xem CV"
                  >
                    Xem CV
                  </button>
                </div>
              </div>
            </div>

            <div className="job-info">
              <h4>{application.jobTitle || 'Không có tiêu đề'}</h4>
              <p className="applied-date">
                Ngày ứng tuyển: {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('vi-VN') : 'Không xác định'}
              </p>
              {application.coverLetter && (
                <p className="cover-letter">
                  Thư xin việc: {application.coverLetter}
                </p>
              )}
            </div>

            <div className="status" style={{ backgroundColor: STATUS_COLORS[application.status] }}>
              {STATUS_LABELS[application.status]}
            </div>

            <div className="actions">
              <button
                className="view-btn"
                onClick={() => handleViewApplication(application.id)}
                title="Xem chi tiết"
                disabled={actionLoading.applicationId === application.id}
              >
                <FaEye />
              </button>

              {application.status === ApplicationStatus.PENDING && (
                <>
                  <button
                    className="approve-btn"
                    onClick={() => showConfirmDialog(application.id, ApplicationStatus.APPROVED)}
                    title="Duyệt đơn"
                    disabled={actionLoading.applicationId === application.id}
                  >
                    {actionLoading.applicationId === application.id && actionLoading.action === ApplicationStatus.APPROVED ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <FaCheck />
                    )}
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => showConfirmDialog(application.id, ApplicationStatus.REJECTED)}
                    title="Từ chối"
                    disabled={actionLoading.applicationId === application.id}
                  >
                    {actionLoading.applicationId === application.id && actionLoading.action === ApplicationStatus.REJECTED ? (
                      <div className="loading-spinner"></div>
                    ) : (
                      <FaTimes />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

        {filteredApplications.length === 0 && (
        <div className="empty-state">
            {selectedStatus === 'ALL' 
              ? 'Chưa có đơn ứng tuyển nào'
              : `Chưa có đơn ứng tuyển nào ${STATUS_LABELS[selectedStatus].toLowerCase()}`
            }
        </div>
      )}
      </div>

      {confirmDialog.show && (
        <div className="modal-overlay">
          <div className="confirm-modal" data-aos="zoom-in" data-aos-duration="400">
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setConfirmDialog({ show: false, applicationId: null, status: null, title: '', message: '' })}
                disabled={actionLoading.applicationId === confirmDialog.applicationId}
              >
                Hủy
              </button>
              <button 
                className={confirmDialog.status === ApplicationStatus.APPROVED ? 'approve-btn' : 'reject-btn'}
                onClick={handleUpdateStatus}
                disabled={actionLoading.applicationId === confirmDialog.applicationId}
              >
                {actionLoading.applicationId === confirmDialog.applicationId ? (
                  <div className="loading-spinner"></div>
                ) : (
                  confirmDialog.status === ApplicationStatus.APPROVED ? 'Duyệt' : 'Từ chối'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement; 