import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, RefreshCw, CheckCircle, XCircle, Loader2, Send, Plus, Database, Cloud, Server, Monitor, Terminal, Activity, Zap, Settings2, BookOpen } from "lucide-react";
import DataCenterOnboarding from "@/components/feoa/DataCenterOnboarding";

interface AIModel {
  id: string;
  model_name: string;
  model_provider: string;
  energy_kwh: number;
  cost_usd: number;
  parameters_billions: number;
}

export default function Connectivity() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<Array<{
    timestamp: string;
    status: string;
    sourceIp: string;
  }>>([]);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);

  // API Integrations state
  const [electricityApiKey, setElectricityApiKey] = useState("");
  const [dataCenterApiKey, setDataCenterApiKey] = useState("");
  const [integrations, setIntegrations] = useState({
    electricity: false,
    dataCenter: false,
  });

  // New AI model form
  const [newModel, setNewModel] = useState({
    name: "",
    provider: "",
    energyKwh: "",
    costUsd: "",
    params: "",
  });

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "lgwaccltpoogoukjyzke";

  useEffect(() => {
    const fetchAiModels = async () => {
      const { data } = await supabase
        .from("ai_training_costs" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setAiModels(data as unknown as AIModel[]);
    };

    fetchAiModels();
  }, []);

  const generateWebhookUrl = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const url = `https://${projectId}.supabase.co/functions/v1/energy-webhook-handler`;
      setWebhookUrl(url);
      setIsGenerating(false);
      toast({
        title: "Webhook URL Generated",
        description: "Your secure webhook endpoint is ready.",
      });
    }, 500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied",
      description: "Webhook URL copied to clipboard.",
    });
  };

  const testWebhook = async () => {
    setIsTesting(true);
    try {
      const testPayloads = {
        nvidia: {
          timestamp: new Date().toISOString(),
          facility_id: "test-facility-001",
          accelerator_vendor: "nvidia",
          temp_c: 22.5,
          humidity_pct: 60,
          hvac_status: "ON",
          gpu_wattage: 280,
          nvidia_utilization: 85,
          nvidia_memory_gb: 32,
          tokens_generated: 1200,
          model_id: "test-nvidia-model",
        },
        google_tpu: {
          timestamp: new Date().toISOString(),
          facility_id: "test-facility-001",
          accelerator_vendor: "google_tpu",
          temp_c: 21.0,
          humidity_pct: 55,
          hvac_status: "ON",
          tpu_wattage: 200,
          tpu_utilization: 92,
          tpu_memory_gb: 64,
          tokens_generated: 2400,
          model_id: "test-tpu-model",
        },
        amd: {
          timestamp: new Date().toISOString(),
          facility_id: "test-facility-001",
          accelerator_vendor: "amd",
          temp_c: 23.5,
          humidity_pct: 58,
          hvac_status: "ON",
          amd_gpu_wattage: 350,
          amd_utilization: 78,
          amd_memory_gb: 128,
          tokens_generated: 1800,
          model_id: "test-amd-model",
        },
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayloads[selectedVendor]),
      });

      if (response.ok) {
        toast({
          title: "Test successful",
          description: "Webhook received the test payload.",
        });
        setWebhookLogs((prev) => [
          {
            timestamp: new Date().toISOString(),
            status: "200 OK",
            sourceIp: "127.0.0.1",
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        throw new Error("Webhook test failed");
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Could not reach webhook endpoint.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const connectIntegration = (type: "electricity" | "dataCenter") => {
    const apiKey = type === "electricity" ? electricityApiKey : dataCenterApiKey;
    if (!apiKey) {
      toast({
        title: "API Key required",
        description: "Please enter an API key to connect.",
        variant: "destructive",
      });
      return;
    }

    setIntegrations((prev) => ({ ...prev, [type]: true }));
    toast({
      title: "Connected",
      description: `${type === "electricity" ? "Electricity Provider" : "Data Centre Monitoring"} integration is now active.`,
    });
  };

  const addAiModel = async () => {
    if (!newModel.name || !newModel.provider) {
      toast({
        title: "Missing fields",
        description: "Please enter model name and provider.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to add AI models.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("ai_training_costs" as any).insert({
      user_id: user.id,
      model_name: newModel.name,
      model_provider: newModel.provider,
      energy_kwh: parseFloat(newModel.energyKwh) || 0,
      cost_usd: parseFloat(newModel.costUsd) || 0,
      parameters_billions: parseFloat(newModel.params) || 0,
      training_date: new Date().toISOString().split("T")[0],
    });

    if (!error) {
      toast({
        title: "Model added",
        description: `${newModel.name} has been added to the database.`,
      });
      setNewModel({ name: "", provider: "", energyKwh: "", costUsd: "", params: "" });
      
      // Refresh list
      const { data } = await supabase
        .from("ai_training_costs" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setAiModels(data as unknown as AIModel[]);
    }
  };

  const [selectedVendor, setSelectedVendor] = useState<"nvidia" | "google_tpu" | "amd">("nvidia");

  const vendorPayloads = {
    nvidia: `{
  "timestamp": "${new Date().toISOString()}",
  "facility_id": "facility-uuid",
  "accelerator_vendor": "nvidia",
  "temp_c": 22.5,
  "humidity_pct": 60,
  "hvac_status": "ON",
  "gpu_wattage": 280,
  "nvidia_utilization": 85,
  "nvidia_memory_gb": 32,
  "tokens_generated": 1200,
  "model_id": "llama-3-70b"
}`,
    google_tpu: `{
  "timestamp": "${new Date().toISOString()}",
  "facility_id": "facility-uuid",
  "accelerator_vendor": "google_tpu",
  "temp_c": 21.0,
  "humidity_pct": 55,
  "hvac_status": "ON",
  "tpu_wattage": 200,
  "tpu_utilization": 92,
  "tpu_memory_gb": 64,
  "tokens_generated": 2400,
  "model_id": "gemma-2-27b"
}`,
    amd: `{
  "timestamp": "${new Date().toISOString()}",
  "facility_id": "facility-uuid",
  "accelerator_vendor": "amd",
  "temp_c": 23.5,
  "humidity_pct": 58,
  "hvac_status": "ON",
  "amd_gpu_wattage": 350,
  "amd_utilization": 78,
  "amd_memory_gb": 128,
  "tokens_generated": 1800,
  "model_id": "mistral-large"
}`
  };

  const examplePayload = vendorPayloads[selectedVendor];

  // Google Cloud GPU Configuration State
  const [gcpConfig, setGcpConfig] = useState({
    projectId: "",
    zone: "us-central1-a",
    gpuType: "nvidia-tesla-a100",
    gpuCount: 1,
    machineType: "a2-highgpu-1g",
    driverVersion: "535",
    opsAgentInstalled: false,
    dcgmEnabled: false,
  });

  const gpuTypes = [
    { value: "nvidia-tesla-a100", label: "NVIDIA A100 (40GB)", memory: "40 GB", power: "400W" },
    { value: "nvidia-a100-80gb", label: "NVIDIA A100 (80GB)", memory: "80 GB", power: "400W" },
    { value: "nvidia-tesla-v100", label: "NVIDIA V100 (16GB)", memory: "16 GB", power: "300W" },
    { value: "nvidia-tesla-t4", label: "NVIDIA T4 (16GB)", memory: "16 GB", power: "70W" },
    { value: "nvidia-l4", label: "NVIDIA L4 (24GB)", memory: "24 GB", power: "72W" },
    { value: "nvidia-h100-80gb", label: "NVIDIA H100 (80GB)", memory: "80 GB", power: "700W" },
  ];

  const gcpZones = [
    "us-central1-a", "us-central1-b", "us-central1-c", "us-central1-f",
    "us-east1-b", "us-east1-c", "us-east1-d",
    "us-west1-a", "us-west1-b",
    "europe-west1-b", "europe-west1-c", "europe-west1-d",
    "europe-west4-a", "europe-west4-b", "europe-west4-c",
    "asia-east1-a", "asia-east1-b", "asia-east1-c",
  ];

  const selectedGpu = gpuTypes.find(g => g.value === gcpConfig.gpuType);

  const generateGcloudCommand = () => {
    return `gcloud compute instances create gpu-monitor-vm \\
  --project=${gcpConfig.projectId || "YOUR_PROJECT_ID"} \\
  --zone=${gcpConfig.zone} \\
  --machine-type=${gcpConfig.machineType} \\
  --accelerator=type=${gcpConfig.gpuType},count=${gcpConfig.gpuCount} \\
  --image-family=ubuntu-2204-lts \\
  --image-project=ubuntu-os-cloud \\
  --boot-disk-size=100GB \\
  --maintenance-policy=TERMINATE`;
  };

  const generateDriverInstallCommand = () => {
    return `# Update system packages
sudo apt update && sudo apt upgrade -y

# Install NVIDIA drivers
sudo apt install -y nvidia-driver-${gcpConfig.driverVersion}

# Verify installation
nvidia-smi

# Install CUDA toolkit (optional)
sudo apt install -y nvidia-cuda-toolkit`;
  };

  const generateOpsAgentCommand = () => {
    return `# Download and install Ops Agent
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

# Verify Ops Agent is running
sudo systemctl status google-cloud-ops-agent

# Configure GPU metrics collection
sudo tee /etc/google-cloud-ops-agent/config.yaml > /dev/null <<EOF
metrics:
  receivers:
    nvml:
      type: nvml
  service:
    pipelines:
      nvml:
        receivers:
          - nvml
EOF

# Restart Ops Agent to apply configuration
sudo systemctl restart google-cloud-ops-agent`;
  };

  const generateDcgmCommand = () => {
    return `# Install DCGM repository
distribution=$(. /etc/os-release; echo $ID$VERSION_ID | sed -e 's/\\.//g')
wget https://developer.download.nvidia.com/compute/cuda/repos/\${distribution}/x86_64/cuda-keyring_1.0-1_all.deb
sudo dpkg -i cuda-keyring_1.0-1_all.deb

# Install DCGM
sudo apt update
sudo apt install -y datacenter-gpu-manager

# Enable and start DCGM service
sudo systemctl enable nvidia-dcgm
sudo systemctl start nvidia-dcgm

# Verify DCGM is running
dcgmi discovery -l

# Start DCGM exporter for Prometheus metrics
docker run -d --gpus all --rm -p 9400:9400 \\
  nvcr.io/nvidia/k8s/dcgm-exporter:3.3.0-3.2.0-ubuntu22.04`;
  };

  const copyCommand = (command: string, name: string) => {
    navigator.clipboard.writeText(command);
    toast({
      title: "Copied",
      description: `${name} command copied to clipboard.`,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="onboarding" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="onboarding" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Setup Guide
          </TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="gcp-gpu">Google Cloud GPU</TabsTrigger>
          <TabsTrigger value="integrations">API Integrations</TabsTrigger>
          <TabsTrigger value="ai-data">AI Training Data</TabsTrigger>
        </TabsList>

        <TabsContent value="onboarding" className="mt-6">
          <DataCenterOnboarding />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6 mt-6">
          {/* Webhooks Section */}
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure real-time data ingestion via webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Button onClick={generateWebhookUrl} disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Generate Webhook URL
                </Button>
              </div>

              {webhookUrl && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={testWebhook} disabled={isTesting}>
                      {isTesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Example Payload (OpenTelemetry Compatible)</Label>
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant={selectedVendor === "nvidia" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedVendor("nvidia")}
                      >
                        NVIDIA GPU
                      </Button>
                      <Button
                        variant={selectedVendor === "google_tpu" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedVendor("google_tpu")}
                      >
                        Google TPU
                      </Button>
                      <Button
                        variant={selectedVendor === "amd" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedVendor("amd")}
                      >
                        AMD GPU
                      </Button>
                    </div>
                    <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto">
                      {examplePayload}
                    </pre>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports NVIDIA (DCGM/nvidia-smi), Google TPU (Cloud Monitoring), and AMD (ROCm SMI) telemetry formats.
                    </p>
                  </div>
                </div>
              )}

              {webhookLogs.length > 0 && (
                <div className="space-y-2">
                  <Label>Recent Webhook Activity</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookLogs.map((log, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-primary">
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{log.sourceIp}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gcp-gpu" className="space-y-6 mt-6">
          {/* Google Cloud GPU Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-primary" />
                Google Cloud GPU Monitoring Setup
              </CardTitle>
              <CardDescription>
                Configure NVIDIA GPU monitoring and benchmarking on Google Cloud Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gcp-project">GCP Project ID</Label>
                  <Input
                    id="gcp-project"
                    placeholder="my-project-id"
                    value={gcpConfig.projectId}
                    onChange={(e) => setGcpConfig({ ...gcpConfig, projectId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gcp-zone">Zone</Label>
                  <select
                    id="gcp-zone"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={gcpConfig.zone}
                    onChange={(e) => setGcpConfig({ ...gcpConfig, zone: e.target.value })}
                  >
                    {gcpZones.map((zone) => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpu-type">GPU Type</Label>
                  <select
                    id="gpu-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={gcpConfig.gpuType}
                    onChange={(e) => setGcpConfig({ ...gcpConfig, gpuType: e.target.value })}
                  >
                    {gpuTypes.map((gpu) => (
                      <option key={gpu.value} value={gpu.value}>{gpu.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpu-count">GPU Count</Label>
                  <Input
                    id="gpu-count"
                    type="number"
                    min={1}
                    max={8}
                    value={gcpConfig.gpuCount}
                    onChange={(e) => setGcpConfig({ ...gcpConfig, gpuCount: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="machine-type">Machine Type</Label>
                  <Input
                    id="machine-type"
                    placeholder="a2-highgpu-1g"
                    value={gcpConfig.machineType}
                    onChange={(e) => setGcpConfig({ ...gcpConfig, machineType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver-version">Driver Version</Label>
                  <select
                    id="driver-version"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={gcpConfig.driverVersion}
                    onChange={(e) => setGcpConfig({ ...gcpConfig, driverVersion: e.target.value })}
                  >
                    <option value="535">535 (Latest Stable)</option>
                    <option value="525">525</option>
                    <option value="515">515</option>
                    <option value="470">470 (LTS)</option>
                  </select>
                </div>
              </div>

              {/* Selected GPU Info */}
              {selectedGpu && (
                <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Memory: <strong>{selectedGpu.memory}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm">TDP: <strong>{selectedGpu.power}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Count: <strong>{gcpConfig.gpuCount}</strong></span>
                  </div>
                </div>
              )}

              {/* Setup Steps Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="step1">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary/20 text-primary">Step 1</Badge>
                      <Server className="h-4 w-4" />
                      <span>Provision GPU-Enabled VM</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Create a VM instance with your selected GPU configuration using the gcloud CLI or Cloud Console.
                    </p>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto whitespace-pre-wrap">
                        {generateGcloudCommand()}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCommand(generateGcloudCommand(), "VM creation")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        <strong>Note:</strong> Ensure your GCP project has sufficient GPU quota for the selected GPU type and zone.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step2">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary/20 text-primary">Step 2</Badge>
                      <Terminal className="h-4 w-4" />
                      <span>Install NVIDIA Drivers</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      SSH into your VM and install the NVIDIA drivers. After installation, verify with nvidia-smi.
                    </p>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto whitespace-pre-wrap">
                        {generateDriverInstallCommand()}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCommand(generateDriverInstallCommand(), "Driver installation")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step3">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary/20 text-primary">Step 3</Badge>
                      <Monitor className="h-4 w-4" />
                      <span>Configure Ops Agent Monitoring</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      Install the Google Cloud Ops Agent to collect GPU metrics and visualize them in Cloud Monitoring.
                    </p>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto whitespace-pre-wrap">
                        {generateOpsAgentCommand()}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCommand(generateOpsAgentCommand(), "Ops Agent")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="ops-agent-installed"
                        checked={gcpConfig.opsAgentInstalled}
                        onChange={(e) => setGcpConfig({ ...gcpConfig, opsAgentInstalled: e.target.checked })}
                        className="rounded border-border"
                      />
                      <Label htmlFor="ops-agent-installed" className="text-sm">
                        Mark as installed
                      </Label>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary/20 text-primary">Step 4</Badge>
                      <Settings2 className="h-4 w-4" />
                      <span>Enable DCGM for Advanced Metrics</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                      NVIDIA Data Center GPU Manager (DCGM) provides advanced profiling and monitoring capabilities.
                    </p>
                    <div className="relative">
                      <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto whitespace-pre-wrap">
                        {generateDcgmCommand()}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCommand(generateDcgmCommand(), "DCGM")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="dcgm-enabled"
                        checked={gcpConfig.dcgmEnabled}
                        onChange={(e) => setGcpConfig({ ...gcpConfig, dcgmEnabled: e.target.checked })}
                        className="rounded border-border"
                      />
                      <Label htmlFor="dcgm-enabled" className="text-sm">
                        Mark DCGM as enabled
                      </Label>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Configuration Status */}
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3">Configuration Status</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      {gcpConfig.projectId ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">Project ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">GPU Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {gcpConfig.opsAgentInstalled ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">Ops Agent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {gcpConfig.dcgmEnabled ? (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">DCGM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benchmarking Tips */}
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Benchmarking for Efficiency
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium">Real-time Monitoring:</p>
                    <code className="block p-2 bg-muted rounded text-xs">nvidia-smi -l 1</code>
                    <p className="text-muted-foreground text-xs">Monitor GPU load, memory, and temperature every second</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Power & Performance:</p>
                    <code className="block p-2 bg-muted rounded text-xs">nvidia-smi --query-gpu=power.draw,utilization.gpu,memory.used --format=csv -l 1</code>
                    <p className="text-muted-foreground text-xs">Export specific metrics to CSV for analysis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 mt-6">
          {/* External API Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>External API Integrations</CardTitle>
              <CardDescription>Connect to third-party monitoring services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Electricity Provider API</h4>
                    {integrations.electricity ? (
                      <Badge className="bg-primary/20 text-primary">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Disconnected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="electricity-key">API Key</Label>
                    <Input
                      id="electricity-key"
                      type="password"
                      placeholder="Enter API key..."
                      value={electricityApiKey}
                      onChange={(e) => setElectricityApiKey(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => connectIntegration("electricity")}
                  >
                    Connect
                  </Button>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Data Centre Monitoring API</h4>
                    {integrations.dataCenter ? (
                      <Badge className="bg-primary/20 text-primary">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="mr-1 h-3 w-3" />
                        Disconnected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="datacenter-key">API Key</Label>
                    <Input
                      id="datacenter-key"
                      type="password"
                      placeholder="Enter API key..."
                      value={dataCenterApiKey}
                      onChange={(e) => setDataCenterApiKey(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => connectIntegration("dataCenter")}
                  >
                    Connect
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Supported Integrations</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">AWS CloudWatch</Badge>
                  <Badge variant="outline">Azure Monitor</Badge>
                  <Badge variant="outline">Google Cloud Monitoring</Badge>
                  <Badge variant="outline">Generic REST API</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-data" className="space-y-6 mt-6">
          {/* AI Training Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                AI Training Cost Database
              </CardTitle>
              <CardDescription>
                Add and manage AI model training cost data for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new model form */}
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-medium">Add New Model</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Model Name</Label>
                    <Input
                      placeholder="GPT-5"
                      value={newModel.name}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Input
                      placeholder="OpenAI"
                      value={newModel.provider}
                      onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Energy (kWh)</Label>
                    <Input
                      type="number"
                      placeholder="1000000"
                      value={newModel.energyKwh}
                      onChange={(e) => setNewModel({ ...newModel, energyKwh: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost (USD)</Label>
                    <Input
                      type="number"
                      placeholder="50000000"
                      value={newModel.costUsd}
                      onChange={(e) => setNewModel({ ...newModel, costUsd: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parameters (B)</Label>
                    <Input
                      type="number"
                      placeholder="175"
                      value={newModel.params}
                      onChange={(e) => setNewModel({ ...newModel, params: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addAiModel}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Model
                </Button>
              </div>

              {/* Existing models list */}
              <div className="space-y-2">
                <Label>Existing Models ({aiModels.length})</Label>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {aiModels.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div>
                          <p className="font-medium">{model.model_name}</p>
                          <p className="text-xs text-muted-foreground">{model.model_provider}</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {Number(model.parameters_billions).toFixed(0)}B params
                          </span>
                          <span className="text-yellow-500">
                            {(Number(model.energy_kwh) / 1000).toFixed(0)} MWh
                          </span>
                          <span className="text-destructive">
                            ${(Number(model.cost_usd) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
