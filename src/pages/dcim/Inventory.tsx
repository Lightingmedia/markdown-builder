import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Server, 
  Plus,
  Search,
  RefreshCw,
  Building2,
  Box,
  Cpu,
  Network,
  Zap,
  Snowflake,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Demo data for inventory
const demoSites = [
  { id: "1", name: "US-East-1 Primary", location: "Ashburn, VA", region: "us-east-1", capacity_mw: 45.5, pue_target: 1.25, rooms: 4 },
  { id: "2", name: "EU-West-1 Primary", location: "Dublin, Ireland", region: "eu-west-1", capacity_mw: 32.0, pue_target: 1.18, rooms: 3 },
  { id: "3", name: "APAC-Tokyo-1", location: "Tokyo, Japan", region: "ap-northeast-1", capacity_mw: 28.5, pue_target: 1.22, rooms: 2 },
];

const demoNodes = [
  { id: "1", name: "gpu-node-001", node_type: "compute", manufacturer: "NVIDIA", model: "DGX H100", status: "online", rack: "A-01", power_rating_w: 10200 },
  { id: "2", name: "gpu-node-002", node_type: "compute", manufacturer: "NVIDIA", model: "DGX H100", status: "online", rack: "A-01", power_rating_w: 10200 },
  { id: "3", name: "gpu-node-003", node_type: "compute", manufacturer: "NVIDIA", model: "DGX A100", status: "maintenance", rack: "A-02", power_rating_w: 6500 },
  { id: "4", name: "storage-001", node_type: "storage", manufacturer: "NetApp", model: "AFF A900", status: "online", rack: "B-01", power_rating_w: 2800 },
  { id: "5", name: "spine-sw-01", node_type: "network", manufacturer: "Arista", model: "7800R3", status: "online", rack: "N-01", power_rating_w: 850 },
];

const demoAccelerators = [
  { id: "1", node: "gpu-node-001", accelerator_type: "gpu", manufacturer: "NVIDIA", model: "H100 SXM5", memory_gb: 80, tdp_w: 700, status: "online" },
  { id: "2", node: "gpu-node-001", accelerator_type: "gpu", manufacturer: "NVIDIA", model: "H100 SXM5", memory_gb: 80, tdp_w: 700, status: "online" },
  { id: "3", node: "gpu-node-002", accelerator_type: "gpu", manufacturer: "NVIDIA", model: "H100 SXM5", memory_gb: 80, tdp_w: 700, status: "online" },
  { id: "4", node: "gpu-node-003", accelerator_type: "gpu", manufacturer: "NVIDIA", model: "A100 SXM4", memory_gb: 80, tdp_w: 400, status: "maintenance" },
];

const demoPowerEquipment = [
  { id: "1", name: "PDU-A01-L", equipment_type: "pdu", capacity_kw: 200, redundancy_type: "2N", status: "online" },
  { id: "2", name: "UPS-Hall-A", equipment_type: "ups", capacity_kw: 1500, redundancy_type: "N+1", status: "online" },
  { id: "3", name: "Breaker-Main-1", equipment_type: "breaker", capacity_kw: 5000, redundancy_type: "N", status: "online" },
];

