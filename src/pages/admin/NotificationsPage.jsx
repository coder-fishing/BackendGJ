import React, { useState, useEffect, useRef } from 'react';
import { FaCheck, FaTrash, FaBell, FaFilter, FaSync, FaEye, FaEyeSlash } from 'react-icons/fa';
import { AiOutlineCheckCircle, AiOutlineBell, AiOutlineClose } from 'react-icons/ai';
import { useNotifications } from '../../utils/NotificationContext';
import { notificationApi } from '../../services/api';
import { formatTimeAgo, formatDateTime } from '../../utils/dateUtils';
import ActionButtons, { ActionIcons } from '../../components/UI/ActionButtons';
import './NotificationsPage.scss';
import { useNavigate, useLocation } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL'); // 'ALL', 'READ', 'UNREAD'
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const location = useLocation();
  const highlightedNotificationRef = useRef(null);
  
  // Get markAllAsRead and refreshNotifications from context
  const { markAsRead, markMultipleAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  // Get the highlighted notification ID from URL
  const highlightedId = new URLSearchParams(location.search).get('highlight');
  
  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // Handle opening detail modal
  const handleOpenDetailModal = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };
  
  // Handle closing detail modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };
  
  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      setIsDeleting(true);
      await deleteNotification(notificationId);
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showToast('Thông báo đã được xóa thành công', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('Không thể xóa thông báo. Vui lòng thử lại.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Load notifications based on current filters and pagination
  useEffect(() => {
    fetchNotifications();
  }, [currentPage, pageSize, selectedFilter, readFilter]);
  
  // Effect to scroll to highlighted notification
  useEffect(() => {
    if (highlightedId && highlightedNotificationRef.current) {
      highlightedNotificationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add temporary highlight effect
      highlightedNotificationRef.current.classList.add('highlighted');
      setTimeout(() => {
        highlightedNotificationRef.current.classList.remove('highlighted');
      }, 2000);
    }
  }, [highlightedId, notifications]);
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let response;
      
      // Fetch based on the selected filter
      if (selectedFilter !== 'ALL') {
        response = await notificationApi.getNotificationsByType(
          selectedFilter, 
          currentPage, 
          pageSize
        );
      } else if (readFilter !== 'ALL') {
        const isRead = readFilter === 'READ';
        response = await notificationApi.getNotificationsByReadStatus(
          isRead, 
          currentPage, 
          pageSize
        );
      } else {
        response = await notificationApi.getNotifications(currentPage, pageSize);
      }
      
      setNotifications(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again later.');
      setNotifications([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Handle page size change
  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0); // Reset to first page when changing page size
  };
  
  // Handle type filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(0); // Reset to first page when changing filter
  };
  
  // Handle read status filter change
  const handleReadFilterChange = (filter) => {
    setReadFilter(filter);
    setCurrentPage(0); // Reset to first page when changing filter
  };
  
  // Handle selection of a notification
  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };
  
  // Handle selection of all notifications on current page
  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };
  
  // Handle marking selected notifications as read
  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length > 0) {
      try {
        await markMultipleAsRead(selectedNotifications);
        // Refresh the list after marking as read
        fetchNotifications();
        // Clear selection
        setSelectedNotifications([]);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
        setError('Failed to mark notifications as read');
      }
    }
  };
  
  // Handle marking a single notification as read
  const handleMarkAsRead = async (notificationId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await markAsRead(notificationId);
      // Update the local state to reflect the change
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Refresh the list after marking all as read
      fetchNotifications();
      // Clear selection
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read');
    }
  };
  
  // Helper to get notification details based on type
  const getNotificationDetails = (notification) => {
    const { type, jobTitle, reason } = notification;
    
    switch (type) {
      case 'NEW_JOB':
        return {
          icon: <AiOutlineBell className="icon new" />,
          title: 'Bài đăng mới cần duyệt',
          message: `Bài đăng "${jobTitle}" vừa được tạo`
        };
      case 'APPROVE':
        return {
          icon: <AiOutlineCheckCircle className="icon approve" />,
          title: 'Bài đăng được phê duyệt',
          message: `Bài đăng "${jobTitle}" đã được phê duyệt`
        };
      case 'REJECT':
        return {
          icon: <FaBell className="icon reject" />,
          title: 'Bài đăng bị từ chối',
          message: `Bài đăng "${jobTitle}" bị từ chối${reason ? `: ${reason}` : ''}`
        };
      case 'DELETE':
        return {
          icon: <FaBell className="icon delete" />,
          title: 'Bài đăng bị xóa',
          message: `Bài đăng "${jobTitle}" đã bị xóa`
        };
      default:
        return {
          icon: <AiOutlineBell className="icon" />,
          title: 'Thông báo mới',
          message: `Bạn có thông báo mới về "${jobTitle}"`
        };
    }
  };
  
  // Render notification table rows
  const renderNotificationRow = (notification) => {
    const details = getNotificationDetails(notification);
    const isSelected = selectedNotifications.includes(notification.id);
    const isHighlighted = notification.id.toString() === highlightedId;
    
    // Define actions for this notification
    const actions = [
      {
        icon: ActionIcons.view,
        onClick: () => handleOpenDetailModal(notification),
        title: 'Xem chi tiết',
        className: 'btn-view'
      },
      {
        icon: ActionIcons.markRead,
        onClick: (e) => handleMarkAsRead(notification.id, e),
        title: 'Đánh dấu đã đọc',
        className: 'btn-restore',
        show: !notification.read
      },
      {
        icon: ActionIcons.delete,
        onClick: () => handleDeleteNotification(notification.id),
        title: 'Xóa thông báo',
        className: 'btn-delete'
      }
    ];
    
    return (
      <tr 
        key={notification.id}
        ref={isHighlighted ? highlightedNotificationRef : null}
        className={`
          notification-row
          ${isSelected ? 'selected' : ''}
          ${notification.read ? 'read' : 'unread'}
          ${isHighlighted ? 'highlighted' : ''}
        `}
      >
        <td>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectNotification(notification.id)}
          />
        </td>
        <td className="notification-type">
          {details.icon}
          <span>{details.title}</span>
        </td>
        <td className="notification-message">
          {details.message}
        </td>
        <td className="notification-time">
          {formatTimeAgo(notification.timestamp)}
        </td>
        <td className="notification-status">
          <span className={notification.read ? 'read' : 'unread'}>
            {notification.read ? 'Đã đọc' : 'Chưa đọc'}
          </span>
        </td>
        <td className="notification-actions">
          <ActionButtons actions={actions} />
        </td>
      </tr>
    );
  };
  
  const navigateToJob = (jobId) => {
    // Implement the logic to navigate to the job page
    console.log(`Navigating to job page with ID: ${jobId}`);
  };
  
  return (
    <div className="notifications-page">
      {/* Toast notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <p>{toast.message}</p>
          <button onClick={() => setToast(null)}>
            <AiOutlineClose />
          </button>
        </div>
      )}
    
      <header className="page-header">
        <h1>Quản lý thông báo</h1>
        <div className="header-actions">
          <button 
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
          >
            <FaSync /> 
            <span>Làm mới</span>
          </button>
        </div>
      </header>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={handleRefresh}>Thử lại</button>
        </div>
      )}
      
      <div className="filters-container">
        <div className="filter-group">
          <label><FaFilter /> Loại thông báo:</label>
          <div className="filter-buttons">
            <button 
              className={selectedFilter === 'ALL' ? 'active' : ''}
              onClick={() => handleFilterChange('ALL')}
            >
              Tất cả
            </button>
            <button 
              className={selectedFilter === 'NEW_JOB' ? 'active' : ''}
              onClick={() => handleFilterChange('NEW_JOB')}
            >
              Bài đăng mới
            </button>
            <button 
              className={selectedFilter === 'APPROVE' ? 'active' : ''}
              onClick={() => handleFilterChange('APPROVE')}
            >
              Phê duyệt
            </button>
            <button 
              className={selectedFilter === 'REJECT' ? 'active' : ''}
              onClick={() => handleFilterChange('REJECT')}
            >
              Từ chối
            </button>
            <button 
              className={selectedFilter === 'DELETE' ? 'active' : ''}
              onClick={() => handleFilterChange('DELETE')}
            >
              Xóa
            </button>
          </div>
        </div>
        
        <div className="filter-group">
          <label><FaEye /> Trạng thái đọc:</label>
          <div className="filter-buttons">
            <button 
              className={readFilter === 'ALL' ? 'active' : ''}
              onClick={() => handleReadFilterChange('ALL')}
            >
              Tất cả
            </button>
            <button 
              className={readFilter === 'READ' ? 'active' : ''}
              onClick={() => handleReadFilterChange('READ')}
            >
              Đã đọc
            </button>
            <button 
              className={readFilter === 'UNREAD' ? 'active' : ''}
              onClick={() => handleReadFilterChange('UNREAD')}
            >
              Chưa đọc
            </button>
          </div>
        </div>
      </div>
      
      <div className="bulk-actions">
        <div className="selection-info">
          {selectedNotifications.length > 0 ? (
            <span>Đã chọn {selectedNotifications.length} thông báo</span>
          ) : (
            <span>Chọn thông báo để thực hiện hành động</span>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="select-all-button"
            onClick={handleSelectAll}
          >
            {selectedNotifications.length === notifications.length && notifications.length > 0
              ? 'Bỏ chọn tất cả'
              : 'Chọn tất cả'}
          </button>
          
          {selectedNotifications.length > 0 && (
            <button 
              className="mark-selected-button"
              onClick={handleMarkSelectedAsRead}
            >
              <FaCheck /> Đánh dấu đã đọc
            </button>
          )}
          
          <button 
            className="mark-all-button"
            onClick={handleMarkAllAsRead}
          >
            <FaCheck /> Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>
      
      <div className="notifications-table-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <FaBell className="empty-icon" />
            <h2>Không có thông báo nào</h2>
            <p>Khi có thông báo mới, bạn sẽ thấy chúng ở đây</p>
          </div>
        ) : (
          <table className="notifications-table">
            <thead>
              <tr>
                <th className="select-header">
                  <input 
                    type="checkbox" 
                    checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="icon-header"></th>
                <th>Thông báo</th>
                <th className="status-header">Thời Gian</th>
                <th className="status-header">Trạng thái</th>
                <th className="status-header">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(renderNotificationRow)}
            </tbody>
          </table>
        )}
      </div>
      
      {!loading && notifications.length > 0 && (
        <div className="pagination-controls">
          <div className="page-info">
            Hiển thị {Math.min(pageSize, notifications.length)} / {totalElements} thông báo
          </div>
          
          <div className="page-size-selector">
            <label>Dòng mỗi trang:</label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          
          <div className="page-buttons">
            <button 
              onClick={() => handlePageChange(0)}
              disabled={currentPage === 0}
            >
              Đầu
            </button>
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Trước
            </button>
            
            <div className="page-number">
              Trang {currentPage + 1} / {Math.max(1, totalPages)}
            </div>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Sau
            </button>
            <button 
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Cuối
            </button>
          </div>
        </div>
      )}
      
      {/* Notification Detail Modal */}
      {showDetailModal && selectedNotification && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-container notification-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết thông báo</h3>
              <button className="close-button" onClick={handleCloseDetailModal}>
                <AiOutlineClose />
              </button>
            </div>
            <div className="modal-body">
              {selectedNotification && (
                <div className="notification-detail">
                  <div className="notification-info">
                    <div className="notification-type">
                      {getNotificationDetails(selectedNotification).icon}
                      <h4>{getNotificationDetails(selectedNotification).title}</h4>
                    </div>
                    
                    <div className="notification-metadata">
                      <p className="timestamp">
                        <strong>Thời gian:</strong> {formatDateTime(selectedNotification.timestamp)}
                      </p>
                      <p className="status">
                        <strong>Trạng thái:</strong>
                        <span className={selectedNotification.read ? 'read' : 'unread'}>
                          {selectedNotification.read ? 'Đã đọc' : 'Chưa đọc'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="notification-content-detail">
                      <h5>Nội dung:</h5>
                      <p>{getNotificationDetails(selectedNotification).message}</p>
                      
                      {selectedNotification.reason && (
                        <div className="notification-reason">
                          <h5>Lý do:</h5>
                          <p>{selectedNotification.reason}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedNotification.jobId && (
                      <div className="job-reference">
                        <h5>Bài đăng liên quan:</h5>
                        <p>ID: {selectedNotification.jobId}</p>
                        <button className="btn btn-primary" onClick={() => navigateToJob(selectedNotification.jobId)}>
                          <FaEye /> Xem bài đăng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseDetailModal}>
                Đóng
              </button>
              {!selectedNotification.read && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    handleMarkAsRead(selectedNotification.id);
                    handleCloseDetailModal();
                  }}
                >
                  <FaCheck /> Đánh dấu đã đọc
                </button>
              )}
              <button 
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteNotification(selectedNotification.id);
                  handleCloseDetailModal();
                }}
              >
                <FaTrash /> Xóa thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage; 