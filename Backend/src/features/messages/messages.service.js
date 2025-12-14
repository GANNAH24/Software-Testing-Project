/**
 * Messages Service
 * Business logic for messaging
 */

const messagesRepository = require('./messages.repository');
const logger = require('../../shared/utils/logger.util');
const { getIO } = require('../../config/socket');

/**
 * Create or get conversation between patient and doctor
 */
const createConversation = async (patientId, doctorId) => {
  const conversation = await messagesRepository.findOrCreateConversation(patientId, doctorId);
  
  logger.info('Conversation created/retrieved', { 
    conversationId: conversation.id, 
    patientId, 
    doctorId 
  });

  return conversation;
};

/**
 * Get all conversations for a user
 */
const getUserConversations = async (userId, role) => {
  const conversations = await messagesRepository.getUserConversations(userId, role);
  
  logger.info('Retrieved user conversations', { 
    userId, 
    role, 
    count: conversations.length 
  });

  return conversations;
};

/**
 * Get messages for a conversation
 */
const getConversationMessages = async (conversationId, userId, limit = 50, offset = 0) => {
  // First verify user has access to this conversation
  await messagesRepository.getConversationById(conversationId, userId);
  
  const messages = await messagesRepository.getConversationMessages(conversationId, limit, offset);
  
  logger.info('Retrieved conversation messages', { 
    conversationId, 
    userId, 
    count: messages.length 
  });

  return messages;
};

/**
 * Create a new message
 */
const createMessage = async (conversationId, senderId, content) => {
  // Verify user has access to this conversation
  const conversation = await messagesRepository.getConversationById(conversationId, senderId);
  
  // Create the message
  const message = await messagesRepository.createMessage(conversationId, senderId, content);
  
  logger.info('Message created', { 
    messageId: message.id, 
    conversationId, 
    senderId 
  });

  // Emit socket event to conversation room
  try {
    const io = getIO();
    io.to(`conversation_${conversationId}`).emit('new_message', {
      conversationId,
      message
    });

    // Emit notification to the other user
    const recipientId = conversation.patient_id === senderId 
      ? conversation.doctor_id 
      : conversation.patient_id;
    
    io.to(`user_${recipientId}`).emit('message_notification', {
      conversationId,
      message,
      sender: message.sender
    });

    logger.info('Socket events emitted for new message', { 
      conversationId, 
      recipientId 
    });
  } catch (error) {
    logger.error('Error emitting socket events', { error: error.message });
    // Don't throw - message was saved successfully
  }

  return message;
};

/**
 * Mark conversation as read
 */
const markAsRead = async (conversationId, userId) => {
  // Verify user has access to this conversation
  await messagesRepository.getConversationById(conversationId, userId);
  
  const updatedMessages = await messagesRepository.markConversationAsRead(conversationId, userId);
  
  logger.info('Conversation marked as read', { 
    conversationId, 
    userId, 
    messagesUpdated: updatedMessages.length 
  });

  // Emit socket event to notify sender
  try {
    const io = getIO();
    io.to(`conversation_${conversationId}`).emit('messages_read', {
      conversationId,
      readBy: userId
    });
  } catch (error) {
    logger.error('Error emitting read receipt', { error: error.message });
  }

  return { success: true, count: updatedMessages.length };
};

/**
 * Get unread message count
 */
const getUnreadCount = async (userId, role) => {
  const count = await messagesRepository.getUnreadCount(userId, role);
  return { unreadCount: count };
};

module.exports = {
  createConversation,
  getUserConversations,
  getConversationMessages,
  createMessage,
  markAsRead,
  getUnreadCount
};
