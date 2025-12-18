import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Zap, Droplets, DollarSign, Leaf, TrendingDown } from "lucide-react";

// Industry average power consumption per accelerator (Watts)
const ACCELERATOR_SPECS = {
  lightrail: { name: "LightRail Photonic", watts: 3.5, waterLiters: 0, color: "hsl(var(--primary))" },
  nvidia_a100: { name: "NVIDIA A100", watts: 400, waterLiters: 12, color: "hsl(142 76% 36%)" },
  nvidia_h100: { name: "NVIDIA H100", watts: 700, waterLiters: 18, color: "hsl(142 60% 30%)" },
  google_tpu_v4: { name: "Google TPU v4", watts: 275, waterLiters: 8, color: "hsl(221 83% 53%)" },
  amd_mi300x: { name: "AMD MI300X", watts: 750, waterLiters: 20, color: "hsl(0 84% 60%)" },
};

// Average electricity cost per kWh (USD)
const ELECTRICITY_COST = 0.12;
// CO2 per kWh (kg) - US grid average
const CO2_PER_KWH = 0.42;
// Hours per month
const HOURS_PER_MONTH = 730;

interface EfficiencyComparisonProps {
  currentVendorStats?: {
    nvidia: { avgWattage: number };
    google_tpu: { avgWattage: number };
    amd: { avgWattage: number };
  };
}

