import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { 
  Code2, 
  Play, 
  Copy, 
  Download, 
  Sparkles,
  TestTube,
  Bug,
  RefreshCw,
  MessageSquare,
  Loader2,
  Send,
  Trophy,
  Star,
  Terminal,
  Settings,
  ChevronDown,
  ChevronUp,
  Wand2,
  Square
} from "lucide-react";

const modelSizes = [
  { id: "0.5b", name: "0.5B", vram: "~0.5GB", speed: "Ultra Fast" },
  { id: "1.5b", name: "1.5B", vram: "~1.2GB", speed: "Fast" },
  { id: "7b", name: "7B", vram: "~4.5GB", speed: "Balanced", recommended: true },
  { id: "14b", name: "14B", vram: "~9GB", speed: "Accurate" },
  { id: "32b", name: "32B", vram: "~20GB", speed: "Maximum" },
];

const testFrameworks = [
  { id: "pytest", name: "pytest" },
  { id: "unittest", name: "unittest" },
  { id: "jest", name: "Jest" },
  { id: "mocha", name: "Mocha" },
  { id: "junit", name: "JUnit" },
  { id: "go-test", name: "go test" },
];

const tabs = [
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "complete", label: "Complete", icon: Code2 },
  { id: "tests", label: "Tests", icon: TestTube },
  { id: "debug", label: "Debug", icon: Bug },
  { id: "refactor", label: "Refactor", icon: RefreshCw },
  { id: "interactive", label: "Chat", icon: MessageSquare },
];

const CODE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/llm-code-gen`;

const QwenCoder = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [modelSize, setModelSize] = useState("7b");
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [testFramework, setTestFramework] = useState("pytest");
  const [temperature, setTemperature] = useState([0.3]);
  const [maxTokens, setMaxTokens] = useState([4096]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [realTimeSuggestions, setRealTimeSuggestions] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hey! I'm Qwen2.5-Coder powered by Lovable AI. I can help you write, debug, and optimize code. What would you like to build?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [logs, setLogs] = useState<string[]>([
    "$ Qwen2.5-Coder initialized",
    "$ Connected to Lovable AI backend",
    "$ Model: gemini-3-flash-preview",
    "$ Real-time suggestions: enabled",
    "$ Ready for code generation..."
  ]);

  const streamResponse = async (
    action: string,
    content: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal
  ) => {
    const response = await fetch(CODE_GEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        action,
        code: content,
        prompt: content,
        language,
        testFramework,
        temperature: temperature[0],
        maxTokens: maxTokens[0],
        model: "qwen",
      }),
      signal,
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
          const chunkContent = parsed.choices?.[0]?.delta?.content;
          if (chunkContent) {
            fullOutput += chunkContent;
            onChunk(fullOutput);
          }
        } catch {
          // Incomplete JSON
        }
      }
    }

    return fullOutput;
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
      const fullOutput = await streamResponse(
        activeTab,
        inputCode,
        (output) => setOutputCode(output),
        abortControllerRef.current.signal
      );

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

  const handleChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setLogs(l => [...l, `$ Chat: processing user query...`]);
    setIsChatLoading(true);

    try {
      let assistantContent = "";
      await streamResponse(
        "interactive",
        chatInput,
        (output) => {
          assistantContent = output;
          setChatMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === "assistant" && newMessages.length > 1) {
              newMessages[newMessages.length - 1] = { role: "assistant", content: output };
            } else {
              newMessages.push({ role: "assistant", content: output });
            }
            return newMessages;
          });
        }
      );

      setLogs(l => [...l, `$ [✓] Chat response generated`]);
    } catch (error) {
      console.error("Chat error:", error);
      setLogs(l => [...l, `$ [✗] Chat error: ${(error as Error).message}`]);
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Sorry, I encountered an error: ${(error as Error).message}` 
      }]);
    } finally {
      setIsChatLoading(false);
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
      {/* Left Sidebar */}
      <div className="flex flex-col gap-4">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Code2 className="h-4 w-4 text-emerald-500" />
              Qwen2.5-Coder
              <Badge variant="secondary" className="ml-auto text-xs">
                <Trophy className="mr-1 h-3 w-3" />
                Lovable AI
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Model Size */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Model Size</Label>
              <div className="grid grid-cols-2 gap-1">
                {modelSizes.map((model) => (
                  <Button
                    key={model.id}
                    variant={modelSize === model.id ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setModelSize(model.id)}
                  >
                    {model.recommended && <Star className="mr-1 h-3 w-3" />}
                    {model.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Test Framework (for tests tab) */}
            {activeTab === "tests" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Test Framework</Label>
                <Select value={testFramework} onValueChange={setTestFramework}>
                  <SelectTrigger className="h-8 bg-background/80 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {testFrameworks.map((fw) => (
                      <SelectItem key={fw.id} value={fw.id}>
                        {fw.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowSettings(!showSettings)}
            >
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
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
                  <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.1} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Max Tokens</Label>
                    <span className="font-mono text-xs">{maxTokens[0]}</span>
                  </div>
                  <Slider value={maxTokens} onValueChange={setMaxTokens} min={512} max={8192} step={512} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-xs">
                    <Wand2 className="h-3 w-3" />
                    Real-time suggestions
                  </Label>
                  <Switch checked={realTimeSuggestions} onCheckedChange={setRealTimeSuggestions} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terminal */}
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
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {activeTab !== "interactive" && (
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
          )}
        </div>

        {/* Content */}
        {activeTab === "interactive" ? (
          <Card className="flex flex-1 flex-col border-border bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-emerald-500" />
                Interactive Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <ScrollArea className="flex-1 rounded-lg bg-background/80 p-4">
                <div className="space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChat()}
                  placeholder="Ask me anything about code..."
                  className="flex-1 bg-background/80"
                  disabled={isChatLoading}
                />
                <Button onClick={handleChat} disabled={isChatLoading || !chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid flex-1 gap-4 lg:grid-cols-2">
            {/* Input Panel */}
            <Card className="flex flex-col border-border bg-card/50">
              <CardHeader className="flex-row items-center justify-between py-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Code2 className="h-4 w-4 text-blue-500" />
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
                  language={activeTab === "debug" || activeTab === "refactor" ? "markdown" : language}
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
        )}
      </div>
    </div>
  );
};

export default QwenCoder;
