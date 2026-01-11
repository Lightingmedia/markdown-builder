import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  Eye, 
  Code2, 
  Pencil, 
  Trash2,
  MoreVertical,
  Clock,
  FileCode,
  CheckCircle2,
  XCircle,
  Loader2,
  FolderKanban,
  LogIn
} from "lucide-react";
import { useLightOSProjects } from "@/hooks/useLightOSProjects";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const stackColors: Record<string, string> = {
  'react-fastapi': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'nextjs-supabase': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'vue-express': 'bg-green-500/20 text-green-400 border-green-500/30',
  'python-data': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const stackLabels: Record<string, string> = {
  'react-fastapi': 'React + FastAPI',
  'nextjs-supabase': 'Next.js + Supabase',
  'vue-express': 'Vue + Express',
  'python-data': 'Python Data Science',
};

const statusIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  building: <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />,
  stopped: <XCircle className="h-4 w-4 text-slate-400" />,
};

const Projects = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { projects, isLoading, deleteProject } = useLightOSProjects();
  const [search, setSearch] = useState("");
  const [stackFilter, setStackFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const filteredProjects = projects
    .filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (stackFilter !== 'all' && p.stack !== stackFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <LogIn className="h-16 w-16 mx-auto mb-4 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign in Required</h2>
            <p className="text-slate-400 mb-6">
              Please sign in to view your saved projects.
            </p>
            <Button 
              onClick={() => navigate('/monitor/auth')}
              className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-slate-400">{projects.length} projects built</p>
          </div>
          <Button 
            onClick={() => navigate('/lightos/build')}
            className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 bg-slate-900/50 border-slate-800/50 text-slate-200"
            />
          </div>
          <Select value={stackFilter} onValueChange={setStackFilter}>
            <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-800/50 text-slate-200">
              <SelectValue placeholder="Filter by stack" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stacks</SelectItem>
              <SelectItem value="react-fastapi">React + FastAPI</SelectItem>
              <SelectItem value="nextjs-supabase">Next.js + Supabase</SelectItem>
              <SelectItem value="vue-express">Vue + Express</SelectItem>
              <SelectItem value="python-data">Python Data Science</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px] bg-slate-900/50 border-slate-800/50 text-slate-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl overflow-hidden hover:border-indigo-500/30 transition-colors group">
                  {/* Thumbnail */}
                  <div className="h-32 bg-gradient-to-br from-indigo-500/10 to-teal-500/10 flex items-center justify-center">
                    <div className="text-4xl opacity-50">
                      {project.mock_ui_type === 'todo' ? '✅' :
                       project.mock_ui_type === 'dashboard' ? '📊' :
                       project.mock_ui_type === 'blog' ? '📝' :
                       project.mock_ui_type === 'ecommerce' ? '🛒' : '🚀'}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {statusIcons[project.status]}
                          <span className="text-xs text-slate-500 capitalize">{project.status}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-slate-400 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/lightos/preview/${project.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/lightos/preview/${project.id}`)}>
                            <Code2 className="h-4 w-4 mr-2" /> View Code
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/lightos/build', { state: { prompt: project.description } })}>
                            <Pencil className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteProject.mutate(project.id)}
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={stackColors[project.stack]} variant="outline">
                        {stackLabels[project.stack]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.build_time_seconds || 0}s
                      </div>
                      <div className="flex items-center gap-1">
                        <FileCode className="h-3 w-3" />
                        {project.files_count || 0} files
                      </div>
                      <div className="flex items-center gap-1">
                        <Code2 className="h-3 w-3" />
                        {project.lines_of_code || 0} LOC
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500"
                        onClick={() => navigate(`/lightos/preview/${project.id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> Preview
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={() => navigate(`/lightos/preview/${project.id}`)}
                      >
                        <Code2 className="h-3 w-3 mr-1" /> Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <FolderKanban className="h-16 w-16 mx-auto mb-4 text-slate-700" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6">Start building your first app with AI</p>
            <Button 
              onClick={() => navigate('/lightos/build')}
              className="bg-gradient-to-r from-indigo-600 to-teal-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
