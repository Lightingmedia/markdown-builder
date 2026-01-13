import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  TrendingUp, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  Thermometer,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Calculator,
  BarChart3,
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  Bar,
} from "recharts";

// Mock forecast data
const generateForecastData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    month,
    current_capacity: 1024,
    projected_demand: 800 + i * 50 + Math.random() * 100,
    optimal_capacity: 900 + i * 45,
    power_headroom: Math.max(0, 45 - i * 3 + Math.random() * 5),
    cooling_headroom: Math.max(0, 38 - i * 2.5 + Math.random() * 5),
  }));
};

const forecastData = generateForecastData();

interface CapacityRecommendation {
  id: string;
  type: "buy" | "optimize" | "defer";
  title: string;
  description: string;
  timeline: string;
  investment: string;
  roi: string;
  confidence: number;
}

const mockRecommendations: CapacityRecommendation[] = [
  {
    id: "1",
    type: "optimize",
    title: "Improve GPU utilization through better placement",
    description: "Current GPU utilization is 67%. By implementing thermal-aware placement and workload packing, you can extract ~15% more effective compute from existing infrastructure.",
    timeline: "Immediate (software change)",
    investment: "$0 (operational)",
    roi: "Equivalent to 150 additional GPUs",
    confidence: 92,
  },
  {
    id: "2",
    type: "defer",
    title: "Delay H100 expansion by optimizing inference workloads",
    description: "Analysis shows 23% of inference workloads can use smaller models with minimal accuracy loss. This can defer $2.4M GPU procurement by 6 months.",
    timeline: "2-4 weeks",
    investment: "$50K (engineering time)",
    roi: "$2.4M deferred, 6-month runway extension",
    confidence: 78,
  },
  {
    id: "3",
    type: "buy",
    title: "Add 2 MW cooling capacity for Q3 expansion",
    description: "Power headroom will be exhausted by August at current growth rate. Recommend initiating cooling infrastructure expansion now to support planned GPU additions.",
    timeline: "Start now, complete by July",
    investment: "$1.2M",
    roi: "Enables $15M GPU deployment",
    confidence: 95,
  },
];

