import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface LightOSProject {
  id: string;
  user_id: string;
  name: string;
  description: string;
  stack: 'react-fastapi' | 'nextjs-supabase' | 'vue-express' | 'python-data';
  status: 'building' | 'success' | 'error' | 'stopped';
  build_time_seconds: number | null;
  files_count: number | null;
  lines_of_code: number | null;
  generated_plan: Json | null;
  mock_ui_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  stack: string;
  status?: string;
  build_time_seconds?: number;
  files_count?: number;
  lines_of_code?: number;
  generated_plan?: Json;
  mock_ui_type?: string;
}

export const useLightOSProjects = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['lightos-projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('lightos_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LightOSProject[];
    },
  });

  const createProject = useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('lightos_projects')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description,
          stack: input.stack,
          status: input.status || 'building',
          build_time_seconds: input.build_time_seconds,
          files_count: input.files_count,
          lines_of_code: input.lines_of_code,
          generated_plan: input.generated_plan,
          mock_ui_type: input.mock_ui_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data as LightOSProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lightos-projects'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<LightOSProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await supabase
        .from('lightos_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LightOSProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lightos-projects'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lightos_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lightos-projects'] });
      toast({
        title: 'Project deleted',
        description: 'The project has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const stats = {
    totalApps: projects.length,
    successRate: projects.length > 0 
      ? (projects.filter(p => p.status === 'success').length / projects.length) * 100 
      : 98.5,
    avgBuildTime: projects.length > 0 
      ? projects.reduce((acc, p) => acc + (p.build_time_seconds || 0), 0) / projects.length 
      : 45,
  };

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    stats,
  };
};
