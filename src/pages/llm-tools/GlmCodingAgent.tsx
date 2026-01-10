import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { 
  Bot, 
  Send, 
  Paperclip,
  Maximize2,
  Copy,
  Download,
  Loader2,
  Square,
  Code2,
  User,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  code?: string;
  language?: string;
  timestamp: Date;
}

const CODE_GEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/llm-code-gen`;

const GlmCodingAgent = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch(CODE_GEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "interactive",
          prompt: input,
          language: "auto",
          temperature: 0.7,
          maxTokens: 4096,
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

  const downloadCode = (code: string, language: string) => {
    const extensions: Record<string, string> = {
      python: "py",
      javascript: "js",
      typescript: "ts",
      java: "java",
      rust: "rs",
      go: "go",
    };
    const ext = extensions[language] || language || "txt";
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
            <div className="rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={message.id} className="flex justify-start">
        <div className="flex max-w-[85%] items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="whitespace-pre-wrap text-sm text-foreground">
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
                    <span className="text-xs font-medium text-muted-foreground">
                      {message.language || "code"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyCode(message.code!)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => downloadCode(message.code!, message.language!)}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="h-64">
                  <Editor
                    height="100%"
                    language={message.language || "typescript"}
                    theme="vs-dark"
                    value={message.code}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      padding: { top: 12 },
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

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-cyan-500 to-blue-600">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium">GLM-4</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="max-w-2xl text-center">
              <h1 className="mb-2 text-3xl font-semibold">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Hey there!
                </span>{" "}
                I'm GLM-4 and I'm a
                <br />
                software engineer.
              </h1>
              <p className="mb-8 text-muted-foreground">
                Enter a coding task below to get started.
              </p>
              <div className="animate-pulse text-4xl text-muted-foreground">|</div>
            </div>
          </div>
        ) : (
          /* Messages */
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="mx-auto max-w-4xl space-y-6 py-6">
              {messages.map(renderMessage)}
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="shrink-0 border-t border-border bg-background p-4">
          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-xl border border-border bg-muted/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Give GLM-4 a task to work on..."
                className="min-h-[56px] resize-none border-0 bg-transparent px-4 py-3 text-sm focus-visible:ring-0"
                rows={1}
                disabled={isLoading}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  {isLoading ? (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleStop}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleSubmit}
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlmCodingAgent;
