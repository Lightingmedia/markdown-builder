import { useState } from "react";
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
  Wand2
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

const mockOutputs: Record<string, string> = {
  generate: `import asyncio
from typing import AsyncIterator, Optional
from dataclasses import dataclass, field
from contextlib import asynccontextmanager
import aiohttp

@dataclass
class StreamConfig:
    """Configuration for streaming responses."""
    chunk_size: int = 1024
    timeout: float = 30.0
    max_retries: int = 3
    buffer_size: int = 4096

class StreamingClient:
    """
    High-performance async streaming client for LLM APIs.
    
    Supports:
    - Chunked transfer encoding
    - Automatic reconnection
    - Backpressure handling
    - Token-by-token streaming
    """
    
    def __init__(
        self,
        base_url: str,
        api_key: str,
        config: Optional[StreamConfig] = None
    ):
        self.base_url = base_url
        self.api_key = api_key
        self.config = config or StreamConfig()
        self._session: Optional[aiohttp.ClientSession] = None
    
    @asynccontextmanager
    async def _get_session(self):
        """Manage aiohttp session lifecycle."""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=self.config.timeout)
            self._session = aiohttp.ClientSession(timeout=timeout)
        try:
            yield self._session
        except Exception:
            await self._session.close()
            raise
    
    async def stream_completion(
        self,
        prompt: str,
        max_tokens: int = 2048,
        temperature: float = 0.7
    ) -> AsyncIterator[str]:
        """
        Stream completion tokens from the API.
        
        Yields tokens as they arrive, enabling real-time display.
        """
        payload = {
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": True
        }
        
        async with self._get_session() as session:
            async with session.post(
                f"{self.base_url}/completions",
                json=payload,
                headers={"Authorization": f"Bearer {self.api_key}"}
            ) as response:
                response.raise_for_status()
                
                async for chunk in response.content.iter_chunks():
                    data, _ = chunk
                    if data:
                        yield data.decode('utf-8')
    
    async def close(self) -> None:
        """Clean up resources."""
        if self._session and not self._session.closed:
            await self._session.close()`,
  complete: `    async def batch_complete(
        self,
        prompts: list[str],
        **kwargs
    ) -> list[str]:
        """
        Complete multiple prompts concurrently.
        
        Uses semaphore to limit concurrent requests.
        """
        semaphore = asyncio.Semaphore(self.config.max_concurrent)
        
        async def _complete_one(prompt: str) -> str:
            async with semaphore:
                tokens = []
                async for token in self.stream_completion(prompt, **kwargs):
                    tokens.append(token)
                return ''.join(tokens)
        
        tasks = [_complete_one(p) for p in prompts]
        return await asyncio.gather(*tasks)
    
    def _parse_sse_event(self, data: bytes) -> Optional[dict]:
        """Parse Server-Sent Event data."""
        try:
            text = data.decode('utf-8').strip()
            if text.startswith('data: '):
                json_str = text[6:]
                if json_str == '[DONE]':
                    return None
                return json.loads(json_str)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None
        return None
    
    async def health_check(self) -> bool:
        """Check if the API is responsive."""
        try:
            async with self._get_session() as session:
                async with session.get(f"{self.base_url}/health") as resp:
                    return resp.status == 200
        except Exception:
            return False`,
  tests: `import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from streaming_client import StreamingClient, StreamConfig

class TestStreamingClient:
    """Comprehensive test suite for StreamingClient."""
    
    @pytest.fixture
    def client(self):
        return StreamingClient(
            base_url="https://api.example.com",
            api_key="test-key",
            config=StreamConfig(timeout=10.0)
        )
    
    @pytest.fixture
    def mock_response(self):
        """Create mock streaming response."""
        async def mock_iter():
            chunks = [b'Hello', b' ', b'World', b'!']
            for chunk in chunks:
                yield (chunk, False)
        
        mock = AsyncMock()
        mock.status = 200
        mock.content.iter_chunks = mock_iter
        mock.__aenter__ = AsyncMock(return_value=mock)
        mock.__aexit__ = AsyncMock(return_value=None)
        return mock
    
    @pytest.mark.asyncio
    async def test_stream_completion_success(self, client, mock_response):
        """Test successful streaming completion."""
        with patch('aiohttp.ClientSession.post', return_value=mock_response):
            tokens = []
            async for token in client.stream_completion("Hello"):
                tokens.append(token)
            
            assert tokens == ['Hello', ' ', 'World', '!']
    
    @pytest.mark.asyncio
    async def test_stream_completion_with_params(self, client, mock_response):
        """Test completion with custom parameters."""
        with patch('aiohttp.ClientSession.post', return_value=mock_response) as mock_post:
            async for _ in client.stream_completion(
                "Test",
                max_tokens=100,
                temperature=0.5
            ):
                pass
            
            call_args = mock_post.call_args
            payload = call_args.kwargs['json']
            assert payload['max_tokens'] == 100
            assert payload['temperature'] == 0.5
    
    @pytest.mark.asyncio
    async def test_batch_complete(self, client, mock_response):
        """Test concurrent batch completion."""
        with patch.object(client, 'stream_completion') as mock_stream:
            async def mock_gen():
                yield "result"
            mock_stream.return_value = mock_gen()
            
            results = await client.batch_complete(["a", "b", "c"])
            assert len(results) == 3
    
    @pytest.mark.asyncio
    async def test_health_check_success(self, client):
        """Test health check when API is healthy."""
        mock_resp = AsyncMock()
        mock_resp.status = 200
        mock_resp.__aenter__ = AsyncMock(return_value=mock_resp)
        mock_resp.__aexit__ = AsyncMock(return_value=None)
        
        with patch('aiohttp.ClientSession.get', return_value=mock_resp):
            result = await client.health_check()
            assert result is True
    
    @pytest.mark.asyncio
    async def test_health_check_failure(self, client):
        """Test health check when API is down."""
        with patch('aiohttp.ClientSession.get', side_effect=Exception("Connection refused")):
            result = await client.health_check()
            assert result is False`,
  debug: `# 🔍 Debug Analysis Report

## Issues Detected: 3

### Issue #1: Memory Leak in Session Management
**Severity:** High | **Line:** 45

\`\`\`python
# PROBLEM: Session created but never closed on error
async with self._get_session() as session:
    # If exception here, session leaks
    async with session.post(...) as response:
        ...

# SOLUTION: Add finally block
try:
    async with self._get_session() as session:
        async with session.post(...) as response:
            ...
finally:
    await self.close()  # Ensure cleanup
\`\`\`

### Issue #2: Race Condition in Concurrent Requests
**Severity:** Medium | **Line:** 78

\`\`\`python
# PROBLEM: _session accessed without lock
if self._session is None:  # Thread A checks
    self._session = ...     # Thread B also creates!

# SOLUTION: Use asyncio.Lock
self._lock = asyncio.Lock()

async with self._lock:
    if self._session is None:
        self._session = aiohttp.ClientSession()
\`\`\`

### Issue #3: Missing Timeout on Individual Chunks
**Severity:** Low | **Line:** 92

\`\`\`python
# PROBLEM: No per-chunk timeout
async for chunk in response.content.iter_chunks():
    yield chunk  # Can hang indefinitely

# SOLUTION: Add chunk timeout
async for chunk in asyncio.wait_for(
    response.content.iter_chunks().__anext__(),
    timeout=5.0
):
    yield chunk
\`\`\`

## Recommendations
1. ✅ Implement proper session lifecycle management
2. ✅ Add locking for shared state access
3. ✅ Consider circuit breaker for resilience`,
  refactor: `# ✨ Refactored Code

## Applied Patterns:
- Strategy Pattern for retry logic
- Builder Pattern for configuration
- Dependency Injection for testability

\`\`\`python
from abc import ABC, abstractmethod
from typing import Protocol, TypeVar
from dataclasses import dataclass, field
import asyncio

# Type definitions
T = TypeVar('T')

class RetryStrategy(Protocol):
    """Protocol for retry strategies."""
    def should_retry(self, attempt: int, error: Exception) -> bool: ...
    def get_delay(self, attempt: int) -> float: ...

@dataclass
class ExponentialBackoff:
    """Exponential backoff with jitter."""
    base_delay: float = 1.0
    max_delay: float = 60.0
    max_attempts: int = 3
    
    def should_retry(self, attempt: int, error: Exception) -> bool:
        return attempt < self.max_attempts
    
    def get_delay(self, attempt: int) -> float:
        import random
        delay = min(self.base_delay * (2 ** attempt), self.max_delay)
        return delay + random.uniform(0, delay * 0.1)

@dataclass
class StreamConfigBuilder:
    """Builder for StreamConfig."""
    _config: dict = field(default_factory=dict)
    
    def chunk_size(self, size: int) -> 'StreamConfigBuilder':
        self._config['chunk_size'] = size
        return self
    
    def timeout(self, seconds: float) -> 'StreamConfigBuilder':
        self._config['timeout'] = seconds
        return self
    
    def retry_strategy(self, strategy: RetryStrategy) -> 'StreamConfigBuilder':
        self._config['retry_strategy'] = strategy
        return self
    
    def build(self) -> StreamConfig:
        return StreamConfig(**self._config)

# Usage:
config = (
    StreamConfigBuilder()
    .chunk_size(2048)
    .timeout(30.0)
    .retry_strategy(ExponentialBackoff(max_attempts=5))
    .build()
)
\`\`\``,
};

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
  
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hey! I'm Qwen2.5-Coder. I can help you write, debug, and optimize code. What would you like to build?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const [logs, setLogs] = useState<string[]>([
    "$ Qwen2.5-Coder initialized",
    `$ Model: qwen2.5-coder-7b (4-bit)`,
    "$ HumanEval: 74.5% | MBPP: 72.8%",
    "$ Real-time suggestions: enabled",
    "$ Ready for code generation..."
  ]);

  const handleGenerate = async () => {
    if (!inputCode.trim()) {
      toast({ title: "Empty input", description: "Please enter code or a prompt.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setOutputCode("");
    setLogs(l => [...l, `$ Processing ${activeTab} request...`]);

    const response = mockOutputs[activeTab] || mockOutputs.generate;
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < response.length) {
        setOutputCode(response.slice(0, currentIndex + 25));
        currentIndex += 25;
      } else {
        clearInterval(streamInterval);
        setIsLoading(false);
        setLogs(l => [...l, `$ [✓] ${activeTab} completed (${response.length} chars)`]);
        toast({ title: "Complete", description: "Code generation finished." });
      }
    }, 12);
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setLogs(l => [...l, `$ Chat: processing user query...`]);
    
    setTimeout(() => {
      const responses = [
        "I've analyzed your request. Here's an optimized solution using async/await with proper error handling. The key is to use a semaphore to limit concurrent requests.",
        "Good question! For this use case, I recommend the Strategy pattern. It will make your code more testable and easier to extend. Want me to show you the implementation?",
        "I see the issue - you're missing the `asynccontextmanager` decorator. This is causing the resource leak. Here's the fix with proper cleanup.",
        "That's a great approach! To make it even better, consider adding type hints and docstrings. This will improve maintainability. Here's an enhanced version."
      ];
      
      const aiMessage = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setLogs(l => [...l, `$ [✓] Chat response generated`]);
    }, 1000);
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
              <Badge className="ml-auto bg-yellow-500/10 text-yellow-500">
                <Trophy className="mr-1 h-3 w-3" />
                74.5%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Model Size</Label>
              <Select value={modelSize} onValueChange={setModelSize}>
                <SelectTrigger className="h-8 bg-background/80 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelSizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      <div className="flex items-center gap-2">
                        <span>{size.name}</span>
                        {size.recommended && <Star className="h-3 w-3 text-yellow-500" />}
                        <span className="text-xs text-muted-foreground">{size.vram}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeTab === "tests" && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Test Framework</Label>
                <Select value={testFramework} onValueChange={setTestFramework}>
                  <SelectTrigger className="h-8 bg-background/80 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {testFrameworks.map((fw) => (
                      <SelectItem key={fw.id} value={fw.id}>{fw.name}</SelectItem>
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
                  <Slider value={maxTokens} onValueChange={setMaxTokens} min={256} max={16384} step={256} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Real-time Suggestions</Label>
                  <Switch checked={realTimeSuggestions} onCheckedChange={setRealTimeSuggestions} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Console */}
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
                      'text-muted-foreground'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center text-muted-foreground">
                    <span className="animate-pulse">▋</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-4 lg:col-span-3">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start bg-muted/30">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {activeTab === "interactive" ? (
          /* Chat Interface */
          <Card className="flex flex-1 flex-col border-border bg-card/50">
            <CardContent className="flex flex-1 flex-col p-4">
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Ask me anything about code..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleChat()}
                  className="bg-background/80"
                />
                <Button onClick={handleChat} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Editor View */
          <div className="grid flex-1 gap-4 lg:grid-cols-2">
            {/* Input */}
            <Card className="flex flex-col border-border bg-card/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Input</CardTitle>
                <Button onClick={handleGenerate} disabled={isLoading} size="sm">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="h-full overflow-hidden rounded-b-lg border-t border-border">
                  <Editor
                    height="100%"
                    language={language}
                    value={inputCode}
                    onChange={(value) => setInputCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="flex flex-col border-border bg-card/50">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Output</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!outputCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCode} disabled={!outputCode}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="h-full overflow-hidden rounded-b-lg border-t border-border">
                  <Editor
                    height="100%"
                    language={activeTab === "debug" ? "markdown" : language}
                    value={outputCode}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default QwenCoder;
