import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  Bot, 
  Code2, 
  TrendingDown, 
  Trophy,
  Server,
  Terminal,
  GitBranch,
  Cpu,
  Activity,
  Play,
  FolderOpen,
  FileCode,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

const stats = [
  { label: "2-5x", subtitle: "Faster Training", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { label: "70%", subtitle: "Less Memory", icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "74.5%", subtitle: "HumanEval", icon: Trophy, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "6+", subtitle: "Platforms", icon: Server, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const recentJobs = [
  { name: "fine-tune-llama-3.1", model: "Llama 3.1 8B", status: "completed", time: "2m ago", progress: 100 },
  { name: "generate-api-tests", model: "Qwen2.5-Coder 7B", status: "running", time: "now", progress: 67 },
  { name: "refactor-backend", model: "GLM-4 9B", status: "completed", time: "15m ago", progress: 100 },
  { name: "debug-auth-module", model: "Qwen2.5-Coder 14B", status: "queued", time: "queued", progress: 0 },
];

const quickActions = [
  { 
    name: "New Fine-Tune Job", 
    icon: Zap, 
    path: "/llm-tools/unsloth",
    shortcut: "⌘ + N",
    color: "text-yellow-500"
  },
  { 
    name: "Generate Code", 
    icon: Code2, 
    path: "/llm-tools/qwen",
    shortcut: "⌘ + G",
    color: "text-emerald-500"
  },
  { 
    name: "Code Assistant", 
    icon: Bot, 
    path: "/llm-tools/glm4",
    shortcut: "⌘ + A",
    color: "text-blue-500"
  },
];

const terminalLines = [
  { type: "info", text: "$ llm-tools init --workspace dev-env" },
  { type: "success", text: "[✓] Workspace initialized successfully" },
  { type: "info", text: "$ llm-tools load-model qwen2.5-coder-7b --4bit" },
  { type: "success", text: "[✓] Model loaded (4.2GB VRAM, Flash Attention enabled)" },
  { type: "info", text: "$ llm-tools start-server --port 8080" },
  { type: "success", text: "[✓] API server running at http://localhost:8080" },
  { type: "warning", text: "[!] GPU utilization at 85% - optimal performance" },
  { type: "info", text: "$ Ready for code generation requests..." },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "queued":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-3">
      {/* Left Panel - Workspace Overview */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border bg-card/50">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Play className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              {quickActions.map((action) => (
                <Button
                  key={action.name}
                  variant="outline"
                  className="h-auto justify-between border-border bg-muted/30 p-4 hover:bg-muted/50"
                  onClick={() => navigate(action.path)}
                >
                  <div className="flex items-center gap-3">
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                    <span className="text-sm font-medium">{action.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {action.shortcut}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terminal Panel */}
        <Card className="flex-1 border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Terminal className="h-4 w-4 text-emerald-500" />
              System Console
              <Badge variant="secondary" className="ml-2 text-xs">
                <Activity className="mr-1 h-3 w-3" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 rounded-lg bg-background/80 p-4 font-mono text-xs">
              {terminalLines.map((line, index) => (
                <div
                  key={index}
                  className={`mb-1 ${
                    line.type === "success"
                      ? "text-emerald-500"
                      : line.type === "warning"
                      ? "text-yellow-500"
                      : line.type === "error"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {line.text}
                </div>
              ))}
              <div className="flex items-center text-muted-foreground">
                <span className="animate-pulse">▋</span>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-500" />
                Active Jobs
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentJobs.map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-mono text-sm text-foreground">{job.name}</p>
                      <p className="text-xs text-muted-foreground">{job.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {job.status === "running" && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{job.progress}%</span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">{job.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Workspace Files & Resources */}
      <div className="flex flex-col gap-4">
        {/* Workspace Explorer */}
        <Card className="flex-1 border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FolderOpen className="h-4 w-4 text-yellow-500" />
              Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 font-mono text-sm">
              <div className="flex items-center gap-2 rounded px-2 py-1.5 text-muted-foreground hover:bg-muted/50">
                <FolderOpen className="h-4 w-4 text-yellow-500" />
                <span>models/</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center gap-2 rounded px-2 py-1 text-muted-foreground hover:bg-muted/50">
                  <FileCode className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs">llama-3.1-8b-finetuned.gguf</span>
                </div>
                <div className="flex items-center gap-2 rounded px-2 py-1 text-muted-foreground hover:bg-muted/50">
                  <FileCode className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs">qwen2.5-coder-7b.safetensors</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded px-2 py-1.5 text-muted-foreground hover:bg-muted/50">
                <FolderOpen className="h-4 w-4 text-yellow-500" />
                <span>datasets/</span>
              </div>
              <div className="ml-4 space-y-1">
                <div className="flex items-center gap-2 rounded px-2 py-1 text-muted-foreground hover:bg-muted/50">
                  <FileCode className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-xs">training-data.jsonl</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded px-2 py-1.5 text-muted-foreground hover:bg-muted/50">
                <FolderOpen className="h-4 w-4 text-yellow-500" />
                <span>outputs/</span>
              </div>
              <div className="flex items-center gap-2 rounded px-2 py-1.5 text-muted-foreground hover:bg-muted/50">
                <GitBranch className="h-4 w-4 text-orange-500" />
                <span>config.yaml</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPU Status */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Cpu className="h-4 w-4 text-emerald-500" />
              GPU Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Utilization</span>
                <span className="font-medium text-foreground">85%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[85%] bg-emerald-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">VRAM</span>
                <span className="font-medium text-foreground">12.4 / 24 GB</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[52%] bg-blue-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-medium text-foreground">68°C</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] bg-yellow-500" />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-foreground">NVIDIA RTX 4090</p>
              <p className="text-xs text-muted-foreground">Driver 545.29.06 • CUDA 12.3</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
