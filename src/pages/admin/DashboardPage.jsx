// pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AiOutlineFile, 
  AiOutlineCheck, 
  AiOutlineClockCircle, 
  AiOutlineClose, 
  AiOutlineDelete,
  AiOutlinePlus
} from 'react-icons/ai';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTrashAlt, 
  FaFileAlt, 
  FaUndoAlt, 
  FaExclamationCircle,
  FaCalendarAlt,
  FaEye,
  FaUserCheck
} from 'react-icons/fa';
import { MdOutlineRestoreFromTrash } from 'react-icons/md';
import { jobsApi, notificationApi } from '../../services/api';
import { Bar, Pie } from 'react-chartjs-2'; // Import Pie chart from Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import '../../styles/dashboard.scss'; // Import your styles
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    deleted: 0,
  });
  const [viewStats, setViewStats] = useState({
    totalViews: 0,
    totalApplies: 0
  });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [notificationsError, setNotificationsError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const allJobsResponse = await jobsApi.getJobs();
        const approvedJobsResponse = await jobsApi.getJobsByStatus('APPROVED');
        const pendingJobsResponse = await jobsApi.getJobsByStatus('PENDING');
        const rejectedJobsResponse = await jobsApi.getJobsByStatus('REJECTED');
        const deletedJobsResponse = await jobsApi.getJobsByStatus('DELETED');
  
        setStats({
          total: allJobsResponse.length || 0,
          approved: approvedJobsResponse.length || 0,
          pending: pendingJobsResponse.length || 0,
          rejected: rejectedJobsResponse.length || 0,
          deleted: deletedJobsResponse.length || 0,
        });
  
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchStats();
  }, []);
  
  // Lấy thống kê lượt xem và ứng tuyển
  useEffect(() => {
    const fetchViewsAppliesStats = async () => {
      try {
        setStatsLoading(true);
        const statistics = await jobsApi.getJobStatistics();
        setViewStats({
          totalViews: statistics.totalViews || 0,
          totalApplies: statistics.totalApplies || 0
        });
        setStatsError(null);
      } catch (err) {
        setStatsError('Không thể tải dữ liệu thống kê lượt xem và ứng tuyển. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchViewsAppliesStats();
  }, []);
  
  // Lấy dữ liệu các thông báo gần đây
  useEffect(() => {
    const fetchRecentNotifications = async () => {
      try {
        setNotificationsLoading(true);
        // Lấy thông báo gần đây thay vì hoạt động
        const notifications = await notificationApi.getRecentNotifications();
        setRecentNotifications(notifications);
        setNotificationsError(null);
      } catch (err) {
        setNotificationsError('Không thể tải dữ liệu thông báo. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchRecentNotifications();
  }, []);

  // Lấy số lượng thông báo chưa đọc
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationApi.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Không thể tải số lượng thông báo chưa đọc:', err);
      }
    };

    fetchUnreadCount();
  }, []);

  const StatCard = ({ title, value, icon, color, link }) => (
    <div 
      className={`stat-card ${color} ${link ? 'clickable' : ''}`}
      onClick={() => link && navigate(link)}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );

  // Hàm lấy icon tương ứng với loại thông báo
  const getNotificationIcon = (notificationType) => {
    switch (notificationType) {
      case 'NEW_JOB':
        return <FaFileAlt className="activity-icon create" />;
      case 'APPROVE':
        return <FaCheckCircle className="activity-icon approve" />;
      case 'REJECT':
        return <FaTimesCircle className="activity-icon reject" />;
      case 'DELETE':
        return <FaTrashAlt className="activity-icon delete" />;
      case 'RESTORE':
        return <MdOutlineRestoreFromTrash className="activity-icon restore" />;
      default:
        return <FaExclamationCircle className="activity-icon" />;
    }
  };

  // Hàm hiển thị mô tả thông báo
  const getNotificationDescription = (notification) => {
    switch (notification.type) {
      case 'NEW_JOB':
        return (
          <span>
            <strong>{notification.user || 'Người dùng'}</strong> đã tạo bài đăng mới <Link to={`/admin/jobs/${notification.jobId}`}>{notification.jobTitle}</Link>
          </span>
        );
      case 'APPROVE':
        return (
          <span>
            <strong>{notification.user || 'Admin'}</strong> đã phê duyệt bài đăng <Link to={`/admin/jobs/${notification.jobId}`}>{notification.jobTitle}</Link>
          </span>
        );
      case 'REJECT':
        return (
          <span>
            <strong>{notification.user || 'Admin'}</strong> đã từ chối bài đăng <Link to={`/admin/jobs/${notification.jobId}`}>{notification.jobTitle}</Link>
            {notification.reason && <span className="activity-reason"> Lý do: {notification.reason}</span>}
          </span>
        );
      case 'DELETE':
        return (
          <span>
            <strong>{notification.user || 'Admin'}</strong> đã xóa bài đăng <Link to={`admin/jobs/${notification.jobId}`}>{notification.jobTitle}</Link>
          </span>
        );
      case 'RESTORE':
        return (
          <span>
            <strong>{notification.user || 'Admin'}</strong> đã khôi phục bài đăng <Link to={`admin/jobs/${notification.jobId}`}>{notification.jobTitle}</Link>
          </span>
        );
      default:
        return <span>Hoạt động không xác định</span>;
    }
  };

  // Thay thế hàm formatTimeAgo
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ngày trước`;
    } else if (hours > 0) {
      return `${hours} giờ trước`;
    } else if (minutes > 0) {
      return `${minutes} phút trước`;
    } else {
      return 'Vừa xong';
    }
  };

  // Dữ liệu cho biểu đồ cột
  const data = {
    labels: ['Tổng số', 'Đã duyệt', 'Đang chờ', 'Từ chối', 'Đã xóa'],
    datasets: [
      {
        label: 'Số lượng bài đăng',
        data: [stats.total, stats.approved, stats.pending, stats.rejected, stats.deleted],
        backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9E9E9E'],
        borderColor: '#000',
        borderWidth: 1,
      },
    ],
  };

  // Dữ liệu cho biểu đồ tròn (lượt xem và ứng tuyển)
  const pieData = {
    labels: ['Lượt xem', 'Lượt ứng tuyển'],
    datasets: [
      {
        data: [viewStats.totalViews, viewStats.totalApplies],
        backgroundColor: ['#4299e1', '#f56565'],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  // Cấu hình cho biểu đồ cột
  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      title: {
        display: true,
        text: 'Thống kê trạng thái bài đăng',
      },
      legend: {
        display: false,
      },
    },
  };

  // Cấu hình cho biểu đồ tròn
  const pieOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Thống kê lượt xem và ứng tuyển',
        font: {
          size: 16,
        },
      },
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.formattedValue || '';
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaExclamationCircle className="error-icon" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <section className="dashboard-header">
        <h1>Tổng quan</h1>
        {/* <Link to="/jobs/add" className="add-job-button">
          <AiOutlinePlus /> Thêm bài đăng mới
        </Link> */}
      </section>

      <section className="dashboard-stats">
        <StatCard
          title="Tổng số bài đăng"
          value={stats.total}
          icon={<AiOutlineFile />}
          color="green"
          link="/admin/jobs"
        />
        <StatCard
          title="Đã duyệt"
          value={stats.approved}
          icon={<AiOutlineCheck />}
          color="blue"
          link="/admin/jobs/status/approved"
        />
        <StatCard
          title="Đang chờ"
          value={stats.pending}
          icon={<AiOutlineClockCircle />}
          color="yellow"
          link="/admin/jobs/status/pending"
        />
        <StatCard
          title="Từ chối"
          value={stats.rejected}
          icon={<AiOutlineClose />}
          color="red"
          link="/admin/jobs/status/rejected"
        />
        <StatCard
          title="Đã xóa"
          value={stats.deleted}
          icon={<AiOutlineDelete />}
          color="gray"
          link="/admin/jobs/status/deleted"
        />
        <StatCard
          title="Lượt xem"
          value={viewStats.totalViews}
          icon={<FaEye />}
          color="cyan"
        />
        <StatCard
          title="Lượt ứng tuyển"
          value={viewStats.totalApplies}
          icon={<FaUserCheck />}
          color="purple"
        />
        <StatCard
          title="Thông báo chưa đọc"
          value={unreadCount}
          icon={<FaExclamationCircle />}
          color="orange"
          link="/admin/notifications"
        />
      </section>

      <section className="dashboard-charts">
        <div className="chart-container">
          <Bar data={data} options={options} />
        </div>
        <div className="chart-container">
          {statsLoading ? (
            <div className="loading-container small">
              <div className="loading-spinner"></div>
              <p>Đang tải thống kê...</p>
            </div>
          ) : statsError ? (
            <div className="error-message">{statsError}</div>
          ) : (
            <Pie data={pieData} options={pieOptions} />
          )}
        </div>
      </section>

      <section className="dashboard-recent-activities">
        <div className="section-header">
          <h2>Hoạt động gần đây</h2>
          <Link to="/admin/notifications" className="view-all-link">
            Xem tất cả
          </Link>
        </div>

        <div className="activities-list">
          {notificationsLoading ? (
            <div className="loading-container small">
              <div className="loading-spinner"></div>
              <p>Đang tải hoạt động...</p>
            </div>
          ) : notificationsError ? (
            <div className="error-message">{notificationsError}</div>
          ) : recentNotifications.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có hoạt động nào gần đây</p>
            </div>
          ) : (
            recentNotifications.slice(0, 8).map((notification, index) => (
              <div className="activity-item" key={notification.id || index}>
                <div className="activity-indicator">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-description">
                    {getNotificationDescription(notification)}
                  </div>
                  <div className="activity-time">
                    <FaCalendarAlt /> {formatTimeAgo(notification.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

