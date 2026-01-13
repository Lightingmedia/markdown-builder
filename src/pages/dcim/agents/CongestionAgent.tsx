import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Network,
  Bot,
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Mock real-time congestion data
const generateCongestionData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    time: `${i}s`,
    queue_depth: 50 + Math.random() * 100,
    ecn_marks: Math.floor(Math.random() * 500),
    retransmits: Math.floor(Math.random() * 50),
    microburst: Math.random() > 0.8 ? 1 : 0,
  }));
};

interface FabricPolicyRecommendation {
  id: string;
  title: string;
  description: string;
  targetJob: string;
  suggestedAction: string;
  expectedImprovement: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "executing" | "verified" | "rolled_back";
}

const mockRecommendations: FabricPolicyRecommendation[] = [
  {
    id: "1",
    title: "Apply traffic shaping to job-llama-70b-train",
    description: "This comm-heavy training job is causing microbursts on spine switches. Recommend applying per-job QoS policy.",
    targetJob: "job-llama-70b-train",
    suggestedAction: "Enable ECN marking + rate limit to 85% of link capacity",
    expectedImprovement: "Reduce p99 step time by 12%",
    priority: "high",
    status: "pending",
  },
  {
    id: "2",
    title: "Reschedule noisy neighbor job-vit-inference",
    description: "This inference job's bursty traffic pattern is impacting adjacent training jobs.",
    targetJob: "job-vit-inference",
    suggestedAction: "Migrate to isolated partition with dedicated NICs",
    expectedImprovement: "Improve neighbor job throughput by 8%",
    priority: "medium",
    status: "pending",
  },
  {
    id: "3",
    title: "Optimize collective algorithm for job-gpt4-finetune",
    description: "Current Ring AllReduce is suboptimal for this topology. Recommend switching to Hierarchical AllReduce.",
    targetJob: "job-gpt4-finetune",
    suggestedAction: "Apply NCCL_ALGO=Tree environment variable",
    expectedImprovement: "Reduce communication time by 18%",
    priority: "high",
    status: "approved",
  },
];

const CongestionAgent = () => {
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [autonomyLevel, setAutonomyLevel] = useState([50]);
  const [congestionData, setCongestionData] = useState(generateCongestionData());
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  // Simulate real-time updates
  useEffect(() => {
    if (!isAgentActive) return;
    
    const interval = setInterval(() => {
      setCongestionData(generateCongestionData());
    }, 5000);

    return () => clearInterval(interval);
  }, [isAgentActive]);

  const handleApprove = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status: "approved" } : rec)
    );
  };

  const handleExecute = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status: "executing" } : rec)
    );
    // Simulate execution
    setTimeout(() => {
      setRecommendations(prev => 
        prev.map(rec => rec.id === id ? { ...rec, status: "verified" } : rec)
      );
    }, 3000);
  };

  const handleReject = (id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Approved</Badge>;
      case "executing":
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Executing</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Verified</Badge>;
      case "rolled_back":
        return <Badge variant="destructive">Rolled Back</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const currentCongestionScore = Math.floor(65 + Math.random() * 20);
  const microburstRate = Math.floor(Math.random() * 15);

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Congestion Agent</h1>
              <p className="text-slate-400 mt-1">Detects microbursts and applies fabric policies to optimize network performance</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="agent-active" className="text-slate-400">Agent Active</Label>
              <Switch 
                id="agent-active" 
                checked={isAgentActive} 
                onCheckedChange={setIsAgentActive}
              />
            </div>
            {isAgentActive ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                Monitoring
              </Badge>
            ) : (
              <Badge variant="outline" className="text-slate-400">
                <Pause className="h-3 w-3 mr-1" />
                Paused
              </Badge>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Network className="h-5 w-5 text-cyan-500" />
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{currentCongestionScore}%</p>
              <p className="text-xs text-slate-400">Network Utilization</p>
              <Progress value={currentCongestionScore} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <TrendingUp className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{microburstRate}</p>
              <p className="text-xs text-slate-400">Microbursts / min</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-5 w-5 text-yellow-500" />
                <Badge variant="outline" className="text-xs">ECN</Badge>
              </div>
              <p className="text-2xl font-bold text-white">2.3k</p>
              <p className="text-xs text-slate-400">ECN Marks / sec</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">Good</Badge>
              </div>
              <p className="text-2xl font-bold text-white">0.02%</p>
              <p className="text-xs text-slate-400">Packet Loss Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Autonomy Level Control */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-yellow-500" />
              Autonomy Policy
            </CardTitle>
            <CardDescription>Configure agent autonomy boundaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Autonomy Level</Label>
                <span className="text-sm text-slate-400">{autonomyLevel[0]}%</span>
              </div>
              <Slider
                value={autonomyLevel}
                onValueChange={setAutonomyLevel}
                max={100}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Recommend Only</span>
                <span>Controlled Actions</span>
                <span>Full Autonomous</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
              <div className="text-center">
                <p className="text-sm text-slate-400">Max Jobs Impacted</p>
                <p className="text-lg font-bold text-white">5</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">Canary Scope</p>
                <p className="text-lg font-bold text-white">1 Rack</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400">Auto-Rollback</p>
                <p className="text-lg font-bold text-emerald-400">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Telemetry Chart */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Real-time Fabric Telemetry</CardTitle>
            <CardDescription>Queue depth and ECN marks over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={congestionData}>
                <defs>
                  <linearGradient id="queueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="queue_depth" 
                  stroke="#f59e0b" 
                  fillOpacity={1} 
                  fill="url(#queueGradient)" 
                  name="Queue Depth"
                />
                <Line 
                  type="monotone" 
                  dataKey="ecn_marks" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  name="ECN Marks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Fabric Policy Recommendations</CardTitle>
                <CardDescription>AI-generated actions to optimize network performance</CardDescription>
              </div>
              <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                {recommendations.filter(r => r.status === "pending").length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <div>
                      <h4 className="font-medium text-white">{rec.title}</h4>
                      <p className="text-sm text-slate-400">{rec.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(rec.priority)} className="capitalize">
                      {rec.priority}
                    </Badge>
                    {getStatusBadge(rec.status)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-slate-900/50 mb-3">
                  <div>
                    <p className="text-xs text-slate-500">Target Job</p>
                    <p className="text-sm text-cyan-400 font-mono">{rec.targetJob}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Suggested Action</p>
                    <p className="text-sm text-white">{rec.suggestedAction}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Expected Improvement</p>
                    <p className="text-sm text-emerald-400">{rec.expectedImprovement}</p>
                  </div>
                </div>

                {rec.status === "pending" && (
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleReject(rec.id)}>
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-yellow-600 hover:bg-yellow-700 gap-1"
                      onClick={() => handleApprove(rec.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}

                {rec.status === "approved" && (
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleReject(rec.id)}>
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 gap-1"
                      onClick={() => handleExecute(rec.id)}
                    >
                      <Play className="h-4 w-4" />
                      Execute
                    </Button>
                  </div>
                )}

                {rec.status === "executing" && (
                  <div className="flex items-center gap-2 justify-end">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Activity className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Executing...</span>
                    </div>
                    <Button variant="destructive" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Rollback
                    </Button>
                  </div>
                )}

                {rec.status === "verified" && (
                  <div className="flex items-center gap-2 justify-end text-emerald-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Action verified successfully</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default CongestionAgent;
