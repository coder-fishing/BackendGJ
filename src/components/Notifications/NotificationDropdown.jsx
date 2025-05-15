import React, { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AiOutlineReload, AiOutlineBell, AiOutlineCheckCircle } from 'react-icons/ai';
import { FaCheck, FaBell } from 'react-icons/fa';
import { useNotifications } from '../../utils/NotificationContext';
import { formatTimeAgo } from '../../utils/dateUtils';
import useClickOutside from '../../hooks/useClickOutside';
import './NotificationDropdown.scss';

const NotificationDropdown = ({ onClose, buttonRef }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications
  } = useNotifications();
  
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Sử dụng hook useClickOutside
  const dropdownRef = useClickOutside(onClose, [buttonRef]);
  
  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Close dropdown
    onClose();
    
    // Navigate to notifications page with the ID in the URL
    navigate(`/admin/notifications?highlight=${notification.id}`);
  };
  
  // Handle mark as read 
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  // Handle refresh notifications
  const handleRefreshNotifications = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setIsRefreshing(false);
  };
  
  // Helper function to get notification icon and title based on type
  const getNotificationDetails = (type) => {
    switch (type) {
      case 'NEW_JOB':
        return {
          icon: <AiOutlineBell className="icon new" />,
          title: 'Bài đăng mới',
          message: (jobTitle) => `Bài đăng "${jobTitle}" vừa được tạo`
        };
      case 'APPROVE':
        return {
          icon: <AiOutlineCheckCircle className="icon approve" />,
          title: 'Bài đăng được duyệt',
          message: (jobTitle) => `Bài đăng "${jobTitle}" đã được duyệt`
        };
      case 'REJECT':
        return {
          icon: <FaBell className="icon reject" />,
          title: 'Bài đăng bị từ chối',
          message: (jobTitle, reason) => `Bài đăng "${jobTitle}" bị từ chối${reason ? `: ${reason}` : ''}`
        };
      case 'DELETE':
        return { 
          icon: <FaBell color="#FF9800" />, 
          title: 'Bài đăng bị xóa',
          message: (jobTitle) => `Bài đăng "${jobTitle}" đã bị xóa`
        };
      default:
        return {
          icon: <AiOutlineBell className="icon" />,
          title: 'Thông báo mới',
          message: (jobTitle) => `Bạn có thông báo mới về "${jobTitle}"`
        };
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <h3>
          Thông báo
          {unreadCount > 0 && (
            <span className="unread-count"> ({unreadCount})</span>
          )}
        </h3>
        <div className="notification-actions">
          <button
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefreshNotifications}
            disabled={isRefreshing}
            title="Làm mới"
          >
            <AiOutlineReload />
          </button>
          {unreadCount > 0 && (
            <button
              className="mark-all-read"
              onClick={handleMarkAllAsRead}
              title="Đánh dấu tất cả là đã đọc"
            >
              Đánh dấu tất cả là đã đọc
            </button>
          )}
        </div>
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="loading-text">Đang tải thông báo...</div>
        ) : error ? (
          <div className="error-text">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="empty-notifications">Không có thông báo nào</div>
        ) : (
          notifications.map(notification => {
            const details = getNotificationDetails(notification.type);
            return (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {details.icon}
                </div>
                <div className="notification-content">
                  <div className="notification-title">
                    {details.title}
                  </div>
                  <div className="notification-message">
                    {details.message(notification.jobTitle, notification.reason)}
                  </div>
                  <div className="notification-time">
                    {formatTimeAgo(notification.timestamp)}
                  </div>
                </div>
                {!notification.read && (
                  <button 
                    className="mark-read-button"
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    title="Đánh dấu đã đọc"
                  >
                    <FaCheck />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
      
      <div className="notification-footer">
        <NavLink to="/admin/notifications" className="view-all">
          Xem tất cả thông báo
        </NavLink>
      </div>
    </div>
  );
};

export default NotificationDropdown; 