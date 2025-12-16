/**
 * Messages Repository
 * Data access layer for messages and conversations
 */

const { supabase } = require('../../config/database');
const logger = require('../../shared/utils/logger.util');

/**
 * Find or create conversation between patient and doctor
 */
const findOrCreateConversation = async (patientId, doctorId) => {
  // First try to find existing conversation
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('*')
    .eq('patient_id', patientId)
    .eq('doctor_id', doctorId)
    .maybeSingle();

  if (findError && findError.code !== 'PGRST116') {
    logger.error('Error finding conversation', { patientId, doctorId, error: findError.message });
    throw findError;
  }

  if (existing) {
    return existing;
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      patient_id: patientId,
      doctor_id: doctorId,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    logger.error('Error creating conversation', { patientId, doctorId, error: error.message });
    throw error;
  }

  return data;
};

/**
 * Get all conversations for a user
 */
const getUserConversations = async (userId, role) => {
  const query = supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  // Filter based on role
  if (role === 'patient') {
    query.eq('patient_id', userId);
  } else if (role === 'doctor') {
    query.eq('doctor_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    logger.error('Error getting user conversations', { userId, role, error: error.message });
    throw error;
  }

  // Get the latest message and profile data for each conversation
  const conversationsWithDetails = await Promise.all(
    data.map(async (conv) => {
      // Get last message
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get patient profile
      const { data: patientProfile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', conv.patient_id)
        .single();

      // Get doctor profile  
      const { data: doctorProfile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', conv.doctor_id)
        .single();

      return {
        ...conv,
        last_message: lastMsg,
        patient: patientProfile,
        doctor: doctorProfile
      };
    })
  );

  return conversationsWithDetails;
};

/**
 * Get conversation by ID with access check
 */
const getConversationById = async (conversationId, userId) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (error) {
    logger.error('Error getting conversation', { conversationId, error: error.message });
    throw error;
  }

  // Verify user has access to this conversation
  if (data.patient_id !== userId && data.doctor_id !== userId) {
    const accessError = new Error('Unauthorized access to conversation');
    accessError.statusCode = 403;
    throw accessError;
  }

  // Get patient and doctor profiles
  const { data: patientProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', data.patient_id)
    .single();

  const { data: doctorProfile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', data.doctor_id)
    .single();

  return {
    ...data,
    patient: patientProfile,
    doctor: doctorProfile
  };
};

/**
 * Get messages for a conversation
 */
const getConversationMessages = async (conversationId, limit = 50, offset = 0) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Error getting messages', { conversationId, error: error.message });
    throw error;
  }

  // Fetch sender profiles separately
  const messagesWithSenders = await Promise.all(
    data.map(async (msg) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', msg.sender_id)
        .single();

      return {
        ...msg,
        sender: profile
      };
    })
  );

  return messagesWithSenders.reverse(); // Return in chronological order
};

/**
 * Create a new message
 */
const createMessage = async (conversationId, senderId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      created_at: new Date().toISOString()
    }])
    .select('*')
    .single();

  if (error) {
    logger.error('Error creating message', { conversationId, senderId, error: error.message });
    throw error;
  }

  // Fetch sender profile separately
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', senderId)
    .single();

  // Update conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return {
    ...data,
    sender: profile
  };
};

/**
 * Mark conversation as read
 */
const markConversationAsRead = async (conversationId, userId) => {
  const { data, error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null)
    .select();

  if (error) {
    logger.error('Error marking messages as read', { conversationId, userId, error: error.message });
    throw error;
  }

  return data;
};

/**
 * Get unread message count for user
 */
const getUnreadCount = async (userId, role) => {
  let query = supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .neq('sender_id', userId)
    .is('read_at', null);

  if (role === 'patient') {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('patient_id', userId);
    
    const conversationIds = conversations?.map(c => c.id) || [];
    query = query.in('conversation_id', conversationIds);
  } else if (role === 'doctor') {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('doctor_id', userId);
    
    const conversationIds = conversations?.map(c => c.id) || [];
    query = query.in('conversation_id', conversationIds);
  }

  const { count, error } = await query;

  if (error) {
    logger.error('Error getting unread count', { userId, role, error: error.message });
    return 0;
  }

  return count || 0;
};

module.exports = {
  findOrCreateConversation,
  getUserConversations,
  getConversationById,
  getConversationMessages,
  createMessage,
  markConversationAsRead,
  getUnreadCount
};
