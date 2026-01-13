import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  Activity,
  Clock,
  CheckCircle,
  MessageSquare,
  FileText,
  Send,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  AlertTriangle,
  Zap,
  Thermometer,
} from "lucide-react";

interface Incident {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "mitigating" | "resolved";
  createdAt: string;
  affectedSystems: string[];
  timeline: TimelineEvent[];
  suggestedActions: string[];
}

interface TimelineEvent {
  timestamp: string;
  type: "detection" | "alert" | "action" | "status_update" | "resolution";
  message: string;
  source: "agent" | "operator";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const mockIncident: Incident = {
  id: "INC-2024-0142",
  title: "GPU Thermal Throttling in Rack A-12 Cluster",
  severity: "high",
  status: "investigating",
  createdAt: "2024-01-13T14:23:00Z",
  affectedSystems: ["gpu-node-045", "gpu-node-046", "gpu-node-047", "job-llama-train-005"],
  timeline: [
    { timestamp: "14:23:00", type: "detection", message: "Anomaly detected: GPU temperatures exceeding 82°C on 3 nodes in Rack A-12", source: "agent" },
    { timestamp: "14:23:15", type: "alert", message: "PagerDuty alert triggered for on-call engineer", source: "agent" },
    { timestamp: "14:25:00", type: "status_update", message: "Thermal Agent reports CDU flow rate normal, investigating node-level cooling", source: "agent" },
    { timestamp: "14:28:00", type: "action", message: "Initiated workload migration for job-llama-train-005 to cooler rack", source: "agent" },
    { timestamp: "14:30:00", type: "status_update", message: "Migration in progress, 2 of 8 GPUs relocated", source: "agent" },
  ],
  suggestedActions: [
    "Complete workload migration to Rack B-05 (coolest available)",
    "Schedule physical inspection of Rack A-12 cooling distribution",
    "Reduce power cap on remaining nodes to 85% until resolution",
    "Notify affected job owner about expected 15-minute delay",
  ],
};

const IncidentCopilot = () => {
  const [incident] = useState<Incident>(mockIncident);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "I've detected a thermal incident in Rack A-12. Three GPU nodes are approaching throttling thresholds. I've already initiated workload migration and alerted the on-call team. How would you like me to proceed?",
      timestamp: "14:23:00",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [expandedTimeline, setExpandedTimeline] = useState(true);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: generateAIResponse(inputMessage),
        timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("status") || lowerInput.includes("update")) {
      return "Current status: Migration is 50% complete (4/8 GPUs relocated). Temperatures on migrated workloads have normalized to 65°C. Remaining nodes are still elevated but below critical threshold. ETA to full migration: 8 minutes.";
    }
    if (lowerInput.includes("root cause") || lowerInput.includes("why")) {
      return "Based on my analysis, the root cause appears to be reduced airflow in Rack A-12. Correlating with maintenance logs, I found that a blanking panel was removed during yesterday's hardware swap and not replaced. This is causing hot air recirculation. I recommend scheduling immediate physical inspection to verify.";
    }
    if (lowerInput.includes("notify") || lowerInput.includes("slack") || lowerInput.includes("team")) {
      return "I've drafted a status update for Slack:\n\n📢 **Incident Update: INC-2024-0142**\nThermal event in Rack A-12 - workload migration in progress.\nETA to resolution: ~10 minutes\nNo data loss expected. Job owners notified.\n\nShall I post this to #infrastructure-alerts?";
    }
    if (lowerInput.includes("postmortem") || lowerInput.includes("report")) {
      return "I can generate a postmortem draft now or after resolution. The report will include:\n\n• Timeline with all detection and response events\n• Root cause analysis (pending physical verification)\n• Impact assessment (affected jobs and duration)\n• Recommendations for preventing recurrence\n\nWould you like me to start drafting now?";
    }
    return "Understood. I'm continuing to monitor the situation and will alert you if conditions change. The Thermal Agent is coordinating the migration, and I'm tracking all metrics. Is there anything specific you'd like me to investigate or prepare?";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "investigating": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "mitigating": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "resolved": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default: return "";
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "detection": return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "alert": return <Zap className="h-4 w-4 text-yellow-400" />;
      case "action": return <Activity className="h-4 w-4 text-blue-400" />;
      case "status_update": return <MessageSquare className="h-4 w-4 text-cyan-400" />;
      case "resolution": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel - Incident Details */}
      <div className="w-1/2 border-r border-slate-800 flex flex-col">
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Incident Copilot</h1>
                <p className="text-slate-400">AI-assisted incident management and response</p>
              </div>
            </div>

            {/* Active Incident Card */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getSeverityColor(incident.severity)} className="uppercase">
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-white">{incident.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-cyan-400">{incident.id}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>Started {new Date(incident.createdAt).toLocaleTimeString()}</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    Open in PagerDuty
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Affected Systems */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Affected Systems</p>
                  <div className="flex flex-wrap gap-2">
                    {incident.affectedSystems.map((system, i) => (
                      <Badge key={i} variant="outline" className="font-mono">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    onClick={() => setExpandedTimeline(!expandedTimeline)}
                  >
                    <p className="text-xs text-slate-500">Timeline ({incident.timeline.length} events)</p>
                    {expandedTimeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  {expandedTimeline && (
                    <div className="mt-3 space-y-3">
                      {incident.timeline.map((event, i) => (
                        <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-slate-800/50">
                          {getTimelineIcon(event.type)}
                          <div className="flex-1">
                            <p className="text-sm text-white">{event.message}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {event.timestamp} • {event.source === "agent" ? "AI Agent" : "Operator"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Suggested Actions */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">AI Suggested Actions</p>
                  <div className="space-y-2">
                    {incident.suggestedActions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                        <p className="text-sm text-slate-300">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start gap-2">
                <FileText className="h-4 w-4" />
                Generate Postmortem
              </Button>
              <Button variant="outline" className="justify-start gap-2">
                <Copy className="h-4 w-4" />
                Copy Status Update
              </Button>
              <Button variant="outline" className="justify-start gap-2 text-emerald-400 border-emerald-500/30">
                <CheckCircle className="h-4 w-4" />
                Mark Resolved
              </Button>
              <Button variant="outline" className="justify-start gap-2 text-red-400 border-red-500/30">
                <AlertTriangle className="h-4 w-4" />
                Escalate
              </Button>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="w-1/2 flex flex-col bg-slate-900/30">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">Incident Copilot</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Actively monitoring incident
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatMessages.map((msg, i) => (
              <div 
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.role === "user" ? "text-emerald-200" : "text-slate-500"}`}>
                    {msg.timestamp}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about the incident, request actions, or get status updates..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-slate-800 border-slate-700"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setInputMessage("What's the current status?")}>
              Status update
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setInputMessage("What's the root cause?")}>
              Root cause?
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-slate-400" onClick={() => setInputMessage("Draft a postmortem report")}>
              Postmortem
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentCopilot;
