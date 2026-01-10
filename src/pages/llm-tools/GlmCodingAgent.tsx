import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { 
  Bot, 
  Play, 
  Copy, 
  Download, 
  Code,
  FileText,
  Bug,
  BookOpen,
  RefreshCw,
  Loader2,
  Sparkles,
  Terminal,
  Settings,
  ChevronDown,
  ChevronUp,
  Square
} from "lucide-react";

const languages = [
  "python", "javascript", "typescript", "java", "c", "cpp", "csharp", "go", "rust", "ruby",
  "php", "swift", "kotlin", "scala", "r", "matlab", "julia", "perl", "lua", "shell",
  "sql", "html", "css", "json", "yaml", "xml", "markdown", "latex", "dockerfile", "terraform",
  "haskell", "elixir", "clojure", "erlang", "ocaml", "fsharp", "dart", "zig", "nim", "crystal"
];

const tabs = [
  { id: "generate", label: "Generate", icon: Code },
  { id: "explain", label: "Explain", icon: FileText },
  { id: "fix", label: "Fix Bugs", icon: Bug },
  { id: "docs", label: "Add Docs", icon: BookOpen },
  { id: "refactor", label: "Refactor", icon: RefreshCw },
];

const CODE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/llm-code-gen`;

const GlmCodingAgent = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([2048]);
  const [use4Bit, setUse4Bit] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "$ GLM-4 Coding Agent initialized",
    "$ Connected to Lovable AI backend",
    "$ Model: gemini-3-flash-preview",
    "$ Ready for code generation..."
  ]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getPlaceholder = () => {
    const placeholders: Record<string, string> = {
      generate: "// Describe the code you want to generate...\n\n// Example:\n// Create an async task queue with priority support,\n// retry logic, and concurrent processing",
      explain: "// Paste code to explain...\n\n// The agent will analyze:\n// - Architecture & design patterns\n// - Time/space complexity\n// - Best practices used",
      fix: "// Paste buggy code here...\n\n// The agent will:\n// - Identify issues\n// - Explain root causes\n// - Provide fixes with before/after",
      docs: "// Paste code needing documentation...\n\n// The agent will generate:\n// - Module docstrings\n// - Function documentation\n// - Usage examples",
      refactor: "// Paste code to refactor...\n\n// The agent will:\n// - Apply SOLID principles\n// - Extract constants\n// - Improve readability",
    };
    return placeholders[activeTab] || "";
  };

  const handleGenerate = async () => {
    if (!inputCode.trim()) {
      toast({ title: "Empty input", description: "Please enter code or a prompt.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setOutputCode("");
    setLogs(l => [...l, `$ Processing ${activeTab} request...`]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(CODE_GEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: activeTab,
          code: inputCode,
          prompt: inputCode,
          language,
          temperature: temperature[0],
          maxTokens: maxTokens[0],
          model: "glm-4",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullOutput = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);

          if (line.startsWith(":") || line === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullOutput += content;
              setOutputCode(fullOutput);
            }
          } catch {
            // Incomplete JSON, will get more data
          }
        }
      }

      setLogs(l => [...l, `$ [✓] ${activeTab} completed (${fullOutput.length} chars)`]);
      toast({ title: "Complete", description: "Code generation finished." });
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        setLogs(l => [...l, `$ [!] Generation stopped by user`]);
        toast({ title: "Stopped", description: "Generation cancelled." });
      } else {
        console.error("Generation error:", error);
        setLogs(l => [...l, `$ [✗] Error: ${(error as Error).message}`]);
        toast({ 
          title: "Error", 
          description: (error as Error).message || "Failed to generate code.", 
          variant: "destructive" 
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
  };

  const downloadCode = () => {
    const blob = new Blob([outputCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-4">
      {/* Left Sidebar - Settings */}
      <div className="flex flex-col gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Bot className="h-4 w-4 text-blue-500" />
              GLM-4 Agent
              <Badge variant="secondary" className="ml-auto text-xs">
                Lovable AI
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-8 bg-background/80 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowSettings(!showSettings)}
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Model Settings
              </span>
              {showSettings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showSettings && (
              <div className="space-y-4 rounded-lg bg-muted/30 p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Temperature</Label>
                    <span className="font-mono text-xs">{temperature[0]}</span>
                  </div>
                  <Slider value={temperature} onValueChange={setTemperature} min={0} max={2} step={0.1} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Max Tokens</Label>
                    <span className="font-mono text-xs">{maxTokens[0]}</span>
                  </div>
                  <Slider value={maxTokens} onValueChange={setMaxTokens} min={256} max={8192} step={256} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">4-bit Quantization</Label>
                  <Switch checked={use4Bit} onCheckedChange={setUse4Bit} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terminal Logs */}
        <Card className="flex-1 border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Terminal className="h-4 w-4 text-emerald-500" />
              Console
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <ScrollArea className="h-full rounded-lg bg-background/80 p-3">
              <div className="font-mono text-xs leading-relaxed">
                {logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`${
                      log.includes('[✓]') ? 'text-emerald-500' :
                      log.includes('[!]') ? 'text-yellow-500' :
                      log.includes('[✗]') ? 'text-destructive' :
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center text-muted-foreground">
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Generating...
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-col gap-4 lg:col-span-3">
        {/* Tabs */}
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <Button variant="destructive" size="sm" onClick={handleStop}>
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button onClick={handleGenerate} size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Run
              </Button>
            )}
          </div>
        </div>

        {/* Split Editor View */}
        <div className="grid flex-1 gap-4 lg:grid-cols-2">
          {/* Input Panel */}
          <Card className="flex flex-col border-border bg-card/50">
            <CardHeader className="flex-row items-center justify-between py-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Code className="h-4 w-4 text-blue-500" />
                Input
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={inputCode}
                onChange={(value) => setInputCode(value || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 12 },
                  placeholder: getPlaceholder(),
                }}
              />
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="flex flex-col border-border bg-card/50">
            <CardHeader className="flex-row items-center justify-between py-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Output
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyToClipboard} disabled={!outputCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={downloadCode} disabled={!outputCode}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <Editor
                height="100%"
                language={activeTab === "explain" || activeTab === "fix" || activeTab === "docs" || activeTab === "refactor" ? "markdown" : language}
                theme="vs-dark"
                value={outputCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "off",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 12 },
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlmCodingAgent;
