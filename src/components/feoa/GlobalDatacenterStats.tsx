import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
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
import { Building2, Globe, Database, Server } from "lucide-react";

interface DatacenterStats {
  id: string;
  region: string;
  country: string;
  total_datacenters: number;
  datacenters_with_metrics: number | null;
  available_grosspower_data: number | null;
  available_whitespace_data: number | null;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(142 76% 36%)",
  "hsl(221 83% 53%)",
  "hsl(262 83% 58%)",
  "hsl(0 84% 60%)",
  "hsl(47 96% 53%)",
  "hsl(280 67% 55%)",
];

export default function GlobalDatacenterStats() {
  const [stats, setStats] = useState<DatacenterStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("global_datacenter_stats")
        .select("*")
        .order("total_datacenters", { ascending: false });

      if (data && !error) {
        setStats(data);
      }
      setIsLoading(false);
    };

    fetchStats();
  }, []);

  // Aggregate by region
  const regionData = stats.reduce((acc, stat) => {
    const region = stat.region;
    if (!acc[region]) {
      acc[region] = { name: region, count: 0, countries: 0 };
    }
    acc[region].count += stat.total_datacenters;
    acc[region].countries += 1;
    return acc;
  }, {} as Record<string, { name: string; count: number; countries: number }>);

  const regionChartData = Object.values(regionData)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Top countries
  const topCountries = stats.slice(0, 10);

  // Totals
  const totalDatacenters = stats.reduce((sum, s) => sum + s.total_datacenters, 0);
  const totalCountries = stats.length;
  const totalWithMetrics = stats.reduce((sum, s) => sum + (s.datacenters_with_metrics || 0), 0);
  const totalPower = stats.reduce((sum, s) => sum + (s.available_grosspower_data || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Datacenters
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalDatacenters.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Worldwide facilities</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Countries
            </CardTitle>
            <Globe className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCountries}</div>
            <p className="text-xs text-muted-foreground">With datacenters</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Metrics
            </CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalWithMetrics.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Reporting data</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Power Data Available
            </CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPower.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Facilities with power metrics</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Datacenters by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === "count" ? "Datacenters" : name,
                  ]}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ name }) => name}
                >
                  {regionChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [value.toLocaleString(), "Datacenters"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Countries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries by Datacenter Count</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px]">
            <div className="space-y-2">
              {topCountries.map((country, index) => (
                <div
                  key={country.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/20 text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{country.country}</p>
                      <p className="text-xs text-muted-foreground">{country.region}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">{country.total_datacenters.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    {country.datacenters_with_metrics && country.datacenters_with_metrics > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {country.datacenters_with_metrics} with metrics
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
