import { io } from 'socket.io-client';
import { storage } from '../utils/storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    const token = storage.getToken();
    if (!token) {
      console.error('No auth token found for socket connection');
      return null;
    }

    this.socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
      
      // Join user's personal room
      const user = storage.getUser();
      if (user?.id) {
        this.socket.emit('join', user.id);
        console.log(`📡 Joined user room: ${user.id}`);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
      console.log('Socket disconnected');
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    
    this.socket.emit('join_conversation', conversationId);
    console.log(`📨 Joined conversation: ${conversationId}`);
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (!this.socket?.connected) return;
    
    this.socket.emit('leave_conversation', conversationId);
    console.log(`📤 Left conversation: ${conversationId}`);
  }

  // Send a message
  sendMessage(conversationId, message) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('send_message', {
      conversationId,
      message
    });
  }

  // Send typing indicator
  sendTyping(conversationId, isTyping) {
    if (!this.socket?.connected) return;

    const user = storage.getUser();
    this.socket.emit('typing', {
      conversationId,
      userId: user?.id,
      isTyping
    });
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (!this.socket) return;
    
    this.socket.on('new_message', callback);
    this.listeners.set('new_message', callback);
  }

  // Listen for message notifications
  onMessageNotification(callback) {
    if (!this.socket) return;
    
    this.socket.on('message_notification', callback);
    this.listeners.set('message_notification', callback);
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (!this.socket) return;
    
    this.socket.on('user_typing', callback);
    this.listeners.set('user_typing', callback);
  }

  // Listen for read receipts
  onMessagesRead(callback) {
    if (!this.socket) return;
    
    this.socket.on('messages_read', callback);
    this.listeners.set('messages_read', callback);
  }

  // Remove event listener
  off(event) {
    if (!this.socket) return;
    
    const callback = this.listeners.get(event);
    if (callback) {
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (!this.socket) return;
    
    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback);
    });
    this.listeners.clear();
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export const socketService = new SocketService();
