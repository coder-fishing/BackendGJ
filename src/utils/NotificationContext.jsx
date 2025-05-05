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
    const userId = localStorage.getItem('userId') || '1'; // Default to 1 if not found
    
    // Connect to WebSocket
    websocketService.connect(userId);
    
    // Listen for new notifications
    websocketService.on('notification', (newNotification) => {
      // Update notifications state with new notification
      setNotifications(prev => [newNotification, ...prev]);
      
      // Update unread count if notification is unread
      if (!newNotification.read) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Play sound or show desktop notification if needed
      playNotificationSound();
      showDesktopNotification(newNotification);
    });
    
    // Clean up on unmount
    return () => {
      websocketService.off('notification');
      websocketService.disconnect();
    };
  }, []);
  
  // Play notification sound
  const playNotificationSound = () => {
    // Implement actual sound playing
    const audio = new Audio('/notification-sound.mp3');
    audio.play().catch(err => console.error('Error playing notification sound:', err));
  };
  
  // Show desktop notification (if permitted)
  const showDesktopNotification = (notification) => {
    if (Notification.permission === 'granted') {
      let title = 'New Notification';
      let message = '';
      
      // Format title and message based on notification type
      switch (notification.type) {
        case 'NEW_JOB':
          title = 'New Job Submission';
          message = `Job "${notification.jobTitle}" has been submitted`;
          break;
        case 'APPROVE':
          title = 'Job Approved';
          message = `Job "${notification.jobTitle}" has been approved`;
          break;
        case 'REJECT':
          title = 'Job Rejected';
          message = `Job "${notification.jobTitle}" has been rejected`;
          break;
        case 'DELETE':
          title = 'Job Deleted';
          message = `Job "${notification.jobTitle}" has been deleted`;
          break;
        default:
          message = notification.message || 'You have a new notification';
      }
      
      const options = {
        body: message,
        icon: '/notification-icon.png'
      };
      
      new Notification(title, options);
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
      // Call the API to delete the notification
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
  
  // Refresh notifications
  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const notificationsData = await notificationApi.getRecentNotifications();
      setNotifications(notificationsData);
      
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error refreshing notifications:', err);
      setError('Failed to refresh notifications');
      return false;
    } finally {
      setLoading(false);
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
    refreshNotifications,
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