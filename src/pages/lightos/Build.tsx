import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Rocket, 
  Brain, 
  FileCode, 
  Package, 
  Play,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  Sparkles,
  Lightbulb,
  LogIn
} from "lucide-react";
import { useLightOSStore, BuildPlan, BuildLog } from "@/stores/lightosStore";
import { useLightOSProjects } from "@/hooks/useLightOSProjects";
import type { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';

const stacks = [
  { value: 'react-fastapi', label: 'React + FastAPI', color: 'text-blue-400' },
  { value: 'nextjs-supabase', label: 'Next.js + Supabase', color: 'text-emerald-400' },
  { value: 'vue-express', label: 'Vue + Express', color: 'text-green-400' },
  { value: 'python-data', label: 'Python Data Science', color: 'text-yellow-400' },
];

const models = [
  { value: 'glm-4', label: 'GLM-4 (Recommended)' },
  { value: 'qwen-2.5', label: 'Qwen 2.5' },
  { value: 'llama-3.2', label: 'Llama 3.2' },
];

const examplePrompts = [
  "Todo app with auth, CRUD operations",
  "E-commerce store with cart and checkout",
  "Analytics dashboard with charts and export",
  "Blog with posts, comments, markdown editor",
];

const buildStages = [
  { key: 'understanding', label: 'Understanding', icon: Brain, duration: 5000 },
  { key: 'planning', label: 'Planning', icon: Lightbulb, duration: 10000 },
  { key: 'building', label: 'Building', icon: FileCode, duration: 30000 },
  { key: 'installing', label: 'Installing', icon: Package, duration: 15000 },
  { key: 'compiling', label: 'Compiling', icon: Rocket, duration: 10000 },
  { key: 'starting', label: 'Starting', icon: Play, duration: 5000 },
];

const Build = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [description, setDescription] = useState(location.state?.prompt || "");
  const [stack, setStack] = useState<string>("react-fastapi");
  const [model, setModel] = useState<string>("glm-4");
  const [isBuilding, setIsBuilding] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const { createProject } = useLightOSProjects();
  
  const { 
    currentBuild, 
    setBuildStage, 
    setBuildProgress, 
    addBuildLog, 
    setBuildPlan,
    setFilesGenerated,
    setCurrentBuildId,
    resetBuild,
  } = useLightOSStore();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const detectPreviewType = (desc: string): 'todo' | 'dashboard' | 'blog' | 'ecommerce' | 'default' => {
    const lower = desc.toLowerCase();
    if (lower.includes('todo') || lower.includes('task')) return 'todo';
    if (lower.includes('dashboard') || lower.includes('analytics') || lower.includes('chart')) return 'dashboard';
    if (lower.includes('blog') || lower.includes('post') || lower.includes('article')) return 'blog';
    if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('cart') || lower.includes('store')) return 'ecommerce';
    return 'default';
  };

  const generatePlan = (desc: string): BuildPlan => {
    const previewType = detectPreviewType(desc);
    const plans: Record<string, BuildPlan> = {
      todo: {
        pages: ['/', '/tasks', '/settings', '/profile'],
        models: ['User', 'Task', 'Category'],
        apis: ['POST /api/tasks', 'GET /api/tasks', 'PUT /api/tasks/:id', 'DELETE /api/tasks/:id'],
        flows: ['User Authentication', 'Task CRUD', 'Category Filtering']
      },
      dashboard: {
        pages: ['/', '/analytics', '/reports', '/settings'],
        models: ['User', 'Metric', 'Report', 'Chart'],
        apis: ['GET /api/metrics', 'GET /api/reports', 'POST /api/export'],
        flows: ['Data Visualization', 'Real-time Updates', 'Export to CSV/PDF']
      },
      blog: {
        pages: ['/', '/posts', '/posts/:id', '/admin', '/profile'],
        models: ['User', 'Post', 'Comment', 'Category'],
        apis: ['GET /api/posts', 'POST /api/posts', 'GET /api/comments', 'POST /api/comments'],
        flows: ['Content Management', 'Markdown Rendering', 'Comment System']
      },
      ecommerce: {
        pages: ['/', '/products', '/cart', '/checkout', '/orders'],
        models: ['User', 'Product', 'Cart', 'Order', 'Payment'],
        apis: ['GET /api/products', 'POST /api/cart', 'POST /api/checkout', 'GET /api/orders'],
        flows: ['Product Catalog', 'Shopping Cart', 'Checkout Flow', 'Order Tracking']
      },
      default: {
        pages: ['/', '/dashboard', '/settings'],
        models: ['User', 'Data'],
        apis: ['GET /api/data', 'POST /api/data'],
        flows: ['Authentication', 'Data Management']
      }
    };
    return plans[previewType];
  };

  const addLog = useCallback((type: BuildLog['type'], message: string) => {
    addBuildLog({
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    });
  }, [addBuildLog]);

  const startBuild = async () => {
    if (!description.trim() || !user) return;
    
    setIsBuilding(true);
    resetBuild();
    
    const previewType = detectPreviewType(description);
    const plan = generatePlan(description);
    
    // Create project in database first
    const projectName = description.slice(0, 50) + (description.length > 50 ? '...' : '');
    
    setCurrentBuildId('temp-' + Date.now());
    
    // Stage 1: Understanding (5s)
    setBuildStage('understanding');
    addLog('info', '🧠 Analyzing your prompt...');
    await new Promise(r => setTimeout(r, 2000));
    addLog('info', 'Extracting requirements and features...');
    await new Promise(r => setTimeout(r, 3000));
    addLog('success', '✓ Requirements understood');
    
    // Stage 2: Planning (10s)
    setBuildStage('planning');
    setBuildProgress(15);
    addLog('info', '📋 Generating architecture plan...');
    await new Promise(r => setTimeout(r, 3000));
    setBuildPlan(plan);
    addLog('info', `Planning ${plan.pages.length} pages, ${plan.models.length} models, ${plan.apis.length} APIs...`);
    await new Promise(r => setTimeout(r, 4000));
    addLog('success', '✓ Architecture plan generated');
    await new Promise(r => setTimeout(r, 3000));
    
    // Stage 3: Building (30s)
    setBuildStage('building');
    setBuildProgress(30);
    addLog('info', '🔨 Creating project structure...');
    
    const files = [
      'package.json', 'vite.config.ts', 'tsconfig.json',
      'src/main.tsx', 'src/App.tsx', 'src/index.css',
      ...plan.pages.map(p => `src/pages${p === '/' ? '/Home' : p}.tsx`),
      ...plan.models.map(m => `src/models/${m}.ts`),
      'src/api/index.ts', 'src/hooks/useAuth.ts',
      'src/components/Layout.tsx', 'src/components/Navbar.tsx'
    ];
    
    for (let i = 0; i < files.length; i++) {
      await new Promise(r => setTimeout(r, 1500));
      setFilesGenerated(i + 1);
      setBuildProgress(30 + (i / files.length) * 30);
      addLog('info', `Creating ${files[i]}...`);
    }
    addLog('success', `✓ Generated ${files.length} files`);
    
    // Stage 4: Installing (15s)
    setBuildStage('installing');
    setBuildProgress(65);
    addLog('info', '📦 Installing dependencies...');
    await new Promise(r => setTimeout(r, 3000));
    addLog('info', 'npm install react react-dom typescript...');
    await new Promise(r => setTimeout(r, 4000));
    addLog('info', 'npm install tailwindcss @tanstack/react-query...');
    await new Promise(r => setTimeout(r, 4000));
    addLog('info', 'npm install lucide-react framer-motion...');
    await new Promise(r => setTimeout(r, 4000));
    addLog('success', '✓ Dependencies installed');
    
    // Stage 5: Compiling (10s)
    setBuildStage('compiling');
    setBuildProgress(85);
    addLog('info', '⚡ Running Vite build...');
    await new Promise(r => setTimeout(r, 3000));
    addLog('info', 'vite v5.0.0 building for production...');
    await new Promise(r => setTimeout(r, 3000));
    addLog('info', '✓ 42 modules transformed');
    await new Promise(r => setTimeout(r, 2000));
    addLog('success', '✓ Build completed in 1.2s');
    await new Promise(r => setTimeout(r, 2000));
    
    // Stage 6: Starting (5s)
    setBuildStage('starting');
    setBuildProgress(95);
    addLog('info', '🚀 Starting development server...');
    await new Promise(r => setTimeout(r, 2000));
    addLog('success', '✓ Server running at http://localhost:5173');
    addLog('success', '✓ API running at http://localhost:8000');
    await new Promise(r => setTimeout(r, 3000));
    
    // Complete - Save to database
    setBuildStage('complete');
    setBuildProgress(100);
    addLog('success', '🎉 Build complete! Your app is ready.');
    
    try {
      const result = await createProject.mutateAsync({
        name: projectName,
        description,
        stack,
        status: 'success',
        build_time_seconds: 75,
        files_count: files.length,
        lines_of_code: files.length * 45,
        generated_plan: plan as unknown as Json,
        mock_ui_type: previewType,
      });
      
      setCreatedProjectId(result.id);
      setCurrentBuildId(result.id);
      addLog('success', '✓ Project saved to cloud');
    } catch (error) {
      addLog('warning', 'Project built locally (sign in to save)');
    }
    
    setIsBuilding(false);
    
    // Confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getCurrentStageIndex = () => {
    return buildStages.findIndex(s => s.key === currentBuild.stage);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <LogIn className="h-16 w-16 mx-auto mb-4 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign in Required</h2>
            <p className="text-slate-400 mb-6">
              Please sign in to build and save your apps to the cloud.
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

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 overflow-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* LEFT: Configuration (30%) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                App Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">App Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your app idea..."
                  className="min-h-[120px] bg-slate-950/50 border-slate-700/50 text-slate-200 placeholder:text-slate-600"
                  disabled={isBuilding}
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Technology Stack</label>
                <Select value={stack} onValueChange={setStack} disabled={isBuilding}>
                  <SelectTrigger className="bg-slate-950/50 border-slate-700/50 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stacks.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">AI Model</label>
                <Select value={model} onValueChange={setModel} disabled={isBuilding}>
                  <SelectTrigger className="bg-slate-950/50 border-slate-700/50 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={startBuild}
                disabled={!description.trim() || isBuilding}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Building...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 mr-2" />
                    Build App
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Example Prompts */}
          <Card className="bg-slate-900/30 border-slate-800/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Example Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {examplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => !isBuilding && setDescription(prompt)}
                  disabled={isBuilding}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/30 text-slate-400 text-sm hover:bg-slate-800/50 hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  "{prompt}"
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* CENTER: Build Progress (40%) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Progress Timeline */}
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Build Progress</CardTitle>
                {isBuilding && (
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    {Math.round(currentBuild.progress)}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buildStages.map((stage, i) => {
                  const currentIdx = getCurrentStageIndex();
                  const isComplete = currentIdx > i || currentBuild.stage === 'complete';
                  const isCurrent = currentIdx === i && currentBuild.stage !== 'complete' && currentBuild.stage !== 'idle';
                  
                  return (
                    <div key={stage.key} className="flex items-center gap-4">
                      <div className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                        ${isComplete ? 'bg-emerald-500/20' : isCurrent ? 'bg-indigo-500/20' : 'bg-slate-800/50'}
                      `}>
                        {isComplete ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                        ) : (
                          <stage.icon className="h-5 w-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${isComplete ? 'text-emerald-400' : isCurrent ? 'text-indigo-400' : 'text-slate-600'}`}>
                          {stage.label}
                        </div>
                        {isCurrent && (
                          <Progress value={33} className="h-1 mt-2 bg-slate-800" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentBuild.stage === 'complete' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-emerald-400 font-medium">Build Complete!</div>
                      <div className="text-sm text-slate-400">{currentBuild.filesGenerated} files generated</div>
                    </div>
                    <Button 
                      onClick={() => navigate(`/lightos/preview/${createdProjectId || currentBuild.id}`)}
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Preview
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Build Logs */}
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">Build Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] font-mono text-xs">
                <AnimatePresence>
                  {currentBuild.logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`py-1 ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        log.type === 'success' ? 'text-emerald-400' :
                        'text-slate-400'
                      }`}
                    >
                      <span className="text-slate-600">[{log.timestamp}]</span> {log.message}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {currentBuild.logs.length === 0 && (
                  <div className="text-slate-600 text-center py-10">
                    Build logs will appear here...
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Generated Plan (30%) */}
        <div className="lg:col-span-3">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-lg text-white">Generated Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {currentBuild.plan ? (
                <ScrollArea className="h-[500px]">
                  <pre className="text-xs text-slate-400 font-mono">
                    {JSON.stringify(currentBuild.plan, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div className="text-slate-600 text-center py-20">
                  <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Architecture plan will appear here after the planning stage</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Build;
