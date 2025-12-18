import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FileBarChart,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
} from "lucide-react";
import { ReportBuilder } from "@/components/feoa/ReportBuilder";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact_level: string;
  status: string;
  requires_approval: boolean;
  created_at: string;
}

interface Report {
  id: string;
  date: string;
  period: string;
  totalConsumption: number;
  recommendations: Recommendation[];
}

export default function Reports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dateRange, setDateRange] = useState("7d");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const { data } = await supabase
        .from("recommendations")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setRecommendations(data);
    };

    fetchRecommendations();
  }, []);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("energy-analysis-agent", {
        body: {
          type: "generate_report",
          dateRange,
        },
      });

      if (error) throw error;

      const newReport: Report = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        period: dateRange,
        totalConsumption: Math.random() * 500 + 200,
        recommendations: data?.recommendations || [],
      };

      setReports((prev) => [newReport, ...prev]);
      toast({
        title: "Report generated",
        description: "Your eco-efficiency report is ready.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Could not generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproval = async (recId: string, approved: boolean) => {
    const { error } = await supabase
      .from("recommendations")
      .update({ status: approved ? "approved" : "rejected" })
      .eq("id", recId);

    if (!error) {
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === recId ? { ...r, status: approved ? "approved" : "rejected" } : r
        )
      );
      toast({
        title: approved ? "Approved" : "Rejected",
        description: `Recommendation has been ${approved ? "approved for execution" : "rejected"}.`,
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "executed":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive/20 text-destructive";
      case "medium":
        return "bg-yellow-500/20 text-yellow-500";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Report Builder */}
      <ReportBuilder />

      {/* Generate Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Create a comprehensive eco-efficiency analysis</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={generateReport} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Generate New Report
          </Button>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {recommendations.filter((r) => r.requires_approval && r.status === "pending").length > 0 && (
        <Card className="border-2 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Pending Approvals
            </CardTitle>
            <CardDescription>
              These recommendations require your approval before execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations
                .filter((r) => r.requires_approval && r.status === "pending")
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 border rounded-lg bg-muted/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                      <Badge className={getImpactColor(rec.impact_level)}>
                        {rec.impact_level} impact
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproval(rec.id, true)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve & Execute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproval(rec.id, false)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>View previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileBarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports generated yet.</p>
              <p className="text-sm">Generate your first report above.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {new Date(report.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Period: {report.period}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {report.totalConsumption.toFixed(0)} kWh
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* All Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>All recommendations from the LightRail Architect</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recommendations yet.</p>
              <p className="text-sm">Generate a report or upload data to receive insights.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getStatusIcon(rec.status)}
                        <div>
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {rec.status}
                        </Badge>
                        <Badge className={getImpactColor(rec.impact_level)}>
                          {rec.impact_level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Report -{" "}
              {selectedReport &&
                new Date(selectedReport.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
            </DialogTitle>
            <DialogDescription>
              Period: {selectedReport?.period} | Total: {selectedReport?.totalConsumption.toFixed(0)} kWh
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-primary">42%</div>
                  <p className="text-xs text-muted-foreground">GPU Inference</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold text-secondary">28%</div>
                  <p className="text-xs text-muted-foreground">HVAC</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold">30%</div>
                  <p className="text-xs text-muted-foreground">Other</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
