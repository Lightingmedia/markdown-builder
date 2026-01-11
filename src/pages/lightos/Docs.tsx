import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Rocket, 
  Code2, 
  Settings, 
  Puzzle,
  ChevronRight,
  Terminal,
  FileCode,
  Zap
} from "lucide-react";

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    items: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quickstart', title: 'Quick Start' },
      { id: 'first-app', title: 'Your First App' },
    ]
  },
  {
    id: 'guides',
    title: 'Guides',
    icon: BookOpen,
    items: [
      { id: 'prompts', title: 'Writing Effective Prompts' },
      { id: 'stacks', title: 'Choosing a Tech Stack' },
      { id: 'customization', title: 'Customizing Generated Code' },
      { id: 'deployment', title: 'Deployment Options' },
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Code2,
    items: [
      { id: 'build-api', title: 'Build API' },
      { id: 'preview-api', title: 'Preview API' },
      { id: 'project-api', title: 'Project API' },
    ]
  },
  {
    id: 'examples',
    title: 'Examples',
    icon: Puzzle,
    items: [
      { id: 'todo-app', title: 'Todo Application' },
      { id: 'dashboard', title: 'Analytics Dashboard' },
      { id: 'ecommerce', title: 'E-Commerce Store' },
      { id: 'blog', title: 'Blog Platform' },
    ]
  },
];

const docsContent: Record<string, { title: string; content: React.ReactNode }> = {
  'introduction': {
    title: 'Introduction to LightOS',
    content: (
      <div className="space-y-6">
        <p className="text-slate-300 leading-relaxed">
          LightOS is an AI-powered development environment that transforms natural language prompts 
          into fully functional web applications. Simply describe what you want to build, and our 
          advanced AI models will generate the code, set up the infrastructure, and provide a live preview.
        </p>
        
        <div className="grid gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Zap className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Instant Generation</h4>
                <p className="text-sm text-slate-400">From prompt to running app in under 75 seconds</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <FileCode className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Production-Ready Code</h4>
                <p className="text-sm text-slate-400">Clean, maintainable code following best practices</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Terminal className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Full Stack Support</h4>
                <p className="text-sm text-slate-400">Frontend, backend, and database all configured</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  'quickstart': {
    title: 'Quick Start Guide',
    content: (
      <div className="space-y-6">
        <p className="text-slate-300 leading-relaxed">
          Get started with LightOS in just a few steps:
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">1</div>
            <div>
              <h4 className="font-medium text-white mb-1">Describe Your App</h4>
              <p className="text-sm text-slate-400">Write a clear description of what you want to build. Be specific about features, pages, and functionality.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">2</div>
            <div>
              <h4 className="font-medium text-white mb-1">Choose Your Stack</h4>
              <p className="text-sm text-slate-400">Select from React + FastAPI, Next.js + Supabase, Vue + Express, or Python Data Science.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">3</div>
            <div>
              <h4 className="font-medium text-white mb-1">Watch It Build</h4>
              <p className="text-sm text-slate-400">Our AI analyzes your prompt, creates an architecture plan, and generates all the code.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">4</div>
            <div>
              <h4 className="font-medium text-white mb-1">Preview & Edit</h4>
              <p className="text-sm text-slate-400">See your app running live, edit the code with our Monaco editor, and watch hot reload in action.</p>
            </div>
          </div>
        </div>
        
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <p className="text-emerald-400 text-sm">
              <strong>Tip:</strong> Start with a template if you're unsure. Templates provide battle-tested starting points for common app types.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  },
  'prompts': {
    title: 'Writing Effective Prompts',
    content: (
      <div className="space-y-6">
        <p className="text-slate-300 leading-relaxed">
          The quality of your generated app depends largely on how well you describe it. Here are some tips for writing effective prompts:
        </p>
        
        <div className="space-y-4">
          <h4 className="text-white font-medium">Be Specific</h4>
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">❌ Bad</Badge>
              <p className="text-sm text-slate-400">"Make a todo app"</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">✓ Good</Badge>
              <p className="text-sm text-slate-400">"Build a todo app with user authentication, task categories, due dates, priority levels, and the ability to share lists with other users"</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="text-white font-medium">Include Key Features</h4>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
            <li>Authentication requirements (login, signup, social auth)</li>
            <li>Main pages and navigation structure</li>
            <li>Data models and relationships</li>
            <li>Key user interactions and flows</li>
            <li>Any specific UI preferences</li>
          </ul>
        </div>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <h4 className="font-medium text-white mb-2">Example Prompt</h4>
            <p className="text-sm text-slate-400 font-mono bg-slate-900/50 p-3 rounded-lg">
              "Create an e-commerce platform with product catalog, shopping cart, checkout with Stripe, user accounts with order history, admin dashboard for inventory management, and a clean modern UI with dark mode"
            </p>
          </CardContent>
        </Card>
      </div>
    )
  },
};

const Docs = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const currentDoc = docsContent[activeSection] || docsContent['introduction'];

  return (
    <div className="h-screen bg-[#0f172a] flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800/50 bg-slate-900/30">
        <div className="p-4 border-b border-slate-800/50">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            Documentation
          </h2>
        </div>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-4 space-y-6">
            {sections.map((section) => (
              <div key={section.id}>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </div>
                <div className="space-y-1 ml-6">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        activeSection === item.id
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <span>Docs</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-300">{currentDoc.title}</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-8">{currentDoc.title}</h1>
          
          <div className="prose prose-invert max-w-none">
            {currentDoc.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
