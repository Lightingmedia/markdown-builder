import { useState } from "react";
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
  ChevronUp
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

const mockOutputs: Record<string, string> = {
  generate: `from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime
import asyncio
import aiohttp

@dataclass
class Task:
    """Represents an async task with metadata."""
    id: str
    name: str
    status: str = "pending"
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()

class TaskQueue:
    """
    Async task queue with priority support and retry logic.
    
    Features:
    - Priority-based execution
    - Automatic retry with exponential backoff
    - Concurrent task processing
    - Progress tracking
    """
    
    def __init__(self, max_workers: int = 5, max_retries: int = 3):
        self.max_workers = max_workers
        self.max_retries = max_retries
        self._queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
        self._active_tasks: dict = {}
        self._results: dict = {}
        
    async def submit(
        self,
        task: Task,
        priority: int = 0,
        callback: Optional[callable] = None
    ) -> str:
        """Submit a task to the queue with optional priority."""
        await self._queue.put((priority, task))
        if callback:
            self._register_callback(task.id, callback)
        return task.id
    
    async def process(self) -> None:
        """Process all tasks in the queue concurrently."""
        workers = [
            asyncio.create_task(self._worker(i))
            for i in range(self.max_workers)
        ]
        await asyncio.gather(*workers)
    
    async def _worker(self, worker_id: int) -> None:
        """Individual worker that processes tasks from queue."""
        while not self._queue.empty():
            priority, task = await self._queue.get()
            try:
                result = await self._execute_with_retry(task)
                self._results[task.id] = result
                task.status = "completed"
            except Exception as e:
                task.status = "failed"
                self._results[task.id] = {"error": str(e)}
            finally:
                self._queue.task_done()`,
  explain: `# Code Explanation

## Overview
This code implements an **async task queue** with the following features:

### Key Components:

1. **Task Dataclass**
   - Immutable task representation
   - Auto-generated timestamps
   - Status tracking (pending → running → completed/failed)

2. **TaskQueue Class**
   - **Priority Queue**: Tasks are processed by priority (lower = higher priority)
   - **Worker Pool**: Configurable concurrent workers (default: 5)
   - **Retry Logic**: Automatic retry with exponential backoff

### How It Works:

\`\`\`
submit() → Queue → Workers → execute_with_retry() → Results
    ↓         ↓         ↓
 Priority   FIFO    Exponential
  Order    Order     Backoff
\`\`\`

### Time Complexity:
- **Submit**: O(log n) - priority queue insertion
- **Process**: O(n) - where n is number of tasks

### Space Complexity:
- O(n) for queue + O(m) for active tasks + O(n) for results

### Best Practices Used:
✓ Type hints throughout
✓ Dataclasses for immutable data
✓ Context managers for resources
✓ Proper exception handling
✓ Async/await patterns`,
  fix: `# Bug Fixes Applied

## Issue #1: Race Condition (Line 45)
\`\`\`python
# BEFORE - Not thread-safe
self._active_tasks[task.id] = task

# AFTER - Thread-safe with lock
async with self._lock:
    self._active_tasks[task.id] = task
\`\`\`

## Issue #2: Missing Timeout (Line 67)
\`\`\`python
# BEFORE - Can hang indefinitely
result = await self._execute(task)

# AFTER - With timeout protection
try:
    result = await asyncio.wait_for(
        self._execute(task),
        timeout=30.0
    )
except asyncio.TimeoutError:
    task.status = "timeout"
    raise
\`\`\`

## Issue #3: Resource Leak (Line 89)
\`\`\`python
# BEFORE - Session not closed
async def _make_request(self):
    session = aiohttp.ClientSession()
    return await session.get(url)

# AFTER - Proper resource management
async def _make_request(self):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()
\`\`\`

## Summary
- Added asyncio.Lock for thread safety
- Implemented 30s timeout for all async operations
- Fixed resource leaks with context managers
- Added proper error propagation`,
  docs: `"""
Task Queue Module
=================

A high-performance async task queue for managing concurrent workloads.

Installation
------------
    pip install task-queue

Quick Start
-----------
    >>> from task_queue import TaskQueue, Task
    >>> 
    >>> queue = TaskQueue(max_workers=10)
    >>> task = Task(id="1", name="process_data")
    >>> await queue.submit(task, priority=1)
    >>> await queue.process()

Classes
-------
Task
    Dataclass representing a single task unit.
    
    Attributes:
        id (str): Unique task identifier
        name (str): Human-readable task name
        status (str): Current status (pending/running/completed/failed)
        created_at (datetime): Creation timestamp

TaskQueue
    Async queue for processing tasks concurrently.
    
    Args:
        max_workers (int): Maximum concurrent workers (default: 5)
        max_retries (int): Retry attempts for failed tasks (default: 3)
    
    Methods:
        submit(task, priority, callback): Add task to queue
        process(): Start processing all queued tasks
        get_result(task_id): Retrieve task result

Example
-------
    >>> async def main():
    ...     queue = TaskQueue(max_workers=5)
    ...     
    ...     # Submit tasks with priorities
    ...     await queue.submit(Task(id="1", name="urgent"), priority=0)
    ...     await queue.submit(Task(id="2", name="normal"), priority=5)
    ...     
    ...     # Process all tasks
    ...     await queue.process()
    ...     
    ...     # Get results
    ...     result = queue.get_result("1")
    
    >>> asyncio.run(main())
"""`,
  refactor: `# Refactored Code

## Changes Applied:
1. ✓ Extracted magic numbers to constants
2. ✓ Applied Single Responsibility Principle
3. ✓ Added comprehensive type hints
4. ✓ Implemented Strategy pattern for extensibility
5. ✓ Enhanced error handling

\`\`\`python
from abc import ABC, abstractmethod
from typing import Protocol, TypeVar, Generic
from dataclasses import dataclass, field
from functools import lru_cache
from enum import Enum, auto
import logging

# Constants (extracted from magic numbers)
class Config:
    MAX_WORKERS = 5
    MAX_RETRIES = 3
    TIMEOUT_SECONDS = 30
    BACKOFF_BASE = 2
    CACHE_SIZE = 1000

class TaskStatus(Enum):
    PENDING = auto()
    RUNNING = auto()
    COMPLETED = auto()
    FAILED = auto()
    TIMEOUT = auto()

# Protocol for type safety
T = TypeVar('T')

class Executor(Protocol[T]):
    """Protocol defining executor interface."""
    async def execute(self, task: T) -> dict: ...
    async def validate(self, task: T) -> bool: ...

# Strategy pattern for retry logic
class RetryStrategy(ABC):
    """Abstract base for retry strategies."""
    
    @abstractmethod
    def get_delay(self, attempt: int) -> float:
        """Calculate delay before next retry."""
        pass

class ExponentialBackoff(RetryStrategy):
    """Exponential backoff with jitter."""
    
    def __init__(self, base: float = Config.BACKOFF_BASE):
        self.base = base
    
    def get_delay(self, attempt: int) -> float:
        import random
        delay = self.base ** attempt
        jitter = random.uniform(0, delay * 0.1)
        return delay + jitter

# Clean implementation
@dataclass
class TaskQueue(Generic[T]):
    """Refactored task queue with clean architecture."""
    
    max_workers: int = Config.MAX_WORKERS
    retry_strategy: RetryStrategy = field(
        default_factory=ExponentialBackoff
    )
    logger: logging.Logger = field(
        default_factory=lambda: logging.getLogger(__name__)
    )
\`\`\``,
};

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
    "$ Model: glm-4-9b-chat (4-bit quantized)",
    "$ VRAM: 7.2GB | Context: 128K tokens",
    "$ Ready for code generation..."
  ]);

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

    const response = mockOutputs[activeTab] || mockOutputs.generate;
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < response.length) {
        setOutputCode(response.slice(0, currentIndex + 20));
        currentIndex += 20;
      } else {
        clearInterval(streamInterval);
        setIsLoading(false);
        setLogs(l => [...l, `$ [✓] ${activeTab} completed (${response.length} chars)`]);
        toast({ title: "Complete", description: "Code generation finished." });
      }
    }, 15);
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
                71.8% HumanEval
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

      {/* Main Editor Area */}
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

        {/* Split Editor View */}
        <div className="grid flex-1 gap-4 lg:grid-cols-2">
          {/* Input Editor */}
          <Card className="flex flex-col border-border bg-card/50">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Input</CardTitle>
              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
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
                    placeholder: getPlaceholder(),
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Output Editor */}
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
                  language={activeTab === "explain" || activeTab === "docs" ? "markdown" : language}
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
      </div>
    </div>
  );
};

export default GlmCodingAgent;
