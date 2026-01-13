import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Server, 
  Zap, 
  Thermometer, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Bot,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface SiteStats {
  totalSites: number;
  totalNodes: number;
  totalGPUs: number;
  activeWorkloads: number;
  pendingRecommendations: number;
  openEvents: number;
}

interface AgentRecommendation {
  id: string;
  agent_type: string;
  title: string;
  priority: string;
  status: string;
  created_at: string;
}

const mockTelemetryData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  power_kw: 850 + Math.random() * 200,
  temp_c: 22 + Math.random() * 5,
  util_pct: 65 + Math.random() * 25,
}));

const mockDriversData = [
  { name: "GPU Inference", value: 42 },
  { name: "HVAC", value: 28 },
  { name: "Network", value: 15 },
  { name: "Storage I/O", value: 10 },
  { name: "Lighting", value: 5 },
];

const Dashboard = () => {
  const [stats, setStats] = useState<SiteStats>({
    totalSites: 0,
    totalNodes: 0,
    totalGPUs: 0,
    activeWorkloads: 0,
    pendingRecommendations: 0,
    openEvents: 0,
  });
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Show demo data for unauthenticated users
        setStats({
          totalSites: 3,
          totalNodes: 248,
          totalGPUs: 1024,
          activeWorkloads: 47,
          pendingRecommendations: 12,
          openEvents: 5,
        });
        setRecommendations([
          { id: "1", agent_type: "thermal", title: "Migrate hot workloads from Rack A-12", priority: "high", status: "pending", created_at: new Date().toISOString() },
          { id: "2", agent_type: "congestion", title: "Apply traffic shaping to comm-heavy jobs", priority: "medium", status: "pending", created_at: new Date().toISOString() },
          { id: "3", agent_type: "capacity", title: "Review GPU expansion for Q2 demand", priority: "low", status: "pending", created_at: new Date().toISOString() },
        ]);
        setLoading(false);
        return;
      }

      // Fetch real data from Supabase
      const [sitesRes, recommendationsRes, eventsRes] = await Promise.all([
        supabase.from("dcim_sites").select("id", { count: "exact" }),
        supabase.from("dcim_agent_recommendations").select("*").eq("status", "pending").order("created_at", { ascending: false }).limit(10),
        supabase.from("dcim_events").select("id", { count: "exact" }).eq("resolved", false),
      ]);

      setStats({
        totalSites: sitesRes.count || 0,
        totalNodes: 248, // Demo
        totalGPUs: 1024, // Demo
        activeWorkloads: 47, // Demo
        pendingRecommendations: recommendationsRes.data?.length || 0,
        openEvents: eventsRes.count || 0,
      });

      setRecommendations(recommendationsRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case "thermal": return <Thermometer className="h-4 w-4 text-orange-400" />;
      case "congestion": return <Zap className="h-4 w-4 text-yellow-400" />;
      case "capacity": return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case "incident": return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Bot className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">DCIM+ Dashboard</h1>
            <p className="text-slate-400 mt-1">Real-time infrastructure observability and AI-powered optimization</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Server className="h-5 w-5 text-emerald-500" />
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Active
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{stats.totalSites}</p>
                <p className="text-xs text-slate-400">Sites</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Activity className="h-5 w-5 text-cyan-500" />
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{stats.totalNodes}</p>
                <p className="text-xs text-slate-400">Nodes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Zap className="h-5 w-5 text-yellow-500" />
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  1024
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{stats.totalGPUs}</p>
                <p className="text-xs text-slate-400">GPUs/NPUs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Activity className="h-5 w-5 text-blue-500" />
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{stats.activeWorkloads}</p>
                <p className="text-xs text-slate-400">Active Workloads</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Bot className="h-5 w-5 text-purple-500" />
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                  {stats.pendingRecommendations}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{stats.pendingRecommendations}</p>
                <p className="text-xs text-slate-400">Recommendations</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                {stats.openEvents > 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">{stats.openEvents}</p>
                <p className="text-xs text-slate-400">Open Events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Power/Temp/Util Chart */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Last 24h Telemetry</CardTitle>
              <CardDescription>Power, temperature, and utilization trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={mockTelemetryData}>
                  <defs>
                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="power_kw" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#powerGradient)" 
                    name="Power (kW)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp_c" 
                    stroke="#f59e0b" 
                    fillOpacity={1} 
                    fill="url(#tempGradient)" 
                    name="Temp (°C)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Energy Drivers */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Top Energy Drivers</CardTitle>
              <CardDescription>Primary contributors to energy consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockDriversData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="%" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Agent Recommendations */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-emerald-500" />
                  Agent Recommendations
                </CardTitle>
                <CardDescription>AI-generated optimization recommendations awaiting review</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-500/50" />
                  <p>No pending recommendations</p>
                  <p className="text-sm text-slate-500">All agent recommendations have been addressed</p>
                </div>
              ) : (
                recommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getAgentIcon(rec.agent_type)}
                      <div>
                        <p className="text-sm font-medium text-white">{rec.title}</p>
                        <p className="text-xs text-slate-400 capitalize">{rec.agent_type} Agent • {new Date(rec.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getPriorityColor(rec.priority)} className="capitalize">
                        {rec.priority}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs">
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default Dashboard;
