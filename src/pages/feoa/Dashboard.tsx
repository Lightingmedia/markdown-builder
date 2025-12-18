import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
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
} from "recharts";
import { Zap, Cpu, DollarSign, Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Mock data for initial display
const energyData = [
  { time: "00:00", consumption: 45 },
  { time: "04:00", consumption: 38 },
  { time: "08:00", consumption: 72 },
  { time: "12:00", consumption: 85 },
  { time: "16:00", consumption: 78 },
  { time: "20:00", consumption: 62 },
  { time: "24:00", consumption: 48 },
];

const driversData = [
  { name: "GPU Inference", value: 42 },
  { name: "HVAC", value: 28 },
  { name: "Cooling", value: 15 },
  { name: "Lighting", value: 10 },
  { name: "Other", value: 5 },
];

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact_level: string;
  status: string;
  created_at: string;
}

export default function FeoaDashboard() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [metrics, setMetrics] = useState({
    energyScore: 12.5,
    gpuEfficiency: 85,
    projectedSavings: 1200,
    loadStatus: "Optimal",
  });

  useEffect(() => {
    const fetchRecommendations = async () => {
      const { data } = await supabase
        .from("recommendations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setRecommendations(data);
    };

    fetchRecommendations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("recommendations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "recommendations" },
        () => fetchRecommendations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  return (
    <div className="space-y-6">
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
            <div className="text-3xl font-bold">{metrics.energyScore}</div>
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
            <div className="text-3xl font-bold">{metrics.gpuEfficiency}%</div>
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
            <div className="text-3xl font-bold">${metrics.projectedSavings.toLocaleString()}</div>
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
              <LineChart data={energyData}>
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
    </div>
  );
}
