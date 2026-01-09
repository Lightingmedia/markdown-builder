import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  Bot, 
  Code2, 
  Rocket, 
  TrendingDown, 
  Trophy,
  Server,
  Clock,
  FileCode,
  Cpu
} from "lucide-react";

const stats = [
  { label: "2-5x Faster", description: "Training Speed", icon: Zap, color: "text-yellow-500" },
  { label: "70% Less", description: "Memory Usage", icon: TrendingDown, color: "text-green-500" },
  { label: "74.5%", description: "HumanEval Score", icon: Trophy, color: "text-blue-500" },
  { label: "6+", description: "Platforms Supported", icon: Server, color: "text-purple-500" },
];

const tools = [
  {
    title: "Unsloth Fine-Tuning",
    description: "Train LLMs 2-5x faster with 70% less memory. Supports Llama 3.1, Mistral, Qwen, and more.",
    icon: Zap,
    path: "/llm-tools/unsloth",
    badge: "⚡ 2-5x Faster",
    features: ["4-bit Quantization", "Flash Attention", "LoRA/QLoRA"]
  },
  {
    title: "GLM-4 Coding Agent",
    description: "Powerful coding assistant achieving 71.8% on HumanEval. Generate, explain, and fix code.",
    icon: Bot,
    path: "/llm-tools/glm4",
    badge: "🤖 71.8% HumanEval",
    features: ["40+ Languages", "Code Explanation", "Bug Fixing"]
  },
  {
    title: "Qwen2.5-Coder",
    description: "State-of-the-art code model beating GPT-4 with 74.5% HumanEval. Multiple sizes available.",
    icon: Code2,
    path: "/llm-tools/qwen",
    badge: "🏆 Beats GPT-4",
    features: ["Test Generation", "Code Completion", "Interactive Mode"]
  },
];

const recentActivity = [
  { action: "Fine-tuning completed", model: "Llama 3.1 8B", time: "2 hours ago", status: "success" },
  { action: "Code generated", model: "Qwen2.5-Coder 7B", time: "4 hours ago", status: "success" },
  { action: "Bug fix applied", model: "GLM-4", time: "5 hours ago", status: "success" },
  { action: "Training started", model: "Mistral 7B", time: "6 hours ago", status: "running" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/10 via-background to-primary/5 p-8">
        <div className="relative z-10">
          <Badge variant="secondary" className="mb-4">
            <Rocket className="mr-1 h-3 w-3" />
            Production Ready
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Train Faster. Code Smarter.
            <br />
            <span className="text-primary">Build Better.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Leverage state-of-the-art LLMs for fine-tuning and code generation. 
            Optimized for speed, efficiency, and developer productivity.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/llm-tools/unsloth")} size="lg">
              <Zap className="mr-2 h-4 w-4" />
              Start Fine-Tuning
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/llm-tools/docs")}>
              View Documentation
            </Button>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card 
              key={tool.title} 
              className="cursor-pointer border-border transition-all hover:border-primary/50 hover:shadow-lg"
              onClick={() => navigate(tool.path)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <tool.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{tool.badge}</Badge>
                </div>
                <CardTitle className="mt-4">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-foreground">Recent Activity</h2>
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' : 
                      activity.status === 'running' ? 'bg-yellow-500 animate-pulse' : 
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
