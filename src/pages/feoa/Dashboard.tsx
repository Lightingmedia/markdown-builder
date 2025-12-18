import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  accelerator_vendor?: string;
  tpu_wattage?: number;
  tpu_utilization?: number;
  amd_gpu_wattage?: number;
  amd_utilization?: number;
  nvidia_utilization?: number;
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

type VendorFilter = "all" | "nvidia" | "google_tpu" | "amd";

export default function FeoaDashboard() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [aiTrainingCosts, setAiTrainingCosts] = useState<AITrainingCost[]>([]);
  const [processedMetrics, setProcessedMetrics] = useState<ProcessedMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorFilter, setVendorFilter] = useState<VendorFilter>("all");
  
  const [metrics, setMetrics] = useState({
    energyScore: 0,
    gpuEfficiency: 0,
    projectedSavings: 0,
    loadStatus: "Low",
  });

  // Vendor breakdown stats
  const [vendorStats, setVendorStats] = useState({
    nvidia: { count: 0, avgWattage: 0, avgUtilization: 0 },
    google_tpu: { count: 0, avgWattage: 0, avgUtilization: 0 },
    amd: { count: 0, avgWattage: 0, avgUtilization: 0 },
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

      // Fetch raw telemetry for charts with multi-vendor fields
      const { data: telData } = await supabase
        .from("raw_telemetry")
        .select("timestamp, gpu_wattage, temp_c, tokens_generated, accelerator_vendor, tpu_wattage, tpu_utilization, amd_gpu_wattage, amd_utilization, nvidia_utilization")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (telData && telData.length > 0) {
        setTelemetryData(telData.reverse());
        
        // Calculate vendor-specific stats
        const nvidiaData = telData.filter(t => !t.accelerator_vendor || t.accelerator_vendor === "nvidia");
        const tpuData = telData.filter(t => t.accelerator_vendor === "google_tpu");
        const amdData = telData.filter(t => t.accelerator_vendor === "amd");

        setVendorStats({
          nvidia: {
            count: nvidiaData.length,
            avgWattage: nvidiaData.length > 0 ? nvidiaData.reduce((sum, t) => sum + (Number(t.gpu_wattage) || 0), 0) / nvidiaData.length : 0,
            avgUtilization: nvidiaData.length > 0 ? nvidiaData.reduce((sum, t) => sum + (Number(t.nvidia_utilization) || 0), 0) / nvidiaData.length : 0,
          },
          google_tpu: {
            count: tpuData.length,
            avgWattage: tpuData.length > 0 ? tpuData.reduce((sum, t) => sum + (Number(t.tpu_wattage) || 0), 0) / tpuData.length : 0,
            avgUtilization: tpuData.length > 0 ? tpuData.reduce((sum, t) => sum + (Number(t.tpu_utilization) || 0), 0) / tpuData.length : 0,
          },
          amd: {
            count: amdData.length,
            avgWattage: amdData.length > 0 ? amdData.reduce((sum, t) => sum + (Number(t.amd_gpu_wattage) || 0), 0) / amdData.length : 0,
            avgUtilization: amdData.length > 0 ? amdData.reduce((sum, t) => sum + (Number(t.amd_utilization) || 0), 0) / amdData.length : 0,
          },
        });
        
        // Calculate metrics from real data
        const avgGpuWattage = telData.reduce((sum, t) => {
          const wattage = Number(t.gpu_wattage) || Number(t.tpu_wattage) || Number(t.amd_gpu_wattage) || 0;
          return sum + wattage;
        }, 0) / telData.length;
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

  // Filter telemetry by vendor
  const filteredTelemetry = vendorFilter === "all" 
    ? telemetryData 
    : telemetryData.filter(t => (t.accelerator_vendor || "nvidia") === vendorFilter);

  // Transform telemetry for line chart
  const energyChartData = filteredTelemetry.map((t) => {
    const wattage = Number(t.gpu_wattage) || Number(t.tpu_wattage) || Number(t.amd_gpu_wattage) || 0;
    return {
      time: new Date(t.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      consumption: wattage,
      vendor: t.accelerator_vendor || "nvidia",
    };
  });

  // Vendor breakdown for pie chart
  const vendorBreakdownData = [
    { name: "NVIDIA", value: vendorStats.nvidia.count, color: "hsl(142 76% 36%)" },
    { name: "Google TPU", value: vendorStats.google_tpu.count, color: "hsl(221 83% 53%)" },
    { name: "AMD", value: vendorStats.amd.count, color: "hsl(0 84% 60%)" },
  ].filter(v => v.value > 0);

  // Calculate energy drivers from telemetry
  const driversData = [
    { name: "NVIDIA GPU", value: vendorStats.nvidia.count > 0 ? Math.round(vendorStats.nvidia.avgWattage) : 0 },
    { name: "Google TPU", value: vendorStats.google_tpu.count > 0 ? Math.round(vendorStats.google_tpu.avgWattage) : 0 },
    { name: "AMD GPU", value: vendorStats.amd.count > 0 ? Math.round(vendorStats.amd.avgWattage) : 0 },
    { name: "HVAC", value: 28 },
    { name: "Other", value: 5 },
  ].filter(d => d.value > 0).sort((a, b) => b.value - a.value).slice(0, 5);

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
          {/* Vendor Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Accelerator:</span>
            <div className="flex gap-2">
              <Button
                variant={vendorFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setVendorFilter("all")}
              >
                All Vendors
              </Button>
              <Button
                variant={vendorFilter === "nvidia" ? "default" : "outline"}
                size="sm"
                onClick={() => setVendorFilter("nvidia")}
                className="gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                NVIDIA ({vendorStats.nvidia.count})
              </Button>
              <Button
                variant={vendorFilter === "google_tpu" ? "default" : "outline"}
                size="sm"
                onClick={() => setVendorFilter("google_tpu")}
                className="gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Google TPU ({vendorStats.google_tpu.count})
              </Button>
              <Button
                variant={vendorFilter === "amd" ? "default" : "outline"}
                size="sm"
                onClick={() => setVendorFilter("amd")}
                className="gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                AMD ({vendorStats.amd.count})
              </Button>
            </div>
          </div>

          {/* Vendor-Specific Stats (when filtered) */}
          {vendorFilter !== "all" && (
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      vendorFilter === "nvidia" ? "bg-green-500" : 
                      vendorFilter === "google_tpu" ? "bg-blue-500" : "bg-red-500"
                    }`} />
                    <span className="font-semibold">
                      {vendorFilter === "nvidia" ? "NVIDIA GPU" : 
                       vendorFilter === "google_tpu" ? "Google TPU" : "AMD GPU"} Metrics
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Avg Power: </span>
                      <span className="font-bold">{vendorStats[vendorFilter].avgWattage.toFixed(0)}W</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Utilization: </span>
                      <span className="font-bold">{vendorStats[vendorFilter].avgUtilization.toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Points: </span>
                      <span className="font-bold">{vendorStats[vendorFilter].count}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="border-2 border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {vendorFilter === "all" ? "All Vendors" : vendorFilter.toUpperCase().replace("_", " ")} - Energy Consumption (W)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : (
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
                        formatter={(value: number, name: string) => [`${value}W`, "Power"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="consumption"
                        stroke={vendorFilter === "nvidia" ? "hsl(142 76% 36%)" : 
                               vendorFilter === "google_tpu" ? "hsl(221 83% 53%)" : 
                               vendorFilter === "amd" ? "hsl(0 84% 60%)" : "hsl(var(--primary))"}
                        strokeWidth={2}
                        dot={{ fill: vendorFilter === "nvidia" ? "hsl(142 76% 36%)" : 
                               vendorFilter === "google_tpu" ? "hsl(221 83% 53%)" : 
                               vendorFilter === "amd" ? "hsl(0 84% 60%)" : "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : vendorBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={vendorBreakdownData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {vendorBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No vendor data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Power Consumption by Source (W)</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="w-full h-[300px]" />
                ) : driversData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={driversData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" unit="W" />
                      <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}W`, "Avg Power"]}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {driversData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.name === "NVIDIA GPU" ? "hsl(142 76% 36%)" :
                              entry.name === "Google TPU" ? "hsl(221 83% 53%)" :
                              entry.name === "AMD GPU" ? "hsl(0 84% 60%)" :
                              "hsl(var(--secondary))"
                            } 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No power data available
                  </div>
                )}
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
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                        <Skeleton className="h-4 w-4 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
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
