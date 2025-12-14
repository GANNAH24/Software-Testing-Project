import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Loader2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { messagesService } from '../../shared/services/messages.service';
import { socketService } from '../../shared/services/socket.service';

export function ChatList() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect socket
    socketService.connect();

    // Load conversations
    loadConversations();

    // Listen for new messages
    socketService.onMessageNotification(handleMessageNotification);

    return () => {
      socketService.off('message_notification');
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesService.getConversations();
      
      if (response.data) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageNotification = (data) => {
    // Update conversation list
    loadConversations();
    
    // Show toast notification
    toast.info(`New message from ${data.sender?.full_name}`);
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/${user.role}/messages/${conversationId}`);
  };

  const getOtherUser = (conversation) => {
    return user.id === conversation.patient_id 
      ? conversation.doctor 
      : conversation.patient;
  };

  const getUnreadCount = (conversation) => {
    // Count unread messages in this conversation
    if (!conversation.last_message) return 0;
    
    const isUnread = !conversation.last_message.read_at && 
                     conversation.last_message.sender_id !== user.id;
    
    return isUnread ? 1 : 0;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#667eea]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No conversations yet</p>
              <p className="text-sm mt-2">
                {user.role === 'patient' 
                  ? 'Start a conversation with a doctor from their profile'
                  : 'Patients can start conversations with you'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const unreadCount = getUnreadCount(conversation);

                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation.id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser?.full_name || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(conversation.last_message?.created_at || conversation.created_at)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${
                            unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                          }`}>
                            {conversation.last_message?.content || 'No messages yet'}
                          </p>
                          
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-[#667eea] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
