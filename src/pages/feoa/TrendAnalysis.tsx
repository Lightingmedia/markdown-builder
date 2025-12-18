import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
} from "lucide-react";

interface TelemetryData {
  timestamp: string;
  temp_c: number | null;
  humidity_pct: number | null;
  gpu_wattage: number | null;
  tokens_generated: number | null;
}

interface MetricData {
  created_at: string;
  ai_energy_score: number | null;
  eco_efficiency_rating: string | null;
}

type TimeRange = "24h" | "7d" | "30d" | "90d";
type ComparisonPeriod = "previous" | "week_ago" | "month_ago";

export default function TrendAnalysis() {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [metricsData, setMetricsData] = useState<MetricData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>("previous");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const [telemetryResult, metricsResult] = await Promise.all([
      supabase
        .from("raw_telemetry")
        .select("timestamp, temp_c, humidity_pct, gpu_wattage, tokens_generated")
        .eq("user_id", user.id)
        .gte("timestamp", startDate.toISOString())
        .order("timestamp", { ascending: true }),
      supabase
        .from("processed_metrics")
        .select("created_at, ai_energy_score, eco_efficiency_rating")
        .eq("user_id", user.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true }),
    ]);

    if (telemetryResult.data) setTelemetryData(telemetryResult.data);
    if (metricsResult.data) setMetricsData(metricsResult.data);
    setIsLoading(false);
  };

  // Aggregate data by time buckets
  const aggregateData = (data: TelemetryData[], buckets: number) => {
    if (data.length === 0) return [];

    const bucketSize = Math.ceil(data.length / buckets);
    const aggregated = [];

    for (let i = 0; i < data.length; i += bucketSize) {
      const bucket = data.slice(i, i + bucketSize);
      const avgTemp = bucket.reduce((sum, d) => sum + (d.temp_c || 0), 0) / bucket.length;
      const avgHumidity = bucket.reduce((sum, d) => sum + (d.humidity_pct || 0), 0) / bucket.length;
      const avgGpu = bucket.reduce((sum, d) => sum + (d.gpu_wattage || 0), 0) / bucket.length;
      const avgTokens = bucket.reduce((sum, d) => sum + (d.tokens_generated || 0), 0) / bucket.length;

      aggregated.push({
        timestamp: new Date(bucket[0].timestamp).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          hour: timeRange === "24h" ? "numeric" : undefined,
        }),
        temperature: Math.round(avgTemp * 10) / 10,
        humidity: Math.round(avgHumidity * 10) / 10,
        gpu_wattage: Math.round(avgGpu),
        tokens: Math.round(avgTokens),
        energy_consumption: Math.round(avgGpu * 0.024 * 100) / 100,
      });
    }

    return aggregated;
  };

  const aggregatedData = aggregateData(telemetryData, timeRange === "24h" ? 24 : timeRange === "7d" ? 14 : 30);

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return { change: 0, direction: "stable" as const };
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length || 0;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length || 0;
    const change = avgFirst === 0 ? 0 : ((avgSecond - avgFirst) / avgFirst) * 100;
    return {
      change: Math.round(change * 10) / 10,
      direction: change > 2 ? "up" : change < -2 ? "down" : "stable",
    };
  };

  const gpuTrend = calculateTrend(telemetryData.map((d) => d.gpu_wattage || 0));
  const tempTrend = calculateTrend(telemetryData.map((d) => d.temp_c || 0));
  const tokensTrend = calculateTrend(telemetryData.map((d) => d.tokens_generated || 0));

  // Efficiency distribution
  const efficiencyDistribution = metricsData.reduce((acc, d) => {
    const rating = d.eco_efficiency_rating || "Unknown";
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const efficiencyChartData = Object.entries(efficiencyDistribution).map(([rating, count]) => ({
    rating,
    count,
    fill: rating === "A" ? "hsl(var(--primary))" :
          rating === "B" ? "hsl(142, 76%, 50%)" :
          rating === "C" ? "hsl(48, 96%, 53%)" :
          rating === "D" ? "hsl(38, 92%, 50%)" :
          "hsl(var(--destructive))",
  }));

  const chartConfig = {
    temperature: { label: "Temperature (°C)", color: "hsl(var(--primary))" },
    humidity: { label: "Humidity (%)", color: "hsl(200, 80%, 50%)" },
    gpu_wattage: { label: "GPU Wattage", color: "hsl(var(--destructive))" },
    tokens: { label: "Tokens", color: "hsl(280, 70%, 60%)" },
    energy_consumption: { label: "Energy (kWh)", color: "hsl(var(--primary))" },
  };

  const TrendIndicator = ({ trend }: { trend: { change: number; direction: string } }) => {
    if (trend.direction === "up") {
      return (
        <div className="flex items-center text-destructive">
          <ArrowUpRight className="h-4 w-4" />
          <span className="text-sm font-medium">+{trend.change}%</span>
        </div>
      );
    }
    if (trend.direction === "down") {
      return (
        <div className="flex items-center text-primary">
          <ArrowDownRight className="h-4 w-4" />
          <span className="text-sm font-medium">{trend.change}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span className="text-sm font-medium">Stable</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Historical Trend Analysis
          </CardTitle>
          <CardDescription>
            Compare energy consumption patterns across different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={comparisonPeriod} onValueChange={(v) => setComparisonPeriod(v as ComparisonPeriod)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous">vs Previous Period</SelectItem>
                <SelectItem value="week_ago">vs Week Ago</SelectItem>
                <SelectItem value="month_ago">vs Month Ago</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trend Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GPU Wattage Trend</p>
                <p className="text-2xl font-bold">
                  {aggregatedData.length > 0
                    ? aggregatedData[aggregatedData.length - 1]?.gpu_wattage || 0
                    : 0}W
                </p>
              </div>
              <TrendIndicator trend={gpuTrend} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {gpuTrend.direction === "down" ? "Improving" : gpuTrend.direction === "up" ? "Increasing usage" : "Stable"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Temperature Trend</p>
                <p className="text-2xl font-bold">
                  {aggregatedData.length > 0
                    ? aggregatedData[aggregatedData.length - 1]?.temperature || 0
                    : 0}°C
                </p>
              </div>
              <TrendIndicator trend={tempTrend} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {tempTrend.direction === "down" ? "Cooling down" : tempTrend.direction === "up" ? "Warming" : "Stable"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Token Generation</p>
                <p className="text-2xl font-bold">
                  {aggregatedData.length > 0
                    ? aggregatedData[aggregatedData.length - 1]?.tokens || 0
                    : 0}
                </p>
              </div>
              <TrendIndicator trend={tokensTrend} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {tokensTrend.direction === "up" ? "Increased activity" : tokensTrend.direction === "down" ? "Reduced activity" : "Stable"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="energy" className="space-y-4">
        <TabsList>
          <TabsTrigger value="energy">Energy Consumption</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency Rating</TabsTrigger>
          <TabsTrigger value="combined">Combined View</TabsTrigger>
        </TabsList>

        <TabsContent value="energy">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Energy Consumption Over Time</CardTitle>
              <CardDescription>GPU wattage and estimated energy consumption</CardDescription>
            </CardHeader>
            <CardContent>
              {aggregatedData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No telemetry data available for the selected period
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <AreaChart data={aggregatedData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="timestamp" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="gpu_wattage"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive))"
                      fillOpacity={0.3}
                      name="GPU Wattage (W)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="energy_consumption"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Energy (kWh)"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Environmental Metrics</CardTitle>
              <CardDescription>Temperature and humidity trends</CardDescription>
            </CardHeader>
            <CardContent>
              {aggregatedData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No telemetry data available for the selected period
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <LineChart data={aggregatedData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="timestamp" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" domain={[15, 35]} />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" domain={[30, 80]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="temperature"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="Temperature (°C)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="humidity"
                      stroke="hsl(200, 80%, 50%)"
                      strokeWidth={2}
                      dot={false}
                      name="Humidity (%)"
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Efficiency Rating Distribution</CardTitle>
              <CardDescription>Distribution of eco-efficiency ratings over time</CardDescription>
            </CardHeader>
            <CardContent>
              {efficiencyChartData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No efficiency data available for the selected period
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <ChartContainer config={{}} className="h-[300px]">
                    <BarChart data={efficiencyChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="rating" type="category" className="text-xs" width={40} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                        {efficiencyChartData.map((entry, index) => (
                          <rect key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                  <div className="space-y-4">
                    <h4 className="font-medium">Rating Breakdown</h4>
                    {efficiencyChartData.map((item) => (
                      <div key={item.rating} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span>Rating {item.rating}</span>
                        </div>
                        <Badge variant="outline">{item.count} readings</Badge>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Total readings: {metricsData.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="combined">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Combined Metrics View</CardTitle>
              <CardDescription>All key metrics in a single view</CardDescription>
            </CardHeader>
            <CardContent>
              {aggregatedData.length === 0 ? (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No telemetry data available for the selected period
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <ComposedChart data={aggregatedData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="timestamp" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="gpu_wattage"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive))"
                      fillOpacity={0.2}
                      name="GPU (W)"
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="Temp (°C)"
                    />
                    <Bar
                      dataKey="tokens"
                      fill="hsl(280, 70%, 60%)"
                      fillOpacity={0.6}
                      name="Tokens"
                    />
                  </ComposedChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
