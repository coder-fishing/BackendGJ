// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  AiOutlineDashboard, 
  AiOutlineUser, 
  AiOutlineFile, 
  AiOutlineSetting, 
  AiOutlineLogout,
  AiOutlineTeam,
  AiOutlineCalendar,
  AiOutlineBarChart,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold
} from 'react-icons/ai';
import { useAuth } from '../../utils/AuthContext';
import './Sidebar.scss';

const Sidebar = ({ collapsed = false, toggleSidebar, mobileOpen = false, toggleMobile }) => {
  // Get logout function from auth context
  const { logout } = useAuth();

  // Handle logout click
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  // Menu items grouped by category
  const menuGroups = [
    {
      title: 'Tổng quan',
      items: [
        { 
          path: '/admin/dashboard', 
          icon: <AiOutlineDashboard />, 
          label: 'Dashboard' 
        },
        { 
          path: '/admin/jobs', 
          icon: <AiOutlineFile />, 
          label: 'Công Việc' 
        }
      ]
    },
    {
      title: 'Quản lý',
      items: [
        { 
          path: '/admin/profile', 
          icon: <AiOutlineUser />, 
          label: 'Hồ Sơ' 
        },
        { 
          path: '/admin/candidates', 
          icon: <AiOutlineTeam />, 
          label: 'Ứng viên' 
        },
        { 
          path: '/admin/calendar', 
          icon: <AiOutlineCalendar />, 
          label: 'Lịch phỏng vấn' 
        }
      ]
    },
    {
      title: 'Thống kê',
      items: [
        { 
          path: '/admin/analytics', 
          icon: <AiOutlineBarChart />, 
          label: 'Phân tích' 
        }
      ]
    },
    {
      title: 'Hệ thống',
      items: [
        // { 
        //   path: '/admin/settings', 
        //   icon: <AiOutlineSetting />, 
        //   label: 'Cài Đặt' 
        // },
        { 
          path: '#', 
          icon: <AiOutlineLogout />, 
          label: 'Đăng Xuất',
          className: 'logout-link',
          onClick: handleLogout
        }
      ]
    }
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <NavLink to="/">
            <span className="logo-icon">GJ</span>
            {!collapsed && <span className="logo-text">GoodJob</span>}
          </NavLink>
        </div>
        <button className="collapse-btn" onClick={toggleSidebar}>
          {collapsed ? <AiOutlineMenuUnfold /> : <AiOutlineMenuFold />}
        </button>
      </div>

      <div className="sidebar-content">
        {menuGroups.map((group, groupIndex) => (
          <div className="menu-group" key={groupIndex}>
            {!collapsed && <div className="group-title">{group.title}</div>}
            <ul className="sidebar-links">
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <NavLink 
                    to={item.path} 
                    className={({isActive}) => 
                      `sidebar-link ${isActive ? 'active' : ''} ${item.className || ''}`
                    }
                    onClick={(e) => {
                      if (item.onClick) {
                        item.onClick(e);
                      } else if (mobileOpen && toggleMobile) {
                        toggleMobile();
                      }
                    }}
                  >
                    <span className="link-icon">{item.icon}</span>
                    {!collapsed && <span className="link-text">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-info">
            <img 
              src="https://randomuser.me/api/portraits/men/43.jpg" 
              alt="Ảnh đại diện" 
              className="user-avatar" 
            />
            <div className="user-details">
              <div className="user-name">Nhà tuyển dụng</div>
              <div className="user-role">Quản trị viên</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="user-avatar-small">
            <img 
              src="https://randomuser.me/api/portraits/men/43.jpg" 
              alt="Ảnh đại diện"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
