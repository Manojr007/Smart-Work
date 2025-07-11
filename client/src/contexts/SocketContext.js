import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection error. Please refresh the page.');
      });

      // Custom events
      newSocket.on('new_message', (data) => {
        toast.success(`New message from ${data.senderName}`);
      });

      newSocket.on('contract_update', (data) => {
        toast.success(`Contract ${data.contractId} has been updated`);
      });

      newSocket.on('payment_received', (data) => {
        toast.success(`Payment of ₹${data.amount} received!`);
      });

      newSocket.on('job_application', (data) => {
        if (user.userType === 'employer') {
          toast.success(`New application for job: ${data.jobTitle}`);
        }
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Join a room (for contract chat)
  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  };

  // Leave a room
  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  };

  // Send a message
  const sendMessage = (roomId, message) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        roomId,
        message,
        senderId: user?._id,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Listen for messages in a room
  const onMessage = (callback) => {
    if (socket) {
      socket.on('receive_message', callback);
    }
  };

  // Remove message listener
  const offMessage = () => {
    if (socket) {
      socket.off('receive_message');
    }
  };

  const value = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    onMessage,
    offMessage,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 