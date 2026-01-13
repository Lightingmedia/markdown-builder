import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network } from "lucide-react";

const Topology = () => (
  <ScrollArea className="h-screen">
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Network className="h-8 w-8 text-cyan-500" />
        <h1 className="text-3xl font-bold text-white">Network Topology</h1>
      </div>
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader><CardTitle className="text-white">Coming Soon</CardTitle></CardHeader>
        <CardContent><p className="text-slate-400">Interactive topology graph with blast radius analysis</p></CardContent>
      </Card>
    </div>
  </ScrollArea>
);

export default Topology;