export default function EfficiencyComparison({ currentVendorStats }: EfficiencyComparisonProps) {
  const [acceleratorCount, setAcceleratorCount] = useState([100]);
  const [utilizationRate, setUtilizationRate] = useState([80]);

  const count = acceleratorCount[0];
  const utilization = utilizationRate[0] / 100;

  // Calculate metrics for each accelerator
  const comparisonData = useMemo(() => {
    return Object.entries(ACCELERATOR_SPECS).map(([key, spec]) => {
      const monthlyKwh = (spec.watts * count * HOURS_PER_MONTH * utilization) / 1000;
      const monthlyCost = monthlyKwh * ELECTRICITY_COST;
      const monthlyWater = spec.waterLiters * count * HOURS_PER_MONTH * utilization;
      const monthlyCO2 = monthlyKwh * CO2_PER_KWH;

      return {
        id: key,
        name: spec.name,
        watts: spec.watts,
        monthlyKwh: Math.round(monthlyKwh),
        monthlyCost: Math.round(monthlyCost),
        monthlyWater: Math.round(monthlyWater),
        monthlyCO2: Math.round(monthlyCO2),
        color: spec.color,
      };
    });
  }, [count, utilization]);

  // Calculate savings vs LightRail
  const lightrailData = comparisonData.find(d => d.id === "lightrail")!;
  
  const savingsData = comparisonData
    .filter(d => d.id !== "lightrail")
    .map(d => ({
      name: d.name.replace("NVIDIA ", "").replace("Google ", "").replace("AMD ", ""),
      costSavings: d.monthlyCost - lightrailData.monthlyCost,
      energySavings: d.monthlyKwh - lightrailData.monthlyKwh,
      waterSavings: d.monthlyWater - lightrailData.monthlyWater,
      co2Savings: d.monthlyCO2 - lightrailData.monthlyCO2,
      color: d.color,
    }));

  // Multi-year projections
  const yearlyProjections = useMemo(() => {
    const years = [1, 3, 5];
    return years.map(year => {
      const projections: Record<string, number> = { year };
      comparisonData.forEach(d => {
        projections[d.name] = d.monthlyCost * 12 * year;
      });
      return projections;
    });
  }, [comparisonData]);

  // Carbon footprint comparison
  const carbonData = comparisonData.map(d => ({
    name: d.name.replace("NVIDIA ", "").replace("Google ", "").replace("AMD ", ""),
    co2: d.monthlyCO2,
    color: d.color,
  }));

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Efficiency Comparison Calculator
          </CardTitle>
          <CardDescription>
            Compare LightRail Photonic vs traditional accelerators. Adjust parameters to see real savings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Number of Accelerators: {count}</Label>
              <Slider
                value={acceleratorCount}
                onValueChange={setAcceleratorCount}
                min={10}
                max={1000}
                step={10}
              />
              <p className="text-xs text-muted-foreground">Typical data center: 100-500 units</p>
            </div>
            <div className="space-y-3">
              <Label>Utilization Rate: {utilizationRate[0]}%</Label>
              <Slider
                value={utilizationRate}
                onValueChange={setUtilizationRate}
                min={20}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">Industry average: 60-80%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Monthly Cost Savings
            </div>
            <div className="text-2xl font-bold text-primary">
              ${Math.max(...savingsData.map(d => d.costSavings)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">vs highest cost option</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Zap className="h-4 w-4" />
              Energy Savings
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.max(...savingsData.map(d => d.energySavings)).toLocaleString()} kWh
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Droplets className="h-4 w-4" />
              Water Savings
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.max(...savingsData.map(d => d.waterSavings)).toLocaleString()} L
            </div>
            <p className="text-xs text-muted-foreground">per month (100% reduction)</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Leaf className="h-4 w-4" />
              CO₂ Avoided
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.max(...savingsData.map(d => d.co2Savings)).toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cost" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cost">Cost Comparison</TabsTrigger>
          <TabsTrigger value="projections">5-Year Projections</TabsTrigger>
          <TabsTrigger value="carbon">Carbon Footprint</TabsTrigger>
          <TabsTrigger value="power">Power Consumption</TabsTrigger>
        </TabsList>

        <TabsContent value="cost" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Operating Cost by Accelerator</CardTitle>
              <CardDescription>
                Based on {count} units at {utilizationRate[0]}% utilization, ${ELECTRICITY_COST}/kWh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={130} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}/month`, "Cost"]}
                  />
                  <Bar dataKey="monthlyCost" radius={[0, 4, 4, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground">LightRail Advantage</Badge>
                </div>
                <p className="text-sm">
                  LightRail Photonic costs <span className="font-bold text-primary">${lightrailData.monthlyCost.toLocaleString()}/month</span> compared to 
                  traditional accelerators costing <span className="font-bold">${Math.max(...comparisonData.filter(d => d.id !== "lightrail").map(d => d.monthlyCost)).toLocaleString()}/month</span>.
                  That's a <span className="font-bold text-primary">
                    {Math.round((1 - lightrailData.monthlyCost / Math.max(...comparisonData.filter(d => d.id !== "lightrail").map(d => d.monthlyCost))) * 100)}% reduction
                  </span> in energy costs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                Cumulative Cost Over Time
              </CardTitle>
              <CardDescription>
                Total energy cost projections over 1, 3, and 5 years
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={yearlyProjections}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `Year ${v}`} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  {comparisonData.map((d) => (
                    <Line
                      key={d.name}
                      type="monotone"
                      dataKey={d.name}
                      stroke={d.color}
                      strokeWidth={d.id === "lightrail" ? 3 : 2}
                      dot={{ fill: d.color }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[1, 3, 5].map((year) => {
                  const lightrailCost = lightrailData.monthlyCost * 12 * year;
                  const maxOtherCost = Math.max(...comparisonData.filter(d => d.id !== "lightrail").map(d => d.monthlyCost)) * 12 * year;
                  const savings = maxOtherCost - lightrailCost;
                  return (
                    <Card key={year} className="border-primary/20">
                      <CardContent className="pt-4 text-center">
                        <p className="text-sm text-muted-foreground">{year}-Year Savings</p>
                        <p className="text-2xl font-bold text-primary">${savings.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbon" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                Carbon Footprint Calculator
              </CardTitle>
              <CardDescription>
                Monthly CO₂ emissions by accelerator type (based on {CO2_PER_KWH} kg CO₂/kWh US grid average)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={carbonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v.toLocaleString()} kg`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} kg CO₂/month`, "Emissions"]}
                  />
                  <Bar dataKey="co2" radius={[4, 4, 0, 0]}>
                    {carbonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Annual CO₂ Avoided with LightRail</p>
                    <p className="text-3xl font-bold text-primary">
                      {(Math.max(...savingsData.map(d => d.co2Savings)) * 12).toLocaleString()} kg
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Equivalent to {Math.round(Math.max(...savingsData.map(d => d.co2Savings)) * 12 / 21.7)} trees planted
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Water Saved Annually</p>
                    <p className="text-3xl font-bold text-primary">
                      {(Math.max(...savingsData.map(d => d.waterSavings)) * 12).toLocaleString()} L
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Zero water cooling required
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="power" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Power Consumption per Accelerator (Watts)</CardTitle>
              <CardDescription>
                Rated TDP (Thermal Design Power) comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="hsl(var(--muted-foreground))" unit="W" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}W`, "Power"]}
                  />
                  <Bar dataKey="watts" radius={[4, 4, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
                <p className="text-sm">
                  <span className="font-bold text-primary">LightRail Photonic: 3.5W</span> — Uses photonic computing to achieve 
                  <span className="font-bold"> 100x better energy efficiency</span> than traditional GPU/TPU accelerators. 
                  No water cooling required.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
