import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LightOSProject {
  id: string;
  name: string;
  description: string;
  stack: 'react-fastapi' | 'nextjs-supabase' | 'vue-express' | 'python-data';
  model: string;
  status: 'building' | 'success' | 'error' | 'stopped';
  createdAt: string;
  buildTime: number;
  filesCount: number;
  linesOfCode: number;
  plan?: BuildPlan;
  previewType?: 'todo' | 'dashboard' | 'blog' | 'ecommerce' | 'default';
}

export interface BuildPlan {
  pages: string[];
  models: string[];
  apis: string[];
  flows: string[];
}

export interface BuildLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface LightOSState {
  projects: LightOSProject[];
  currentBuild: {
    id: string | null;
    stage: 'idle' | 'understanding' | 'planning' | 'building' | 'installing' | 'compiling' | 'starting' | 'complete' | 'error';
    progress: number;
    logs: BuildLog[];
    plan: BuildPlan | null;
    filesGenerated: number;
  };
  stats: {
    totalApps: number;
    successRate: number;
    avgBuildTime: number;
  };
  
  // Actions
  addProject: (project: LightOSProject) => void;
  updateProject: (id: string, updates: Partial<LightOSProject>) => void;
  deleteProject: (id: string) => void;
  setBuildStage: (stage: LightOSState['currentBuild']['stage']) => void;
  setBuildProgress: (progress: number) => void;
  addBuildLog: (log: BuildLog) => void;
  setBuildPlan: (plan: BuildPlan) => void;
  setFilesGenerated: (count: number) => void;
  setCurrentBuildId: (id: string | null) => void;
  resetBuild: () => void;
  updateStats: () => void;
}

export const useLightOSStore = create<LightOSState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentBuild: {
        id: null,
        stage: 'idle',
        progress: 0,
        logs: [],
        plan: null,
        filesGenerated: 0,
      },
      stats: {
        totalApps: 0,
        successRate: 98.5,
        avgBuildTime: 45,
      },

      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project] 
      })),
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),
      
      setBuildStage: (stage) => set((state) => ({
        currentBuild: { ...state.currentBuild, stage }
      })),
      
      setBuildProgress: (progress) => set((state) => ({
        currentBuild: { ...state.currentBuild, progress }
      })),
      
      addBuildLog: (log) => set((state) => ({
        currentBuild: { 
          ...state.currentBuild, 
          logs: [...state.currentBuild.logs, log] 
        }
      })),
      
      setBuildPlan: (plan) => set((state) => ({
        currentBuild: { ...state.currentBuild, plan }
      })),
      
      setFilesGenerated: (count) => set((state) => ({
        currentBuild: { ...state.currentBuild, filesGenerated: count }
      })),
      
      setCurrentBuildId: (id) => set((state) => ({
        currentBuild: { ...state.currentBuild, id }
      })),
      
      resetBuild: () => set((state) => ({
        currentBuild: {
          id: null,
          stage: 'idle',
          progress: 0,
          logs: [],
          plan: null,
          filesGenerated: 0,
        }
      })),
      
      updateStats: () => set((state) => {
        const successCount = state.projects.filter(p => p.status === 'success').length;
        const totalCount = state.projects.length;
        return {
          stats: {
            totalApps: totalCount,
            successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 98.5,
            avgBuildTime: state.projects.length > 0 
              ? state.projects.reduce((acc, p) => acc + p.buildTime, 0) / state.projects.length 
              : 45,
          }
        };
      }),
    }),
    {
      name: 'lightos-storage',
    }
  )
);
