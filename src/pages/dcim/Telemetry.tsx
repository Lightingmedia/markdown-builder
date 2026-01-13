import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

const Telemetry = () => (
  <ScrollArea className="h-screen">
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Activity className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Real-time Telemetry</h1>
      </div>
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader><CardTitle className="text-white">Coming Soon</CardTitle></CardHeader>
        <CardContent><p className="text-slate-400">Power, thermal, and fabric telemetry streams</p></CardContent>
      </Card>
    </div>
  </ScrollArea>
);

export default Telemetry;
