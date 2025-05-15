import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaSignOutAlt, FaUser, FaCaretDown, FaCog, FaSearch, FaBookmark, FaHistory, FaLock } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import defaultAvatar from '../../assets/images/default-avatar.svg';
import '../../styles/user/header.scss';

const UserHeader = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  const handleClickOutside = () => {
    setShowProfileMenu(false);
    setShowNotifications(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getFullName = () => {
    return currentUser?.fullName || 'Người dùng';
  };

  return (
    <header className="user-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-text">GoodJob</span>
          </Link>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm việc làm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </div>
        </form>

        <nav className="header-nav">
          <Link to="/" className="nav-item">
            Trang chủ
          </Link>
          <Link to="/jobs" className="nav-item">
            Việc làm
          </Link>
          <Link to="/user/dashboard" className="nav-item">
            Bảng điều khiển
          </Link>
          <Link to="/user/saved-jobs" className="nav-item">
            <FaBookmark /> Đã lưu
          </Link>
          <Link to="/user/applications" className="nav-item">
            <FaHistory /> Đã ứng tuyển
          </Link>
        </nav>

        <div className="header-right">
          <div className="notifications" onClick={() => setShowNotifications(!showNotifications)}>
            <FaBell />
            <span className="notification-badge">2</span>
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notification-header">
                  <h3>Thông báo</h3>
                  <button className="mark-all-read">Đánh dấu đã đọc</button>
                </div>
                <div className="notification-list">
                  <div className="notification-item unread">
                    <div className="notification-content">
                      <h4>Đơn ứng tuyển đã được xem</h4>
                      <p>Nhà tuyển dụng đã xem đơn ứng tuyển của bạn cho vị trí Lập trình viên PHP</p>
                      <small>5 phút trước</small>
                    </div>
                  </div>
                  <div className="notification-item">
                    <div className="notification-content">
                      <h4>Phỏng vấn sắp tới</h4>
                      <p>Bạn có cuộc phỏng vấn vào ngày mai lúc 10:00 với công ty ABC</p>
                      <small>2 giờ trước</small>
                    </div>
                  </div>
                </div>
                <div className="notification-footer">
                  <Link to="/user/notifications">Xem tất cả thông báo</Link>
                </div>
              </div>
            )}
          </div>

          <div className="profile-menu">
            <div className="profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <img src={defaultAvatar} alt="Avatar" className="avatar" />
              <span className="username">{getFullName()}</span>
              <FaCaretDown />
            </div>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/user/profile" className="dropdown-item">
                  <FaUser />
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link to="/user/settings" className="dropdown-item">
                  <FaCog />
                  <span>Cài đặt</span>
                </Link>
                <Link to="/user/change-password" className="dropdown-item">
                  <FaLock />
                  <span>Đổi mật khẩu</span>
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

export default UserHeader; 