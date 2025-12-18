import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Zap, Factory, Brain, Scale, TrendingDown } from "lucide-react";

interface ComparisonData {
  facilityEnergy: number;
  aiTrainingEnergy: number;
}

export default function EnergyComparisonTool() {
  const [facilityEnergy, setFacilityEnergy] = useState(0);
  const [aiTrainingEnergy, setAiTrainingEnergy] = useState(0);
  const [scaleFactor, setScaleFactor] = useState([1]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnergyData = async () => {
      setIsLoading(true);

      // Fetch facility telemetry energy
      const { data: telemetry } = await supabase
        .from("raw_telemetry")
        .select("gpu_wattage")
        .limit(100);

      if (telemetry && telemetry.length > 0) {
        const totalWattHours = telemetry.reduce(
          (sum, t) => sum + (Number(t.gpu_wattage) || 0),
          0
        );
        setFacilityEnergy(totalWattHours / 1000); // Convert to kWh
      }

      // Fetch AI training energy
      const { data: trainingData } = await supabase
        .from("ai_training_costs" as any)
        .select("energy_kwh");

      if (trainingData && trainingData.length > 0) {
        const totalEnergy = (trainingData as any[]).reduce(
          (sum, t) => sum + (Number(t.energy_kwh) || 0),
          0
        );
        setAiTrainingEnergy(totalEnergy);
      }

      setIsLoading(false);
    };

    fetchEnergyData();
  }, []);

  const scaledFacilityEnergy = facilityEnergy * scaleFactor[0] * 365; // Annual
  const scaledAiTrainingEnergy = aiTrainingEnergy;

  const comparisonData = [
    {
      category: "Annual Facility",
      energy: Math.round(scaledFacilityEnergy),
      fill: "hsl(var(--primary))",
    },
    {
      category: "AI Training (Total)",
      energy: Math.round(scaledAiTrainingEnergy / 1000), // Convert to MWh
      fill: "hsl(var(--destructive))",
    },
  ];

  const detailedComparison = [
    {
      metric: "Daily Operations",
      facility: Math.round(facilityEnergy * scaleFactor[0]),
      training: Math.round(scaledAiTrainingEnergy / 365 / 1000),
    },
    {
      metric: "Weekly Operations",
      facility: Math.round(facilityEnergy * scaleFactor[0] * 7),
      training: Math.round((scaledAiTrainingEnergy / 52) / 1000),
    },
    {
      metric: "Monthly Operations",
      facility: Math.round(facilityEnergy * scaleFactor[0] * 30),
      training: Math.round((scaledAiTrainingEnergy / 12) / 1000),
    },
    {
      metric: "Annual Operations",
      facility: Math.round(scaledFacilityEnergy),
      training: Math.round(scaledAiTrainingEnergy / 1000),
    },
  ];

  const ratio = scaledAiTrainingEnergy > 0 && scaledFacilityEnergy > 0
    ? (scaledAiTrainingEnergy / 1000) / scaledFacilityEnergy
    : 0;

  const getEfficiencyBadge = () => {
    if (ratio < 10) return { label: "Efficient", variant: "default" as const };
    if (ratio < 50) return { label: "Moderate", variant: "secondary" as const };
    return { label: "High Impact", variant: "destructive" as const };
  };

  const efficiency = getEfficiencyBadge();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Energy Comparison Tool
              </CardTitle>
              <CardDescription>
                Benchmark facility energy consumption vs AI training costs
              </CardDescription>
            </div>
            <Badge variant={efficiency.variant}>{efficiency.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scale Control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Facility Scale Factor</span>
              <span className="text-sm text-muted-foreground">{scaleFactor[0]}x</span>
            </div>
            <Slider
              value={scaleFactor}
              onValueChange={setScaleFactor}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Adjust to simulate multiple facilities or increased operations
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Factory className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Facility Energy</span>
                </div>
                <div className="text-2xl font-bold">
                  {scaledFacilityEnergy.toLocaleString()} kWh
                </div>
                <p className="text-xs text-muted-foreground">Annual estimate</p>
              </CardContent>
            </Card>

            <Card className="border-destructive/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">AI Training Energy</span>
                </div>
                <div className="text-2xl font-bold">
                  {(scaledAiTrainingEnergy / 1000000).toFixed(1)} GWh
                </div>
                <p className="text-xs text-muted-foreground">Total training costs</p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Ratio</span>
                </div>
                <div className="text-2xl font-bold">
                  {ratio > 0 ? `${ratio.toFixed(0)}:1` : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">AI vs Facility</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Energy Breakdown (MWh)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={detailedComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar
                dataKey="facility"
                name="Facility (kWh)"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="training"
                name="AI Training (MWh)"
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm">
                <strong>Scale Comparison:</strong> AI model training typically consumes{" "}
                <span className="text-destructive font-semibold">
                  {ratio > 0 ? `${ratio.toFixed(0)}x` : "significantly"} more
                </span>{" "}
                energy than annual facility operations.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm">
                <strong>Cost Implication:</strong> Training a single large AI model can cost
                as much as running your facility for{" "}
                <span className="text-primary font-semibold">
                  {ratio > 0 ? Math.round(ratio / 12) : "multiple"} years
                </span>
                .
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm">
                <strong>Recommendation:</strong> Consider photonic computing solutions
                to reduce AI training energy by up to{" "}
                <span className="text-primary font-semibold">100x</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
