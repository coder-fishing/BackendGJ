import React, { createContext, useState, useEffect, useContext } from 'react';
import { notificationApi, websocketService } from '../services/api';

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial notifications
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch recent notifications
        const notificationsData = await notificationApi.getRecentNotifications();
        setNotifications(notificationsData);
        
        // Fetch unread count
        const count = await notificationApi.getUnreadCount();
        setUnreadCount(count);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching notification data:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up polling to update unread count every minute
    const interval = setInterval(async () => {
      try {
        const count = await notificationApi.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Set up websocket connection for real-time updates
  useEffect(() => {
    // Extract user ID from auth context or localStorage
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (!userId) return;

    // Connect to WebSocket
    websocketService.connect(userId);
    
    // Listen for new notifications
    websocketService.on('notification', (newNotification) => {
      // Format notification based on type
      let formattedNotification = {
        ...newNotification,
        read: false,
        createdAt: new Date().toISOString()
      };

      switch (newNotification.type) {
        case 'JOB_APPROVED':
          formattedNotification.title = 'Bài đăng được duyệt';
          formattedNotification.message = `Bài đăng "${newNotification.jobTitle}" đã được phê duyệt`;
          break;
        case 'JOB_REJECTED':
          formattedNotification.title = 'Bài đăng bị từ chối';
          formattedNotification.message = `Bài đăng "${newNotification.jobTitle}" đã bị từ chối${newNotification.reason ? `: ${newNotification.reason}` : ''}`;
          break;
        case 'NEW_APPLICATION':
          formattedNotification.title = 'Ứng viên mới';
          formattedNotification.message = `${newNotification.applicantName} đã ứng tuyển vào vị trí "${newNotification.jobTitle}"`;
          break;
        case 'APPLICATION_STATUS_CHANGED':
          const statusText = newNotification.status === 'APPROVED' ? 'chấp nhận' : 'từ chối';
          formattedNotification.title = 'Trạng thái ứng tuyển thay đổi';
          formattedNotification.message = `Đơn ứng tuyển của bạn vào vị trí "${newNotification.jobTitle}" đã được ${statusText}`;
          break;
        default:
          formattedNotification.title = 'Thông báo mới';
          formattedNotification.message = newNotification.message;
      }

      // Update notifications state with new notification
      setNotifications(prev => [formattedNotification, ...prev]);
      
      // Update unread count
      setUnreadCount(prev => prev + 1);
      
      // Play sound and show desktop notification
      playNotificationSound();
      showDesktopNotification(formattedNotification);
    });
    
    // Clean up on unmount
    return () => {
      websocketService.off('notification');
      websocketService.disconnect();
    };
  }, []);
  
  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(err => console.error('Error playing notification sound:', err));
  };
  
  // Show desktop notification
  const showDesktopNotification = (notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/notification-icon.png'
      });
    }
  };

  // Request desktop notification permission
  const requestNotificationPermission = async () => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId ? { ...notification, read: true } : notification
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };
  
  // Mark multiple notifications as read
  const markMultipleAsRead = async (notificationIds) => {
    try {
      await notificationApi.markMultipleAsRead(notificationIds);
      
      // Update local state
      setNotifications(prev => prev.map(notification => 
        notificationIds.includes(notification.id) ? { ...notification, read: true } : notification
      ));
      
      // Count how many were actually marked as read
      const unreadIdsCount = notifications.filter(n => 
        !n.read && notificationIds.includes(n.id)
      ).length;
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - unreadIdsCount));
      
      return true;
    } catch (error) {
      console.error('Error marking multiple notifications as read:', error);
      return false;
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      
      // Update unread count
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };
  
  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      // If the notification was unread, decrease the unread count
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };
  
  // Context value
  const value = {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 