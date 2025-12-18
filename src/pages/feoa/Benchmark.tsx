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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Thermometer,
  Droplets,
  Award,
} from "lucide-react";

interface FacilityData {
  facility_id: string;
  avgTemp: number;
  avgHumidity: number;
  avgGpuWattage: number;
  avgTokens: number;
  avgEnergyScore: number;
  totalReadings: number;
  efficiencyGrade: string;
}

export default function Benchmark() {
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchFacilityData();
  }, [timeRange]);

  const fetchFacilityData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoading(false);
      return;
    }

    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case "7d": startDate.setDate(now.getDate() - 7); break;
      case "30d": startDate.setDate(now.getDate() - 30); break;
      case "90d": startDate.setDate(now.getDate() - 90); break;
    }

    const { data: telemetry } = await supabase
      .from("raw_telemetry")
      .select("facility_id, temp_c, humidity_pct, gpu_wattage, tokens_generated")
      .eq("user_id", user.id)
      .gte("timestamp", startDate.toISOString());

    const { data: metrics } = await supabase
      .from("processed_metrics")
      .select("telemetry_id, ai_energy_score, eco_efficiency_rating")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString());

    if (telemetry && telemetry.length > 0) {
      // Group by facility
      const facilityMap = new Map<string, any[]>();
      telemetry.forEach((t) => {
        const fid = t.facility_id || "default";
        if (!facilityMap.has(fid)) facilityMap.set(fid, []);
        facilityMap.get(fid)!.push(t);
      });

      const facilityData: FacilityData[] = [];
      facilityMap.forEach((readings, facility_id) => {
        const avgTemp = readings.reduce((s, r) => s + (r.temp_c || 0), 0) / readings.length;
        const avgHumidity = readings.reduce((s, r) => s + (r.humidity_pct || 0), 0) / readings.length;
        const avgGpuWattage = readings.reduce((s, r) => s + (r.gpu_wattage || 0), 0) / readings.length;
        const avgTokens = readings.reduce((s, r) => s + (r.tokens_generated || 0), 0) / readings.length;
        
        // Calculate efficiency score
        const energyScore = avgTokens > 0 ? (avgGpuWattage / avgTokens) * 1000 : 0;
        let grade = "A";
        if (energyScore > 50) grade = "F";
        else if (energyScore > 30) grade = "D";
        else if (energyScore > 20) grade = "C";
        else if (energyScore > 10) grade = "B";

        facilityData.push({
          facility_id,
          avgTemp: Math.round(avgTemp * 10) / 10,
          avgHumidity: Math.round(avgHumidity * 10) / 10,
          avgGpuWattage: Math.round(avgGpuWattage),
          avgTokens: Math.round(avgTokens),
          avgEnergyScore: Math.round(energyScore * 100) / 100,
          totalReadings: readings.length,
          efficiencyGrade: grade,
        });
      });

      setFacilities(facilityData);
      if (facilityData.length > 0 && selectedFacilities.length === 0) {
        setSelectedFacilities(facilityData.slice(0, Math.min(3, facilityData.length)).map(f => f.facility_id));
      }
    }
    setIsLoading(false);
  };

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((f) => f !== facilityId)
        : [...prev, facilityId]
    );
  };

  const selectedData = facilities.filter((f) => selectedFacilities.includes(f.facility_id));

  // Prepare chart data
  const comparisonData = selectedData.map((f) => ({
    name: f.facility_id === "default" ? "Main Facility" : f.facility_id.slice(0, 8),
    "GPU Wattage": f.avgGpuWattage,
    Temperature: f.avgTemp,
    Humidity: f.avgHumidity,
    "Energy Score": f.avgEnergyScore,
  }));

  const radarData = [
    { metric: "Energy Efficiency", ...Object.fromEntries(selectedData.map(f => [f.facility_id, 100 - f.avgEnergyScore])) },
    { metric: "Thermal Mgmt", ...Object.fromEntries(selectedData.map(f => [f.facility_id, Math.max(0, 100 - Math.abs(f.avgTemp - 22) * 5)])) },
    { metric: "Humidity Control", ...Object.fromEntries(selectedData.map(f => [f.facility_id, Math.max(0, 100 - Math.abs(f.avgHumidity - 50))])) },
    { metric: "GPU Utilization", ...Object.fromEntries(selectedData.map(f => [f.facility_id, Math.min(100, f.avgGpuWattage / 3)])) },
    { metric: "Throughput", ...Object.fromEntries(selectedData.map(f => [f.facility_id, Math.min(100, f.avgTokens / 50)])) },
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-primary";
      case "B": return "text-green-500";
      case "C": return "text-yellow-500";
      case "D": return "text-orange-500";
      default: return "text-destructive";
    }
  };

  const chartConfig = {
    "GPU Wattage": { color: "hsl(var(--destructive))" },
    Temperature: { color: "hsl(var(--primary))" },
    Humidity: { color: "hsl(200, 80%, 50%)" },
    "Energy Score": { color: "hsl(280, 70%, 60%)" },
  };

  const radarColors = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(280, 70%, 60%)", "hsl(48, 96%, 53%)"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Facility Benchmark Comparison
          </CardTitle>
          <CardDescription>
            Compare energy efficiency metrics across multiple facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchFacilityData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Facility Selection */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Select Facilities to Compare</CardTitle>
          <CardDescription>Choose up to 4 facilities for comparison</CardDescription>
        </CardHeader>
        <CardContent>
          {facilities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No facility data available.</p>
              <p className="text-sm">Send telemetry data to see facility comparisons.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {facilities.map((facility) => (
                <Card
                  key={facility.facility_id}
                  className={`cursor-pointer transition-all ${
                    selectedFacilities.includes(facility.facility_id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-muted-foreground/50"
                  }`}
                  onClick={() => toggleFacility(facility.facility_id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium truncate">
                        {facility.facility_id === "default" ? "Main Facility" : facility.facility_id.slice(0, 12)}
                      </span>
                      <Badge className={getGradeColor(facility.efficiencyGrade)} variant="outline">
                        Grade {facility.efficiencyGrade}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {facility.avgGpuWattage}W
                      </div>
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3" />
                        {facility.avgTemp}°C
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {facility.avgHumidity}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {facility.totalReadings} readings
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Charts */}
      {selectedData.length > 0 && (
        <Tabs defaultValue="bar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bar">Bar Comparison</TabsTrigger>
            <TabsTrigger value="radar">Radar Analysis</TabsTrigger>
            <TabsTrigger value="table">Detailed Table</TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Metric Comparison</CardTitle>
                <CardDescription>Side-by-side comparison of key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="GPU Wattage" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Temperature" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Humidity" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="radar">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional efficiency analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      {selectedData.map((facility, index) => (
                        <Radar
                          key={facility.facility_id}
                          name={facility.facility_id === "default" ? "Main Facility" : facility.facility_id.slice(0, 8)}
                          dataKey={facility.facility_id}
                          stroke={radarColors[index % radarColors.length]}
                          fill={radarColors[index % radarColors.length]}
                          fillOpacity={0.2}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Detailed Comparison</CardTitle>
                <CardDescription>Full metrics breakdown for selected facilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Metric</th>
                        {selectedData.map((f) => (
                          <th key={f.facility_id} className="text-center py-3 px-4">
                            {f.facility_id === "default" ? "Main Facility" : f.facility_id.slice(0, 12)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">Efficiency Grade</td>
                        {selectedData.map((f) => (
                          <td key={f.facility_id} className={`text-center py-3 px-4 font-bold ${getGradeColor(f.efficiencyGrade)}`}>
                            {f.efficiencyGrade}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">Avg GPU Wattage</td>
                        {selectedData.map((f) => (
                          <td key={f.facility_id} className="text-center py-3 px-4">{f.avgGpuWattage}W</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">Avg Temperature</td>
                        {selectedData.map((f) => (
                          <td key={f.facility_id} className="text-center py-3 px-4">{f.avgTemp}°C</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">Avg Humidity</td>
                        {selectedData.map((f) => (
                          <td key={f.facility_id} className="text-center py-3 px-4">{f.avgHumidity}%</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">Avg Tokens/Reading</td>
                        {selectedData.map((f) => (
                          <td key={f.facility_id} className="text-center py-3 px-4">{f.avgTokens}</td>
                        ))}
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">Energy Score</td>
                        {selectedData.map((f) => (
                          <td key={f.facility_id} className="text-center py-3 px-4">{f.avgEnergyScore} Wh/1k tokens</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Total Readings</td>
                        {selectedData.map((f) => (
                          <td key={f.facility_id} className="text-center py-3 px-4">{f.totalReadings}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
