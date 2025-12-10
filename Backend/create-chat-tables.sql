-- ================================================
-- Create Chat/Messaging Tables for Se7ety
-- Run this in Supabase SQL Editor
-- ================================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique conversation between patient and doctor
    UNIQUE(patient_id, doctor_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Check content is not empty
    CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_patient ON public.conversations(patient_id);
CREATE INDEX IF NOT EXISTS idx_conversations_doctor ON public.conversations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON public.conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(conversation_id, read_at) WHERE read_at IS NULL;

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations table
-- Users can view conversations they are part of
CREATE POLICY "Users can view their own conversations"
    ON public.conversations FOR SELECT
    USING (
        auth.uid() = patient_id OR 
        auth.uid() = doctor_id
    );

-- Patients can create conversations with doctors
CREATE POLICY "Patients can create conversations with doctors"
    ON public.conversations FOR INSERT
    WITH CHECK (
        auth.uid() = patient_id
    );

-- RLS Policies for messages table
-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.patient_id = auth.uid() OR conversations.doctor_id = auth.uid())
        )
    );

-- Users can send messages in their conversations
CREATE POLICY "Users can send messages in their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = conversation_id
            AND (conversations.patient_id = auth.uid() OR conversations.doctor_id = auth.uid())
        )
    );

-- Users can mark their own messages as read
CREATE POLICY "Users can update read status"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.patient_id = auth.uid() OR conversations.doctor_id = auth.uid())
        )
    );

-- Create function to update conversation updated_at on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update conversation timestamp
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON public.messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- Grant permissions (if needed for service role)
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.conversations TO service_role;
GRANT ALL ON public.messages TO service_role;

-- Verify the tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages')
ORDER BY table_name;
