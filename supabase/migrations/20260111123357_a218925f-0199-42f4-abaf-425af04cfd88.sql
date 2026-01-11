-- Create LightOS projects table
CREATE TABLE public.lightos_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  stack TEXT NOT NULL DEFAULT 'react-fastapi',
  status TEXT NOT NULL DEFAULT 'building',
  build_time_seconds INTEGER,
  files_count INTEGER DEFAULT 0,
  lines_of_code INTEGER DEFAULT 0,
  generated_plan JSONB DEFAULT '{}'::jsonb,
  mock_ui_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lightos_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own projects"
ON public.lightos_projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
ON public.lightos_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON public.lightos_projects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON public.lightos_projects
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_lightos_projects_updated_at
BEFORE UPDATE ON public.lightos_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();