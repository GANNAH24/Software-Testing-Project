/**
 * Messages Routes
 * API endpoints for chat messages
 */

const express = require('express');
const router = express.Router();
const messagesController = require('./messages.controller');
const { requireAuth } = require('../../shared/middleware/auth.middleware');

// All message routes require authentication
router.use(requireAuth());

// Create or get existing conversation
router.post('/conversations', messagesController.createConversation);

// Get conversations for current user
router.get('/conversations', messagesController.getConversations);

// Get messages for a conversation
router.get('/conversations/:conversationId', messagesController.getMessages);

// Send a message
router.post('/conversations/:conversationId/messages', messagesController.sendMessage);

// Mark messages as read
router.put('/conversations/:conversationId/read', messagesController.markAsRead);

// Get unread message count
router.get('/unread-count', messagesController.getUnreadCount);

module.exports = router;
