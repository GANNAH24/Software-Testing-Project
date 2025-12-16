/**
 * Unit Tests for Messages Service (Mocked)
 */

jest.mock('../../src/features/messages/messages.repository');
jest.mock('../../src/features/doctors/doctors.repository');
jest.mock('../../src/features/patients/patients.repository');

const messagesService = require('../../src/features/messages/messages.service');
const messagesRepository = require('../../src/features/messages/messages.repository');
const doctorsRepository = require('../../src/features/doctors/doctors.repository');
const patientsRepository = require('../../src/features/patients/patients.repository');

describe('Messages Service - Unit Tests (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Note: createConversation() and createMessage() use direct Supabase queries,
  // so they're better tested in integration tests

  describe('getUserConversations()', () => {
    it('should retrieve user conversations', async () => {
      const mockConversations = [
        { conversation_id: 'conv-1', patient_id: 'p1' },
        { conversation_id: 'conv-2', patient_id: 'p1' }
      ];

      messagesRepository.getUserConversations.mockResolvedValue(mockConversations);

      const result = await messagesService.getUserConversations('p1', 'patient');

      expect(result).toEqual(mockConversations);
    });
  });

  describe('getConversationMessages()', () => {
    it('should retrieve messages for conversation', async () => {
      const mockMessages = [
        { message_id: 'm1', content: 'Hello', sender_id: 'p1' },
        { message_id: 'm2', content: 'Hi there', sender_id: 'd1' }
      ];

      messagesRepository.getConversationMessages.mockResolvedValue(mockMessages);

      const result = await messagesService.getConversationMessages('conv-1');

      expect(result).toEqual(mockMessages);
    });
  });

  describe('getUnreadCount()', () => {
    it('should return unread message count', async () => {
      messagesRepository.getUnreadCount.mockResolvedValue(5);

      const result = await messagesService.getUnreadCount('user-1', 'patient');

      expect(result).toEqual({ unreadCount: 5 });
      expect(messagesRepository.getUnreadCount).toHaveBeenCalledWith('user-1', 'patient');
    });

    it('should return zero when no unread messages', async () => {
      messagesRepository.getUnreadCount.mockResolvedValue(0);

      const result = await messagesService.getUnreadCount('user-2', 'doctor');

      expect(result).toEqual({ unreadCount: 0 });
    });
  });

  // Note: deleteMessage() uses direct Supabase query for authorization check,
  // so it's better tested in integration tests
});