const demoCoolingEquipment = [
  { id: "1", name: "CDU-Row-A", equipment_type: "cdu", capacity_kw: 500, setpoint_c: 18, status: "online" },
  { id: "2", name: "CRAC-Hall-A-1", equipment_type: "crac", capacity_kw: 250, setpoint_c: 22, status: "online" },
  { id: "3", name: "Chiller-Plant-1", equipment_type: "chiller", capacity_kw: 2000, setpoint_c: 7, status: "online" },
];

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Online</Badge>;
      case "offline":
        return <Badge variant="destructive">Offline</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case "compute": return <Cpu className="h-4 w-4 text-emerald-400" />;
      case "storage": return <Box className="h-4 w-4 text-blue-400" />;
      case "network": return <Network className="h-4 w-4 text-purple-400" />;
      default: return <Server className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Inventory</h1>
            <p className="text-slate-400 mt-1">Complete asset inventory with topology graph</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search assets..." 
            className="pl-10 bg-slate-900/50 border-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Inventory Tabs */}
        <Tabs defaultValue="sites" className="space-y-4">
          <TabsList className="bg-slate-900/50 border border-slate-700">
            <TabsTrigger value="sites" className="data-[state=active]:bg-emerald-500/20">
              <Building2 className="h-4 w-4 mr-2" />
              Sites
            </TabsTrigger>
            <TabsTrigger value="nodes" className="data-[state=active]:bg-emerald-500/20">
              <Server className="h-4 w-4 mr-2" />
              Nodes
            </TabsTrigger>
            <TabsTrigger value="accelerators" className="data-[state=active]:bg-emerald-500/20">
              <Cpu className="h-4 w-4 mr-2" />
              Accelerators
            </TabsTrigger>
            <TabsTrigger value="power" className="data-[state=active]:bg-emerald-500/20">
              <Zap className="h-4 w-4 mr-2" />
              Power
            </TabsTrigger>
            <TabsTrigger value="cooling" className="data-[state=active]:bg-emerald-500/20">
              <Snowflake className="h-4 w-4 mr-2" />
              Cooling
            </TabsTrigger>
          </TabsList>

          {/* Sites Tab */}
          <TabsContent value="sites">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Data Center Sites</CardTitle>
                <CardDescription>Registered facilities and their capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Location</TableHead>
                      <TableHead className="text-slate-400">Region</TableHead>
                      <TableHead className="text-slate-400">Capacity (MW)</TableHead>
                      <TableHead className="text-slate-400">PUE Target</TableHead>
                      <TableHead className="text-slate-400">Rooms</TableHead>
                      <TableHead className="text-slate-400"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoSites.map((site) => (
                      <TableRow key={site.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white">{site.name}</TableCell>
                        <TableCell className="text-slate-300">{site.location}</TableCell>
                        <TableCell><Badge variant="outline">{site.region}</Badge></TableCell>
                        <TableCell className="text-emerald-400">{site.capacity_mw} MW</TableCell>
                        <TableCell className="text-cyan-400">{site.pue_target}</TableCell>
                        <TableCell className="text-slate-300">{site.rooms}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nodes Tab */}
          <TabsContent value="nodes">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Compute & Network Nodes</CardTitle>
                <CardDescription>Servers, switches, and storage systems</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Manufacturer</TableHead>
                      <TableHead className="text-slate-400">Model</TableHead>
                      <TableHead className="text-slate-400">Rack</TableHead>
                      <TableHead className="text-slate-400">Power (W)</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoNodes.map((node) => (
                      <TableRow key={node.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white flex items-center gap-2">
                          {getNodeTypeIcon(node.node_type)}
                          {node.name}
                        </TableCell>
                        <TableCell className="text-slate-300 capitalize">{node.node_type}</TableCell>
                        <TableCell className="text-slate-300">{node.manufacturer}</TableCell>
                        <TableCell className="text-slate-300">{node.model}</TableCell>
                        <TableCell><Badge variant="outline">{node.rack}</Badge></TableCell>
                        <TableCell className="text-yellow-400">{node.power_rating_w.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(node.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accelerators Tab */}
          <TabsContent value="accelerators">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">GPU/NPU Accelerators</CardTitle>
                <CardDescription>High-performance compute accelerators</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Node</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Manufacturer</TableHead>
                      <TableHead className="text-slate-400">Model</TableHead>
                      <TableHead className="text-slate-400">Memory</TableHead>
                      <TableHead className="text-slate-400">TDP</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoAccelerators.map((acc) => (
                      <TableRow key={acc.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white">{acc.node}</TableCell>
                        <TableCell className="text-slate-300 uppercase">{acc.accelerator_type}</TableCell>
                        <TableCell className="text-slate-300">{acc.manufacturer}</TableCell>
                        <TableCell className="text-emerald-400">{acc.model}</TableCell>
                        <TableCell className="text-cyan-400">{acc.memory_gb} GB</TableCell>
                        <TableCell className="text-yellow-400">{acc.tdp_w} W</TableCell>
                        <TableCell>{getStatusBadge(acc.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Power Tab */}
          <TabsContent value="power">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Power Distribution</CardTitle>
                <CardDescription>PDUs, UPS systems, and breakers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Capacity (kW)</TableHead>
                      <TableHead className="text-slate-400">Redundancy</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoPowerEquipment.map((eq) => (
                      <TableRow key={eq.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          {eq.name}
                        </TableCell>
                        <TableCell className="text-slate-300 uppercase">{eq.equipment_type}</TableCell>
                        <TableCell className="text-yellow-400">{eq.capacity_kw.toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{eq.redundancy_type}</Badge></TableCell>
                        <TableCell>{getStatusBadge(eq.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cooling Tab */}
          <TabsContent value="cooling">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Cooling Infrastructure</CardTitle>
                <CardDescription>CRACs, CDUs, and chillers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Name</TableHead>
                      <TableHead className="text-slate-400">Type</TableHead>
                      <TableHead className="text-slate-400">Capacity (kW)</TableHead>
                      <TableHead className="text-slate-400">Setpoint (°C)</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoCoolingEquipment.map((eq) => (
                      <TableRow key={eq.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell className="font-medium text-white flex items-center gap-2">
                          <Snowflake className="h-4 w-4 text-cyan-400" />
                          {eq.name}
                        </TableCell>
                        <TableCell className="text-slate-300 uppercase">{eq.equipment_type}</TableCell>
                        <TableCell className="text-cyan-400">{eq.capacity_kw.toLocaleString()}</TableCell>
                        <TableCell className="text-blue-400">{eq.setpoint_c}°C</TableCell>
                        <TableCell>{getStatusBadge(eq.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default Inventory;
