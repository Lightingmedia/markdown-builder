import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Check, Download, Server, Webhook, Cloud, Activity, Shield, Zap, BookOpen, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportIntegrationDocumentation } from "@/lib/integrationDocsPdf";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function DataCenterOnboarding() {
  const { toast } = useToast();
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { id: "prereq", title: "Review Prerequisites", description: "Ensure your infrastructure meets requirements", completed: false },
    { id: "auth", title: "Create API Credentials", description: "Generate authentication tokens", completed: false },
    { id: "webhook", title: "Configure Webhook Endpoint", description: "Set up data ingestion pipeline", completed: false },
    { id: "agent", title: "Deploy Monitoring Agent", description: "Install telemetry collection agent", completed: false },
    { id: "test", title: "Validate Connection", description: "Send test payload and verify data flow", completed: false },
  ]);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "lgwaccltpoogoukjyzke";
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/energy-webhook-handler`;

  const completedSteps = steps.filter((s) => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  const toggleStep = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s))
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(label);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied successfully.`,
    });
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handleDownloadDocs = () => {
    exportIntegrationDocumentation({ webhookUrl, projectId });
    toast({
      title: "Documentation Generated",
      description: "Integration guide PDF has been downloaded.",
    });
  };

  const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "timestamp": "2024-01-15T10:30:00Z",
    "facility_id": "dc-west-01",
    "accelerator_vendor": "nvidia",
    "gpu_wattage": 350,
    "nvidia_utilization": 85,
    "nvidia_memory_gb": 40,
    "temp_c": 72,
    "humidity_pct": 45,
    "hvac_status": "ON",
    "tokens_generated": 15000,
    "model_id": "llama-3-70b"
  }'`;

  const pythonExample = `import requests
from datetime import datetime

FEOA_WEBHOOK_URL = "${webhookUrl}"
API_KEY = "your_api_key_here"

def send_telemetry(facility_id: str, gpu_data: dict):
    payload = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "facility_id": facility_id,
        "accelerator_vendor": "nvidia",
        **gpu_data
    }
    
    response = requests.post(
        FEOA_WEBHOOK_URL,
        json=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }
    )
    return response.status_code == 200

# Example usage
send_telemetry("dc-west-01", {
    "gpu_wattage": 350,
    "nvidia_utilization": 85,
    "nvidia_memory_gb": 40,
    "temp_c": 72,
    "tokens_generated": 15000
})`;

  const prometheusConfig = `# prometheus.yml - FEOA Remote Write Configuration
remote_write:
  - url: "${webhookUrl}/prometheus"
    bearer_token: "YOUR_API_KEY"
    write_relabel_configs:
      - source_labels: [__name__]
        regex: 'DCGM_FI_DEV_POWER_USAGE|DCGM_FI_DEV_GPU_UTIL|DCGM_FI_DEV_MEM_COPY_UTIL'
        action: keep

# Scrape DCGM Exporter
scrape_configs:
  - job_name: 'dcgm-exporter'
    static_configs:
      - targets: ['localhost:9400']`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Centre Integration Guide</h2>
          <p className="text-muted-foreground">
            Step-by-step instructions to connect your infrastructure to FEOA
          </p>
        </div>
        <Button onClick={handleDownloadDocs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download PDF Guide
        </Button>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Setup Progress</CardTitle>
            <Badge variant={progress === 100 ? "default" : "secondary"}>
              {completedSteps} of {steps.length} complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleStep(step.id)}
              >
                <Checkbox checked={step.completed} />
                <span className={`text-xs ${step.completed ? "text-primary" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Prerequisites
          </CardTitle>
          <CardDescription>Ensure your environment meets these requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Infrastructure Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• NVIDIA GPU with DCGM or nvidia-smi access</li>
                <li>• Network connectivity to FEOA endpoints (HTTPS/443)</li>
                <li>• Server with cron or systemd for scheduled tasks</li>
                <li>• Minimum 100MB RAM for monitoring agent</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Supported Platforms</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• NVIDIA GPUs (Tesla, A100, H100, L4, T4)</li>
                <li>• Google Cloud TPUs (v2, v3, v4)</li>
                <li>• AMD Instinct GPUs (MI250, MI300)</li>
                <li>• Bare metal & virtualised environments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Integration Methods
          </CardTitle>
          <CardDescription>Choose the method that best fits your infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Method 1: Direct Webhook */}
            <AccordionItem value="webhook">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-primary">Recommended</Badge>
                  <span>Direct Webhook Integration</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Send telemetry data directly via HTTPS POST requests. Ideal for custom scripts or existing monitoring pipelines.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Webhook Endpoint</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                    >
                      {copiedCommand === "Webhook URL" ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <code className="block p-3 bg-muted rounded text-xs font-mono break-all">
                    {webhookUrl}
                  </code>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">cURL Example</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(curlExample, "cURL command")}
                    >
                      {copiedCommand === "cURL command" ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="p-3 bg-muted rounded text-xs font-mono overflow-x-auto">
                    {curlExample}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Method 2: Python SDK */}
            <AccordionItem value="python">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span>Python Integration</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use our Python example to integrate with your existing monitoring scripts or Jupyter notebooks.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Python Script</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(pythonExample, "Python script")}
                    >
                      {copiedCommand === "Python script" ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="p-3 bg-muted rounded text-xs font-mono overflow-x-auto">
                    {pythonExample}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Method 3: Prometheus */}
            <AccordionItem value="prometheus">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span>Prometheus Remote Write</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  If you are using Prometheus with DCGM Exporter, configure remote write to stream metrics to FEOA.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">prometheus.yml Configuration</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(prometheusConfig, "Prometheus config")}
                    >
                      {copiedCommand === "Prometheus config" ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="p-3 bg-muted rounded text-xs font-mono overflow-x-auto">
                    {prometheusConfig}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Payload Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Telemetry Payload Schema
          </CardTitle>
          <CardDescription>Required and optional fields for data submission</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Field</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Required</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 font-mono text-xs">timestamp</td>
                  <td className="py-2">ISO 8601</td>
                  <td className="py-2"><Badge variant="destructive" className="text-xs">Required</Badge></td>
                  <td className="py-2">UTC timestamp of the measurement</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-xs">facility_id</td>
                  <td className="py-2">String</td>
                  <td className="py-2"><Badge variant="destructive" className="text-xs">Required</Badge></td>
                  <td className="py-2">Unique identifier for your data centre</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-xs">accelerator_vendor</td>
                  <td className="py-2">Enum</td>
                  <td className="py-2"><Badge variant="secondary" className="text-xs">Optional</Badge></td>
                  <td className="py-2">nvidia | google_tpu | amd (default: nvidia)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-xs">gpu_wattage</td>
                  <td className="py-2">Number</td>
                  <td className="py-2"><Badge variant="secondary" className="text-xs">Optional</Badge></td>
                  <td className="py-2">Current GPU power consumption in watts</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-xs">nvidia_utilization</td>
                  <td className="py-2">Number</td>
                  <td className="py-2"><Badge variant="secondary" className="text-xs">Optional</Badge></td>
                  <td className="py-2">GPU utilisation percentage (0-100)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-xs">temp_c</td>
                  <td className="py-2">Number</td>
                  <td className="py-2"><Badge variant="secondary" className="text-xs">Optional</Badge></td>
                  <td className="py-2">Ambient temperature in Celsius</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-mono text-xs">tokens_generated</td>
                  <td className="py-2">Integer</td>
                  <td className="py-2"><Badge variant="secondary" className="text-xs">Optional</Badge></td>
                  <td className="py-2">Number of tokens generated (for LLM workloads)</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-xs">model_id</td>
                  <td className="py-2">String</td>
                  <td className="py-2"><Badge variant="secondary" className="text-xs">Optional</Badge></td>
                  <td className="py-2">Identifier for the AI model being run</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={handleDownloadDocs}>
              <Download className="mr-2 h-4 w-4" />
              Download Full Documentation
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@lightrail.ai">
                <ExternalLink className="mr-2 h-4 w-4" />
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
