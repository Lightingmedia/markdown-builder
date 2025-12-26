import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Cpu,
  Shield,
  Activity,
  Thermometer,
  Zap,
  Droplets,
  Settings,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Server,
  Gauge,
  Lock,
} from "lucide-react";

// Redfish-inspired API capability definitions
const API_CAPABILITIES = {
  management: {
    title: "Unified Multi-Vendor Management",
    icon: Settings,
    color: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    features: [
      "Single, standardised API",
      "Cross-vendor hardware control (NVIDIA / AMD / Intel, etc.)",
      "Reduces operational complexity",
      "Replaces vendor-specific IPMI/OEM extensions",
    ],
  },
  security: {
    title: "Modern Security Framework",
    icon: Shield,
    color: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    features: [
      "Session-based authentication",
      "X.509 certificate support",
      "RBAC (Role-Based Access Control)",
      "Built-in security for multi-tenant AI environments",
    ],
  },
  telemetry: {
    title: "Precision Telemetry",
    icon: Activity,
    color: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    features: [
      "GPU power capping / power control",
      "Real-time sensor data collection (voltage, current, temperature)",
      "Foundation for energy efficiency optimisation",
      "Enables performance tuning / optimisation",
    ],
  },
  compute: {
    title: "Compute / Accelerators",
    icon: Cpu,
    color: "bg-slate-100 dark:bg-slate-800/50",
    iconColor: "text-slate-600 dark:text-slate-400",
    features: [
      "Per-GPU instance power control (Power Capping)",
      "NVLink / PCIe switch health & status monitoring",
      "Unified firmware management",
    ],
  },
  cooling: {
    title: "Liquid Cooling",
    icon: Droplets,
    color: "bg-cyan-100 dark:bg-cyan-900/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    features: [
      "CDU (Cooling Distribution Unit) pump RPM monitoring",
      "Cooling loop pressure monitoring",
      "Leak detection sensors + event integration",
    ],
  },
  power: {
    title: "Power Infrastructure",
    icon: Zap,
    color: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    features: [
      "Smart PDU outlet-level power metering",
      "OCP Power Shelf load balancing",
      "Efficiency reporting / analytics",
    ],
  },
};

// Mock connected endpoints
const CONNECTED_ENDPOINTS = [
  { id: "1", name: "GPU Cluster A", type: "compute", status: "connected", lastPing: "2s ago" },
  { id: "2", name: "CDU Unit 1", type: "cooling", status: "connected", lastPing: "5s ago" },
  { id: "3", name: "PDU Rack 1", type: "power", status: "warning", lastPing: "30s ago" },
  { id: "4", name: "GPU Cluster B", type: "compute", status: "connected", lastPing: "1s ago" },
];

