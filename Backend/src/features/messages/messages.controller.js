/**
 * Messages Controller
 * Handles chat message requests
 */

const messagesService = require('./messages.service');
const { successResponse, errorResponse } = require('../../shared/utils/response.util');
const { asyncHandler } = require('../../shared/middleware/error.middleware');

/**
 * Create or get existing conversation
 * POST /api/v1/messages/conversations
 */
const createConversation = asyncHandler(async (req, res) => {
  const { patientId, doctorId } = req.body;

  if (!patientId || !doctorId) {
    return res.status(400).json(errorResponse('Patient ID and Doctor ID are required', null, 400));
  }

  const conversation = await messagesService.createConversation(patientId, doctorId);
  res.status(201).json(successResponse(conversation, 'Conversation created successfully', 201));
});

/**
 * Get all conversations for current user
 * GET /api/v1/messages/conversations
 */
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await messagesService.getUserConversations(
    req.user.id,
    req.user.profile.role
  );
  res.json(successResponse(conversations));
});

/**
 * Get messages for a conversation
 * GET /api/v1/messages/conversations/:conversationId
 */
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const messages = await messagesService.getConversationMessages(
    conversationId,
    req.user.id
  );
  res.json(successResponse(messages));
});

/**
 * Send a message
 * POST /api/v1/messages/conversations/:conversationId/messages
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json(errorResponse('Message content is required', null, 400));
  }

  const message = await messagesService.createMessage(
    conversationId,
    req.user.id,
    content.trim()
  );

  res.status(201).json(successResponse(message, 'Message sent successfully', 201));
});

/**
 * Mark conversation as read
 * PUT /api/v1/messages/conversations/:conversationId/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const result = await messagesService.markAsRead(conversationId, req.user.id);
  res.json(successResponse(result, 'Messages marked as read'));
});

/**
 * Get unread message count
 * GET /api/v1/messages/unread-count
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await messagesService.getUnreadCount(req.user.id, req.user.profile.role);
  res.json(successResponse(result));
});

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
};
