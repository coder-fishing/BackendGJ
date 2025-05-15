import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserAlt, FaBuilding, FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import './UserManagement.scss';

const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI5OCIgZmlsbD0iI0UyRThGMCIgc3Ryb2tlPSIjQ0JENUU0IiBzdHJva2Utd2lkdGg9IjQiLz4KICA8cGF0aCBkPSJNMTAwIDEyMEMxMjIuMDkxIDEyMCAxNDAgMTAyLjA5MSAxNDAgODBDMTQwIDU3LjkwODYgMTIyLjA5MSA0MCAxMDAgNDBDNzcuOTA4NiA0MCA2MCA1Ny45MDg2IDYwIDgwQzYwIDEwMi4wOTEgNzcuOTA4NiAxMjAgMTAwIDEyMFoiIGZpbGw9IiNBMEFFQzAiLz4KICA8cGF0aCBkPSJNMTY1IDE3MEMxNjUgMTQyLjM4NiAxMzUuODk5IDEyMCAxMDAgMTIwQzY0LjEwMTUgMTIwIDM1IDE0Mi4zODYgMzUgMTcwIiBzdHJva2U9IiNBMEFFQzAiIHN0cm9rZS13aWR0aD0iMzAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('employers');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === 'employers' 
        ? 'http://localhost:8080/api/users/employers'
        : 'http://localhost:8080/api/users/normal';
      
      const response = await axios.get(endpoint);
      setUsers(response.data);
    } catch (err) {
      setError('Không thể tải danh sách người dùng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTermLower) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTermLower)) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      (user.phoneNumber && user.phoneNumber.includes(searchTerm))
    );
    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      // Only allow deactivating users, not activating them
      if (currentStatus) {
        await axios.put(`http://localhost:8080/api/users/${userId}/status`, {
          active: false
        });
        // Show success message
        setError(null);
        // Refresh the users list
        fetchUsers();
      } else {
        setError('Người dùng sẽ được kích hoạt khi đăng nhập');
      }
    } catch (err) {
      setError('Không thể thay đổi trạng thái người dùng: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogin = async (userId) => {
    try {
      await axios.put(`http://localhost:8080/api/users/${userId}/status`, {
        active: true
      });
      fetchUsers();
    } catch (err) {
      setError('Không thể cập nhật trạng thái đăng nhập: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError('Không thể xóa người dùng: ' + (err.response?.data?.message || err.message));
    }
  };

  const UserCard = ({ user }) => {
    const [showDetails, setShowDetails] = useState(false);

    const handleInfoClick = () => {
      setShowDetails(true);
    };

    return (
      <>
        <div className="user-card" onClick={handleInfoClick}>
          <div className="user-avatar">
            <img 
              src={user.avatarUrl || DEFAULT_AVATAR} 
              alt={user.fullName || user.username}
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
          </div>
          <div className="user-info">
            <h3>{user.fullName || user.username}</h3>
            <div className="info-content">
              <div className="info-row">
                <span className="label">Username:</span>
                <p className="username">@{user.username}</p>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <p className="email">{user.email}</p>
              </div>
              {user.phoneNumber && (
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <p className="phone">{user.phoneNumber}</p>
                </div>
              )}
              {user.bio && (
                <div className="info-row">
                  <span className="label">Bio:</span>
                  <p className="bio">{user.bio}</p>
                </div>
              )}
            </div>
            <div className="bottom-row">
              <div className="user-status">
                <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                  {user.active ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
                <span className={`role-badge ${user.role.toLowerCase()}`}>
                  {user.role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Người dùng'}
                </span>
              </div>
              <div className="user-actions">
                <button 
                  className="btn-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(user.id, user.active);
                  }}
                  title={user.active ? 'Vô hiệu hóa' : 'Chờ đăng nhập để kích hoạt'}
                  disabled={!user.active}
                >
                  {user.active ? <FaToggleOn /> : <FaToggleOff />}
                </button>
                <button 
                  className="btn-edit" 
                  title="Chỉnh sửa thông tin"
                  onClick={(e) => {
                    e.stopPropagation();
                    /* Implement edit functionality */
                  }}
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn-delete" 
                  title="Xóa người dùng"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteUser(user.id);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="user-details-modal" onClick={() => setShowDetails(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h2>{user.fullName || user.username}</h2>
              <div className="detail-row">
                <span className="label">Username:</span>
                <span className="value">@{user.username}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{user.phoneNumber}</span>
                </div>
              )}
              {user.bio && (
                <div className="detail-row">
                  <span className="label">Bio:</span>
                  <span className="value">{user.bio}</span>
                </div>
              )}
              <button className="close-btn" onClick={() => setShowDetails(false)}>
                Đóng
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>Quản lý người dùng</h1>
        <div className="search-bar">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'employers' ? 'active' : ''}`}
            onClick={() => setActiveTab('employers')}
          >
            <FaBuilding /> Nhà tuyển dụng
          </button>
          <button 
            className={`tab-button ${activeTab === 'normal' ? 'active' : ''}`}
            onClick={() => setActiveTab('normal')}
          >
            <FaUserAlt /> Người dùng thường
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="users-grid">
        {filteredUsers.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="empty-state">
          {searchTerm ? (
            <p>Không tìm thấy kết quả phù hợp</p>
          ) : (
            <p>Chưa có {activeTab === 'employers' ? 'nhà tuyển dụng' : 'người dùng'} nào</p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement; 