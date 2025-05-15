import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaUserAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../utils/AuthContext';
import useClickOutside from '../../hooks/useClickOutside';
import './AdminDropdown.scss';

const AdminDropdown = ({ onClose, buttonRef }) => {
  const { currentUser, logout } = useAuth();
  
  // Sử dụng hook useClickOutside để đóng dropdown khi click ra ngoài
  const dropdownRef = useClickOutside(onClose, [buttonRef]);
  
  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="admin-dropdown" ref={dropdownRef}>
      <div className="admin-info">
        <div className="admin-name">
          {currentUser?.fullName || 'Admin'}
        </div>
        <div className="admin-email">
          {currentUser?.email || 'admin@example.com'}
        </div>
      </div>
      
      <div className="dropdown-menu">
        <NavLink to="/admin/profile" className="dropdown-item" onClick={onClose}>
          <FaUserAlt className="item-icon" />
          <span>Hồ sơ cá nhân</span>
        </NavLink>
        
        <button className="dropdown-item logout" onClick={handleLogout}>
          <FaSignOutAlt className="item-icon" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDropdown; 