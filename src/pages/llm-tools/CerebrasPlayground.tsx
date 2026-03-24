import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Zap, Copy, Check, Eye, EyeOff, ChevronDown, Send, Loader2,
  Clock, Hash, Gauge, Sparkles
} from "lucide-react";

const CODE_EXAMPLES = {
  python: `# Install the LightRail AI SDK
# !pip install lightrail-ai-sdk

import os
from lightrail.ai.sdk import LightRailAI

# Initialize LightRail AI client
client = LightRailAI(
    api_key=os.environ.get("LIGHTRAIL_API_KEY")
)

# Create a chat completion
completion = client.chat.completions.create(
    messages=[{
        "role": "user",
        "content": "Explain photonic computing in simple terms"
    }],
    model="llama3.1-8b",
    max_completion_tokens=1024,
    temperature=0.2,
    top_p=1,
    stream=False
)

# Print the response
print(completion.choices[0].message.content)`,
  typescript: `import { LightRailAI } from 'lightrail-ai-sdk';

// Initialize LightRail AI client
const client = new LightRailAI({
  apiKey: process.env.LIGHTRAIL_API_KEY!
});

async function main() {
  const completion = await client.chat.completions.create({
    messages: [{
      role: 'user',
      content: 'Explain photonic computing in simple terms'
    }],
    model: 'llama3.1-8b',
    max_completion_tokens: 1024,
    temperature: 0.2,
    top_p: 1,
    stream: false
  });

  console.log(completion.choices[0].message.content);
}

main();`,
  curl: `curl --location 'https://api.lightrail.ink/v1/chat/completions' \\
  --header 'Content-Type: application/json' \\
  --header 'Authorization: Bearer $LIGHTRAIL_API_KEY' \\
  --data '{
    "model": "llama3.1-8b",
    "max_completion_tokens": 1024,
    "temperature": 0.2,
    "top_p": 1,
    "stream": false,
    "messages": [{
      "role": "user",
      "content": "Explain photonic computing in simple terms"
    }]
  }'`,
};

const MODELS = [
  {
    id: "llama3.1-8b",
    name: "Llama 3.1 8B",
    speed: 5, quality: 4, cost: 1,
    best: "Quick queries, chat, simple tasks",
  },
  {
    id: "llama3.1-70b",
    name: "Llama 3.1 70B",
    speed: 4, quality: 5, cost: 2,
    best: "Complex reasoning, analysis",
  },
  {
    id: "llama3.3-70b",
    name: "Llama 3.3 70B",
    speed: 4, quality: 5, cost: 2,
    best: "Latest capabilities, production",
  },
];

const EXAMPLE_PROMPTS = [
  "Explain quantum computing",
  "Write Python code to analyze data",
  "Compare AI chip architectures",
  "Explain photonic interconnects",
];

