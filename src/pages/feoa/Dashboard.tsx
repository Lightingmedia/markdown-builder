import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { exportAITrainingCostsPDF } from "@/lib/pdfExport";
import EnergyComparisonTool from "@/components/feoa/EnergyComparisonTool";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Zap, Cpu, DollarSign, Activity, AlertTriangle, CheckCircle, Clock, Leaf, Flame, FileDown, Scale } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact_level: string;
  status: string;
  created_at: string;
}

interface TelemetryData {
  timestamp: string;
  gpu_wattage: number;
  temp_c: number;
  tokens_generated: number;
}

interface AITrainingCost {
  id: string;
  model_name: string;
  model_provider: string;
  energy_kwh: number;
  cost_usd: number;
  carbon_kg: number;
  parameters_billions: number;
  training_date: string;
}

interface ProcessedMetric {
  ai_energy_score: number;
  eco_efficiency_rating: string;
  predicted_consumption: number;
  created_at: string;
}

export default function FeoaDashboard() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [aiTrainingCosts, setAiTrainingCosts] = useState<AITrainingCost[]>([]);
  const [processedMetrics, setProcessedMetrics] = useState<ProcessedMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [metrics, setMetrics] = useState({
    energyScore: 0,
    gpuEfficiency: 0,
    projectedSavings: 0,
    loadStatus: "Low",
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      
      // Fetch recommendations
      const { data: recData } = await supabase
        .from("recommendations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recData) setRecommendations(recData);

      // Fetch raw telemetry for charts
      const { data: telData } = await supabase
        .from("raw_telemetry")
        .select("timestamp, gpu_wattage, temp_c, tokens_generated")
        .order("timestamp", { ascending: false })
        .limit(24);

      if (telData && telData.length > 0) {
        setTelemetryData(telData.reverse());
        
        // Calculate metrics from real data
        const avgGpuWattage = telData.reduce((sum, t) => sum + (Number(t.gpu_wattage) || 0), 0) / telData.length;
        const totalTokens = telData.reduce((sum, t) => sum + (t.tokens_generated || 0), 0);
        const energyScore = totalTokens > 0 ? (avgGpuWattage / totalTokens) * 1000 : 12.5;
        const efficiency = Math.min(100, Math.max(0, 100 - (avgGpuWattage / 300) * 100));
        
        setMetrics({
          energyScore: Number(energyScore.toFixed(1)),
          gpuEfficiency: Math.round(efficiency),
          projectedSavings: Math.round((100 - efficiency) * 12),
          loadStatus: avgGpuWattage > 200 ? "High" : avgGpuWattage > 100 ? "Optimal" : "Low",
        });
      }

      // Fetch processed metrics
      const { data: metricsData } = await supabase
        .from("processed_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (metricsData) setProcessedMetrics(metricsData);

      // Fetch AI training costs (new table, cast as unknown first)
      const { data: trainingData } = await supabase
        .from("ai_training_costs" as any)
        .select("*")
        .order("cost_usd", { ascending: false });

      if (trainingData) setAiTrainingCosts(trainingData as unknown as AITrainingCost[]);

      setIsLoading(false);
    };

    fetchAllData();

    // Subscribe to real-time updates
    const telemetryChannel = supabase
      .channel("telemetry-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "raw_telemetry" },
        (payload) => {
          setTelemetryData((prev) => [...prev.slice(-23), payload.new as TelemetryData]);
        }
      )
      .subscribe();

    const recommendationsChannel = supabase
      .channel("recommendations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recommendations" },
        () => fetchAllData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(telemetryChannel);
      supabase.removeChannel(recommendationsChannel);
    };
  }, []);

  // Transform telemetry for line chart
  const energyChartData = telemetryData.map((t) => ({
    time: new Date(t.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    consumption: Number(t.gpu_wattage) || 0,
  }));

  // Calculate energy drivers from telemetry
  const driversData = [
    { name: "GPU Inference", value: 42 },
    { name: "HVAC", value: 28 },
    { name: "Cooling", value: 15 },
    { name: "Lighting", value: 10 },
    { name: "Other", value: 5 },
  ];

  // AI Training costs chart data
  const trainingCostData = aiTrainingCosts.slice(0, 6).map((t) => ({
    name: t.model_name,
    cost: Number(t.cost_usd) / 1000000,
    energy: Number(t.energy_kwh) / 1000,
    carbon: Number(t.carbon_kg) / 1000,
  }));

  const trainingPieData = aiTrainingCosts.map((t) => ({
    name: t.model_name,
    value: Number(t.energy_kwh),
  }));

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(142 76% 36%)", "hsl(221 83% 53%)", "hsl(262 83% 58%)", "hsl(0 84% 60%)"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getLoadStatusColor = (status: string) => {
    switch (status) {
      case "Optimal":
        return "bg-primary/20 text-primary";
      case "High":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-yellow-500/20 text-yellow-500";
    }
  };

  // Calculate totals from AI training data
  const totalTrainingCost = aiTrainingCosts.reduce((sum, t) => sum + Number(t.cost_usd || 0), 0);
  const totalTrainingEnergy = aiTrainingCosts.reduce((sum, t) => sum + Number(t.energy_kwh || 0), 0);
  const totalCarbon = aiTrainingCosts.reduce((sum, t) => sum + Number(t.carbon_kg || 0), 0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="facility" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="facility">Facility Metrics</TabsTrigger>
          <TabsTrigger value="ai-training">AI Training Costs</TabsTrigger>
          <TabsTrigger value="comparison">
            <Scale className="h-4 w-4 mr-1" />
            Compare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facility" className="space-y-6 mt-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Real-time Energy Score
                </CardTitle>
                <Zap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.energyScore || "12.5"}</div>
                <p className="text-xs text-muted-foreground">Wh/1000 queries</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  GPU/TPU Efficiency
                </CardTitle>
                <Cpu className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.gpuEfficiency || 85}%</div>
                <p className="text-xs text-muted-foreground">Compute utilisation</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Projected Monthly Savings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(metrics.projectedSavings || 1200).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Based on current optimisations</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Load Status
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={getLoadStatusColor(metrics.loadStatus)}>
                  {metrics.loadStatus}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">System health: Good</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Last 24h Energy Consumption (kWh)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={energyChartData.length > 0 ? energyChartData : [
                    { time: "00:00", consumption: 45 },
                    { time: "04:00", consumption: 38 },
                    { time: "08:00", consumption: 72 },
                    { time: "12:00", consumption: 85 },
                    { time: "16:00", consumption: 78 },
                    { time: "20:00", consumption: 62 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consumption"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Energy Drivers (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={driversData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts/Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        {getStatusIcon(rec.status)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {rec.impact_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recommendations yet.</p>
                    <p className="text-sm">Upload data in Energy Lab to get started.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-training" className="space-y-6 mt-6">
          {/* Header with Export Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">AI Model Training Costs</h2>
              <p className="text-sm text-muted-foreground">Track energy and cost across trained models</p>
            </div>
            <Button
              variant="outline"
              onClick={() => exportAITrainingCostsPDF(aiTrainingCosts, {
                totalCost: totalTrainingCost,
                totalEnergy: totalTrainingEnergy,
                totalCarbon: totalCarbon,
              })}
              disabled={aiTrainingCosts.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {/* AI Training Cost KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-destructive/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Training Cost
                </CardTitle>
                <DollarSign className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(totalTrainingCost / 1000000).toFixed(0)}M</div>
                <p className="text-xs text-muted-foreground">Across {aiTrainingCosts.length} models</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Energy Used
                </CardTitle>
                <Flame className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(totalTrainingEnergy / 1000000).toFixed(1)} GWh</div>
                <p className="text-xs text-muted-foreground">Equivalent to {Math.round(totalTrainingEnergy / 10000)} homes/year</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Carbon Footprint
                </CardTitle>
                <Leaf className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(totalCarbon / 1000).toFixed(0)}k tonnes</div>
                <p className="text-xs text-muted-foreground">CO₂ equivalent emissions</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Training Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Cost by Model ($M)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trainingCostData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(1)}M`, "Cost"]}
                    />
                    <Bar dataKey="cost" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Energy Distribution by Model</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trainingPieData.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name }) => name}
                    >
                      {trainingPieData.slice(0, 6).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${(value / 1000).toFixed(0)} MWh`, "Energy"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Training Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>AI Model Training Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {aiTrainingCosts.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{model.model_name}</p>
                          <Badge variant="outline" className="text-xs">
                            {model.model_provider}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Number(model.parameters_billions).toFixed(0)}B params • {model.training_date}
                        </p>
                      </div>
                      <div className="flex gap-6 text-right">
                        <div>
                          <p className="font-medium text-destructive">${(Number(model.cost_usd) / 1000000).toFixed(1)}M</p>
                          <p className="text-xs text-muted-foreground">Cost</p>
                        </div>
                        <div>
                          <p className="font-medium text-yellow-500">{(Number(model.energy_kwh) / 1000).toFixed(0)} MWh</p>
                          <p className="text-xs text-muted-foreground">Energy</p>
                        </div>
                        <div>
                          <p className="font-medium text-primary">{(Number(model.carbon_kg) / 1000).toFixed(0)}t CO₂</p>
                          <p className="text-xs text-muted-foreground">Carbon</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <EnergyComparisonTool />
        </TabsContent>
      </Tabs>
    </div>
  );
}
