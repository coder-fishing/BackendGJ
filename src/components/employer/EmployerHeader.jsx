import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaSignOutAlt, FaUser, FaCaretDown, FaCog } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import defaultAvatar from '../../assets/images/default-avatar.svg';
import '../../styles/employer/header.scss';

const EmployerHeader = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleClickOutside = () => {
    setShowProfileMenu(false);
    setShowNotifications(false);
  };

  const getFullName = () => {
    return currentUser?.fullName || 'Chưa cập nhật';
  };

  const getAvatar = () => {
    return currentUser?.avatarUrl || defaultAvatar;
  };

  return (
    <header className="employer-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/employer/dashboard" className="logo">
            <span className="logo-text">GoodJob</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link to="/employer/dashboard" className="nav-item">
            Việc làm
          </Link>
          <Link to="/employer/post-job" className="nav-item">
            Đăng tuyển
          </Link>
          <Link to="/employer/my-jobs" className="nav-item">
            Tin đã đăng
          </Link>
          <Link to="/employer/applications" className="nav-item">
            Quản lý ứng viên
          </Link>
          <Link to="/employer/profile" className="nav-item">
            Thông tin công ty
          </Link>
        </nav>

        <div className="header-right">
          {/* <div className="notifications" onClick={() => setShowNotifications(!showNotifications)}>
            <FaBell />
            <span className="notification-badge">3</span>
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notification-item">
                  <span>Bạn có một ứng viên mới</span>
                  <small>2 phút trước</small>
                </div>
                Add more notification items
              </div>
            )}
          </div> */}

          <div className="profile-menu">
            <div className="profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <img src={getAvatar()} alt="Avatar" className="avatar" />
              <span className="username">{getFullName()}</span>
              <FaCaretDown />
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/employer/profile" className="dropdown-item">
                  <FaUser />
                  <span>Thông tin công ty</span>
                </Link>
                <Link to="/employer/setting" className="dropdown-item">
                  <FaCog />
                  <span>Cài đặt</span>
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  <FaSignOutAlt />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(showNotifications || showProfileMenu) && (
        <div className="overlay" onClick={handleClickOutside} />
      )}
    </header>
  );
};

export default EmployerHeader; 