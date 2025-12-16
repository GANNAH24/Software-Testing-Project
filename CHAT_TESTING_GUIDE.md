# Real-Time Chat Testing Guide

## Overview
This guide explains how to test the real-time chat feature between patients and doctors in your application.

## Prerequisites
- Backend server running on `http://localhost:3000`
- Frontend dev server running on `http://localhost:5173`
- At least two user accounts:
  - One Patient account (e.g., ali@patient.com)
  - One Doctor account (e.g., alia@doctor.com)

---

## Testing Strategy 1: Two Different Browsers

### Setup
1. **Browser 1 (Chrome)**: Login as Patient
2. **Browser 2 (Firefox/Safari)**: Login as Doctor

### Steps

#### Patient Side (Browser 1 - Chrome):
1. Login as patient (ali@patient.com)
2. Navigate to "Find Doctors" from sidebar
3. Click on any doctor's profile
4. Click the "Message Doctor" button (blue outlined button next to "Book Appointment")
5. You should be redirected to `/patient/messages/:conversationId`
6. Type a message: "Hello Doctor, I have a question about my appointment"
7. Press Send

#### Doctor Side (Browser 2 - Firefox):
1. Login as doctor (alia@doctor.com)
2. Navigate to "Messages" from sidebar
3. You should see the new conversation appear in the list
4. You should see a notification toast for the new message
5. Click on the conversation
6. You should see the patient's message
7. Type a reply: "Hello! I'm happy to help. What's your question?"
8. Press Send

#### Verification (Patient Side - Browser 1):
1. The doctor's reply should appear in real-time (no refresh needed)
2. Check that the message shows "Read" status
3. Try typing - doctor should see "typing..." indicator

---

## Testing Strategy 2: Incognito Windows (Same Browser)

### Setup
1. **Normal Window**: Login as Patient
2. **Incognito Window**: Login as Doctor

### Steps

#### Start from Doctor's Appointments:
1. **Incognito Window** (Doctor):
   - Go to "My Bookings" from sidebar
   - Find an appointment with patient_phone displayed
   - Click the message icon (💬) next to patient name
   - Should redirect to chat with that patient

2. **Normal Window** (Patient):
   - Go to "Messages" from sidebar
   - New conversation should appear
   - Open the conversation
   - Send a message

3. **Incognito Window** (Doctor):
   - Message should appear in real-time
   - Reply to the message

4. **Normal Window** (Patient):
   - Reply should appear instantly
   - Check typing indicator works

---

## Testing Strategy 3: Developer Tools Network Tab

### Real-Time Verification

1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "WS" (WebSocket)
4. You should see a WebSocket connection to `localhost:3000`
5. Click on the WebSocket connection
6. Go to **Messages** tab
7. Send a chat message
8. You should see:
   ```json
   {
     "event": "send_message",
     "data": {
       "conversationId": "...",
       "content": "Your message"
     }
   }
   ```
9. When receiving a message, you should see:
   ```json
   {
     "event": "new_message",
     "data": {
       "message": {...}
     }
   }
   ```

---

## Feature Checklist

### Message Delivery ✓
- [ ] Patient can send message to doctor
- [ ] Doctor can send message to patient
- [ ] Messages appear in real-time (no page refresh)
- [ ] Messages persist after page reload

### User Interface ✓
- [ ] "Message Doctor" button appears on doctor profile (patient view)
- [ ] Message icon appears on appointment cards (doctor view)
- [ ] Unread message badge shows count in sidebar
- [ ] Conversation list shows last message preview
- [ ] Chat window displays all messages

### Real-Time Features ✓
- [ ] Typing indicator appears when other user types
- [ ] Read receipts show "Read" when message is viewed
- [ ] Notifications toast when new message arrives
- [ ] Unread count updates automatically

### Navigation ✓
- [ ] Clicking "Message Doctor" redirects to `/patient/messages/:id`
- [ ] Clicking message icon in appointments redirects to `/doctor/messages/:id`
- [ ] Messages link in sidebar navigates to conversation list
- [ ] Badge count refreshes every 30 seconds

---