export default function CerebrasPlayground() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("llama3.1-8b");
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [metrics, setMetrics] = useState<{ inferenceTime: string; tokensGenerated: number; tokensPerSecond: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("python");

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResponse("");
    setMetrics(null);

    try {
      const { data, error } = await supabase.functions.invoke("cerebras-chat", {
        body: { message, model, temperature, maxTokens },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setResponse(data.response);
      setMetrics(data.metrics);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate response");
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto bg-[#0c0c0f]">
      {/* Header */}
      <div className="border-b border-border/40 px-6 py-5 bg-gradient-to-r from-[#0c0c0f] to-[#111118]">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Get started with LightRail AI</h1>
            <p className="text-sm text-muted-foreground">
              Ultra-fast inference powered by Cerebras — grab your API key and start building
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
        {/* Quick Start + API Key */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Code Examples */}
          <div className="lg:col-span-3">
            <Card className="bg-[#16161d] border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-[#1e1e28] mb-4">
                    <TabsTrigger value="python" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-semibold">
                      PYTHON
                    </TabsTrigger>
                    <TabsTrigger value="typescript" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-semibold">
                      TYPESCRIPT
                    </TabsTrigger>
                    <TabsTrigger value="curl" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-semibold">
                      CURL
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(CODE_EXAMPLES).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang}>
                      <div className="relative bg-[#0d0d12] rounded-lg p-4 border border-border/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(code, lang)}
                        >
                          {copiedCode === lang ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                          <span className="ml-1 text-xs">{copiedCode === lang ? "Copied!" : "Copy"}</span>
                        </Button>
                        <pre className="text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed">
                          {code}
                        </pre>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* API Key Card */}
          <div className="lg:col-span-2">
            <Card className="bg-[#16161d] border-border/30">
              <CardHeader>
                <CardTitle className="text-lg">Your API Key</CardTitle>
                <CardDescription>Use this key to authenticate requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full aspect-video bg-gradient-to-br from-cyan-900/30 via-[#1a1a24] to-orange-900/20 rounded-lg flex items-center justify-center border border-border/20">
                  <div className="grid grid-cols-3 gap-2 p-4">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full ${
                          i % 3 === 0 ? "bg-cyan-500 shadow-[0_0_8px_rgba(0,212,255,0.5)]" :
                          i % 3 === 1 ? "bg-orange-500 shadow-[0_0_8px_rgba(255,107,53,0.5)]" :
                          "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#0d0d12] rounded-lg p-3 font-mono text-sm text-muted-foreground border border-border/20">
                  csk-9nfh•••••••••••j9hkr
                </div>

                <p className="text-xs text-muted-foreground">
                  Your API key is stored securely. Contact admin for key management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Playground */}
        <Card className="bg-[#16161d] border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Test LightRail AI Inference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask anything about AI, photonics, or technology..."
                  className="bg-[#0d0d12] border-border/30 min-h-[120px] text-sm focus:border-cyan-500/50 resize-none"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-[#0d0d12] border-border/30 hover:border-cyan-500/50 hover:text-cyan-400"
                      onClick={() => setMessage(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-[#0d0d12] border-border/30 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground">
                      Advanced Settings <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Temperature: {temperature}</label>
                      <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={0} max={1} step={0.1} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Max Tokens</label>
                      <Input
                        type="number"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(Number(e.target.value))}
                        className="bg-[#0d0d12] border-border/30 text-sm mt-1"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Button
                  onClick={handleSubmit}
                  disabled={loading || !message.trim()}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Zap className="h-4 w-4" /> Generate Response</>
                  )}
                </Button>
              </div>
            </div>

            {/* Response */}
            <div className="bg-[#0d0d12] rounded-lg p-4 min-h-[160px] border border-border/20">
              {response ? (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => copyToClipboard(response, "response")}
                      className="text-xs text-muted-foreground"
                    >
                      {copiedCode === "response" ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      <span className="ml-1">{copiedCode === "response" ? "Copied!" : "Copy"}</span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{response}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">Your AI response will appear here...</p>
              )}
            </div>

            {/* Metrics */}
            {metrics && (
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-cyan-400" /> {metrics.inferenceTime}s</span>
                <span className="flex items-center gap-1"><Hash className="h-3 w-3 text-cyan-400" /> {metrics.tokensGenerated} tokens</span>
                <span className="flex items-center gap-1"><Gauge className="h-3 w-3 text-cyan-400" /> {metrics.tokensPerSecond} tok/s</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Model Comparison */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Models</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {MODELS.map((m) => (
              <Card key={m.id} className="bg-[#16161d] border-border/30 hover:border-cyan-500/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{m.name}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs">{m.id}</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Speed</span><span>{"⚡".repeat(m.speed)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Quality</span><span>{"⭐".repeat(m.quality)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cost</span><span>{"💰".repeat(m.cost)}</span></div>
                  <p className="text-xs text-muted-foreground pt-1">Best for: {m.best}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/50 pb-6">
          Powered by LightRail AI — Ultra-fast inference at photonic speed
        </div>
      </div>
    </div>
  );
}
