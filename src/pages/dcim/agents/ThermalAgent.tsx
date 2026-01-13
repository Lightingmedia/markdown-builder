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
  Thermometer, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Flame,
  Snowflake,
  ArrowRight,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Bot,
  MapPin,
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

// Mock thermal map data
const generateThermalData = () => {
  const data = [];
  for (let rack = 1; rack <= 10; rack++) {
    for (let u = 1; u <= 42; u += 4) {
      data.push({
        rack: `A-${rack.toString().padStart(2, '0')}`,
        position: u,
        temp: 20 + Math.random() * 15 + (rack > 6 ? 8 : 0),
        load: 50 + Math.random() * 50,
      });
    }
  }
  return data;
};

const generateTimeSeriesData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    inlet_temp: 18 + Math.random() * 4,
    outlet_temp: 28 + Math.random() * 8,
    delta_t: 8 + Math.random() * 6,
    throttle_events: Math.floor(Math.random() * 5),
  }));
};

interface ThermalRecommendation {
  id: string;
  title: string;
  description: string;
  zone: string;
  action: string;
  expectedImprovement: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "executing" | "verified";
}

const mockRecommendations: ThermalRecommendation[] = [
  {
    id: "1",
    title: "Migrate hot workloads from Rack A-12",
    description: "GPU nodes in A-12 are approaching thermal throttling threshold. Recommend migrating 3 jobs to cooler racks.",
    zone: "Row A, Racks 10-12",
    action: "Migrate jobs: llama-train-001, gpt-finetune-003, vit-inference-002 to Row B",
    expectedImprovement: "Reduce rack temp by 4°C, eliminate throttling",
    priority: "high",
    status: "pending",
  },
  {
    id: "2",
    title: "Adjust CDU setpoint for liquid cooling loop",
    description: "Liquid cooling loop serving Row C is running warmer than optimal. Minor setpoint adjustment recommended.",
    zone: "Row C CDU-1",
    action: "Lower CDU supply temp from 18°C to 16°C",
    expectedImprovement: "Improve thermal headroom by 2°C",
    priority: "medium",
    status: "pending",
  },
  {
    id: "3",
    title: "Pre-emptive workload shaping for predicted heat wave",
    description: "Weather forecast shows 35°C external temps tomorrow. Recommend reducing compute density in perimeter racks.",
    zone: "Perimeter racks (all rows)",
    action: "Apply 80% power cap to perimeter racks during peak hours",
    expectedImprovement: "Maintain thermal safety margin during heat event",
    priority: "medium",
    status: "approved",
  },
];

const ThermalAgent = () => {
  const [isAgentActive, setIsAgentActive] = useState(true);
  const [thermalThreshold, setThermalThreshold] = useState([35]);
  const [thermalData] = useState(generateThermalData());
  const [timeSeriesData] = useState(generateTimeSeriesData());
  const [recommendations, setRecommendations] = useState(mockRecommendations);

  const hotspots = thermalData.filter(d => d.temp > 32);
  const averageTemp = (thermalData.reduce((sum, d) => sum + d.temp, 0) / thermalData.length).toFixed(1);
  const maxTemp = Math.max(...thermalData.map(d => d.temp)).toFixed(1);

  const handleApprove = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status: "approved" } : rec)
    );
  };

  const handleExecute = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => rec.id === id ? { ...rec, status: "executing" } : rec)
    );
    setTimeout(() => {
      setRecommendations(prev => 
        prev.map(rec => rec.id === id ? { ...rec, status: "verified" } : rec)
      );
    }, 3000);
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTempColor = (temp: number) => {
    if (temp > 35) return "#ef4444";
    if (temp > 30) return "#f59e0b";
    if (temp > 25) return "#10b981";
    return "#06b6d4";
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/20">
              <Thermometer className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Thermal Agent</h1>
              <p className="text-slate-400 mt-1">Predicts throttling, migrates jobs, and coordinates cooling controls</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="thermal-active" className="text-slate-400">Agent Active</Label>
              <Switch 
                id="thermal-active" 
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
              <Badge variant="outline" className="text-slate-400">Paused</Badge>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <Badge variant="outline" className="text-xs">Avg</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{averageTemp}°C</p>
              <p className="text-xs text-slate-400">Average Inlet Temp</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-5 w-5 text-red-500" />
                <TrendingUp className="h-4 w-4 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">{maxTemp}°C</p>
              <p className="text-xs text-slate-400">Hottest Point</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-xs">
                  {hotspots.length}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">{hotspots.length}</p>
              <p className="text-xs text-slate-400">Active Hotspots</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Snowflake className="h-5 w-5 text-cyan-500" />
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">92%</p>
              <p className="text-xs text-slate-400">Thermal Uniformity</p>
            </CardContent>
          </Card>
        </div>

        {/* Thermal Threshold Control */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-orange-500" />
              Thermal Policy Configuration
            </CardTitle>
            <CardDescription>Set temperature thresholds for automatic actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Throttling Threshold</Label>
                <span className="text-sm text-slate-400">{thermalThreshold[0]}°C</span>
              </div>
              <Slider
                value={thermalThreshold}
                onValueChange={setThermalThreshold}
                min={30}
                max={45}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>30°C (Conservative)</span>
                <span>38°C (Standard)</span>
                <span>45°C (Aggressive)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thermal Time Series */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">24-Hour Thermal Trend</CardTitle>
            <CardDescription>Inlet/outlet temperatures and delta-T</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="inletGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="outletGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={[15, 40]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="inlet_temp" 
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#inletGradient)" 
                  name="Inlet (°C)"
                />
                <Area 
                  type="monotone" 
                  dataKey="outlet_temp" 
                  stroke="#f59e0b" 
                  fillOpacity={1} 
                  fill="url(#outletGradient)" 
                  name="Outlet (°C)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Thermal Heatmap */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-500" />
              Thermal Heatmap
            </CardTitle>
            <CardDescription>Real-time temperature distribution across racks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-1">
              {thermalData.slice(0, 100).map((point, i) => (
                <div
                  key={i}
                  className="h-8 rounded text-xs flex items-center justify-center text-white font-medium cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: getTempColor(point.temp) }}
                  title={`${point.rack} U${point.position}: ${point.temp.toFixed(1)}°C`}
                >
                  {point.temp > 32 && <Flame className="h-3 w-3" />}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#06b6d4" }} />
                <span className="text-xs text-slate-400">&lt;25°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#10b981" }} />
                <span className="text-xs text-slate-400">25-30°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f59e0b" }} />
                <span className="text-xs text-slate-400">30-35°C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#ef4444" }} />
                <span className="text-xs text-slate-400">&gt;35°C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Thermal Recommendations</CardTitle>
                <CardDescription>AI-predicted cooling actions and migrations</CardDescription>
              </div>
              <Badge variant="outline" className="text-orange-400 border-orange-500/30">
                {recommendations.filter(r => r.status === "pending").length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-5 w-5 text-orange-400" />
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
                    <p className="text-xs text-slate-500">Affected Zone</p>
                    <p className="text-sm text-cyan-400">{rec.zone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Recommended Action</p>
                    <p className="text-sm text-white">{rec.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Expected Improvement</p>
                    <p className="text-sm text-emerald-400">{rec.expectedImprovement}</p>
                  </div>
                </div>

                {rec.status === "pending" && (
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" size="sm">Reject</Button>
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700 gap-1"
                      onClick={() => handleApprove(rec.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}

                {rec.status === "approved" && (
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="outline" size="sm">Cancel</Button>
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
                    <span className="text-sm">Thermal improvement verified</span>
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

export default ThermalAgent;