const CapacityPlanner = () => {
  const [growthRate, setGrowthRate] = useState([25]);
  const [includeOptimizations, setIncludeOptimizations] = useState(true);
  const [recommendations] = useState(mockRecommendations);

  // Calculate summary metrics
  const currentCapacity = 1024;
  const currentUtilization = 67;
  const powerHeadroom = forecastData[0].power_headroom;
  const coolingHeadroom = forecastData[0].cooling_headroom;
  const monthsUntilPowerLimit = forecastData.findIndex(d => d.power_headroom < 10) + 1 || 12;
  const monthsUntilCoolingLimit = forecastData.findIndex(d => d.cooling_headroom < 10) + 1 || 12;

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "buy": return <DollarSign className="h-5 w-5 text-emerald-400" />;
      case "optimize": return <TrendingUp className="h-5 w-5 text-blue-400" />;
      case "defer": return <Calendar className="h-5 w-5 text-purple-400" />;
      default: return <Bot className="h-5 w-5 text-slate-400" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case "buy": return "bg-emerald-500/10 border-emerald-500/30";
      case "optimize": return "bg-blue-500/10 border-blue-500/30";
      case "defer": return "bg-purple-500/10 border-purple-500/30";
      default: return "bg-slate-500/10 border-slate-500/30";
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Capacity Planner</h1>
              <p className="text-slate-400 mt-1">Forecasts constraints and recommends procurement/expansion</p>
            </div>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Calculator className="h-4 w-4" />
            Run What-If Analysis
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <Badge variant="outline" className="text-xs">GPUs</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{currentCapacity}</p>
              <p className="text-xs text-slate-400">Total Accelerators</p>
              <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs">
                <ArrowUpRight className="h-3 w-3" />
                <span>{currentUtilization}% utilized</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-emerald-500" />
                <Badge variant="outline" className="text-xs">Power</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{powerHeadroom.toFixed(0)}%</p>
              <p className="text-xs text-slate-400">Power Headroom</p>
              <div className="flex items-center gap-1 mt-1 text-yellow-400 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>{monthsUntilPowerLimit} months runway</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Thermometer className="h-5 w-5 text-cyan-500" />
                <Badge variant="outline" className="text-xs">Cooling</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{coolingHeadroom.toFixed(0)}%</p>
              <p className="text-xs text-slate-400">Cooling Headroom</p>
              <div className="flex items-center gap-1 mt-1 text-yellow-400 text-xs">
                <AlertTriangle className="h-3 w-3" />
                <span>{monthsUntilCoolingLimit} months runway</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                  Savings
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">$2.4M</p>
              <p className="text-xs text-slate-400">Deferrable Capex</p>
              <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs">
                <CheckCircle className="h-3 w-3" />
                <span>Via optimization</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forecast Controls */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              Forecast Parameters
            </CardTitle>
            <CardDescription>Adjust growth assumptions to see impact on capacity runway</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Demand Growth Rate (YoY)</Label>
                  <span className="text-sm text-slate-400">{growthRate[0]}%</span>
                </div>
                <Slider
                  value={growthRate}
                  onValueChange={setGrowthRate}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300">Include Optimization Gains</Label>
                  <p className="text-xs text-slate-500">Factor in utilization improvements from agent recommendations</p>
                </div>
                <Switch
                  checked={includeOptimizations}
                  onCheckedChange={setIncludeOptimizations}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Charts */}
        <Tabs defaultValue="demand" className="space-y-4">
          <TabsList className="bg-slate-900/50 border border-slate-700">
            <TabsTrigger value="demand" className="data-[state=active]:bg-blue-500/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Demand Forecast
            </TabsTrigger>
            <TabsTrigger value="headroom" className="data-[state=active]:bg-blue-500/20">
              <Activity className="h-4 w-4 mr-2" />
              Headroom Runway
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demand">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">12-Month Demand vs Capacity Forecast</CardTitle>
                <CardDescription>Projected GPU demand compared to available capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={forecastData}>
                    <defs>
                      <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
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
                      dataKey="projected_demand" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#demandGradient)" 
                      name="Projected Demand"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="current_capacity" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Current Capacity"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="optimal_capacity" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={false}
                      name="Optimal Capacity (with buffer)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="headroom">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Power & Cooling Headroom Runway</CardTitle>
                <CardDescription>Months until infrastructure limits are reached</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="coolingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 50]} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="power_headroom" 
                      stroke="#f59e0b" 
                      fillOpacity={1} 
                      fill="url(#powerGradient)" 
                      name="Power Headroom %"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cooling_headroom" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#coolingGradient)" 
                      name="Cooling Headroom %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recommendations */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Buy vs Optimize Recommendations</CardTitle>
                <CardDescription>AI-generated capacity planning actions with ROI analysis</CardDescription>
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                {recommendations.length} Actions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className={`p-4 rounded-lg border ${getRecommendationColor(rec.type)} transition-colors`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getRecommendationIcon(rec.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white">{rec.title}</h4>
                        <Badge variant="outline" className="capitalize text-xs">
                          {rec.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{rec.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Confidence</span>
                    <Badge 
                      variant="outline" 
                      className={rec.confidence > 85 ? "text-emerald-400 border-emerald-500/30" : "text-yellow-400 border-yellow-500/30"}
                    >
                      {rec.confidence}%
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-slate-900/50">
                  <div>
                    <p className="text-xs text-slate-500">Timeline</p>
                    <p className="text-sm text-white">{rec.timeline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Investment</p>
                    <p className="text-sm text-yellow-400">{rec.investment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ROI / Impact</p>
                    <p className="text-sm text-emerald-400">{rec.roi}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end mt-3">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Add to Plan
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default CapacityPlanner;
