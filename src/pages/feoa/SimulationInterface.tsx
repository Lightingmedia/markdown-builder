import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Send,
  Loader2,
  Zap,
  Droplets,
  Leaf,
  DollarSign,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Clock,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SimulationResult {
  current: {
    accelerator: string;
    tokens_per_second: number;
    energy_kwh: number;
    water_liters: number;
    co2_kg: number;
    cost_usd: number;
    duration_hours: number;
  };
  target: {
    accelerator: string;
    region: string;
    tokens_per_second: number;
    energy_kwh: number;
    water_liters: number;
    co2_kg: number;
    cost_usd: number;
    duration_hours: number;
  };
  comparison: {
    speedup_factor: number;
    energy_savings_pct: number;
    water_savings_pct: number;
    co2_savings_pct: number;
    cost_savings_pct: number;
    cost_savings_usd: number;
  };
}

const ACCELERATOR_OPTIONS = [
  "A100-40GB",
  "A100-80GB",
  "H100-80GB",
  "H200",
  "B200",
  "TPU v4",
  "TPU v5e",
  "TPU v5p",
  "MI300X",
];

const REGION_OPTIONS = [
  { code: "us-central1", name: "Iowa" },
  { code: "us-east4", name: "Virginia" },
  { code: "europe-west1", name: "Belgium" },
  { code: "europe-north1", name: "Finland" },
  { code: "asia-east1", name: "Taiwan" },
  { code: "us-west1", name: "Oregon" },
];

const WORKLOAD_OPTIONS = ["pretrain", "inference", "finetune"];
const MODEL_OPTIONS = ["llama-70b", "llama-7b", "gpt-4", "mistral-7b"];