## Common Test Scenarios

### Scenario 1: Patient Initiates Chat
1. Patient views doctor profile
2. Clicks "Message Doctor"
3. Conversation is created
4. Patient sends first message
5. Doctor receives notification
6. Doctor replies
7. Bidirectional chat established

### Scenario 2: Doctor Initiates Chat from Appointment
1. Doctor views their bookings
2. Sees patient phone number
3. Clicks message icon
4. Conversation is created (or existing one opened)
5. Doctor sends message
6. Patient receives notification
7. Patient replies

### Scenario 3: Existing Conversation
1. Patient clicks "Message Doctor" again
2. Should open same conversation (not create new one)
3. Message history should be preserved
4. New messages append to existing chat

---

## Debugging Tips

### Backend Logs
Monitor the backend terminal for:
```
[2025-12-10T...] [INFO] Client connected {"socketId":"..."}
[2025-12-10T...] [INFO] User joined room {"userId":"..."}
[2025-12-10T...] [INFO] Message sent {"conversationId":"..."}
```

### Frontend Console
Check browser console for:
- "Socket connected"
- "Joined conversation room"
- "New message received"
- Any error messages

### Database Verification
Check Supabase database:
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run:
   ```sql
   SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 10;
   SELECT * FROM messages ORDER BY created_at DESC LIMIT 20;
   ```

---

## Performance Testing

### Load Test
1. Open 3-4 different browser windows
2. Login as different users in each
3. Create multiple conversations
4. Send messages rapidly
5. Verify all messages are delivered
6. Check for any lag or delays

### Connection Stability
1. Send a message
2. Disconnect internet briefly
3. Reconnect
4. Send another message
5. Verify both messages are delivered
6. Check if Socket.IO reconnects automatically

---

## Expected Behavior

### Message Sending
- ✅ Input clears after sending
- ✅ Message appears at bottom of chat
- ✅ Scroll auto-scrolls to latest message
- ✅ Sending indicator shows briefly
- ✅ Timestamp is displayed

### Message Receiving
- ✅ Message appears without refresh
- ✅ Notification toast shows
- ✅ Unread count increments
- ✅ Conversation moves to top of list
- ✅ Sound/visual notification (if implemented)

### Typing Indicator
- ✅ Shows "typing..." when other user types
- ✅ Disappears when user stops typing (3s delay)
- ✅ Only shows for active conversation

### Read Receipts
- ✅ Messages show "Sent" initially
- ✅ Updates to "Read" when recipient opens chat
- ✅ All messages marked as read when window focused

---

## Troubleshooting

### Messages Not Appearing
1. Check Socket.IO connection in Network tab
2. Verify backend server is running
3. Check browser console for errors
4. Ensure user IDs are correct
5. Verify database tables have data

### Unread Count Not Updating
1. Check if badge refresh interval is working (30s)
2. Manually refresh the page
3. Verify unread-count API endpoint returns correct data
4. Check if messages are being marked as read properly

### Conversation Not Creating
1. Check if patient_id and doctor_id are correct
2. Verify createConversation API is working
3. Check database for duplicate constraints
4. Look for foreign key errors in backend logs

---

## Success Criteria

✅ **Core Functionality**
- Messages are sent and received in real-time
- Both patient and doctor can initiate conversations
- Message history persists across sessions
- Unread counts are accurate

✅ **User Experience**
- UI is responsive and intuitive
- Notifications work properly
- Typing indicators enhance real-time feel
- Read receipts provide delivery confirmation

✅ **Reliability**
- No message loss
- Handles network disconnections gracefully
- Socket.IO reconnects automatically
- Database transactions are atomic

---

## Next Steps

After successful testing:
1. ✅ Deploy to staging environment
2. ✅ Test with real devices (mobile/tablet)
3. ✅ Conduct user acceptance testing
4. ✅ Monitor production logs
5. ✅ Gather user feedback
6. ✅ Implement analytics for chat usage

---

## Contact

For issues or questions:
- Check backend logs at `/Backend/logs`
- Review Supabase database
- Inspect Socket.IO connections in Network tab
- Contact development team
