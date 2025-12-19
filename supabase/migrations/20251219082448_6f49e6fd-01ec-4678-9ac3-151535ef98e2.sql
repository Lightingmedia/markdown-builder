-- PCB EDA Copilot Tables

-- Projects scoped to users (admin only)
CREATE TABLE public.pcb_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design objects (components, nets, constraints)
CREATE TABLE public.pcb_design_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.pcb_projects(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- BLOCK, COMPONENT, NET, CONSTRAINT
  name VARCHAR(255) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design versioning
CREATE TABLE public.pcb_design_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.pcb_projects(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  summary_text TEXT,
  design_snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions per project
CREATE TABLE public.pcb_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.pcb_projects(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages with tool call support
CREATE TABLE public.pcb_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID REFERENCES public.pcb_chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL, -- user, assistant, system
  content TEXT NOT NULL,
  tool_calls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.pcb_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcb_design_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcb_design_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcb_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcb_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pcb_projects (admin only)
CREATE POLICY "Admins can view all projects" ON public.pcb_projects
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can create projects" ON public.pcb_projects
  FOR INSERT WITH CHECK (is_admin() AND auth.uid() = owner_user_id);

CREATE POLICY "Admins can update own projects" ON public.pcb_projects
  FOR UPDATE USING (is_admin() AND auth.uid() = owner_user_id);

CREATE POLICY "Admins can delete own projects" ON public.pcb_projects
  FOR DELETE USING (is_admin() AND auth.uid() = owner_user_id);

-- RLS Policies for pcb_design_objects (admin only via project ownership)
CREATE POLICY "Admins can view design objects" ON public.pcb_design_objects
  FOR SELECT USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id
  ));

CREATE POLICY "Admins can create design objects" ON public.pcb_design_objects
  FOR INSERT WITH CHECK (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id AND owner_user_id = auth.uid()
  ));

CREATE POLICY "Admins can update design objects" ON public.pcb_design_objects
  FOR UPDATE USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id AND owner_user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete design objects" ON public.pcb_design_objects
  FOR DELETE USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id AND owner_user_id = auth.uid()
  ));

-- RLS Policies for pcb_design_versions (admin only via project ownership)
CREATE POLICY "Admins can view design versions" ON public.pcb_design_versions
  FOR SELECT USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id
  ));

CREATE POLICY "Admins can create design versions" ON public.pcb_design_versions
  FOR INSERT WITH CHECK (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id AND owner_user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete design versions" ON public.pcb_design_versions
  FOR DELETE USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id AND owner_user_id = auth.uid()
  ));

-- RLS Policies for pcb_chat_sessions (admin only via project ownership)
CREATE POLICY "Admins can view chat sessions" ON public.pcb_chat_sessions
  FOR SELECT USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id
  ));

CREATE POLICY "Admins can create chat sessions" ON public.pcb_chat_sessions
  FOR INSERT WITH CHECK (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id AND owner_user_id = auth.uid()
  ));

CREATE POLICY "Admins can update chat sessions" ON public.pcb_chat_sessions
  FOR UPDATE USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id AND owner_user_id = auth.uid()
  ));

CREATE POLICY "Admins can delete chat sessions" ON public.pcb_chat_sessions
  FOR DELETE USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_projects WHERE id = project_id AND owner_user_id = auth.uid()
  ));

-- RLS Policies for pcb_chat_messages (admin only via chat session -> project)
CREATE POLICY "Admins can view chat messages" ON public.pcb_chat_messages
  FOR SELECT USING (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_chat_sessions cs
    JOIN public.pcb_projects p ON cs.project_id = p.id
    WHERE cs.id = chat_session_id
  ));

CREATE POLICY "Admins can create chat messages" ON public.pcb_chat_messages
  FOR INSERT WITH CHECK (is_admin() AND EXISTS (
    SELECT 1 FROM public.pcb_chat_sessions cs
    JOIN public.pcb_projects p ON cs.project_id = p.id
    WHERE cs.id = chat_session_id AND p.owner_user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_pcb_projects_owner ON public.pcb_projects(owner_user_id);
CREATE INDEX idx_pcb_design_objects_project ON public.pcb_design_objects(project_id);
CREATE INDEX idx_pcb_design_objects_type ON public.pcb_design_objects(type);
CREATE INDEX idx_pcb_design_versions_project ON public.pcb_design_versions(project_id);
CREATE INDEX idx_pcb_chat_sessions_project ON public.pcb_chat_sessions(project_id);
CREATE INDEX idx_pcb_chat_messages_session ON public.pcb_chat_messages(chat_session_id);

-- Trigger to update updated_at on pcb_projects
CREATE TRIGGER update_pcb_projects_updated_at
  BEFORE UPDATE ON public.pcb_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();