import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { useAuthContext } from '../../shared/contexts/AuthContext';
import { messagesService } from '../../shared/services/messages.service';
import { socketService } from '../../shared/services/socket.service';

export function ChatWindow() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    // Connect socket
    socketService.connect();
    socketService.joinConversation(conversationId);

    // Load messages
    loadMessages();

    // Listen for new messages
    socketService.onNewMessage(handleNewMessage);
    socketService.onTyping(handleTypingIndicator);
    socketService.onMessagesRead(handleMessagesRead);

    // Mark as read when opening
    messagesService.markAsRead(conversationId).catch(console.error);

    return () => {
      socketService.leaveConversation(conversationId);
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('messages_read');
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesService.getMessages(conversationId);
      
      if (response.data) {
        setMessages(response.data);
        
        // Get conversation info from first message or fetch separately
        const conversationsResponse = await messagesService.getConversations();
        const conv = conversationsResponse.data.find(c => c.id === conversationId);
        
        if (conv) {
          setConversation(conv);
          // Determine other user
          const other = user.id === conv.patient_id ? conv.doctor : conv.patient;
          setOtherUser(other);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (data) => {
    if (data.conversationId === conversationId) {
      // Check if message already exists (prevent duplication)
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === data.message.id);
        if (exists) {
          return prev;
        }
        return [...prev, data.message];
      });
      
      // Mark as read if window is active
      if (document.hasFocus()) {
        messagesService.markAsRead(conversationId).catch(console.error);
      }
    }
  };

  const handleTypingIndicator = (data) => {
    if (data.conversationId === conversationId && data.userId !== user.id) {
      setIsTyping(data.isTyping);
    }
  };

  const handleMessagesRead = (data) => {
    if (data.conversationId === conversationId) {
      setMessages(prev =>
        prev.map(msg => ({
          ...msg,
          read_at: msg.sender_id === user.id ? new Date().toISOString() : msg.read_at
        }))
      );
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await messagesService.sendMessage(conversationId, newMessage.trim());
      
      if (response.data) {
        // Add message to state immediately for instant feedback
        setMessages(prev => {
          // Check if it already exists to prevent duplication
          const exists = prev.some(msg => msg.id === response.data.id);
          if (exists) {
            return prev;
          }
          return [...prev, response.data];
        });
        setNewMessage('');
        socketService.sendTyping(conversationId, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    socketService.sendTyping(conversationId, true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(conversationId, false);
    }, 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
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
      <Card className="h-[calc(100vh-12rem)]">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${user.role}/messages`)}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-lg">
                {otherUser?.full_name || 'Chat'}
              </CardTitle>
              {isTyping && (
                <p className="text-sm text-gray-500">typing...</p>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex flex-col h-[calc(100%-8rem)] p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message, index) => {
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);
                const isOwn = message.sender_id === user.id;

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center text-sm text-gray-500 my-4">
                        {formatDate(message.created_at)}
                      </div>
                    )}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwn
                            ? 'bg-[#667eea] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatTime(message.created_at)}
                          {isOwn && message.read_at && ' · Read'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-[#667eea] hover:bg-[#5568d3]"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
