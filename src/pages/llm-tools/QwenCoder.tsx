import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { 
  Code2, 
  Play, 
  Copy, 
  Download, 
  Settings,
  Sparkles,
  TestTube,
  Bug,
  RefreshCw,
  MessageSquare,
  Loader2,
  Send,
  Trophy,
  Star
} from "lucide-react";

const modelSizes = [
  { id: "0.5b", name: "0.5B", description: "Ultra-fast, basic tasks" },
  { id: "1.5b", name: "1.5B", description: "Quick responses" },
  { id: "7b", name: "7B", description: "Best balance", recommended: true },
  { id: "14b", name: "14B", description: "Higher accuracy" },
  { id: "32b", name: "32B", description: "Maximum capability" },
];

const testFrameworks = [
  { id: "pytest", name: "pytest", language: "python" },
  { id: "unittest", name: "unittest", language: "python" },
  { id: "jest", name: "Jest", language: "javascript" },
  { id: "mocha", name: "Mocha", language: "javascript" },
  { id: "junit", name: "JUnit", language: "java" },
  { id: "go-test", name: "go test", language: "go" },
];

const tabs = [
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "complete", label: "Complete", icon: Code2 },
  { id: "tests", label: "Tests", icon: TestTube },
  { id: "debug", label: "Debug", icon: Bug },
  { id: "refactor", label: "Refactor", icon: RefreshCw },
  { id: "interactive", label: "Interactive", icon: MessageSquare },
];

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
  
  // Interactive chat
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleGenerate = async () => {
    if (!inputCode.trim()) {
      toast({ title: "Empty input", description: "Please enter code or a prompt.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setOutputCode("");

    const mockResponses: Record<string, string> = {
      generate: `from typing import List, Optional
from dataclasses import dataclass
import asyncio
import aiohttp

@dataclass
class APIResponse:
    """Represents an API response with status and data."""
    status_code: int
    data: dict
    error: Optional[str] = None

class AsyncAPIClient:
    """
    High-performance async API client with connection pooling,
    retry logic, and comprehensive error handling.
    """
    
    def __init__(
        self,
        base_url: str,
        timeout: int = 30,
        max_retries: int = 3
    ):
        self.base_url = base_url.rstrip('/')
        self.timeout = aiohttp.ClientTimeout(total=timeout)
        self.max_retries = max_retries
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self) -> 'AsyncAPIClient':
        self._session = aiohttp.ClientSession(timeout=self.timeout)
        return self
    
    async def __aexit__(self, *args) -> None:
        if self._session:
            await self._session.close()
    
    async def get(self, endpoint: str, **kwargs) -> APIResponse:
        return await self._request('GET', endpoint, **kwargs)
    
    async def post(self, endpoint: str, **kwargs) -> APIResponse:
        return await self._request('POST', endpoint, **kwargs)
    
    async def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> APIResponse:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        for attempt in range(self.max_retries):
            try:
                async with self._session.request(method, url, **kwargs) as resp:
                    data = await resp.json()
                    return APIResponse(
                        status_code=resp.status,
                        data=data
                    )
            except aiohttp.ClientError as e:
                if attempt == self.max_retries - 1:
                    return APIResponse(
                        status_code=500,
                        data={},
                        error=str(e)
                    )
                await asyncio.sleep(2 ** attempt)
        
        return APIResponse(status_code=500, data={}, error="Max retries exceeded")`,
      complete: `    # Completing the function...
    def process_batch(self, items: List[dict]) -> List[dict]:
        """Process a batch of items with parallel execution."""
        results = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {
                executor.submit(self._process_single, item): item
                for item in items
            }
            
            for future in as_completed(futures):
                original_item = futures[future]
                try:
                    result = future.result()
                    results.append({
                        'input': original_item,
                        'output': result,
                        'status': 'success'
                    })
                except Exception as e:
                    results.append({
                        'input': original_item,
                        'error': str(e),
                        'status': 'failed'
                    })
                    self.logger.error(f"Processing failed: {e}")
        
        return results
    
    def _process_single(self, item: dict) -> dict:
        """Process a single item with validation and transformation."""
        validated = self._validate(item)
        transformed = self._transform(validated)
        return self._enrich(transformed)`,
      tests: `import pytest
from unittest.mock import Mock, patch, AsyncMock
from your_module import AsyncAPIClient, APIResponse

class TestAsyncAPIClient:
    """Comprehensive test suite for AsyncAPIClient."""
    
    @pytest.fixture
    def client(self):
        return AsyncAPIClient(
            base_url="https://api.example.com",
            timeout=10,
            max_retries=3
        )
    
    @pytest.mark.asyncio
    async def test_get_success(self, client):
        """Test successful GET request."""
        mock_response = {"data": "test"}
        
        with patch.object(client, '_request', new_callable=AsyncMock) as mock_req:
            mock_req.return_value = APIResponse(
                status_code=200,
                data=mock_response
            )
            
            async with client:
                result = await client.get("/users")
            
            assert result.status_code == 200
            assert result.data == mock_response
            mock_req.assert_called_once_with('GET', '/users')
    
    @pytest.mark.asyncio
    async def test_post_with_data(self, client):
        """Test POST request with JSON payload."""
        payload = {"name": "test", "value": 42}
        
        with patch.object(client, '_request', new_callable=AsyncMock) as mock_req:
            mock_req.return_value = APIResponse(status_code=201, data={"id": 1})
            
            async with client:
                result = await client.post("/items", json=payload)
            
            assert result.status_code == 201
            mock_req.assert_called_with('POST', '/items', json=payload)
    
    @pytest.mark.asyncio
    async def test_retry_on_failure(self, client):
        """Test retry logic on transient failures."""
        with patch('aiohttp.ClientSession.request') as mock_req:
            mock_req.side_effect = [
                aiohttp.ClientError("Connection failed"),
                aiohttp.ClientError("Timeout"),
                Mock(status=200, json=AsyncMock(return_value={"success": True}))
            ]
            
            async with client:
                result = await client.get("/health")
            
            assert mock_req.call_count == 3
    
    @pytest.mark.asyncio
    async def test_max_retries_exceeded(self, client):
        """Test error handling when max retries exceeded."""
        with patch('aiohttp.ClientSession.request') as mock_req:
            mock_req.side_effect = aiohttp.ClientError("Persistent failure")
            
            async with client:
                result = await client.get("/health")
            
            assert result.status_code == 500
            assert "Max retries exceeded" in result.error`,
      debug: `# 🐛 Debug Analysis

## Issues Found:

### 1. Race Condition (Line 45)
\`\`\`python
# BEFORE (Bug)
self.data = shared_resource  # Not thread-safe

# AFTER (Fixed)
with self._lock:
    self.data = shared_resource.copy()
\`\`\`

### 2. Memory Leak (Line 78)
\`\`\`python
# BEFORE (Bug)
def process(self):
    self.cache[key] = large_object  # Never cleaned up

# AFTER (Fixed)
def process(self):
    self.cache[key] = large_object
    if len(self.cache) > self.max_cache_size:
        self._evict_oldest()
\`\`\`

### 3. Unhandled Exception (Line 112)
\`\`\`python
# BEFORE (Bug)
result = external_api.call()  # Can raise NetworkError

# AFTER (Fixed)
try:
    result = external_api.call()
except NetworkError as e:
    logger.error(f"API call failed: {e}")
    result = self._get_fallback()
\`\`\`

## Recommendations:
1. Add comprehensive logging throughout
2. Implement circuit breaker pattern for external calls
3. Add unit tests for edge cases
4. Consider using asyncio for I/O-bound operations`,
      refactor: `# ✨ Refactored Code

## Changes Made:
- Extracted magic numbers to constants
- Applied Single Responsibility Principle
- Added type hints throughout
- Improved error handling
- Enhanced documentation

\`\`\`python
from abc import ABC, abstractmethod
from typing import Protocol, TypeVar, Generic
from dataclasses import dataclass, field
from functools import lru_cache
import logging

T = TypeVar('T')

class Validator(Protocol[T]):
    """Protocol for data validation."""
    def validate(self, data: T) -> bool: ...
    def get_errors(self) -> list[str]: ...

@dataclass
class ProcessingConfig:
    """Configuration for data processing."""
    max_batch_size: int = 100
    timeout_seconds: int = 30
    retry_count: int = 3
    enable_caching: bool = True
    log_level: str = "INFO"

class DataProcessor(ABC, Generic[T]):
    """Abstract base class for data processors."""
    
    def __init__(self, config: ProcessingConfig):
        self.config = config
        self.logger = logging.getLogger(self.__class__.__name__)
        self._setup_logging()
    
    def _setup_logging(self) -> None:
        self.logger.setLevel(self.config.log_level)
    
    @abstractmethod
    def process(self, data: T) -> T:
        """Process data and return result."""
        pass
    
    @lru_cache(maxsize=1000)
    def _cached_operation(self, key: str) -> dict:
        """Cached expensive operation."""
        return self._fetch_data(key)

class BatchProcessor(DataProcessor[list]):
    """Processes data in configurable batches."""
    
    def process(self, data: list) -> list:
        results = []
        for batch in self._create_batches(data):
            try:
                batch_result = self._process_batch(batch)
                results.extend(batch_result)
            except ProcessingError as e:
                self.logger.error(f"Batch failed: {e}")
                results.extend(self._handle_failure(batch))
        return results
\`\`\``,
    };

    const response = mockResponses[activeTab] || mockResponses.generate;
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < response.length) {
        setOutputCode(response.slice(0, currentIndex + 15));
        currentIndex += 15;
      } else {
        clearInterval(streamInterval);
        setIsLoading(false);
        toast({ title: "Complete", description: "Code generation finished." });
      }
    }, 15);
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed your code. The main issue is the nested loops causing O(n²) complexity. I suggest using a hash map for O(n) lookup instead.",
        "Good question! For this use case, I recommend using async/await with proper error boundaries. Here's a pattern that works well...",
        "That's a common pitfall. The solution is to implement proper resource cleanup using context managers or try-finally blocks.",
        "Based on your requirements, I'd suggest starting with a factory pattern here. It will make the code more maintainable as you add more types."
      ];
      
      const aiMessage = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      setChatMessages(prev => [...prev, aiMessage]);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Qwen2.5-Coder</h2>
              <Badge className="bg-yellow-500/10 text-yellow-500">
                <Trophy className="mr-1 h-3 w-3" />
                74.5% HumanEval
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">State-of-the-art code model - Beats GPT-4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Model Size Selector */}
          <Select value={modelSize} onValueChange={setModelSize}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelSizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  <div className="flex items-center gap-2">
                    <span>{size.name}</span>
                    {size.recommended && <Star className="h-3 w-3 text-yellow-500" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Model Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Temperature</Label>
                <span className="text-sm text-muted-foreground">{temperature[0]}</span>
              </div>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Max Tokens</Label>
                <span className="text-sm text-muted-foreground">{maxTokens[0]}</span>
              </div>
              <Slider
                value={maxTokens}
                onValueChange={setMaxTokens}
                min={512}
                max={16384}
                step={512}
              />
            </div>
            <div className="space-y-2">
              <Label>Test Framework</Label>
              <Select value={testFramework} onValueChange={setTestFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testFrameworks.map((fw) => (
                    <SelectItem key={fw.id} value={fw.id}>{fw.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Real-time Suggestions</Label>
              <Switch checked={realTimeSuggestions} onCheckedChange={setRealTimeSuggestions} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Interactive Tab */}
        <TabsContent value="interactive" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Interactive Coding Assistant</CardTitle>
              <CardDescription>Chat with Qwen2.5-Coder for real-time help</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[400px] rounded-lg border border-border p-4">
                {chatMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Start a conversation about your code...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
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
                )}
              </ScrollArea>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask about code, debugging, best practices..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChat();
                    }
                  }}
                  className="min-h-[60px]"
                />
                <Button onClick={handleChat} size="icon" className="h-auto">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs */}
        {tabs.filter(t => t.id !== "interactive").map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Input */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Input</CardTitle>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["python", "javascript", "typescript", "go", "rust", "java"].map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] overflow-hidden rounded-md border border-border">
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
                        suggestOnTriggerCharacters: realTimeSuggestions,
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="mt-4 w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        {tab.label}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Output</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        disabled={!outputCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadCode}
                        disabled={!outputCode}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[340px] overflow-hidden rounded-md border border-border">
                    <Editor
                      height="100%"
                      language={language}
                      value={outputCode}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default QwenCoder;
