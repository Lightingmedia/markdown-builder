import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportCustomReport, ReportConfig } from "@/lib/pdfExport";

interface MetricOption {
  id: string;
  label: string;
  category: "facility" | "ai" | "efficiency";
}

const AVAILABLE_METRICS: MetricOption[] = [
  // Facility metrics
  { id: "temperature", label: "Temperature Data", category: "facility" },
  { id: "humidity", label: "Humidity Levels", category: "facility" },
  { id: "hvac_status", label: "HVAC Status", category: "facility" },
  { id: "gpu_wattage", label: "GPU Wattage", category: "facility" },
  { id: "tokens_generated", label: "Tokens Generated", category: "facility" },
  // AI Training metrics
  { id: "training_costs", label: "AI Training Costs", category: "ai" },
  { id: "training_energy", label: "Training Energy (kWh)", category: "ai" },
  { id: "training_carbon", label: "Carbon Emissions", category: "ai" },
  { id: "model_parameters", label: "Model Parameters", category: "ai" },
  // Efficiency metrics
  { id: "energy_score", label: "Energy Score", category: "efficiency" },
  { id: "efficiency_rating", label: "Efficiency Rating", category: "efficiency" },
  { id: "recommendations", label: "AI Recommendations", category: "efficiency" },
];

export function ReportBuilder() {
  const { toast } = useToast();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "training_costs",
    "training_energy",
    "training_carbon",
  ]);
  const [reportTitle, setReportTitle] = useState("Energy Efficiency Report");
  const [reportNotes, setReportNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((m) => m !== metricId)
        : [...prev, metricId]
    );
  };

  const selectAll = (category: "facility" | "ai" | "efficiency") => {
    const categoryMetrics = AVAILABLE_METRICS.filter((m) => m.category === category).map((m) => m.id);
    const allSelected = categoryMetrics.every((m) => selectedMetrics.includes(m));
    
    if (allSelected) {
      setSelectedMetrics((prev) => prev.filter((m) => !categoryMetrics.includes(m)));
    } else {
      setSelectedMetrics((prev) => [...new Set([...prev, ...categoryMetrics])]);
    }
  };

  const generateReport = async () => {
    if (selectedMetrics.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric to include in the report.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch data based on selected metrics
      const reportData: ReportConfig = {
        title: reportTitle,
        notes: reportNotes,
        generatedAt: new Date().toISOString(),
        metrics: selectedMetrics,
        facilityData: null,
        aiTrainingData: null,
        efficiencyData: null,
      };

      // Fetch facility data if any facility metrics selected
      const facilityMetrics = ["temperature", "humidity", "hvac_status", "gpu_wattage", "tokens_generated"];
      if (facilityMetrics.some((m) => selectedMetrics.includes(m))) {
        const { data: telemetry } = await supabase
          .from("raw_telemetry")
          .select("*")
          .eq("user_id", user.id)
          .order("timestamp", { ascending: false })
          .limit(100);
        reportData.facilityData = telemetry || [];
      }

      // Fetch AI training data if any AI metrics selected
      const aiMetrics = ["training_costs", "training_energy", "training_carbon", "model_parameters"];
      if (aiMetrics.some((m) => selectedMetrics.includes(m))) {
        const { data: trainingCosts } = await supabase
          .from("ai_training_costs" as any)
          .select("*")
          .order("training_date", { ascending: false });
        reportData.aiTrainingData = (trainingCosts as any) || [];
      }

      // Fetch efficiency data if any efficiency metrics selected
      const efficiencyMetrics = ["energy_score", "efficiency_rating", "recommendations"];
      if (efficiencyMetrics.some((m) => selectedMetrics.includes(m))) {
        const { data: metrics } = await supabase
          .from("processed_metrics")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);
        
        const { data: recs } = await supabase
          .from("recommendations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);
        
        reportData.efficiencyData = {
          metrics: metrics || [],
          recommendations: recs || [],
        };
      }

      exportCustomReport(reportData);

      toast({
        title: "Report Generated",
        description: "Your custom report has been downloaded.",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryMetrics = (category: "facility" | "ai" | "efficiency") =>
    AVAILABLE_METRICS.filter((m) => m.category === category);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Custom Report Builder
        </CardTitle>
        <CardDescription>
          Select the metrics you want to include in your PDF export
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Settings */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-title">Report Title</Label>
            <Input
              id="report-title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Enter report title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-notes">Notes (Optional)</Label>
            <Textarea
              id="report-notes"
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Add any notes or context for this report..."
              rows={3}
            />
          </div>
        </div>

        {/* Metric Categories */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Facility Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Facility Metrics</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectAll("facility")}
                className="text-xs h-7"
              >
                Toggle All
              </Button>
            </div>
            <div className="space-y-2">
              {getCategoryMetrics("facility").map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => toggleMetric(metric.id)}
                  />
                  <Label htmlFor={metric.id} className="text-sm cursor-pointer">
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* AI Training Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">AI Training Metrics</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectAll("ai")}
                className="text-xs h-7"
              >
                Toggle All
              </Button>
            </div>
            <div className="space-y-2">
              {getCategoryMetrics("ai").map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => toggleMetric(metric.id)}
                  />
                  <Label htmlFor={metric.id} className="text-sm cursor-pointer">
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Efficiency Metrics</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectAll("efficiency")}
                className="text-xs h-7"
              >
                Toggle All
              </Button>
            </div>
            <div className="space-y-2">
              {getCategoryMetrics("efficiency").map((metric) => (
                <div key={metric.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric.id}
                    checked={selectedMetrics.includes(metric.id)}
                    onCheckedChange={() => toggleMetric(metric.id)}
                  />
                  <Label htmlFor={metric.id} className="text-sm cursor-pointer">
                    {metric.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary & Generate */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{selectedMetrics.length} metrics selected</span>
          </div>
          <Button
            onClick={generateReport}
            disabled={isGenerating || selectedMetrics.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate PDF Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
