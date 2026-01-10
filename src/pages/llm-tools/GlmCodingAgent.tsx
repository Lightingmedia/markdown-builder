import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Editor from "@monaco-editor/react";
import { 
  Bot, 
  Send, 
  Paperclip,
  Plus,
  Copy,
  Download,
  Loader2,
  Square,
  Code2,
  User,
  MessageSquare,
  Trash2,
  X,
  FileText,
  Play,
  Sparkles,
  TestTube,
  Bug,
  RefreshCw,
  Terminal,
  Settings,
  ChevronDown,
  ChevronUp,
  Wand2
} from "lucide-react";

interface Attachment {
  name: string;
  content: string;
  type: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  code?: string;
  language?: string;
  attachments?: Attachment[];
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

const tabs = [
  { id: "complete", label: "Complete", icon: Code2 },
  { id: "tests", label: "Tests", icon: TestTube },
  { id: "debug", label: "Debug", icon: Bug },
  { id: "refactor", label: "Refactor", icon: RefreshCw },
  { id: "interactive", label: "Chat", icon: MessageSquare },
];

const testFrameworks = [
  { id: "pytest", name: "pytest" },
  { id: "unittest", name: "unittest" },
  { id: "jest", name: "Jest" },
  { id: "mocha", name: "Mocha" },
  { id: "junit", name: "JUnit" },
  { id: "go-test", name: "go test" },
];

const CODE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/llm-code-gen`;

const GlmCodingAgent = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("interactive");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // IDE mode states
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [testFramework, setTestFramework] = useState("pytest");
  const [temperature, setTemperature] = useState([0.3]);
  const [maxTokens, setMaxTokens] = useState([4096]);
  const [showSettings, setShowSettings] = useState(false);
  const [realTimeSuggestions, setRealTimeSuggestions] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    "$ LightRail AI initialized",
    "$ Connected to Lovable AI backend",
    "$ Ready for code generation..."
  ]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user) {
        loadSessions(user.id);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user) {
        loadSessions(session.user.id);
      } else {
        setSessions([]);
        setCurrentSessionId(null);
        setMessages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load sessions
  const loadSessions = async (uid: string) => {
    const { data, error } = await supabase
      .from("llm_chat_sessions")
      .select("id, title, updated_at")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setSessions(data);
    }
  };

  // Load messages for a session
  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from("llm_chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        attachments: (Array.isArray(m.attachments) ? m.attachments : []) as unknown as Attachment[],
        timestamp: new Date(m.created_at!),
        code: extractCode(m.content)?.code,
        language: extractCode(m.content)?.language
      })));
    }
    setCurrentSessionId(sessionId);
    setShowHistory(false);
    setActiveTab("interactive");
  };

  const extractCode = (content: string): { code: string; language: string } | null => {
    const match = content.match(/```(\w+)?\n([\s\S]*?)```/);
    if (match) {
      return { code: match[2], language: match[1] || "typescript" };
    }
    return null;
  };

  // Create new session
  const createSession = async (firstMessage: string): Promise<string | null> => {
    if (!userId) return null;

    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    const { data, error } = await supabase
      .from("llm_chat_sessions")
      .insert({ user_id: userId, title })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create session:", error);
      return null;
    }

    setSessions(prev => [{ id: data.id, title, updated_at: new Date().toISOString() }, ...prev]);
    return data.id;
  };

  // Save message
  const saveMessage = async (sessionId: string, role: "user" | "assistant", content: string, messageAttachments: Attachment[] = []) => {
    await supabase.from("llm_chat_messages").insert([{
      session_id: sessionId,
      role,
      content,
      attachments: messageAttachments as unknown as null
    }]);

    // Update session timestamp
    await supabase
      .from("llm_chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", sessionId);
  };

  // Delete session
  const deleteSession = async (sessionId: string) => {
    await supabase.from("llm_chat_sessions").delete().eq("id", sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
    }
    toast({ title: "Deleted", description: "Chat session removed." });
  };

  // New chat
  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setAttachments([]);
    setShowHistory(false);
    setActiveTab("interactive");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // File upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast({ 
          title: "File too large", 
          description: `${file.name} exceeds 1MB limit.`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setAttachments(prev => [...prev, {
          name: file.name,
          content,
          type: file.type || "text/plain"
        }]);
      };
      reader.readAsText(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [toast]);

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Stream response for IDE mode
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
        model: "lightrail",
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

  // IDE mode generate handler
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

  // Chat mode submit
  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    let sessionId = currentSessionId;

    // Create session if user is logged in and no current session
    if (userId && !sessionId) {
      sessionId = await createSession(input);
      setCurrentSessionId(sessionId);
    }

    const currentAttachments = [...attachments];
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      attachments: currentAttachments,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    // Save user message if logged in
    if (sessionId) {
      saveMessage(sessionId, "user", input, currentAttachments);
    }

    abortControllerRef.current = new AbortController();

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Build prompt with attachments
    let fullPrompt = input;
    if (currentAttachments.length > 0) {
      fullPrompt += "\n\n--- Attached Files ---\n";
      currentAttachments.forEach(att => {
        fullPrompt += `\n### ${att.name}\n\`\`\`\n${att.content}\n\`\`\`\n`;
      });
    }

    try {
      const response = await fetch(CODE_GEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "interactive",
          prompt: fullPrompt,
          language: "auto",
          temperature: 0.7,
          maxTokens: 4096,
          model: "lightrail",
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
              setMessages(prev => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (updated[lastIndex]?.role === "assistant") {
                  updated[lastIndex] = { ...updated[lastIndex], content: fullOutput };
                }
                return updated;
              });
            }
          } catch {
            // Incomplete JSON
          }
        }
      }

      // Extract code blocks from response
      const codeMatch = fullOutput.match(/```(\w+)?\n([\s\S]*?)```/);
      if (codeMatch) {
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              code: codeMatch[2],
              language: codeMatch[1] || "typescript"
            };
          }
          return updated;
        });
      }

      // Save assistant message if logged in
      if (sessionId) {
        saveMessage(sessionId, "assistant", fullOutput);
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        toast({ title: "Stopped", description: "Generation cancelled." });
      } else {
        console.error("Generation error:", error);
        toast({ 
          title: "Error", 
          description: (error as Error).message || "Failed to generate response.", 
          variant: "destructive" 
        });
        setMessages(prev => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex]?.role === "assistant") {
            updated[lastIndex] = { 
              ...updated[lastIndex], 
              content: `Sorry, I encountered an error: ${(error as Error).message}` 
            };
          }
          return updated;
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
  };

  const downloadCode = (code: string, lang: string) => {
    const extensions: Record<string, string> = {
      python: "py",
      javascript: "js",
      typescript: "ts",
      java: "java",
      rust: "rs",
      go: "go",
    };
    const ext = extensions[lang] || lang || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderMessage = (message: Message) => {
    if (message.role === "user") {
      return (
        <div key={message.id} className="flex justify-end">
          <div className="flex max-w-[80%] items-start gap-3">
            <div className="space-y-2">
              <div className="rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap justify-end gap-2">
                  {message.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className="flex justify-start">
        <div className="flex max-w-[85%] items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {message.content || (isLoading && messages[messages.length - 1]?.id === message.id ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking...
                  </span>
                ) : null)}
              </p>
            </div>
            
            {message.code && (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {message.language || "code"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyCode(message.code!)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => downloadCode(message.code!, message.language!)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="h-72">
                  <Editor
                    height="100%"
                    language={message.language || "typescript"}
                    theme="vs-dark"
                    value={message.code}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      padding: { top: 16 },
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isIDEMode = activeTab !== "interactive";

  return (
    <div className="flex h-screen flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".js,.ts,.tsx,.jsx,.py,.java,.go,.rs,.c,.cpp,.h,.css,.html,.json,.md,.txt,.yaml,.yml,.sql,.sh,.bash"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold">LightRail AI</span>
        </div>
        
        {/* Tabs in header */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="gap-2 text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {activeTab === "interactive" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewChat}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
              {userId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  History
                </Button>
              )}
            </>
          )}
          {isIDEMode && (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      {isIDEMode ? (
        /* IDE Mode */
        <div className="flex flex-1 overflow-hidden p-4">
          <div className="grid h-full w-full gap-4 lg:grid-cols-4">
            {/* Left Sidebar - Settings */}
            <div className="flex flex-col gap-4">
              <Card className="border-border bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Bot className="h-4 w-4 text-cyan-500" />
                    LightRail AI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Language */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-9 bg-background/80 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Test Framework (for tests tab) */}
                  {activeTab === "tests" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Test Framework</Label>
                      <Select value={testFramework} onValueChange={setTestFramework}>
                        <SelectTrigger className="h-9 bg-background/80 text-sm">
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
                    className="w-full justify-between text-sm"
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
                          <Label className="text-sm">Temperature</Label>
                          <span className="font-mono text-sm">{temperature[0]}</span>
                        </div>
                        <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.1} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Max Tokens</Label>
                          <span className="font-mono text-sm">{maxTokens[0]}</span>
                        </div>
                        <Slider value={maxTokens} onValueChange={setMaxTokens} min={512} max={8192} step={512} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-sm">
                          <Wand2 className="h-4 w-4" />
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
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Terminal className="h-4 w-4 text-cyan-500" />
                    Console
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-4rem)]">
                  <ScrollArea className="h-full rounded-lg bg-background/80 p-3">
                    <div className="font-mono text-sm leading-relaxed">
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              <div className="grid flex-1 gap-4 lg:grid-cols-2">
                {/* Input Editor */}
                <Card className="flex flex-col border-border bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Sparkles className="h-4 w-4 text-cyan-500" />
                      Input
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-full rounded-lg border border-border overflow-hidden">
                      <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={inputCode}
                        onChange={(value) => setInputCode(value || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          padding: { top: 16 },
                          wordWrap: "on",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Output Editor */}
                <Card className="flex flex-col border-border bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-cyan-500" />
                        Output
                      </span>
                      {outputCode && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyCode(outputCode)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadCode(outputCode, language)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="h-full rounded-lg border border-border overflow-hidden">
                      <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={outputCode}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: "on",
                          scrollBeyondLastLine: false,
                          padding: { top: 16 },
                          wordWrap: "on",
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Chat Mode */
        <div className="flex flex-1 overflow-hidden">
          {/* Chat History Sidebar */}
          {showHistory && userId && (
            <div className="w-72 shrink-0 border-r border-border bg-muted/30">
              <div className="p-4">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Recent Chats</h3>
                <ScrollArea className="h-[calc(100vh-140px)]">
                  <div className="space-y-1 pr-3">
                    {sessions.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">No chat history</p>
                    ) : (
                      sessions.map(session => (
                        <div
                          key={session.id}
                          className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                            currentSessionId === session.id ? "bg-muted" : ""
                          }`}
                          onClick={() => loadMessages(session.id)}
                        >
                          <span className="line-clamp-1 flex-1">{session.title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(session.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {messages.length === 0 ? (
              /* Empty State */
              <div className="flex flex-1 flex-col items-center justify-center px-6">
                <div className="max-w-2xl text-center">
                  <h1 className="mb-3 text-4xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Hey there!
                    </span>{" "}
                    I'm LightRail AI and I'm a
                    <br />
                    software engineer.
                  </h1>
                  <p className="mb-10 text-lg text-muted-foreground">
                    Enter a coding task below to get started. You can attach code files for analysis.
                  </p>
                  <div className="animate-pulse text-5xl text-muted-foreground/50">|</div>
                </div>
              </div>
            ) : (
              /* Messages */
              <ScrollArea className="flex-1 px-6" ref={scrollRef}>
                <div className="mx-auto max-w-4xl space-y-6 py-8">
                  {messages.map(renderMessage)}
                </div>
              </ScrollArea>
            )}

            {/* Input Area */}
            <div className="shrink-0 border-t border-border bg-background p-6">
              <div className="mx-auto max-w-3xl">
                {/* Attachment Preview */}
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm"
                      >
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="max-w-[150px] truncate">{att.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => removeAttachment(i)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative rounded-xl border border-border bg-muted/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Give LightRail AI a task to work on..."
                    className="min-h-[60px] resize-none border-0 bg-transparent px-4 py-4 text-base focus-visible:ring-0"
                    rows={1}
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between px-4 pb-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        <Paperclip className="h-5 w-5" />
                      </Button>
                    </div>
                    <div>
                      {isLoading ? (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-9 w-9"
                          onClick={handleStop}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="icon"
                          className="h-9 w-9"
                          onClick={handleSubmit}
                          disabled={!input.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {!userId && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Sign in to save your chat history
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlmCodingAgent;
