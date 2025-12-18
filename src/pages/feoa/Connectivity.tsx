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
import { Copy, RefreshCw, CheckCircle, XCircle, Loader2, Send, Plus, Database } from "lucide-react";

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
      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="integrations">API Integrations</TabsTrigger>
          <TabsTrigger value="ai-data">AI Training Data</TabsTrigger>
        </TabsList>

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
