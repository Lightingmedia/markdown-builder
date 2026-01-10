-- Create table for LightRail AI chat sessions
CREATE TABLE public.llm_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat messages
CREATE TABLE public.llm_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.llm_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.llm_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat sessions
CREATE POLICY "Users can view own sessions" ON public.llm_chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.llm_chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.llm_chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.llm_chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for chat messages
CREATE POLICY "Users can view own messages" ON public.llm_chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.llm_chat_sessions WHERE id = session_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create own messages" ON public.llm_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.llm_chat_sessions WHERE id = session_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own messages" ON public.llm_chat_messages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.llm_chat_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX idx_llm_chat_sessions_user_id ON public.llm_chat_sessions(user_id);
CREATE INDEX idx_llm_chat_messages_session_id ON public.llm_chat_messages(session_id);

-- Create updated_at trigger
CREATE TRIGGER update_llm_chat_sessions_updated_at
  BEFORE UPDATE ON public.llm_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();