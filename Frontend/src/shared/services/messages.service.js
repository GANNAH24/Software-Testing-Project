import apiClient from './api.service';

export const messagesService = {
  // Get all conversations for current user
  getConversations: async () => {
    return await apiClient.get('/messages/conversations');
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId, limit = 50, offset = 0) => {
    return await apiClient.get(`/messages/conversations/${conversationId}`, {
      params: { limit, offset }
    });
  },

  // Send a message
  sendMessage: async (conversationId, content) => {
    return await apiClient.post(`/messages/conversations/${conversationId}/messages`, {
      content
    });
  },

  // Mark conversation as read
  markAsRead: async (conversationId) => {
    return await apiClient.put(`/messages/conversations/${conversationId}/read`);
  },

  // Get unread message count
  getUnreadCount: async () => {
    return await apiClient.get('/messages/unread-count');
  },

  // Create conversation (if needed - typically done when sending first message)
  createConversation: async (patientId, doctorId) => {
    return await apiClient.post('/messages/conversations', {
      patientId,
      doctorId
    });
  }
};
