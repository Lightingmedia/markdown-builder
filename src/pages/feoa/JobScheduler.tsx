import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Legend,
  ComposedChart,
  Bar,
} from "recharts";
import { Calendar, Clock, Leaf, DollarSign, Zap, MapPin, TrendingDown, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface FacilityCoefficient {
  id: string;
  region_code: string;
  region_name: string;
  provider: string;
  pue: number;
  wue_l_per_kwh: number;
  grid_co2_kg_per_kwh: number;
  renewable_pct: number;
}

interface AcceleratorSpec {
  id: string;
  vendor: string;
  model: string;
  tdp_w: number;
  peak_fp16_tflops: number;
}

interface TimeSlot {
  hour: number;
  label: string;
  carbonIntensity: number;
  spotPriceMultiplier: number;
  renewablePct: number;
  recommendation: "excellent" | "good" | "fair" | "avoid";
}

interface ScheduleRecommendation {
  region: FacilityCoefficient;
  optimalSlots: TimeSlot[];
  estimatedSavings: {
    costPct: number;
    carbonPct: number;
    costUsd: number;
    carbonKg: number;
  };
  score: number;
}

// Simulated carbon intensity patterns by hour (typical patterns)
const generateCarbonForecast = (baseCO2: number, renewablePct: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  for (let hour = 0; hour < 24; hour++) {
    // Carbon intensity varies through the day - lowest during solar hours (10-16)
    let carbonMultiplier = 1.0;
    let spotMultiplier = 1.0;
    let effectiveRenewable = renewablePct;
    
    // Early morning (0-6): Medium carbon, low spot prices
    if (hour >= 0 && hour < 6) {
      carbonMultiplier = 0.9;
      spotMultiplier = 0.7;
      effectiveRenewable = renewablePct * 0.3; // No solar
    }
    // Morning ramp (6-10): Rising carbon, rising prices
    else if (hour >= 6 && hour < 10) {
      carbonMultiplier = 1.1;
      spotMultiplier = 1.2;
      effectiveRenewable = renewablePct * 0.5;
    }
    // Solar peak (10-16): Lowest carbon (solar), high prices
    else if (hour >= 10 && hour < 16) {
      carbonMultiplier = 0.6;
      spotMultiplier = 1.0;
      effectiveRenewable = renewablePct * 1.2; // Peak solar
    }
    // Evening peak (16-20): Highest carbon, highest prices
    else if (hour >= 16 && hour < 20) {
      carbonMultiplier = 1.3;
      spotMultiplier = 1.5;
      effectiveRenewable = renewablePct * 0.4;
    }
    // Night (20-24): Medium-low carbon, low prices
    else {
      carbonMultiplier = 0.85;
      spotMultiplier = 0.75;
      effectiveRenewable = renewablePct * 0.2;
    }

    // Add some randomness
    carbonMultiplier += (Math.random() - 0.5) * 0.1;
    spotMultiplier += (Math.random() - 0.5) * 0.1;

    const carbonIntensity = baseCO2 * carbonMultiplier;
    
    // Determine recommendation
    let recommendation: TimeSlot["recommendation"] = "fair";
    const score = (1 / carbonMultiplier) * (1 / spotMultiplier);
    if (score > 1.4) recommendation = "excellent";
    else if (score > 1.1) recommendation = "good";
    else if (score < 0.7) recommendation = "avoid";

    slots.push({
      hour,
      label: `${hour.toString().padStart(2, "0")}:00`,
      carbonIntensity: Math.round(carbonIntensity * 1000) / 1000,
      spotPriceMultiplier: Math.round(spotMultiplier * 100) / 100,
      renewablePct: Math.min(100, Math.max(0, Math.round(effectiveRenewable))),
      recommendation,
    });
  }

  return slots;
};

export default function JobScheduler() {
  const [facilities, setFacilities] = useState<FacilityCoefficient[]>([]);
  const [accelerators, setAccelerators] = useState<AcceleratorSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Job configuration
  const [jobName, setJobName] = useState("LLaMA-70B Training");
  const [selectedAccelerator, setSelectedAccelerator] = useState<string>("");
  const [deviceCount, setDeviceCount] = useState([8]);
  const [durationHours, setDurationHours] = useState([24]);
  const [priority, setPriority] = useState<"cost" | "carbon" | "balanced">("balanced");
  
  // Results
  const [recommendations, setRecommendations] = useState<ScheduleRecommendation[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [forecast, setForecast] = useState<TimeSlot[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRegion && facilities.length > 0) {
      const facility = facilities.find(f => f.region_code === selectedRegion);
      if (facility) {
        setForecast(generateCarbonForecast(facility.grid_co2_kg_per_kwh, facility.renewable_pct));
      }
    }
  }, [selectedRegion, facilities]);

  const fetchData = async () => {
    try {
      const [facRes, accRes] = await Promise.all([
        supabase.from("facility_coefficients").select("*").order("grid_co2_kg_per_kwh"),
        supabase.from("accelerator_specs").select("*").order("peak_fp16_tflops", { ascending: false }),
      ]);

      if (facRes.data) {
        setFacilities(facRes.data);
        if (facRes.data.length > 0) {
          setSelectedRegion(facRes.data[0].region_code);
        }
      }
      if (accRes.data) {
        setAccelerators(accRes.data);
        if (accRes.data.length > 0) {
          setSelectedAccelerator(accRes.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load reference data");
    } finally {
      setLoading(false);
    }
  };

  const analyzeSchedule = async () => {
    setAnalyzing(true);
    try {
      const accelerator = accelerators.find(a => a.id === selectedAccelerator);
      const baseCostPerHour = accelerator ? getGpuHourCost(accelerator.model) : 3.0;
      const basePowerKw = accelerator ? (accelerator.tdp_w * deviceCount[0]) / 1000 : 2.4;

      const results: ScheduleRecommendation[] = facilities.map(facility => {
        const slots = generateCarbonForecast(facility.grid_co2_kg_per_kwh, facility.renewable_pct);
        
        // Find optimal slots based on priority
        const scoredSlots = slots.map(slot => {
          let score = 0;
          if (priority === "cost") {
            score = 1 / slot.spotPriceMultiplier;
          } else if (priority === "carbon") {
            score = 1 / slot.carbonIntensity;
          } else {
            score = (1 / slot.spotPriceMultiplier) * 0.5 + (1 / slot.carbonIntensity) * 0.5;
          }
          return { ...slot, score };
        });

        scoredSlots.sort((a, b) => b.score - a.score);
        const optimalSlots = scoredSlots.slice(0, Math.min(durationHours[0], 24));

        // Calculate savings vs worst case
        const worstSlots = [...scoredSlots].reverse().slice(0, durationHours[0]);
        
        const optimalCostMultiplier = optimalSlots.reduce((sum, s) => sum + s.spotPriceMultiplier, 0) / optimalSlots.length;
        const worstCostMultiplier = worstSlots.reduce((sum, s) => sum + s.spotPriceMultiplier, 0) / worstSlots.length;
        
        const optimalCarbon = optimalSlots.reduce((sum, s) => sum + s.carbonIntensity, 0) / optimalSlots.length;
        const worstCarbon = worstSlots.reduce((sum, s) => sum + s.carbonIntensity, 0) / worstSlots.length;

        const baseJobCost = baseCostPerHour * deviceCount[0] * durationHours[0];
        const costSavingsUsd = baseJobCost * (worstCostMultiplier - optimalCostMultiplier);
        const carbonPerHour = basePowerKw * facility.pue;
        const carbonSavingsKg = (worstCarbon - optimalCarbon) * carbonPerHour * durationHours[0];

        // Overall region score
        const regionScore = (
          (100 - facility.grid_co2_kg_per_kwh * 150) * 0.3 +
          facility.renewable_pct * 0.3 +
          ((2 - facility.pue) * 50) * 0.2 +
          ((2 - facility.wue_l_per_kwh) * 25) * 0.2
        );

        return {
          region: facility,
          optimalSlots,
          estimatedSavings: {
            costPct: Math.round((1 - optimalCostMultiplier / worstCostMultiplier) * 100),
            carbonPct: Math.round((1 - optimalCarbon / worstCarbon) * 100),
            costUsd: Math.round(costSavingsUsd * 100) / 100,
            carbonKg: Math.round(carbonSavingsKg * 100) / 100,
          },
          score: regionScore,
        };
      });

      results.sort((a, b) => b.score - a.score);
      setRecommendations(results);
      toast.success("Schedule analysis complete");
    } catch (error) {
      console.error("Error analyzing schedule:", error);
      toast.error("Failed to analyze schedule");
    } finally {
      setAnalyzing(false);
    }
  };

  const getGpuHourCost = (model: string): number => {
    const costs: Record<string, number> = {
      "A100-40GB": 2.5,
      "A100-80GB": 3.0,
      "H100-80GB": 4.5,
      "H200": 6.0,
      "B200": 8.0,
      "TPU v4": 3.2,
      "TPU v5e": 2.8,
      "TPU v5p": 4.0,
      "MI300X": 5.0,
    };
    return costs[model] || 3.0;
  };

  const getRecommendationColor = (rec: TimeSlot["recommendation"]) => {
    switch (rec) {
      case "excellent": return "hsl(var(--chart-2))";
      case "good": return "hsl(var(--primary))";
      case "fair": return "hsl(var(--chart-4))";
      case "avoid": return "hsl(var(--destructive))";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Scheduling Optimizer</h1>
        <p className="text-muted-foreground">
          Find optimal time slots and regions based on carbon intensity forecasts and spot pricing
        </p>
      </div>

      {/* Job Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Job Configuration
          </CardTitle>
          <CardDescription>Configure your workload parameters for scheduling optimization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobName">Job Name</Label>
              <Input
                id="jobName"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="Enter job name"
              />
            </div>

            <div className="space-y-2">
              <Label>Accelerator</Label>
              <Select value={selectedAccelerator} onValueChange={setSelectedAccelerator}>
                <SelectTrigger>
                  <SelectValue placeholder="Select accelerator" />
                </SelectTrigger>
                <SelectContent>
                  {accelerators.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.model} ({acc.vendor})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Device Count: {deviceCount[0]}</Label>
              <Slider
                value={deviceCount}
                onValueChange={setDeviceCount}
                min={1}
                max={64}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (hours): {durationHours[0]}</Label>
              <Slider
                value={durationHours}
                onValueChange={setDurationHours}
                min={1}
                max={168}
                step={1}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-2">
              <Label>Optimization Priority</Label>
              <div className="flex gap-2">
                <Button
                  variant={priority === "cost" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority("cost")}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Cost
                </Button>
                <Button
                  variant={priority === "carbon" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority("carbon")}
                >
                  <Leaf className="h-4 w-4 mr-1" />
                  Carbon
                </Button>
                <Button
                  variant={priority === "balanced" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriority("balanced")}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Balanced
                </Button>
              </div>
            </div>

            <Button onClick={analyzeSchedule} disabled={analyzing} className="ml-auto">
              {analyzing ? "Analyzing..." : "Analyze Schedule"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carbon Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            24-Hour Carbon Intensity Forecast
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4">
              <span>Region:</span>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((fac) => (
                    <SelectItem key={fac.region_code} value={fac.region_code}>
                      {fac.region_name} ({fac.region_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" className="text-xs" />
                <YAxis yAxisId="carbon" orientation="left" className="text-xs" />
                <YAxis yAxisId="price" orientation="right" className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "Carbon Intensity") return [`${value} kg CO₂/kWh`, name];
                    if (name === "Spot Price") return [`${value}x`, name];
                    if (name === "Renewable %") return [`${value}%`, name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Area
                  yAxisId="carbon"
                  type="monotone"
                  dataKey="renewablePct"
                  name="Renewable %"
                  fill="hsl(var(--chart-2))"
                  stroke="hsl(var(--chart-2))"
                  fillOpacity={0.2}
                />
                <Line
                  yAxisId="carbon"
                  type="monotone"
                  dataKey="carbonIntensity"
                  name="Carbon Intensity"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                />
                <Bar
                  yAxisId="price"
                  dataKey="spotPriceMultiplier"
                  name="Spot Price"
                  fill="hsl(var(--primary))"
                  opacity={0.5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Time slot recommendations */}
          <div className="mt-4 grid grid-cols-12 gap-1">
            {forecast.map((slot) => (
              <div
                key={slot.hour}
                className="text-center p-2 rounded text-xs"
                style={{ backgroundColor: getRecommendationColor(slot.recommendation) + "20" }}
                title={`${slot.label}: ${slot.recommendation}`}
              >
                <div className="font-medium">{slot.hour}</div>
                <div
                  className="w-2 h-2 rounded-full mx-auto mt-1"
                  style={{ backgroundColor: getRecommendationColor(slot.recommendation) }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
              Excellent
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--primary))" }} />
              Good
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
              Fair
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(var(--destructive))" }} />
              Avoid
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Region Recommendations
            </CardTitle>
            <CardDescription>
              Ranked by sustainability score (priority: {priority})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Cost Savings</TableHead>
                  <TableHead className="text-right">Carbon Savings</TableHead>
                  <TableHead>Best Hours</TableHead>
                  <TableHead>Metrics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <TableRow key={rec.region.id}>
                    <TableCell>
                      <Badge variant={idx === 0 ? "default" : "outline"}>#{idx + 1}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{rec.region.region_name}</div>
                          <div className="text-xs text-muted-foreground">{rec.region.region_code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${rec.score}%` }}
                          />
                        </div>
                        <span className="text-sm">{Math.round(rec.score)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-emerald-500">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">${rec.estimatedSavings.costUsd}</span>
                        <span className="text-xs text-muted-foreground">
                          ({rec.estimatedSavings.costPct}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 text-emerald-500">
                        <Leaf className="h-3 w-3" />
                        <span className="font-medium">{rec.estimatedSavings.carbonKg} kg</span>
                        <span className="text-xs text-muted-foreground">
                          ({rec.estimatedSavings.carbonPct}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {rec.optimalSlots.slice(0, 4).map((slot) => (
                          <Badge key={slot.hour} variant="secondary" className="text-xs">
                            {slot.label}
                          </Badge>
                        ))}
                        {rec.optimalSlots.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{rec.optimalSlots.length - 4}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>PUE: {rec.region.pue}</span>
                        <span>•</span>
                        <span>{rec.region.renewable_pct}% renewable</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Best Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations[0]?.region.region_name}</div>
              <p className="text-xs text-muted-foreground">
                Score: {Math.round(recommendations[0]?.score || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Max Cost Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                ${recommendations[0]?.estimatedSavings.costUsd}
              </div>
              <p className="text-xs text-muted-foreground">
                {recommendations[0]?.estimatedSavings.costPct}% vs worst timing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-500" />
                Max Carbon Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {recommendations[0]?.estimatedSavings.carbonKg} kg
              </div>
              <p className="text-xs text-muted-foreground">
                {recommendations[0]?.estimatedSavings.carbonPct}% reduction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Optimal Start Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recommendations[0]?.optimalSlots[0]?.label || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {recommendations[0]?.optimalSlots[0]?.recommendation} window
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
