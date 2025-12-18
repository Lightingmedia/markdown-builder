import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calculator, Server, Wrench, Snowflake, DollarSign, TrendingDown, Zap, Building2, Rocket, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface TcoInputs {
  // Hardware
  serverCount: number;
  gpuPerServer: number;
  gpuUnitCost: number;
  serverLifespan: number;
  
  // Maintenance
  itStaffCost: number;
  annualMaintenancePct: number;
  downtimeCostPerHour: number;
  expectedDowntimeHours: number;
  
  // Cooling & Power
  powerPerGpu: number;
  pueRatio: number;
  electricityRate: number;
  coolingInfrastructureCost: number;
}

const defaultTraditional: TcoInputs = {
  serverCount: 100,
  gpuPerServer: 8,
  gpuUnitCost: 30000,
  serverLifespan: 5,
  itStaffCost: 500000,
  annualMaintenancePct: 15,
  downtimeCostPerHour: 10000,
  expectedDowntimeHours: 48,
  powerPerGpu: 400,
  pueRatio: 1.6,
  electricityRate: 0.12,
  coolingInfrastructureCost: 2000000,
};

const lightRailMultipliers = {
  gpuUnitCost: 0.4,
  powerPerGpu: 0.01,
  pueRatio: 1.05,
  annualMaintenancePct: 0.5,
  expectedDowntimeHours: 0.1,
  coolingInfrastructureCost: 0.1,
};

type ScenarioKey = "startup" | "enterprise" | "hyperscaler" | "custom";

const scenarioPresets: Record<Exclude<ScenarioKey, "custom">, { name: string; description: string; icon: typeof Rocket; inputs: TcoInputs }> = {
  startup: {
    name: "Small Startup",
    description: "10-50 GPUs, lean team",
    icon: Rocket,
    inputs: {
      serverCount: 5,
      gpuPerServer: 4,
      gpuUnitCost: 25000,
      serverLifespan: 4,
      itStaffCost: 150000,
      annualMaintenancePct: 12,
      downtimeCostPerHour: 2000,
      expectedDowntimeHours: 24,
      powerPerGpu: 350,
      pueRatio: 1.8,
      electricityRate: 0.14,
      coolingInfrastructureCost: 100000,
    },
  },
  enterprise: {
    name: "Enterprise",
    description: "500-2000 GPUs, dedicated ops",
    icon: Building2,
    inputs: {
      serverCount: 100,
      gpuPerServer: 8,
      gpuUnitCost: 30000,
      serverLifespan: 5,
      itStaffCost: 500000,
      annualMaintenancePct: 15,
      downtimeCostPerHour: 10000,
      expectedDowntimeHours: 48,
      powerPerGpu: 400,
      pueRatio: 1.6,
      electricityRate: 0.12,
      coolingInfrastructureCost: 2000000,
    },
  },
  hyperscaler: {
    name: "Hyperscaler",
    description: "10,000+ GPUs, global scale",
    icon: Globe,
    inputs: {
      serverCount: 1000,
      gpuPerServer: 8,
      gpuUnitCost: 35000,
      serverLifespan: 5,
      itStaffCost: 2000000,
      annualMaintenancePct: 18,
      downtimeCostPerHour: 100000,
      expectedDowntimeHours: 72,
      powerPerGpu: 500,
      pueRatio: 1.4,
      electricityRate: 0.08,
      coolingInfrastructureCost: 50000000,
    },
  },
};

