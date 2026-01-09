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
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { 
  Bot, 
  Play, 
  Copy, 
  Download, 
  Settings,
  Code,
  FileText,
  Bug,
  BookOpen,
  RefreshCw,
  Loader2
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

  const getPlaceholder = () => {
    switch (activeTab) {
      case "generate":
        return "Describe the code you want to generate...\n\nExample: Write a function that finds the longest palindromic substring in a given string.";
      case "explain":
        return "Paste the code you want explained...\n\nExample: def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)";
      case "fix":
        return "Paste the buggy code here...\n\nExample: def divide(a, b): return a / b  # Needs error handling";
      case "docs":
        return "Paste code that needs documentation...\n\nExample: def process_data(data, threshold, normalize=True): ...";
      case "refactor":
        return "Paste the code you want refactored...\n\nExample: A function with code smells that needs improvement";
      default:
        return "Enter your code or prompt...";
    }
  };

  const handleGenerate = async () => {
    if (!inputCode.trim()) {
      toast({ title: "Empty input", description: "Please enter code or a prompt.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setOutputCode("");

    // Simulate API call with streaming effect
    const mockResponses: Record<string, string> = {
      generate: `def longest_palindrome(s: str) -> str:
    """
    Find the longest palindromic substring using dynamic programming.
    
    Args:
        s: Input string
        
    Returns:
        The longest palindromic substring
    """
    if not s:
        return ""
    
    n = len(s)
    # dp[i][j] will be True if s[i:j+1] is a palindrome
    dp = [[False] * n for _ in range(n)]
    start, max_len = 0, 1
    
    # All single characters are palindromes
    for i in range(n):
        dp[i][i] = True
    
    # Check for 2-character palindromes
    for i in range(n - 1):
        if s[i] == s[i + 1]:
            dp[i][i + 1] = True
            start, max_len = i, 2
    
    # Check for lengths > 2
    for length in range(3, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j] and dp[i + 1][j - 1]:
                dp[i][j] = True
                start, max_len = i, length
    
    return s[start:start + max_len]`,
      explain: `# Code Explanation

## Overview
This code defines a recursive Fibonacci function that calculates the nth Fibonacci number.

## How it works:
1. **Base Case**: If n <= 1, return n directly (F(0) = 0, F(1) = 1)
2. **Recursive Case**: Return the sum of the previous two Fibonacci numbers

## Time Complexity: O(2^n)
Each call branches into two recursive calls, leading to exponential time.

## Space Complexity: O(n)
Maximum recursion depth is n.

## Optimization Suggestions:
- Use memoization to cache results
- Use dynamic programming for O(n) time
- Use matrix exponentiation for O(log n) time`,
      fix: `def divide(a: float, b: float) -> float:
    """
    Safely divide two numbers with error handling.
    
    Args:
        a: Dividend
        b: Divisor
        
    Returns:
        Result of division
        
    Raises:
        ZeroDivisionError: When b is zero
        TypeError: When inputs are not numbers
    """
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("Both arguments must be numbers")
    
    if b == 0:
        raise ZeroDivisionError("Cannot divide by zero")
    
    return a / b

# Usage with error handling:
# try:
#     result = divide(10, 0)
# except ZeroDivisionError as e:
#     print(f"Error: {e}")`,
      docs: `def process_data(
    data: list[dict],
    threshold: float,
    normalize: bool = True
) -> list[dict]:
    """
    Process and filter data based on threshold with optional normalization.
    
    This function takes a list of data points, filters them based on a 
    threshold value, and optionally normalizes the remaining values.
    
    Args:
        data: A list of dictionaries containing 'value' keys with numeric values.
        threshold: Minimum value required for a data point to be included.
        normalize: If True, normalize values to range [0, 1]. Defaults to True.
        
    Returns:
        A list of processed dictionaries with filtered and optionally normalized values.
        
    Raises:
        ValueError: If data is empty or threshold is negative.
        KeyError: If any dictionary lacks a 'value' key.
        
    Example:
        >>> data = [{'value': 10}, {'value': 5}, {'value': 15}]
        >>> process_data(data, threshold=7, normalize=True)
        [{'value': 0.0}, {'value': 1.0}]
    """
    # Implementation here...
    pass`,
      refactor: `# Refactored Code

## Before (Code Smells):
- Long function with multiple responsibilities
- Magic numbers
- Poor variable names
- No error handling

## After (Clean Code):

from dataclasses import dataclass
from typing import Optional
from enum import Enum

class Status(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class ProcessResult:
    status: Status
    data: Optional[dict] = None
    error: Optional[str] = None

class DataProcessor:
    """Handles data processing with clear separation of concerns."""
    
    MAX_RETRIES = 3
    TIMEOUT_SECONDS = 30
    
    def __init__(self, config: dict):
        self.config = config
        self._validate_config()
    
    def _validate_config(self) -> None:
        required_keys = ["api_url", "api_key"]
        for key in required_keys:
            if key not in self.config:
                raise ValueError(f"Missing required config: {key}")
    
    def process(self, data: dict) -> ProcessResult:
        """Process data with retry logic and error handling."""
        try:
            validated_data = self._validate(data)
            transformed_data = self._transform(validated_data)
            return ProcessResult(Status.COMPLETED, data=transformed_data)
        except Exception as e:
            return ProcessResult(Status.FAILED, error=str(e))`,
    };

    // Simulate streaming
    const response = mockResponses[activeTab] || mockResponses.generate;
    let currentIndex = 0;
    
    const streamInterval = setInterval(() => {
      if (currentIndex < response.length) {
        setOutputCode(response.slice(0, currentIndex + 10));
        currentIndex += 10;
      } else {
        clearInterval(streamInterval);
        setIsLoading(false);
        toast({ title: "Generation complete", description: "Code has been generated successfully." });
      }
    }, 20);
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
    toast({ title: "Downloaded!", description: "Code file has been downloaded." });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">GLM-4 Coding Agent</h2>
            <p className="text-sm text-muted-foreground">71.8% HumanEval Score</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Model Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Temperature</Label>
                <span className="text-sm text-muted-foreground">{temperature[0]}</span>
              </div>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                min={0}
                max={2}
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
                min={256}
                max={8192}
                step={256}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>4-bit Quantization</Label>
              <Switch checked={use4Bit} onCheckedChange={setUse4Bit} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
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
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder={getPlaceholder()}
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
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

export default GlmCodingAgent;
