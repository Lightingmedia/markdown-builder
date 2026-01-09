import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
  MemoryStick
} from "lucide-react";

const models = [
  { id: "llama-3.1-8b", name: "Llama 3.1 8B", size: "8B", provider: "Meta" },
  { id: "mistral-7b", name: "Mistral 7B", size: "7B", provider: "Mistral AI" },
  { id: "qwen-2.5-7b", name: "Qwen 2.5 7B", size: "7B", provider: "Alibaba" },
  { id: "glm-4-9b", name: "GLM-4 9B", size: "9B", provider: "Zhipu AI" },
  { id: "gemma-7b", name: "Gemma 7B", size: "7B", provider: "Google" },
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
  const [logs, setLogs] = useState<string[]>([]);
  const [lossData, setLossData] = useState<{ step: number; loss: number }[]>([]);
  const [gpuUtilization, setGpuUtilization] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);

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
    setLogs([`[${new Date().toLocaleTimeString()}] Starting training with ${selectedModel}...`]);
    setLossData([]);

    // Simulate training progress
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        const newProgress = (next / maxSteps[0]) * 100;
        setProgress(newProgress);
        
        // Add log
        setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] Step ${next}/${maxSteps[0]} - Loss: ${(2.5 - next * 0.03).toFixed(4)}`]);
        
        // Add loss data point
        setLossData(d => [...d, { step: next, loss: 2.5 - next * 0.03 + Math.random() * 0.1 }]);
        
        // Update GPU stats
        setGpuUtilization(85 + Math.random() * 10);
        setMemoryUsage(quantization ? 45 + Math.random() * 5 : 75 + Math.random() * 5);

        if (next >= maxSteps[0]) {
          clearInterval(interval);
          setIsTraining(false);
          setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ✅ Training completed successfully!`]);
          toast({ title: "Training Complete", description: "Your model is ready for export." });
        }
        
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  };

  const pauseTraining = () => {
    setIsPaused(true);
    setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ⏸️ Training paused`]);
  };

  const resumeTraining = () => {
    setIsPaused(false);
    setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ▶️ Training resumed`]);
  };

  const stopTraining = () => {
    setIsTraining(false);
    setIsPaused(false);
    setLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ⏹️ Training stopped`]);
  };

  const exportModel = () => {
    toast({ title: "Exporting Model", description: "Your trained model is being prepared for download..." });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Configuration Panel */}
      <div className="space-y-6">
        {/* Model Selection */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Model Selection
            </CardTitle>
            <CardDescription>Choose a base model for fine-tuning</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="text-xs">{model.size}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Dataset Upload */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-blue-500" />
              Dataset Upload
            </CardTitle>
            <CardDescription>Upload JSON or JSONL training data</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                dataset 
                  ? datasetValid 
                    ? 'border-green-500 bg-green-500/5' 
                    : 'border-red-500 bg-red-500/5'
                  : 'border-border hover:border-primary'
              }`}
            >
              {dataset ? (
                <div className="flex items-center gap-2">
                  {datasetValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-foreground">{dataset.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
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

        {/* Training Config */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Training Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Max Steps</Label>
                <span className="text-sm text-muted-foreground">{maxSteps[0]}</span>
              </div>
              <Slider
                value={maxSteps}
                onValueChange={setMaxSteps}
                min={10}
                max={1000}
                step={10}
              />
            </div>

            <div className="space-y-2">
              <Label>Learning Rate</Label>
              <Input
                type="text"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Batch Size</Label>
              <Select value={batchSize} onValueChange={setBatchSize}>
                <SelectTrigger>
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
                <Label>LoRA Rank</Label>
                <span className="text-sm text-muted-foreground">{loraRank[0]}</span>
              </div>
              <Slider
                value={loraRank}
                onValueChange={setLoraRank}
                min={8}
                max={64}
                step={8}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>4-bit Quantization</Label>
              <Switch checked={quantization} onCheckedChange={setQuantization} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Flash Attention</Label>
              <Switch checked={flashAttention} onCheckedChange={setFlashAttention} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Progress Panel */}
      <div className="space-y-6">
        {/* Controls */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Training Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {!isTraining ? (
                <Button onClick={startTraining} className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Start Training
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button onClick={resumeTraining} variant="secondary" className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                  ) : (
                    <Button onClick={pauseTraining} variant="secondary" className="flex-1">
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={stopTraining} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground">{currentStep} / {maxSteps[0]} steps</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">GPU Utilization</p>
                  <p className="font-medium text-foreground">{gpuUtilization.toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Memory Usage</p>
                  <p className="font-medium text-foreground">{memoryUsage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loss Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Loss Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="step" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="loss" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Training Logs */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Training Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 rounded-md bg-muted/50 p-3 font-mono text-xs">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} className="text-muted-foreground">{log}</div>
                ))
              ) : (
                <div className="text-muted-foreground">No logs yet. Start training to see progress.</div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Export */}
        <Button 
          onClick={exportModel} 
          disabled={!isTraining && currentStep === 0}
          className="w-full"
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Trained Model
        </Button>
      </div>
    </div>
  );
};

export default UnslothFineTuning;
