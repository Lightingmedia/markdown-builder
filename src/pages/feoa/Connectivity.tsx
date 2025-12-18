import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, CheckCircle, XCircle, Loader2, Send } from "lucide-react";

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

  // API Integrations state
  const [electricityApiKey, setElectricityApiKey] = useState("");
  const [dataCenterApiKey, setDataCenterApiKey] = useState("");
  const [integrations, setIntegrations] = useState({
    electricity: false,
    dataCenter: false,
  });

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "lgwaccltpoogoukjyzke";

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
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          facility_id: "test-facility-001",
          temp_c: 22.5,
          humidity_pct: 60,
          hvac_status: "ON",
          gpu_wattage: 180,
          tokens_generated: 1200,
          model_id: "test-model",
        }),
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

    // Simulate API validation
    setIntegrations((prev) => ({ ...prev, [type]: true }));
    toast({
      title: "Connected",
      description: `${type === "electricity" ? "Electricity Provider" : "Data Center Monitoring"} integration is now active.`,
    });
  };

  const examplePayload = `{
  "timestamp": "2024-01-15T10:30:00Z",
  "facility_id": "facility-uuid",
  "temp_c": 22.5,
  "humidity_pct": 60,
  "hvac_status": "ON",
  "gpu_wattage": 180,
  "tokens_generated": 1200,
  "model_id": "gpt-3.5-turbo"
}`;

  return (
    <div className="space-y-6">
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
                <Label>Example Payload</Label>
                <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-auto">
                  {examplePayload}
                </pre>
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
    </div>
  );
}
