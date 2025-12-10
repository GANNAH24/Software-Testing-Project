/**
 * Socket.IO Configuration
 * Real-time communication setup
 */

const { Server } = require('socket.io');
const logger = require('../shared/utils/logger.util');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id });

    // Join room for specific user
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      logger.info('User joined room', { userId, socketId: socket.id });
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      logger.info('Joined conversation', { conversationId, socketId: socket.id });
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
      const { conversationId, message } = data;
      // Broadcast to everyone in the conversation except sender
      socket.to(`conversation_${conversationId}`).emit('new_message', message);
      logger.info('Message sent', { conversationId, messageId: message.id });
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { conversationId, userId, isTyping } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {  userId, isTyping });
    });

    socket.on('disconnect', () => {
      logger.info('Client disconnected', { socketId: socket.id });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
