import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Upload,
  Activity,
  Brain,
  Sliders,
  Send,
  Loader2,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";

// Mock EDA data
const correlationData = [
  { x: "Temp", y: "Energy", value: 0.72 },
  { x: "HVAC", y: "Energy", value: 0.85 },
  { x: "GPU", y: "Energy", value: 0.91 },
  { x: "Tokens", y: "GPU", value: 0.88 },
];

const featureImportance = [
  { feature: "GPU Wattage", importance: 40 },
  { feature: "HVAC Cycles", importance: 30 },
  { feature: "External Temp", importance: 15 },
  { feature: "Occupancy", importance: 10 },
  { feature: "Time of Day", importance: 5 },
];

export default function EnergyLab() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ingest");
  const [isLiveActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [modelType, setModelType] = useState("regression");
  const [isTraining, setIsTraining] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);

  // What-If Simulator state
  const [externalTemp, setExternalTemp] = useState([22]);
  const [hvacSetpoint, setHvacSetpoint] = useState([24]);
  const [occupancy, setOccupancy] = useState([75]);
  const [modelVerbosity, setModelVerbosity] = useState([500]);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Calculate predicted consumption based on sliders
  const predictedConsumption =
    10 +
    (externalTemp[0] - 20) * 0.5 +
    (30 - hvacSetpoint[0]) * 2 +
    occupancy[0] * 0.1 +
    (modelVerbosity[0] > 1000 ? modelVerbosity[0] * 0.03 : modelVerbosity[0] * 0.001);

  // Enterprise-scale savings calculation based on EIA 2025 data
  // U.S. Industrial avg: $0.09/kWh (Source: EIA Electric Power Monthly, Sept 2025)
  // PUE (Power Usage Effectiveness): 1.4 typical data center overhead for cooling
  const gpuCount = 1000;
  const hoursPerMonth = 730;
  const costPerKwh = 0.09; // EIA U.S. industrial average
  const pue = 1.4; // Typical data center PUE (cooling overhead)
  const traditionalWattage = 700; // H100 SXM TDP is 700W
  const lightrailWattage = 7; // LightRail photonic (100x efficient)
  
  // Adjust based on verbosity slider
  const efficiencyMultiplier = 1 + (modelVerbosity[0] / 4000) * 0.3;
  
  // Traditional: GPU power * PUE * cost
  const traditionalMonthlyCost = (traditionalWattage * gpuCount * hoursPerMonth / 1000) * pue * costPerKwh * efficiencyMultiplier;
  // LightRail: No cooling needed (photonic), so PUE = 1.0
  const lightrailMonthlyCost = (lightrailWattage * gpuCount * hoursPerMonth / 1000) * 1.0 * costPerKwh;
  const projectedSavings = Math.round(traditionalMonthlyCost - lightrailMonthlyCost);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded for analysis.`,
      });
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsAnalysing(true);

    try {
      const { data, error } = await supabase.functions.invoke("energy-analysis-agent", {
        body: {
          type: "eda_chat",
          message: chatInput,
        },
      });

      if (error) throw error;

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "Analysis complete." },
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologise, but I encountered an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      // Simulate training delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setModelTrained(true);
      toast({
        title: "Model trained successfully",
        description: `${modelType.charAt(0).toUpperCase() + modelType.slice(1)} model is ready for predictions.`,
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ingest" className="gap-2">
            <Upload className="h-4 w-4" />
            Data Ingest
          </TabsTrigger>
          <TabsTrigger value="eda" className="gap-2">
            <Activity className="h-4 w-4" />
            EDA
          </TabsTrigger>
          <TabsTrigger value="model" className="gap-2">
            <Brain className="h-4 w-4" />
            Model Builder
          </TabsTrigger>
          <TabsTrigger value="whatif" className="gap-2">
            <Sliders className="h-4 w-4" />
            What-If
          </TabsTrigger>
        </TabsList>

        {/* Data Ingest Tab */}
        <TabsContent value="ingest" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-40 w-full rounded-lg" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Manual Upload</CardTitle>
                    <CardDescription>Upload CSV/Excel files with historical facility data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-primary font-medium">Click to upload</span>
                        <span className="text-muted-foreground"> or drag and drop</span>
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <p className="text-sm text-muted-foreground mt-2">CSV, XLSX up to 50MB</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Live Data Status
                      {isLiveActive && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>Real-time webhook data ingestion</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={isLiveActive ? "default" : "secondary"}>
                        {isLiveActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Webhook endpoint configured
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Configure webhooks in the Connectivity page to send live telemetry data.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* EDA Tab */}
        <TabsContent value="eda" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Correlation Matrix</CardTitle>
                <CardDescription>Variable relationships in your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {["Temp", "HVAC", "GPU", "Energy"].map((col) => (
                    <div key={col} className="text-center text-xs font-medium text-muted-foreground">
                      {col}
                    </div>
                  ))}
                  {["Temp", "HVAC", "GPU", "Energy"].map((row, i) =>
                    ["Temp", "HVAC", "GPU", "Energy"].map((col, j) => {
                      const val = i === j ? 1 : 0.3 + Math.random() * 0.6;
                      const intensity = Math.round(val * 100);
                      return (
                        <div
                          key={`${row}-${col}`}
                          className="h-12 rounded flex items-center justify-center text-xs font-mono"
                          style={{
                            backgroundColor: `hsl(var(--primary) / ${intensity}%)`,
                            color: intensity > 50 ? "hsl(var(--primary-foreground))" : "inherit",
                          }}
                        >
                          {val.toFixed(2)}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Chat for EDA</CardTitle>
                <CardDescription>Ask questions about your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-[200px] border rounded-lg p-3">
                  {chatMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Ask questions like "Show correlation between GPU and Energy" or "Generate box
                      plot for HVAC status"
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg text-sm ${
                            msg.role === "user"
                              ? "bg-primary/20 ml-8"
                              : "bg-muted mr-8"
                          }`}
                        >
                          {msg.content}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask about your data..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="min-h-[60px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                  />
                  <Button onClick={handleChatSubmit} disabled={isAnalysing}>
                    {isAnalysing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Model Builder Tab */}
        <TabsContent value="model" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Selection</CardTitle>
                <CardDescription>Choose your prediction model type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={modelType} onValueChange={setModelType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regression" id="regression" />
                    <Label htmlFor="regression">Regression (Predict energy consumption)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="classification" id="classification" />
                    <Label htmlFor="classification">Classification (Categorise load status)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anomaly" id="anomaly" />
                    <Label htmlFor="anomaly">Anomaly Detection (Identify unusual patterns)</Label>
                  </div>
                </RadioGroup>

                <Button onClick={handleTrainModel} disabled={isTraining} className="w-full">
                  {isTraining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Training Model...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Train Model
                    </>
                  )}
                </Button>

                {modelTrained && (
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                    <h4 className="font-medium mb-2">Model Performance</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">R²:</span>{" "}
                        <span className="font-mono">0.89</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">MAE:</span>{" "}
                        <span className="font-mono">2.34</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Importance</CardTitle>
                <CardDescription>Variables most impacting energy consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={featureImportance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      dataKey="feature"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Importance"]}
                    />
                    <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* What-If Simulator Tab */}
        <TabsContent value="whatif" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scenario Parameters</CardTitle>
                <CardDescription>Adjust variables to simulate energy impact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>External Temperature (°C)</Label>
                    <span className="font-mono text-primary">{externalTemp[0]}°C</span>
                  </div>
                  <Slider
                    value={externalTemp}
                    onValueChange={setExternalTemp}
                    min={-10}
                    max={45}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>HVAC Setpoint (°C)</Label>
                    <span className="font-mono text-primary">{hvacSetpoint[0]}°C</span>
                  </div>
                  <Slider
                    value={hvacSetpoint}
                    onValueChange={setHvacSetpoint}
                    min={16}
                    max={30}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Occupancy Rate (%)</Label>
                    <span className="font-mono text-primary">{occupancy[0]}%</span>
                  </div>
                  <Slider value={occupancy} onValueChange={setOccupancy} min={0} max={100} step={5} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>AI Model Verbosity (Tokens/Query)</Label>
                    <span className="font-mono text-primary">{modelVerbosity[0]}</span>
                  </div>
                  <Slider
                    value={modelVerbosity}
                    onValueChange={setModelVerbosity}
                    min={100}
                    max={4000}
                    step={100}
                  />
                  {modelVerbosity[0] > 1000 && (
                    <p className="text-xs text-destructive">
                      ⚠️ High verbosity models consume up to 30x more energy
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Predicted Energy Consumption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">
                      {predictedConsumption.toFixed(1)}
                    </div>
                    <p className="text-muted-foreground">kWh/hr</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Projected Cost Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      ${projectedSavings >= 1000000 
                        ? `${(projectedSavings / 1000000).toFixed(1)}M`
                        : projectedSavings >= 1000 
                          ? `${Math.round(projectedSavings / 1000)}K`
                          : projectedSavings.toLocaleString()}
                    </div>
                    <p className="text-muted-foreground">per month vs traditional (1000 GPUs)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
