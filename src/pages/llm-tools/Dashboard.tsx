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
  { name: "refactor-backend", model: "LightRail AI", status: "completed", time: "15m ago", progress: 100 },
  { name: "debug-auth-module", model: "Qwen2.5-Coder 14B", status: "queued", time: "queued", progress: 0 },
];

const quickActions = [
  { 
    name: "LightRail AI", 
    description: "Chat-based coding assistant",
    icon: Bot, 
    path: "/llm-tools/glm4",
    color: "text-cyan-500",
    bg: "from-cyan-500 to-blue-600"
  },
  { 
    name: "Fine-Tune Model", 
    description: "Train with Unsloth",
    icon: Zap, 
    path: "/llm-tools/unsloth",
    color: "text-yellow-500",
    bg: "from-yellow-500 to-orange-600"
  },
  { 
    name: "Qwen2.5-Coder", 
    description: "Generate & refactor code",
    icon: Code2, 
    path: "/llm-tools/qwen",
    color: "text-emerald-500",
    bg: "from-emerald-500 to-teal-600"
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
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "queued":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold">LLM Dev Tools</span>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Panel - Workspace Overview */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-border bg-card/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.label}</p>
                      <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="border-border bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Play className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.name}
                      variant="outline"
                      className="h-auto flex-col items-start gap-3 border-border bg-muted/30 p-5 hover:bg-muted/50"
                      onClick={() => navigate(action.path)}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.bg}`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-base font-semibold">{action.name}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Terminal Panel */}
            <Card className="border-border bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Terminal className="h-5 w-5 text-emerald-500" />
                  System Console
                  <Badge variant="secondary" className="ml-2 text-xs">
                    <Activity className="mr-1 h-3 w-3" />
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-52 rounded-lg bg-background/80 p-4 font-mono text-sm">
                  {terminalLines.map((line, index) => (
                    <div
                      key={index}
                      className={`mb-1.5 leading-relaxed ${
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
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-base font-semibold">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-blue-500" />
                    Active Jobs
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-sm">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentJobs.map((job, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <p className="font-mono text-sm font-medium text-foreground">{job.name}</p>
                          <p className="text-sm text-muted-foreground">{job.model}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {job.status === "running" && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{job.progress}%</span>
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">{job.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Workspace Files & Resources */}
          <div className="flex flex-col gap-6">
            {/* Workspace Explorer */}
            <Card className="flex-1 border-border bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <FolderOpen className="h-5 w-5 text-yellow-500" />
                  Workspace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 font-mono text-sm">
                  <div className="flex items-center gap-2 rounded px-2 py-2 text-foreground hover:bg-muted/50">
                    <FolderOpen className="h-4 w-4 text-yellow-500" />
                    <span>models/</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="flex items-center gap-2 rounded px-2 py-1.5 text-muted-foreground hover:bg-muted/50">
                      <FileCode className="h-4 w-4 text-blue-500" />
                      <span>llama-3.1-8b-finetuned.gguf</span>
                    </div>
                    <div className="flex items-center gap-2 rounded px-2 py-1.5 text-muted-foreground hover:bg-muted/50">
                      <FileCode className="h-4 w-4 text-emerald-500" />
                      <span>qwen2.5-coder-7b.safetensors</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-2 text-foreground hover:bg-muted/50">
                    <FolderOpen className="h-4 w-4 text-yellow-500" />
                    <span>datasets/</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="flex items-center gap-2 rounded px-2 py-1.5 text-muted-foreground hover:bg-muted/50">
                      <FileCode className="h-4 w-4 text-purple-500" />
                      <span>training-data.jsonl</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-2 text-foreground hover:bg-muted/50">
                    <FolderOpen className="h-4 w-4 text-yellow-500" />
                    <span>outputs/</span>
                  </div>
                  <div className="flex items-center gap-2 rounded px-2 py-2 text-foreground hover:bg-muted/50">
                    <GitBranch className="h-4 w-4 text-orange-500" />
                    <span>config.yaml</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GPU Status */}
            <Card className="border-border bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Cpu className="h-5 w-5 text-emerald-500" />
                  GPU Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="font-semibold text-foreground">85%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[85%] bg-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">VRAM</span>
                    <span className="font-semibold text-foreground">12.4 / 24 GB</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[52%] bg-blue-500" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Temperature</span>
                    <span className="font-semibold text-foreground">68°C</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[68%] bg-yellow-500" />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-semibold text-foreground">NVIDIA RTX 4090</p>
                  <p className="text-sm text-muted-foreground">Driver 545.29.06 • CUDA 12.3</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