export default function SimulationInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulation params
  const [currentAccelerator, setCurrentAccelerator] = useState("A100-80GB");
  const [targetAccelerator, setTargetAccelerator] = useState("H100-80GB");
  const [targetRegion, setTargetRegion] = useState("europe-north1");
  const [workloadType, setWorkloadType] = useState("pretrain");
  const [modelName, setModelName] = useState("llama-70b");
  const [deviceCount, setDeviceCount] = useState(8);
  const [hours, setHours] = useState(24);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/infrastructure-advisor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: userMessage }],
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 402) {
          toast.error("Usage limit reached. Please add credits.");
        } else {
          toast.error("Failed to get response from advisor");
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let textBuffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return newMessages;
              });
            }
          } catch {
            // Incomplete JSON, put back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const { data, error } = await supabase.functions.invoke("infrastructure-tools", {
        body: {
          tool: "simulate_job_on_alternative_hardware",
          params: {
            current_accelerator_model: currentAccelerator,
            target_accelerator_model: targetAccelerator,
            target_region_code: targetRegion,
            workload_type: workloadType,
            model_name: modelName,
            device_count: deviceCount,
            hours: hours,
          },
        },
      });

      if (error) throw error;
      if (data?.success) {
        setSimulationResult(data.data);
        toast.success("Simulation complete!");
      } else {
        throw new Error(data?.error || "Simulation failed");
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast.error("Failed to run simulation");
    } finally {
      setSimulating(false);
    }
  };

  const exampleQuestions = [
    "What's the most energy-efficient way to run a 70B model pretrain?",
    "Compare H100 vs A100 for inference workloads",
    "Which region has the lowest carbon footprint?",
    "How can I reduce water usage for my training jobs?",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Infrastructure Simulation & Advisor</h1>
        <p className="text-muted-foreground">
          Simulate hardware migrations and chat with the AI optimization advisor
        </p>
      </div>

      <Tabs defaultValue="simulator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulator">What-If Simulator</TabsTrigger>
          <TabsTrigger value="advisor">AI Advisor</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Simulation Parameters</CardTitle>
                <CardDescription>
                  Configure your current and target infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Accelerator</label>
                    <Select value={currentAccelerator} onValueChange={setCurrentAccelerator}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCELERATOR_OPTIONS.map((acc) => (
                          <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Accelerator</label>
                    <Select value={targetAccelerator} onValueChange={setTargetAccelerator}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCELERATOR_OPTIONS.map((acc) => (
                          <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Region</label>
                  <Select value={targetRegion} onValueChange={setTargetRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGION_OPTIONS.map((reg) => (
                        <SelectItem key={reg.code} value={reg.code}>
                          {reg.name} ({reg.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Workload Type</label>
                    <Select value={workloadType} onValueChange={setWorkloadType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKLOAD_OPTIONS.map((w) => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model</label>
                    <Select value={modelName} onValueChange={setModelName}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Device Count: {deviceCount}
                  </label>
                  <Slider
                    value={[deviceCount]}
                    onValueChange={([v]) => setDeviceCount(v)}
                    min={1}
                    max={64}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Duration (hours): {hours}
                  </label>
                  <Slider
                    value={[hours]}
                    onValueChange={([v]) => setHours(v)}
                    min={1}
                    max={168}
                    step={1}
                  />
                </div>

                <Button onClick={runSimulation} disabled={simulating} className="w-full">
                  {simulating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      Run Simulation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Simulation Results</CardTitle>
                <CardDescription>
                  {simulationResult
                    ? `${currentAccelerator} → ${targetAccelerator} in ${targetRegion}`
                    : "Configure and run a simulation"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simulationResult ? (
                  <div className="space-y-6">
                    {/* Comparison Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Current</div>
                        <div className="text-lg font-bold">{simulationResult.current.accelerator}</div>
                        <div className="text-sm">{simulationResult.current.tokens_per_second} tok/s</div>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Target</div>
                        <div className="text-lg font-bold">{simulationResult.target.accelerator}</div>
                        <div className="text-sm">{simulationResult.target.tokens_per_second} tok/s</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Metrics Comparison */}
                    <div className="space-y-4">
                      <MetricRow
                        icon={<Clock className="h-4 w-4" />}
                        label="Duration"
                        current={`${simulationResult.current.duration_hours}h`}
                        target={`${simulationResult.target.duration_hours}h`}
                        savings={`${simulationResult.comparison.speedup_factor}x faster`}
                        positive={simulationResult.comparison.speedup_factor > 1}
                      />
                      <MetricRow
                        icon={<Zap className="h-4 w-4" />}
                        label="Energy"
                        current={`${simulationResult.current.energy_kwh} kWh`}
                        target={`${simulationResult.target.energy_kwh} kWh`}
                        savings={`${simulationResult.comparison.energy_savings_pct}%`}
                        positive={simulationResult.comparison.energy_savings_pct > 0}
                      />
                      <MetricRow
                        icon={<Droplets className="h-4 w-4" />}
                        label="Water"
                        current={`${simulationResult.current.water_liters}L`}
                        target={`${simulationResult.target.water_liters}L`}
                        savings={`${simulationResult.comparison.water_savings_pct}%`}
                        positive={simulationResult.comparison.water_savings_pct > 0}
                      />
                      <MetricRow
                        icon={<Leaf className="h-4 w-4" />}
                        label="CO₂"
                        current={`${simulationResult.current.co2_kg} kg`}
                        target={`${simulationResult.target.co2_kg} kg`}
                        savings={`${simulationResult.comparison.co2_savings_pct}%`}
                        positive={simulationResult.comparison.co2_savings_pct > 0}
                      />
                      <MetricRow
                        icon={<DollarSign className="h-4 w-4" />}
                        label="Cost"
                        current={`$${simulationResult.current.cost_usd}`}
                        target={`$${simulationResult.target.cost_usd}`}
                        savings={`$${simulationResult.comparison.cost_savings_usd}`}
                        positive={simulationResult.comparison.cost_savings_pct > 0}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Configure parameters and run a simulation to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advisor" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>AI Infrastructure Advisor</CardTitle>
              <CardDescription>
                Ask questions about optimizing your AI infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              {messages.length === 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleQuestions.map((q, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => {
                          setInput(q);
                        }}
                      >
                        {q}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex gap-2 mt-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about infrastructure optimization..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricRow({
  icon,
  label,
  current,
  target,
  savings,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  current: string;
  target: string;
  savings: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">
          {current} → {target}
        </div>
      </div>
      <Badge variant={positive ? "default" : "destructive"} className="flex items-center gap-1">
        {positive ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
        {savings}
      </Badge>
    </div>
  );
}
