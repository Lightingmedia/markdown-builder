import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, FileSpreadsheet, Database, Loader2 } from "lucide-react";
import {
  exportToCSV,
  formatTelemetryForExport,
  formatMetricsForExport,
  formatRecommendationsForExport,
} from "@/lib/csvExport";

interface ExportStats {
  telemetryCount: number;
  metricsCount: number;
  recommendationsCount: number;
}

export function DataExport() {
  const { toast } = useToast();
  const [stats, setStats] = useState<ExportStats>({ telemetryCount: 0, metricsCount: 0, recommendationsCount: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [telemetry, metrics, recommendations] = await Promise.all([
      supabase.from("raw_telemetry").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("processed_metrics").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("recommendations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    setStats({
      telemetryCount: telemetry.count || 0,
      metricsCount: metrics.count || 0,
      recommendationsCount: recommendations.count || 0,
    });
  };

  const exportData = async (type: "telemetry" | "metrics" | "recommendations") => {
    setIsLoading(true);
    setExportingType(type);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let data: any[] = [];
      let filename = "";

      switch (type) {
        case "telemetry":
          const { data: telemetry } = await supabase
            .from("raw_telemetry")
            .select("*")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false });
          data = formatTelemetryForExport(telemetry || []);
          filename = "facility-telemetry";
          break;

        case "metrics":
          const { data: metrics } = await supabase
            .from("processed_metrics")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          data = formatMetricsForExport(metrics || []);
          filename = "energy-metrics";
          break;

        case "recommendations":
          const { data: recs } = await supabase
            .from("recommendations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          data = formatRecommendationsForExport(recs || []);
          filename = "ai-recommendations";
          break;
      }

      if (data.length === 0) {
        toast({
          title: "No data to export",
          description: "There is no data available for export.",
          variant: "destructive",
        });
        return;
      }

      exportToCSV(data, filename);
      toast({
        title: "Export Complete",
        description: `${data.length} records exported successfully.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setExportingType(null);
    }
  };

  const exportAll = async () => {
    setIsLoading(true);
    setExportingType("all");

    try {
      await exportData("telemetry");
      await exportData("metrics");
      await exportData("recommendations");
    } finally {
      setIsLoading(false);
      setExportingType(null);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Data Export
        </CardTitle>
        <CardDescription>
          Download your facility data as CSV files for external analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Telemetry Export */}
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Telemetry Data</span>
                </div>
                <Badge variant="outline">{stats.telemetryCount} records</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Raw facility sensor readings including temperature, humidity, GPU wattage
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => exportData("telemetry")}
                disabled={isLoading || stats.telemetryCount === 0}
              >
                {exportingType === "telemetry" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </CardContent>
          </Card>

          {/* Metrics Export */}
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Processed Metrics</span>
                </div>
                <Badge variant="outline">{stats.metricsCount} records</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Calculated energy scores, efficiency ratings, and identified drivers
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => exportData("metrics")}
                disabled={isLoading || stats.metricsCount === 0}
              >
                {exportingType === "metrics" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </CardContent>
          </Card>

          {/* Recommendations Export */}
          <Card className="border-border/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Recommendations</span>
                </div>
                <Badge variant="outline">{stats.recommendationsCount} records</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                AI-generated optimization recommendations and their status
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => exportData("recommendations")}
                disabled={isLoading || stats.recommendationsCount === 0}
              >
                {exportingType === "recommendations" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Export All Button */}
        <div className="pt-4 border-t border-border/50">
          <Button
            onClick={exportAll}
            disabled={isLoading || (stats.telemetryCount === 0 && stats.metricsCount === 0 && stats.recommendationsCount === 0)}
            className="w-full md:w-auto"
          >
            {exportingType === "all" ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
