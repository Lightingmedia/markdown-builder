import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { Cpu, Zap, Droplets, Leaf, DollarSign, Activity } from "lucide-react";

interface AcceleratorSpec {
  id: string;
  vendor: string;
  model: string;
  arch: string;
  memory_gb: number;
  mem_bandwidth_gbps: number;
  peak_fp16_tflops: number;
  tdp_w: number;
}

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

interface Benchmark {
  id: string;
  workload_type: string;
  model_name: string;
  tokens_per_second: number;
  avg_power_w_per_device: number;
  energy_kwh_total: number;
  accelerator?: { model: string };
}

export default function OptimizationDashboard() {
  const [accelerators, setAccelerators] = useState<AcceleratorSpec[]>([]);
  const [facilities, setFacilities] = useState<FacilityCoefficient[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, facRes, benchRes] = await Promise.all([
        supabase.from("accelerator_specs").select("*").order("peak_fp16_tflops", { ascending: false }),
        supabase.from("facility_coefficients").select("*").order("grid_co2_kg_per_kwh", { ascending: true }),
        supabase.from("benchmarks").select(`*, accelerator:accelerator_specs(model)`),
      ]);

      if (accRes.data) setAccelerators(accRes.data);
      if (facRes.data) setFacilities(facRes.data);
      if (benchRes.data) setBenchmarks(benchRes.data as Benchmark[]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const acceleratorChartData = accelerators.map((acc) => ({
    name: acc.model,
    tflops: acc.peak_fp16_tflops,
    memory: acc.memory_gb,
    tdp: acc.tdp_w,
    efficiency: Math.round((acc.peak_fp16_tflops / acc.tdp_w) * 100) / 100,
  }));

  const facilityRadarData = facilities.map((fac) => ({
    region: fac.region_code,
    pue: (2 - fac.pue) * 100, // Invert so lower is better
    wue: Math.max(0, 100 - fac.wue_l_per_kwh * 40),
    carbon: Math.max(0, 100 - fac.grid_co2_kg_per_kwh * 150),
    renewable: fac.renewable_pct,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Calculate summary stats
  const bestEfficiencyAccel = accelerators.reduce((best, acc) => {
    const eff = acc.peak_fp16_tflops / acc.tdp_w;
    const bestEff = best.peak_fp16_tflops / best.tdp_w;
    return eff > bestEff ? acc : best;
  }, accelerators[0]);

  const greenestFacility = facilities.reduce((best, fac) => 
    fac.grid_co2_kg_per_kwh < best.grid_co2_kg_per_kwh ? fac : best
  , facilities[0]);

  const totalBenchmarks = benchmarks.length;
  const avgTokensPerSecond = benchmarks.length > 0
    ? Math.round(benchmarks.reduce((sum, b) => sum + (b.tokens_per_second || 0), 0) / benchmarks.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Infrastructure Optimization Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and compare AI accelerators, regions, and benchmarks for optimal efficiency
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Best Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestEfficiencyAccel?.model}</div>
            <p className="text-xs text-muted-foreground">
              {((bestEfficiencyAccel?.peak_fp16_tflops || 0) / (bestEfficiencyAccel?.tdp_w || 1)).toFixed(2)} TFLOPS/W
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Greenest Region</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{greenestFacility?.region_name}</div>
            <p className="text-xs text-muted-foreground">
              {greenestFacility?.grid_co2_kg_per_kwh} kg CO₂/kWh • {greenestFacility?.renewable_pct}% renewable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accelerators</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accelerators.length}</div>
            <p className="text-xs text-muted-foreground">
              {accelerators.filter(a => a.vendor === 'nvidia').length} NVIDIA, 
              {accelerators.filter(a => a.vendor === 'google').length} TPU
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTokensPerSecond}</div>
            <p className="text-xs text-muted-foreground">
              tokens/sec across {totalBenchmarks} benchmarks
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accelerators" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accelerators">Accelerators</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="accelerators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accelerator Performance Comparison</CardTitle>
              <CardDescription>TFLOPS, Memory, TDP, and Efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={acceleratorChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="tflops" name="TFLOPS (FP16)" fill="hsl(var(--primary))" />
                    <Bar dataKey="efficiency" name="TFLOPS/W" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accelerator Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Arch</TableHead>
                    <TableHead className="text-right">Memory (GB)</TableHead>
                    <TableHead className="text-right">TFLOPS</TableHead>
                    <TableHead className="text-right">TDP (W)</TableHead>
                    <TableHead className="text-right">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accelerators.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-medium">{acc.model}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{acc.vendor}</Badge>
                      </TableCell>
                      <TableCell>{acc.arch}</TableCell>
                      <TableCell className="text-right">{acc.memory_gb}</TableCell>
                      <TableCell className="text-right">{acc.peak_fp16_tflops}</TableCell>
                      <TableCell className="text-right">{acc.tdp_w}</TableCell>
                      <TableCell className="text-right">
                        {(acc.peak_fp16_tflops / acc.tdp_w).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Region Sustainability Comparison</CardTitle>
              <CardDescription>PUE, WUE, Carbon intensity, and Renewable %</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={facilityRadarData}>
                    <PolarGrid className="stroke-border" />
                    <PolarAngleAxis dataKey="region" className="text-xs" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Score (higher is better)"
                      dataKey="renewable"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.5}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facility Coefficients</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">PUE</TableHead>
                    <TableHead className="text-right">WUE (L/kWh)</TableHead>
                    <TableHead className="text-right">CO₂ (kg/kWh)</TableHead>
                    <TableHead className="text-right">Renewable %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilities.map((fac) => (
                    <TableRow key={fac.id}>
                      <TableCell className="font-medium">{fac.region_code}</TableCell>
                      <TableCell>{fac.region_name}</TableCell>
                      <TableCell className="text-right">{fac.pue}</TableCell>
                      <TableCell className="text-right">{fac.wue_l_per_kwh}</TableCell>
                      <TableCell className="text-right">{fac.grid_co2_kg_per_kwh}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={fac.renewable_pct >= 90 ? "default" : "secondary"}>
                          {fac.renewable_pct}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benchmark Results</CardTitle>
              <CardDescription>Performance measurements across workloads</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Accelerator</TableHead>
                    <TableHead>Workload</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Tokens/sec</TableHead>
                    <TableHead className="text-right">Power (W)</TableHead>
                    <TableHead className="text-right">Energy (kWh)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benchmarks.map((bench) => (
                    <TableRow key={bench.id}>
                      <TableCell className="font-medium">{bench.accelerator?.model || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bench.workload_type}</Badge>
                      </TableCell>
                      <TableCell>{bench.model_name}</TableCell>
                      <TableCell className="text-right">{bench.tokens_per_second}</TableCell>
                      <TableCell className="text-right">{bench.avg_power_w_per_device}</TableCell>
                      <TableCell className="text-right">{bench.energy_kwh_total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
