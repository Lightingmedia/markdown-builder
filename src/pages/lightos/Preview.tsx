import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import Editor from "@monaco-editor/react";
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RefreshCw, 
  Square, 
  Play,
  Code2,
  Terminal,
  FileJson,
  Database,
  Globe,
  ChevronRight,
  File,
  Folder,
  Save,
  CheckCircle2,
  Loader2,
  LogIn
} from "lucide-react";
import { useLightOSProjects } from "@/hooks/useLightOSProjects";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// Mock preview components
const TodoPreview = () => (
  <div className="p-6 bg-slate-100 min-h-full">
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Tasks</h1>
      <div className="flex gap-2 mb-4">
        <input className="flex-1 px-4 py-2 rounded-lg border" placeholder="Add a new task..." />
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add</button>
      </div>
      <div className="space-y-2">
        {['Complete project documentation', 'Review pull requests', 'Update dependencies'].map((task, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
            <input type="checkbox" className="w-5 h-5" defaultChecked={i === 0} />
            <span className={i === 0 ? 'line-through text-slate-400' : 'text-slate-700'}>{task}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DashboardPreview = () => (
  <div className="p-6 bg-slate-100 min-h-full">
    <h1 className="text-2xl font-bold text-slate-800 mb-6">Analytics Dashboard</h1>
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { label: 'Total Users', value: '12,847', change: '+12%' },
        { label: 'Revenue', value: '$84,230', change: '+8%' },
        { label: 'Conversion', value: '3.2%', change: '+0.4%' }
      ].map((stat, i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
          <div className="text-sm text-slate-500">{stat.label}</div>
          <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
          <div className="text-sm text-emerald-600">{stat.change}</div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-lg shadow-sm p-4 h-48 flex items-center justify-center text-slate-400">
      📊 Chart Placeholder
    </div>
  </div>
);

const BlogPreview = () => (
  <div className="p-6 bg-slate-100 min-h-full">
    <h1 className="text-2xl font-bold text-slate-800 mb-6">Latest Posts</h1>
    <div className="grid gap-4">
      {[
        { title: 'Getting Started with React', date: 'Jan 10, 2026', excerpt: 'Learn the fundamentals...' },
        { title: 'Building Scalable APIs', date: 'Jan 8, 2026', excerpt: 'Best practices for...' },
        { title: 'Modern CSS Techniques', date: 'Jan 5, 2026', excerpt: 'Explore new features...' }
      ].map((post, i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow-sm">
          <h2 className="font-semibold text-slate-800">{post.title}</h2>
          <div className="text-sm text-slate-400 mb-2">{post.date}</div>
          <p className="text-slate-600 text-sm">{post.excerpt}</p>
        </div>
      ))}
    </div>
  </div>
);

const EcommercePreview = () => (
  <div className="p-6 bg-slate-100 min-h-full">
    <h1 className="text-2xl font-bold text-slate-800 mb-6">Products</h1>
    <div className="grid grid-cols-2 gap-4">
      {[
        { name: 'Wireless Headphones', price: '$199.99', img: '🎧' },
        { name: 'Smart Watch', price: '$349.99', img: '⌚' },
        { name: 'Laptop Stand', price: '$79.99', img: '💻' },
        { name: 'Mechanical Keyboard', price: '$149.99', img: '⌨️' }
      ].map((product, i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow-sm text-center">
          <div className="text-4xl mb-2">{product.img}</div>
          <div className="font-medium text-slate-800">{product.name}</div>
          <div className="text-indigo-600 font-bold">{product.price}</div>
          <button className="mt-2 w-full py-2 bg-indigo-600 text-white rounded-lg text-sm">Add to Cart</button>
        </div>
      ))}
    </div>
  </div>
);

const DefaultPreview = () => (
  <div className="p-6 bg-slate-100 min-h-full flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">🚀</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Your App</h1>
      <p className="text-slate-600">Successfully built and running</p>
    </div>
  </div>
);

const fileTree = [
  { type: 'folder', name: 'src', children: [
    { type: 'folder', name: 'components', children: [
      { type: 'file', name: 'Layout.tsx' },
      { type: 'file', name: 'Navbar.tsx' },
    ]},
    { type: 'folder', name: 'pages', children: [
      { type: 'file', name: 'Home.tsx' },
      { type: 'file', name: 'Dashboard.tsx' },
    ]},
    { type: 'file', name: 'App.tsx' },
    { type: 'file', name: 'main.tsx' },
  ]},
  { type: 'file', name: 'package.json' },
  { type: 'file', name: 'vite.config.ts' },
];

const mockCode = `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to Your App
      </h1>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Count: {count}
      </button>
    </div>
  );
}

export default App;`;

const mockApiDocs = [
  { method: 'GET', path: '/api/tasks', description: 'List all tasks' },
  { method: 'POST', path: '/api/tasks', description: 'Create a new task' },
  { method: 'PUT', path: '/api/tasks/:id', description: 'Update a task' },
  { method: 'DELETE', path: '/api/tasks/:id', description: 'Delete a task' },
];

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { projects, isLoading, getProjectById } = useLightOSProjects();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [url, setUrl] = useState('http://localhost:5173');
  const [isRunning, setIsRunning] = useState(true);
  const [code, setCode] = useState(mockCode);
  const [selectedFile, setSelectedFile] = useState('src/App.tsx');
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const project = getProjectById(id || '');

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || '');
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
  };

  const renderPreview = () => {
    const type = project?.mock_ui_type || 'default';
    switch (type) {
      case 'todo': return <TodoPreview />;
      case 'dashboard': return <DashboardPreview />;
      case 'blog': return <BlogPreview />;
      case 'ecommerce': return <EcommercePreview />;
      default: return <DefaultPreview />;
    }
  };

  const renderFileTree = (items: any[], depth = 0) => {
    return items.map((item, i) => (
      <div key={i}>
        <button
          onClick={() => item.type === 'file' && setSelectedFile(`${item.name}`)}
          className={`flex items-center gap-2 px-2 py-1 w-full text-left text-sm hover:bg-slate-800/50 rounded ${
            selectedFile.endsWith(item.name) ? 'bg-slate-800/50 text-indigo-400' : 'text-slate-400'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {item.type === 'folder' ? (
            <>
              <Folder className="h-4 w-4 text-indigo-400" />
              <span>{item.name}</span>
            </>
          ) : (
            <>
              <File className="h-4 w-4" />
              <span>{item.name}</span>
            </>
          )}
        </button>
        {item.children && renderFileTree(item.children, depth + 1)}
      </div>
    ));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <LogIn className="h-16 w-16 mx-auto mb-4 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white mb-2">Sign in Required</h2>
            <p className="text-slate-400 mb-6">
              Please sign in to view project previews.
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

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 mb-4">Project not found</div>
          <Button onClick={() => navigate('/lightos/projects')}>View All Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f172a] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-medium truncate max-w-[200px]">{project.name}</h2>
          <Badge className={`${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {isRunning ? 'Running' : 'Stopped'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-slate-400 border-slate-700">
            <Globe className="h-3 w-3 mr-1" /> localhost:5173
          </Badge>
          <Badge variant="outline" className="text-slate-400 border-slate-700">
            API: localhost:8000
          </Badge>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className="text-slate-400"
          >
            {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-400">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Preview */}
        <div className="w-1/2 flex flex-col border-r border-slate-800/50">
          {/* Preview Controls */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/50 bg-slate-900/30">
            <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
              {[
                { key: 'desktop', icon: Monitor },
                { key: 'tablet', icon: Tablet },
                { key: 'mobile', icon: Smartphone }
              ].map(d => (
                <Button
                  key={d.key}
                  variant="ghost"
                  size="sm"
                  onClick={() => setDevice(d.key as any)}
                  className={device === d.key ? 'bg-slate-700 text-white' : 'text-slate-400'}
                >
                  <d.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
            <Input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-8 bg-slate-800/50 border-slate-700/50 text-slate-300 text-sm"
            />
            <Button variant="ghost" size="sm" className="text-slate-400">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Frame */}
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-950/50">
            <motion.div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ width: deviceWidths[device], maxWidth: '100%' }}
              animate={{ width: deviceWidths[device] }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-[500px] overflow-auto">
                {renderPreview()}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right: Editor & Tools */}
        <div className="w-1/2 flex flex-col">
          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="px-4 py-2 bg-slate-900/30 border-b border-slate-800/50 justify-start rounded-none">
              <TabsTrigger value="code" className="data-[state=active]:bg-slate-800">
                <Code2 className="h-4 w-4 mr-2" /> Code
              </TabsTrigger>
              <TabsTrigger value="logs" className="data-[state=active]:bg-slate-800">
                <Terminal className="h-4 w-4 mr-2" /> Logs
              </TabsTrigger>
              <TabsTrigger value="api" className="data-[state=active]:bg-slate-800">
                <FileJson className="h-4 w-4 mr-2" /> API Docs
              </TabsTrigger>
              <TabsTrigger value="database" className="data-[state=active]:bg-slate-800">
                <Database className="h-4 w-4 mr-2" /> Database
              </TabsTrigger>
            </TabsList>

            <TabsContent value="code" className="flex-1 flex m-0">
              {/* File Tree */}
              <div className="w-48 border-r border-slate-800/50 bg-slate-900/30">
                <div className="p-2 border-b border-slate-800/50 text-xs text-slate-500 uppercase">
                  Explorer
                </div>
                <ScrollArea className="h-[500px]">
                  {renderFileTree(fileTree)}
                </ScrollArea>
              </div>

              {/* Editor */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/50 bg-slate-900/30">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <File className="h-4 w-4" />
                    {selectedFile}
                    {!isSaved && <span className="text-amber-400">•</span>}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleSave}
                    className={isSaved ? 'text-slate-500' : 'text-indigo-400'}
                  >
                    {isSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>
                <Editor
                  height="100%"
                  defaultLanguage="typescript"
                  theme="vs-dark"
                  value={code}
                  onChange={handleCodeChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    padding: { top: 16 },
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="logs" className="flex-1 m-0 bg-slate-950 p-4 font-mono text-xs">
              <ScrollArea className="h-[500px]">
                <div className="space-y-1">
                  <div className="text-slate-500">[12:00:00] Server starting...</div>
                  <div className="text-emerald-400">[12:00:01] ✓ Vite dev server ready</div>
                  <div className="text-slate-400">[12:00:01] Local: http://localhost:5173</div>
                  <div className="text-slate-400">[12:00:02] API: http://localhost:8000</div>
                  <div className="text-teal-400">[12:00:03] HMR enabled</div>
                  <div className="text-slate-500">[12:00:05] Waiting for changes...</div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="api" className="flex-1 m-0 p-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {mockApiDocs.map((api, i) => (
                    <Card key={i} className="bg-slate-800/30 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            api.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                            api.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                            api.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {api.method}
                          </Badge>
                          <code className="text-slate-300 text-sm">{api.path}</code>
                        </div>
                        <p className="text-sm text-slate-500">{api.description}</p>
                        <Button size="sm" variant="outline" className="mt-3 text-xs">
                          Try it out <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="database" className="flex-1 m-0 p-4">
              <div className="text-center py-12 text-slate-500">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Database viewer coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Preview;
