import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AiOutlineUser, AiOutlineBell, AiOutlineSearch, AiOutlineMenu, AiOutlineCheckCircle, AiOutlineReload } from 'react-icons/ai';
import { FaRegBell, FaCheck, FaBell, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { useNotifications } from '../../utils/NotificationContext';
import { useAuth } from '../../utils/AuthContext';
import { formatTimeAgo } from '../../utils/dateUtils';
import useClickOutside from '../../hooks/useClickOutside';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import AdminDropdown from '../Admin/AdminDropdown';
import './Navbar.scss';

const Navbar = ({ toggleMobile }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use notification context
  const { 
    notifications, 
    loading, 
    error, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    refreshNotifications,
    requestNotificationPermission 
  } = useNotifications();

  // Refs cho các nút toggle
  const userButtonRef = useRef(null);
  const notificationButtonRef = useRef(null);

  // Memoize các hàm xử lý để tránh re-render không cần thiết
  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const closeNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  // Sử dụng hook useClickOutside để phát hiện click outside
  const dropdownRef = useClickOutside(closeDropdown, [userButtonRef]);
  const notificationsRef = useClickOutside(closeNotifications, [notificationButtonRef]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showDropdown) setShowDropdown(false);
  };
  
  // Handle logout using AuthContext
  const handleLogout = () => {
    logout();
  };

  // Request notification permission when component mounts
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);
  
  // Handle mark as read with the context function
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };
  
  // Handle mark all as read with the context function
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
          icon: <AiOutlineBell />, 
          title: 'Bài đăng mới cần duyệt',
          message: (jobTitle) => `Bài đăng "${jobTitle}" vừa được tạo`
        };
      case 'APPROVE':
        return { 
          icon: <AiOutlineCheckCircle color="#4CAF50" />, 
          title: 'Bài đăng được phê duyệt',
          message: (jobTitle) => `Bài đăng "${jobTitle}" đã được phê duyệt`
        };
      case 'REJECT':
        return { 
          icon: <FaBell color="#F44336" />, 
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
          icon: <AiOutlineBell />, 
          title: 'Thông báo mới',
          message: (jobTitle) => `Bạn có thông báo mới về "${jobTitle}"`
        };
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo">
            <NavLink to="/">
              <span className="logo-icon">GJ</span>
              <span className="logo-text">MyDashboard</span>
            </NavLink>
          </div>
          <button className="mobile-toggle" onClick={toggleMobile || toggleMobileMenu}>
            <AiOutlineMenu />
          </button>
        </div>

        {/* <div className="navbar-search">
          <div className="search-input">
            <AiOutlineSearch className="search-icon" />
            <input type="text" placeholder="Tìm kiếm công việc..." />
          </div>
        </div> */}

        <ul className={`navbar-links ${showMobileMenu ? 'mobile-visible' : ''}`}>
          <li>
            <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''} end>
              Trang Chủ
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? 'active' : ''}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/jobs" className={({isActive}) => isActive ? 'active' : ''}>
              Công Việc
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/profile" className={({isActive}) => isActive ? 'active' : ''}>
              Hồ Sơ
            </NavLink>
          </li>
        </ul>

        <div className="navbar-actions">
          <button 
            className="action-button notification-button" 
            onClick={toggleNotifications}
            ref={notificationButtonRef}
          >
            <FaRegBell />
            {unreadCount > 0 && (
              <span className="notification-badge pulse-animation">{unreadCount}</span>
            )}
          </button>
          
          {/* Dropdown thông báo */}
          {showNotifications && (
            <NotificationDropdown 
              onClose={closeNotifications} 
              buttonRef={notificationButtonRef} 
            />
          )}
          
          <div className="user-menu">
            <button 
              className="user-button" 
              onClick={toggleDropdown}
              ref={userButtonRef}
            >
              <AiOutlineUser />
              <span className="user-name">{currentUser?.fullName || 'Admin'}</span>
            </button>
            
            {/* Dropdown admin */}
            {showDropdown && (
              <AdminDropdown 
                onClose={closeDropdown} 
                buttonRef={userButtonRef} 
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
