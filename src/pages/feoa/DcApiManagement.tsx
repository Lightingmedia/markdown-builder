import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  Loader2,
  Trash2,
  Wifi,
  WifiOff,
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

interface DcEndpoint {
  id: string;
  name: string;
  type: string;
  url: string;
  status: string;
  last_ping: string | null;
  metadata: unknown;
  created_at: string;
}

interface TelemetryEntry {
  id: string;
  endpoint_id: string | null;
  endpoint_name: string;
  endpoint_type: string;
  temperature_c: number | null;
  power_w: number | null;
  utilization_pct: number | null;
  flow_lpm: number | null;
  pressure_bar: number | null;
  leak_status: string | null;
  load_kw: number | null;
  voltage_v: number | null;
  power_factor: number | null;
  created_at: string;
}

export default function DcApiManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [apiEnabled, setApiEnabled] = useState(true);
  const [rbacEnabled, setRbacEnabled] = useState(true);
  const [telemetryInterval, setTelemetryInterval] = useState("1000");
  
  // Endpoint state
  const [endpoints, setEndpoints] = useState<DcEndpoint[]>([]);
  const [loadingEndpoints, setLoadingEndpoints] = useState(true);
  const [registering, setRegistering] = useState(false);
  
  // New endpoint form
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    type: 'compute' as 'compute' | 'cooling' | 'power',
    url: ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Real-time telemetry
  const [telemetryStream, setTelemetryStream] = useState<TelemetryEntry[]>([]);
  const [streamActive, setStreamActive] = useState(false);

  const apiEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dc-api`;

  // Fetch endpoints from database
  const fetchEndpoints = async () => {
    setLoadingEndpoints(true);
    const { data, error } = await supabase
      .from('dc_endpoints')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching endpoints:', error);
      toast({
        title: "Error",
        description: "Failed to load endpoints",
        variant: "destructive"
      });
    } else {
      setEndpoints(data || []);
    }
    setLoadingEndpoints(false);
  };

  // Fetch initial telemetry
  const fetchTelemetry = async () => {
    const { data, error } = await supabase
      .from('dc_telemetry')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setTelemetryStream(data);
    }
  };

  // Subscribe to real-time telemetry updates
  useEffect(() => {
    fetchEndpoints();
    fetchTelemetry();
    
    // Set up real-time subscription for telemetry
    const channel = supabase
      .channel('dc-telemetry-stream')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dc_telemetry'
        },
        (payload) => {
          console.log('[DC-API] New telemetry:', payload.new);
          setTelemetryStream(prev => [payload.new as TelemetryEntry, ...prev.slice(0, 19)]);
          setStreamActive(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(apiEndpoint);
    toast({
      title: "API Endpoint Copied",
      description: "The DC API endpoint has been copied to your clipboard.",
    });
  };

  const handleRefreshConnections = async () => {
    toast({
      title: "Refreshing Connections",
      description: "Polling all connected endpoints for status updates...",
    });
    await fetchEndpoints();
  };

  // Validate and register new endpoint
  const handleRegisterEndpoint = async () => {
    const errors: string[] = [];
    
    if (!newEndpoint.name || newEndpoint.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    
    if (!newEndpoint.url || newEndpoint.url.trim().length < 5) {
      errors.push("URL/IP address is required");
    }
    
    if (!['compute', 'cooling', 'power'].includes(newEndpoint.type)) {
      errors.push("Type must be compute, cooling, or power");
    }

    setValidationErrors(errors);
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors[0],
        variant: "destructive"
      });
      return;
    }

    setRegistering(true);
    
    try {
      // Call edge function to register endpoint
      const response = await supabase.functions.invoke('dc-api', {
        body: {
          name: newEndpoint.name.trim(),
          type: newEndpoint.type,
          url: newEndpoint.url.trim()
        },
        method: 'POST'
      });

      if (response.error) {
        throw new Error(response.error.message || 'Registration failed');
      }

      toast({
        title: "Endpoint Registered",
        description: `${newEndpoint.name} has been registered successfully`,
      });

      // Reset form and refresh
      setNewEndpoint({ name: '', type: 'compute', url: '' });
      setValidationErrors([]);
      await fetchEndpoints();
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  // Delete endpoint
  const handleDeleteEndpoint = async (id: string) => {
    const { error } = await supabase
      .from('dc_endpoints')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete endpoint",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Endpoint Deleted",
        description: "The endpoint has been removed",
      });
      setEndpoints(prev => prev.filter(e => e.id !== id));
    }
  };

  // Format telemetry for display
  const formatTelemetryLine = (entry: TelemetryEntry) => {
    const time = new Date(entry.created_at).toLocaleTimeString();
    const name = entry.endpoint_name;
    
    let metrics = '';
    if (entry.endpoint_type === 'compute') {
      metrics = `Temp=${entry.temperature_c ?? '--'}°C, Power=${entry.power_w ?? '--'}W, Util=${entry.utilization_pct ?? '--'}%`;
    } else if (entry.endpoint_type === 'cooling') {
      metrics = `Flow=${entry.flow_lpm ?? '--'}L/min, Pressure=${entry.pressure_bar ?? '--'}bar, Leak=${entry.leak_status || 'OK'}`;
    } else if (entry.endpoint_type === 'power') {
      metrics = `Load=${entry.load_kw ?? '--'}kW, Voltage=${entry.voltage_v ?? '--'}V, PF=${entry.power_factor ?? '--'}`;
    }
    
    return `[${time}] ${name}: ${metrics}`;
  };

  // Get relative time
  const getRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    if (diff < 1000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
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
                <Badge variant="outline">Redfish-Compatible</Badge>
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
            <h3 className="text-lg font-semibold">Connected Infrastructure ({endpoints.length})</h3>
            <Button variant="outline" onClick={handleRefreshConnections} disabled={loadingEndpoints}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingEndpoints ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>

          {loadingEndpoints ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : endpoints.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Endpoints Connected</p>
                <p className="text-sm text-muted-foreground">Register your first infrastructure endpoint below</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {endpoints.map((endpoint) => {
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
                          <p className="text-sm text-muted-foreground">{endpoint.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{getRelativeTime(endpoint.last_ping)}</span>
                        <Badge
                          variant={endpoint.status === "connected" ? "default" : endpoint.status === "warning" ? "destructive" : "secondary"}
                          className="capitalize gap-1"
                        >
                          {endpoint.status === 'connected' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                          {endpoint.status}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEndpoint(endpoint.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Register New Endpoint</CardTitle>
              <CardDescription>Connect a new infrastructure component to the DC API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationErrors.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  {validationErrors.map((err, i) => (
                    <p key={i} className="text-sm text-destructive">{err}</p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Endpoint Name *</Label>
                  <Input 
                    placeholder="e.g., GPU Cluster C" 
                    value={newEndpoint.name}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Endpoint Type *</Label>
                  <Select 
                    value={newEndpoint.type} 
                    onValueChange={(v) => setNewEndpoint(prev => ({ ...prev, type: v as 'compute' | 'cooling' | 'power' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compute">
                        <span className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" /> Compute / GPU
                        </span>
                      </SelectItem>
                      <SelectItem value="cooling">
                        <span className="flex items-center gap-2">
                          <Droplets className="h-4 w-4" /> Cooling / CDU
                        </span>
                      </SelectItem>
                      <SelectItem value="power">
                        <span className="flex items-center gap-2">
                          <Zap className="h-4 w-4" /> Power / PDU
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Endpoint URL / IP Address *</Label>
                  <Input 
                    placeholder="https://10.0.1.100/redfish/v1" 
                    value={newEndpoint.url}
                    onChange={(e) => setNewEndpoint(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleRegisterEndpoint} disabled={registering}>
                {registering ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                {registering ? 'Registering...' : 'Register Endpoint'}
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
              <CardTitle className="flex items-center gap-2">
                Live Sensor Stream
                {streamActive && (
                  <Badge variant="default" className="ml-2 gap-1">
                    <Activity className="h-3 w-3 animate-pulse" />
                    Live
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Real-time telemetry data from connected endpoints (via WebSocket)</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px] border border-border rounded-lg p-3 font-mono text-xs bg-muted/30">
                {telemetryStream.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Activity className="h-8 w-8 mb-2" />
                    <p>Waiting for telemetry data...</p>
                    <p className="text-xs">Send data to the DC API telemetry endpoint</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {telemetryStream.map((entry) => (
                      <p key={entry.id} className="text-muted-foreground hover:text-foreground transition-colors">
                        {formatTelemetryLine(entry)}
                      </p>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
