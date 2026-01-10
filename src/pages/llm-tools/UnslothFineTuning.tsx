import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { 
  Upload, 
  Play, 
  Pause, 
  Square, 
  Download, 
  Zap,
  FileJson,
  CheckCircle,
  AlertCircle,
  Cpu,
  Terminal,
  Settings,
  BarChart3,
  Activity,
  Layers,
  Clock,
  HardDrive
} from "lucide-react";

const models = [
  { id: "llama-3.1-8b", name: "Llama 3.1 8B", size: "8B", vram: "~6GB (4-bit)" },
  { id: "mistral-7b", name: "Mistral 7B", size: "7B", vram: "~5GB (4-bit)" },
  { id: "qwen-2.5-7b", name: "Qwen 2.5 7B", size: "7B", vram: "~5GB (4-bit)" },
  { id: "glm-4-9b", name: "GLM-4 9B", size: "9B", vram: "~7GB (4-bit)" },
  { id: "gemma-7b", name: "Gemma 7B", size: "7B", vram: "~5GB (4-bit)" },
];

const UnslothFineTuning = () => {
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b");
  const [dataset, setDataset] = useState<File | null>(null);
  const [datasetValid, setDatasetValid] = useState<boolean | null>(null);
  const [maxSteps, setMaxSteps] = useState([60]);
  const [learningRate, setLearningRate] = useState("2e-4");
  const [batchSize, setBatchSize] = useState("4");
  const [loraRank, setLoraRank] = useState([16]);
  const [quantization, setQuantization] = useState(true);
  const [flashAttention, setFlashAttention] = useState(true);
  
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    "$ Unsloth Fine-Tuning Engine v2.1.0",
    "$ GPU detected: NVIDIA RTX 4090 (24GB)",
    "$ CUDA 12.3 | cuDNN 8.9.7 | Flash Attention 2.0",
    "$ Ready for training job..."
  ]);
  const [lossData, setLossData] = useState<{ step: number; loss: number; lr: number }[]>([]);
  const [gpuData, setGpuData] = useState<{ time: string; util: number; mem: number }[]>([]);
  const [gpuUtilization, setGpuUtilization] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [eta, setEta] = useState("--:--");

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    validateAndSetDataset(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetDataset(file);
  };

  const validateAndSetDataset = (file: File) => {
    const validExtensions = ['.json', '.jsonl'];
    const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (isValid) {
      setDataset(file);
      setDatasetValid(true);
      setLogs(l => [...l, `$ Dataset loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`]);
      toast({ title: "Dataset uploaded", description: `${file.name} is ready for training.` });
    } else {
      setDatasetValid(false);
      toast({ 
        title: "Invalid file format", 
        description: "Please upload a JSON or JSONL file.",
        variant: "destructive"
      });
    }
  };

  const startTraining = () => {
    if (!dataset) {
      toast({ title: "No dataset", description: "Please upload a dataset first.", variant: "destructive" });
      return;
    }

    setIsTraining(true);
    setIsPaused(false);
    setProgress(0);
    setCurrentStep(0);
    setLossData([]);
    setGpuData([]);
    
    const modelName = models.find(m => m.id === selectedModel)?.name || selectedModel;
    setLogs(l => [...l, 
      `$ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `$ Starting training job...`,
      `$ Model: ${modelName}`,
      `$ Quantization: ${quantization ? "4-bit (QLoRA)" : "None"}`,
      `$ Flash Attention: ${flashAttention ? "Enabled" : "Disabled"}`,
      `$ LoRA Rank: ${loraRank[0]} | Alpha: ${loraRank[0] * 2}`,
      `$ Batch Size: ${batchSize} | LR: ${learningRate}`,
      `$ Loading model weights...`
    ]);

    setTimeout(() => {
      setLogs(l => [...l, `$ [✓] Model loaded successfully`]);
    }, 800);

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        const newProgress = (next / maxSteps[0]) * 100;
        setProgress(newProgress);
        
        const remainingSteps = maxSteps[0] - next;
        const etaSeconds = remainingSteps * 0.5;
        const mins = Math.floor(etaSeconds / 60);
        const secs = Math.floor(etaSeconds % 60);
        setEta(`${mins}:${secs.toString().padStart(2, '0')}`);
        
        const currentLoss = 2.5 - next * 0.025 + Math.random() * 0.1;
        const currentLr = parseFloat(learningRate) * (1 - next / maxSteps[0]);
        
        if (next % 5 === 0) {
          setLogs(l => [...l, `$ Step ${next}/${maxSteps[0]} | Loss: ${currentLoss.toFixed(4)} | LR: ${currentLr.toExponential(2)}`]);
        }
        
        setLossData(d => [...d, { step: next, loss: currentLoss, lr: currentLr * 10000 }]);
        
        const gpuUtil = 85 + Math.random() * 10;
        const gpuMem = quantization ? 45 + Math.random() * 5 : 75 + Math.random() * 5;
        setGpuUtilization(gpuUtil);
        setMemoryUsage(gpuMem);
        setGpuData(d => [...d.slice(-20), { 
          time: `${next}`, 
          util: gpuUtil, 
          mem: gpuMem 
        }]);

        if (next >= maxSteps[0]) {
          clearInterval(interval);
          setIsTraining(false);
          setEta("00:00");
          setLogs(l => [...l, 
            `$ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `$ [✓] Training completed successfully!`,
            `$ Final Loss: ${currentLoss.toFixed(4)}`,
            `$ Model saved to: ./outputs/${modelName.toLowerCase().replace(/ /g, '-')}-finetuned.gguf`,
            `$ Ready for export.`
          ]);
          toast({ title: "Training Complete", description: "Your model is ready for export." });
        }
        
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  };

  const pauseTraining = () => {
    setIsPaused(true);
    setLogs(l => [...l, `$ [!] Training paused at step ${currentStep}`]);
  };

  const resumeTraining = () => {
    setIsPaused(false);
    setLogs(l => [...l, `$ [>] Training resumed from step ${currentStep}`]);
  };

  const stopTraining = () => {
    setIsTraining(false);
    setIsPaused(false);
    setLogs(l => [...l, `$ [X] Training stopped by user at step ${currentStep}`]);
  };

  const exportModel = () => {
    setLogs(l => [...l, `$ Exporting model to GGUF format...`]);
    toast({ title: "Exporting Model", description: "Your trained model is being prepared for download..." });
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-3">
      {/* Left Panel - Configuration */}
      <div className="flex flex-col gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Layers className="h-4 w-4 text-yellow-500" />
              Model Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="bg-background/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">{model.vram}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FileJson className="h-4 w-4 text-blue-500" />
              Dataset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                dataset 
                  ? datasetValid 
                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                    : 'border-destructive/50 bg-destructive/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }`}
            >
              {dataset ? (
                <div className="flex items-center gap-2">
                  {datasetValid ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-mono text-sm text-foreground">{dataset.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Drop JSON/JSONL here</p>
                </>
              )}
              <Input
                type="file"
                accept=".json,.jsonl"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Settings className="h-4 w-4 text-purple-500" />
              Training Config
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Max Steps</Label>
                <span className="font-mono text-xs text-foreground">{maxSteps[0]}</span>
              </div>
              <Slider value={maxSteps} onValueChange={setMaxSteps} min={10} max={1000} step={10} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Learning Rate</Label>
              <Input
                type="text"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
                className="h-8 bg-background/80 font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Batch Size</Label>
                <Select value={batchSize} onValueChange={setBatchSize}>
                  <SelectTrigger className="h-8 bg-background/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 4, 8].map((size) => (
                      <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">LoRA Rank</Label>
                  <span className="font-mono text-xs text-foreground">{loraRank[0]}</span>
                </div>
                <Slider value={loraRank} onValueChange={setLoraRank} min={8} max={64} step={8} />
              </div>
            </div>

            <div className="space-y-3 rounded-lg bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">4-bit Quantization</Label>
                <Switch checked={quantization} onCheckedChange={setQuantization} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Flash Attention 2.0</Label>
                <Switch checked={flashAttention} onCheckedChange={setFlashAttention} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Panel - Training Monitor */}
      <div className="flex flex-col gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Training Controls
              </div>
              {isTraining && (
                <Badge variant="secondary" className="animate-pulse">
                  <Activity className="mr-1 h-3 w-3" />
                  Training
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {!isTraining ? (
                <Button onClick={startTraining} className="flex-1" size="sm">
                  <Play className="mr-2 h-4 w-4" />
                  Start Training
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button onClick={resumeTraining} variant="secondary" className="flex-1" size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                  ) : (
                    <Button onClick={pauseTraining} variant="secondary" className="flex-1" size="sm">
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={stopTraining} variant="destructive" size="sm">
                    <Square className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono text-foreground">{currentStep}/{maxSteps[0]}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>ETA: {eta}</span>
                <span>{progress.toFixed(1)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">GPU</span>
                </div>
                <p className="mt-1 font-mono text-lg font-bold text-foreground">{gpuUtilization.toFixed(0)}%</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">VRAM</span>
                </div>
                <p className="mt-1 font-mono text-lg font-bold text-foreground">{memoryUsage.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="loss" className="h-full">
              <TabsList className="w-full">
                <TabsTrigger value="loss" className="flex-1 text-xs">Loss Curve</TabsTrigger>
                <TabsTrigger value="gpu" className="flex-1 text-xs">GPU Stats</TabsTrigger>
              </TabsList>
              <TabsContent value="loss" className="mt-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lossData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="step" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line type="monotone" dataKey="loss" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              <TabsContent value="gpu" className="mt-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gpuData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="util" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="mem" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Button 
          onClick={exportModel} 
          disabled={!isTraining && currentStep === 0}
          variant="outline"
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Model
        </Button>
      </div>

      {/* Right Panel - Terminal */}
      <div className="flex flex-col gap-4">
        <Card className="flex-1 border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Terminal className="h-4 w-4 text-emerald-500" />
              Training Logs
              <Badge variant="secondary" className="ml-auto text-xs font-mono">
                {logs.length} lines
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <ScrollArea className="h-full rounded-lg bg-background/80 p-4">
              <div className="font-mono text-xs leading-relaxed">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`${
                      log.includes('[✓]') ? 'text-emerald-500' :
                      log.includes('[!]') ? 'text-yellow-500' :
                      log.includes('[X]') ? 'text-destructive' :
                      log.includes('━') ? 'text-muted-foreground/50' :
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                {isTraining && (
                  <div className="flex items-center text-muted-foreground">
                    <span className="animate-pulse">▋</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnslothFineTuning;
