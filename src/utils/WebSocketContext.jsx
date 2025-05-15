import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

// Create WebSocket context
const WebSocketContext = createContext({
  connected: false,
  notifications: [],
  sendMessage: () => {},
  connect: () => {},
  disconnect: () => {}
});

// WebSocket provider component
export const WebSocketProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  // Connect to WebSocket server
  const connect = () => {
    // Maximum connection attempts to avoid spamming the server
    const MAX_ATTEMPTS = 2;
    
    if (connectionAttempts >= MAX_ATTEMPTS) {
      console.log('Maximum WebSocket connection attempts reached');
      return;
    }
    
    if (!currentUser || !currentUser.id) {
      console.log('No user ID available for WebSocket connection');
      return;
    }
    
    try {
      const ws = new WebSocket(`ws://localhost:8080/ws/notifications/${currentUser.id}`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setConnected(true);
        setConnectionAttempts(0); // Reset counter on success
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          setNotifications(prev => [data, ...prev].slice(0, 20)); // Keep only the last 20 notifications
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setConnected(false);
      };
      
      ws.onerror = () => {
        console.log('WebSocket connection error - will not retry');
        setConnected(false);
        setConnectionAttempts(prev => prev + 1);
        
        // Close socket on error to clean up
        if (ws) {
          ws.close();
        }
      };
      
      setSocket(ws);
    } catch (error) {
      console.log('WebSocket connection failed:', error);
      setConnectionAttempts(prev => prev + 1);
    }
  };
  
  // Disconnect WebSocket
  const disconnect = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setConnected(false);
    }
  };
  
  // Send message to server
  const sendMessage = (message) => {
    if (socket && connected) {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      console.log('WebSocket not connected, cannot send message');
    }
  };
  
  // Connect when user is available and disconnect on unmount
  useEffect(() => {
    if (currentUser && currentUser.id) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [currentUser]);
  
  // Context value
  const value = {
    connected,
    notifications,
    sendMessage,
    connect,
    disconnect
  };
  
  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

export default WebSocketProvider; 