export function TcoCalculator() {
  const [inputs, setInputs] = useState<TcoInputs>(scenarioPresets.enterprise.inputs);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("enterprise");

  const updateInput = (key: keyof TcoInputs, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
    setActiveScenario("custom");
  };

  const applyPreset = (key: Exclude<ScenarioKey, "custom">) => {
    setInputs(scenarioPresets[key].inputs);
    setActiveScenario(key);
  };

  const calculations = useMemo(() => {
    const totalGpus = inputs.serverCount * inputs.gpuPerServer;
    
    // Traditional TCO
    const tradHardwareCost = totalGpus * inputs.gpuUnitCost;
    const tradAnnualMaintenance = tradHardwareCost * (inputs.annualMaintenancePct / 100);
    const tradDowntimeCost = inputs.downtimeCostPerHour * inputs.expectedDowntimeHours;
    const tradTotalPowerKw = (totalGpus * inputs.powerPerGpu * inputs.pueRatio) / 1000;
    const tradAnnualPowerCost = tradTotalPowerKw * 8760 * inputs.electricityRate;
    const tradCoolingCost = inputs.coolingInfrastructureCost;
    const tradItStaff = inputs.itStaffCost;
    
    const tradYear1 = tradHardwareCost + tradCoolingCost + tradAnnualMaintenance + tradAnnualPowerCost + tradDowntimeCost + tradItStaff;
    const tradAnnualRecurring = tradAnnualMaintenance + tradAnnualPowerCost + tradDowntimeCost + tradItStaff;
    const trad5YearTco = tradYear1 + (tradAnnualRecurring * 4);
    
    // LightRail TCO
    const lrHardwareCost = totalGpus * (inputs.gpuUnitCost * lightRailMultipliers.gpuUnitCost);
    const lrAnnualMaintenance = lrHardwareCost * (inputs.annualMaintenancePct * lightRailMultipliers.annualMaintenancePct / 100);
    const lrDowntimeCost = inputs.downtimeCostPerHour * (inputs.expectedDowntimeHours * lightRailMultipliers.expectedDowntimeHours);
    const lrTotalPowerKw = (totalGpus * (inputs.powerPerGpu * lightRailMultipliers.powerPerGpu) * lightRailMultipliers.pueRatio) / 1000;
    const lrAnnualPowerCost = lrTotalPowerKw * 8760 * inputs.electricityRate;
    const lrCoolingCost = inputs.coolingInfrastructureCost * lightRailMultipliers.coolingInfrastructureCost;
    const lrItStaff = inputs.itStaffCost * 0.7;
    
    const lrYear1 = lrHardwareCost + lrCoolingCost + lrAnnualMaintenance + lrAnnualPowerCost + lrDowntimeCost + lrItStaff;
    const lrAnnualRecurring = lrAnnualMaintenance + lrAnnualPowerCost + lrDowntimeCost + lrItStaff;
    const lr5YearTco = lrYear1 + (lrAnnualRecurring * 4);
    
    const totalSavings = trad5YearTco - lr5YearTco;
    const savingsPercentage = ((trad5YearTco - lr5YearTco) / trad5YearTco) * 100;
    
    return {
      traditional: {
        hardware: tradHardwareCost,
        maintenance: tradAnnualMaintenance * 5,
        downtime: tradDowntimeCost * 5,
        power: tradAnnualPowerCost * 5,
        cooling: tradCoolingCost,
        staff: tradItStaff * 5,
        year1: tradYear1,
        total5Year: trad5YearTco,
      },
      lightRail: {
        hardware: lrHardwareCost,
        maintenance: lrAnnualMaintenance * 5,
        downtime: lrDowntimeCost * 5,
        power: lrAnnualPowerCost * 5,
        cooling: lrCoolingCost,
        staff: lrItStaff * 5,
        year1: lrYear1,
        total5Year: lr5YearTco,
      },
      totalSavings,
      savingsPercentage,
      totalGpus,
    };
  }, [inputs]);

  const comparisonData = [
    { category: "Hardware", Traditional: calculations.traditional.hardware / 1000000, LightRail: calculations.lightRail.hardware / 1000000 },
    { category: "Maintenance", Traditional: calculations.traditional.maintenance / 1000000, LightRail: calculations.lightRail.maintenance / 1000000 },
    { category: "Power", Traditional: calculations.traditional.power / 1000000, LightRail: calculations.lightRail.power / 1000000 },
    { category: "Cooling", Traditional: calculations.traditional.cooling / 1000000, LightRail: calculations.lightRail.cooling / 1000000 },
    { category: "Downtime", Traditional: calculations.traditional.downtime / 1000000, LightRail: calculations.lightRail.downtime / 1000000 },
    { category: "IT Staff", Traditional: calculations.traditional.staff / 1000000, LightRail: calculations.lightRail.staff / 1000000 },
  ];

  const pieDataTraditional = [
    { name: "Hardware", value: calculations.traditional.hardware, color: "hsl(var(--destructive))" },
    { name: "Power", value: calculations.traditional.power, color: "hsl(var(--chart-1))" },
    { name: "Cooling", value: calculations.traditional.cooling, color: "hsl(var(--chart-2))" },
    { name: "Maintenance", value: calculations.traditional.maintenance, color: "hsl(var(--chart-3))" },
    { name: "Staff", value: calculations.traditional.staff, color: "hsl(var(--chart-4))" },
  ];

  const pieDataLightRail = [
    { name: "Hardware", value: calculations.lightRail.hardware, color: "hsl(var(--primary))" },
    { name: "Power", value: calculations.lightRail.power, color: "hsl(var(--chart-1))" },
    { name: "Cooling", value: calculations.lightRail.cooling, color: "hsl(var(--chart-2))" },
    { name: "Maintenance", value: calculations.lightRail.maintenance, color: "hsl(var(--chart-3))" },
    { name: "Staff", value: calculations.lightRail.staff, color: "hsl(var(--chart-4))" },
  ];

  const yearlyData = Array.from({ length: 5 }, (_, i) => ({
    year: `Year ${i + 1}`,
    Traditional: i === 0 ? calculations.traditional.year1 / 1000000 : (calculations.traditional.total5Year - calculations.traditional.year1) / 4 / 1000000 + (i === 0 ? calculations.traditional.year1 / 1000000 : 0),
    LightRail: i === 0 ? calculations.lightRail.year1 / 1000000 : (calculations.lightRail.total5Year - calculations.lightRail.year1) / 4 / 1000000 + (i === 0 ? calculations.lightRail.year1 / 1000000 : 0),
  }));

  const cumulativeData = Array.from({ length: 5 }, (_, i) => {
    const tradYear1 = calculations.traditional.year1;
    const tradRecurring = (calculations.traditional.total5Year - tradYear1) / 4;
    const lrYear1 = calculations.lightRail.year1;
    const lrRecurring = (calculations.lightRail.total5Year - lrYear1) / 4;
    
    return {
      year: `Year ${i + 1}`,
      Traditional: (tradYear1 + tradRecurring * i) / 1000000,
      LightRail: (lrYear1 + lrRecurring * i) / 1000000,
      Savings: ((tradYear1 + tradRecurring * i) - (lrYear1 + lrRecurring * i)) / 1000000,
    };
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calculator className="h-5 w-5 text-primary" />
          Total Cost of Ownership Calculator
          <Badge variant="outline" className="ml-2 border-primary/50 text-primary">Interactive</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inputs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inputs">Configure</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="projections">5-Year View</TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="space-y-6">
            {/* Scenario Presets */}
            <div className="flex flex-wrap gap-3">
              <span className="text-sm font-medium text-muted-foreground self-center">Scenario:</span>
              {(Object.keys(scenarioPresets) as Exclude<ScenarioKey, "custom">[]).map((key) => {
                const preset = scenarioPresets[key];
                const Icon = preset.icon;
                return (
                  <Button
                    key={key}
                    variant={activeScenario === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyPreset(key)}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs opacity-70">{preset.description}</div>
                    </div>
                  </Button>
                );
              })}
              {activeScenario === "custom" && (
                <Badge variant="secondary" className="self-center">Custom Configuration</Badge>
              )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-destructive/10 border-destructive/30">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Traditional 5-Year TCO</div>
                  <div className="text-2xl font-bold text-destructive">{formatCurrency(calculations.traditional.total5Year)}</div>
                  <div className="text-xs text-muted-foreground">{calculations.totalGpus} GPUs</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">LightRail 5-Year TCO</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(calculations.lightRail.total5Year)}</div>
                  <div className="text-xs text-muted-foreground">100x Energy Efficient</div>
                </CardContent>
              </Card>
              <Card className="bg-emerald-500/10 border-emerald-500/30">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Total Savings
                  </div>
                  <div className="text-2xl font-bold text-emerald-500">{formatCurrency(calculations.totalSavings)}</div>
                  <div className="text-xs text-emerald-400">{calculations.savingsPercentage.toFixed(1)}% reduction</div>
                </CardContent>
              </Card>
            </div>

            {/* Input Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hardware Costs */}
              <Card className="bg-muted/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Server className="h-4 w-4 text-chart-1" />
                    Hardware Costs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Server Count: {inputs.serverCount}</Label>
                    <Slider
                      value={[inputs.serverCount]}
                      onValueChange={([v]) => updateInput("serverCount", v)}
                      min={10}
                      max={500}
                      step={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">GPUs per Server: {inputs.gpuPerServer}</Label>
                    <Slider
                      value={[inputs.gpuPerServer]}
                      onValueChange={([v]) => updateInput("gpuPerServer", v)}
                      min={1}
                      max={16}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">GPU Unit Cost ($)</Label>
                    <Input
                      type="number"
                      value={inputs.gpuUnitCost}
                      onChange={(e) => updateInput("gpuUnitCost", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Lifespan (years): {inputs.serverLifespan}</Label>
                    <Slider
                      value={[inputs.serverLifespan]}
                      onValueChange={([v]) => updateInput("serverLifespan", v)}
                      min={3}
                      max={7}
                      step={1}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Costs */}
              <Card className="bg-muted/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-chart-2" />
                    Maintenance & Operations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Annual IT Staff Cost ($)</Label>
                    <Input
                      type="number"
                      value={inputs.itStaffCost}
                      onChange={(e) => updateInput("itStaffCost", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Maintenance (% of hardware): {inputs.annualMaintenancePct}%</Label>
                    <Slider
                      value={[inputs.annualMaintenancePct]}
                      onValueChange={([v]) => updateInput("annualMaintenancePct", v)}
                      min={5}
                      max={25}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Downtime Cost ($/hour)</Label>
                    <Input
                      type="number"
                      value={inputs.downtimeCostPerHour}
                      onChange={(e) => updateInput("downtimeCostPerHour", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Expected Downtime (hrs/year): {inputs.expectedDowntimeHours}</Label>
                    <Slider
                      value={[inputs.expectedDowntimeHours]}
                      onValueChange={([v]) => updateInput("expectedDowntimeHours", v)}
                      min={0}
                      max={168}
                      step={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cooling & Power */}
              <Card className="bg-muted/30 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-chart-3" />
                    Cooling & Power
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Power per GPU (W): {inputs.powerPerGpu}W</Label>
                    <Slider
                      value={[inputs.powerPerGpu]}
                      onValueChange={([v]) => updateInput("powerPerGpu", v)}
                      min={200}
                      max={700}
                      step={25}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">PUE Ratio: {inputs.pueRatio.toFixed(2)}</Label>
                    <Slider
                      value={[inputs.pueRatio * 100]}
                      onValueChange={([v]) => updateInput("pueRatio", v / 100)}
                      min={110}
                      max={200}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Electricity Rate ($/kWh)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={inputs.electricityRate}
                      onChange={(e) => updateInput("electricityRate", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cooling Infrastructure ($)</Label>
                    <Input
                      type="number"
                      value={inputs.coolingInfrastructureCost}
                      onChange={(e) => updateInput("coolingInfrastructureCost", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}M`} />
                  <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}M`, ""]}
                  />
                  <Legend />
                  <Bar dataKey="Traditional" fill="hsl(var(--destructive))" name="Traditional GPU" />
                  <Bar dataKey="LightRail" fill="hsl(var(--primary))" name="LightRail" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="breakdown">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">Traditional GPU Infrastructure</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDataTraditional}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieDataTraditional.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-lg font-bold text-destructive mt-2">
                  {formatCurrency(calculations.traditional.total5Year)}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-center mb-4 text-muted-foreground">LightRail Photonic</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDataLightRail}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieDataLightRail.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-lg font-bold text-primary mt-2">
                  {formatCurrency(calculations.lightRail.total5Year)}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="projections">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}M`, ""]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Traditional" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ fill: "hsl(var(--destructive))" }} />
                  <Line type="monotone" dataKey="LightRail" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  <Line type="monotone" dataKey="Savings" stroke="hsl(142 71% 45%)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "hsl(142 71% 45%)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400">
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">5-Year Cumulative Savings with LightRail:</span>
                <span className="text-2xl font-bold">{formatCurrency(calculations.totalSavings)}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