export default function DcApiManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [apiEnabled, setApiEnabled] = useState(true);
  const [rbacEnabled, setRbacEnabled] = useState(true);
  const [telemetryInterval, setTelemetryInterval] = useState("1000");

  const apiEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dc-api`;

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(apiEndpoint);
    toast({
      title: "API Endpoint Copied",
      description: "The DC API endpoint has been copied to your clipboard.",
    });
  };

  const handleRefreshConnections = () => {
    toast({
      title: "Refreshing Connections",
      description: "Polling all connected endpoints for status updates...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">DC API Management</h1>
          <p className="text-muted-foreground">
            Unified infrastructure management API inspired by DMTF Redfish
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">API Status</span>
            <Badge variant={apiEnabled ? "default" : "secondary"} className="gap-1">
              {apiEnabled ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {apiEnabled ? "Active" : "Disabled"}
            </Badge>
          </div>
          <Switch checked={apiEnabled} onCheckedChange={setApiEnabled} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* API Endpoint Card */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                API Gateway Endpoint
              </CardTitle>
              <CardDescription>
                Single entry point for all DC infrastructure management operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input value={apiEndpoint} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopyEndpoint}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">REST API</Badge>
                <Badge variant="outline">JSON Payload</Badge>
                <Badge variant="outline">TLS 1.3</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Capability Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(API_CAPABILITIES).map(([key, capability]) => (
              <Card key={key} className="overflow-hidden">
                <CardHeader className={`${capability.color} pb-3`}>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <capability.icon className={`h-5 w-5 ${capability.iconColor}`} />
                    {capability.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {capability.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Connected Infrastructure</h3>
            <Button variant="outline" onClick={handleRefreshConnections}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>

          <div className="grid gap-4">
            {CONNECTED_ENDPOINTS.map((endpoint) => {
              const cap = API_CAPABILITIES[endpoint.type as keyof typeof API_CAPABILITIES];
              return (
                <Card key={endpoint.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${cap?.color || "bg-muted"}`}>
                        {cap?.icon && <cap.icon className={`h-5 w-5 ${cap?.iconColor}`} />}
                      </div>
                      <div>
                        <p className="font-medium">{endpoint.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{endpoint.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">{endpoint.lastPing}</span>
                      <Badge
                        variant={endpoint.status === "connected" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {endpoint.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Endpoint</CardTitle>
              <CardDescription>Connect a new infrastructure component to the DC API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Endpoint Name</Label>
                  <Input placeholder="e.g., GPU Cluster C" />
                </div>
                <div className="space-y-2">
                  <Label>Endpoint Type</Label>
                  <Input placeholder="compute / cooling / power" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endpoint URL / IP Address</Label>
                <Input placeholder="https://10.0.1.100/redfish/v1" />
              </div>
              <Button>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Register Endpoint
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                Configure authentication and access control for the DC API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Role-Based Access Control (RBAC)</p>
                  <p className="text-sm text-muted-foreground">
                    Enable fine-grained permissions for API operations
                  </p>
                </div>
                <Switch checked={rbacEnabled} onCheckedChange={setRbacEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session-Based Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require authenticated sessions for all API calls
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">X.509 Certificate Validation</p>
                  <p className="text-sm text-muted-foreground">
                    Validate client certificates for mutual TLS
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-3">API Key Management</h4>
                <div className="space-y-2">
                  <Label>Current API Key</Label>
                  <div className="flex gap-2">
                    <Input type="password" value="dc-api-xxxxx-xxxxx-xxxxx" readOnly />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Roles</CardTitle>
              <CardDescription>Define permissions for different user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {["Administrator", "Operator", "Viewer", "Auditor"].map((role) => (
                    <div key={role} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <span className="font-medium">{role}</span>
                      <div className="flex gap-2">
                        {role === "Administrator" && (
                          <>
                            <Badge variant="outline">Read</Badge>
                            <Badge variant="outline">Write</Badge>
                            <Badge variant="outline">Delete</Badge>
                            <Badge>Admin</Badge>
                          </>
                        )}
                        {role === "Operator" && (
                          <>
                            <Badge variant="outline">Read</Badge>
                            <Badge variant="outline">Write</Badge>
                          </>
                        )}
                        {role === "Viewer" && <Badge variant="outline">Read</Badge>}
                        {role === "Auditor" && (
                          <>
                            <Badge variant="outline">Read</Badge>
                            <Badge variant="outline">Audit</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telemetry Tab */}
        <TabsContent value="telemetry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Telemetry Configuration
              </CardTitle>
              <CardDescription>
                Configure real-time sensor data collection and monitoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Polling Interval (ms)</Label>
                <Input
                  type="number"
                  value={telemetryInterval}
                  onChange={(e) => setTelemetryInterval(e.target.value)}
                  placeholder="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Frequency of sensor data collection. Lower values increase accuracy but also load.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <span>Temperature Sensors</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Power Metrics</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    <span>Cooling Metrics</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-slate-500" />
                    <span>GPU Utilisation</span>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Sensor Stream</CardTitle>
              <CardDescription>Real-time telemetry data from connected endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] border border-border rounded-lg p-3 font-mono text-xs">
                <div className="space-y-1 text-muted-foreground">
                  <p>[2025-12-26 10:23:45] GPU-A1: Temp=72°C, Power=685W, Util=98%</p>
                  <p>[2025-12-26 10:23:44] CDU-1: Flow=45L/min, Pressure=2.1bar, Leak=OK</p>
                  <p>[2025-12-26 10:23:44] PDU-R1: Load=12.5kW, Voltage=480V, PF=0.98</p>
                  <p>[2025-12-26 10:23:43] GPU-A2: Temp=70°C, Power=672W, Util=95%</p>
                  <p>[2025-12-26 10:23:43] GPU-B1: Temp=68°C, Power=690W, Util=99%</p>
                  <p>[2025-12-26 10:23:42] CDU-1: Flow=45L/min, Pressure=2.1bar, Leak=OK</p>
                  <p>[2025-12-26 10:23:41] PDU-R2: Load=11.8kW, Voltage=480V, PF=0.97</p>
                  <p>[2025-12-26 10:23:40] GPU-A1: Temp=71°C, Power=688W, Util=97%</p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
