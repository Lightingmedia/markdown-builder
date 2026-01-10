import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Editor from "@monaco-editor/react";
import { 
  BookOpen, 
  Rocket, 
  Zap, 
  Bot, 
  Code2, 
  Terminal,
  Trophy,
  Copy,
  CheckCircle,
  HelpCircle,
  FileCode,
  Cpu,
  Settings,
  Download,
  GitBranch
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Documentation = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("quickstart");

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({ title: "Copied!", description: "Code copied to clipboard." });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = "python", id }: { code: string; language?: string; id: string }) => (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 z-10 h-7 w-7 p-0"
        onClick={() => copyCode(code, id)}
      >
        {copiedCode === id ? (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <div className="overflow-hidden rounded-lg border border-border">
        <Editor
          height="180px"
          language={language}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: "off",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );

  const sections = [
    { id: "quickstart", label: "Quick Start", icon: Rocket },
    { id: "finetuning", label: "Fine-Tuning", icon: Zap },
    { id: "coding", label: "Coding Agents", icon: Bot },
    { id: "api", label: "API Reference", icon: Terminal },
    { id: "faq", label: "FAQ", icon: HelpCircle },
  ];

  const faqs = [
    {
      question: "What are the minimum system requirements?",
      answer: "For fine-tuning: NVIDIA GPU with 8GB+ VRAM, 16GB RAM, Python 3.9+. With 4-bit quantization, you can run 7B models on 8GB VRAM. For coding agents: CPU-only works for smaller models (0.5B-1.5B), but GPU is recommended for 7B+."
    },
    {
      question: "How do I prepare training data?",
      answer: "Use JSON or JSONL format with 'instruction' and 'response' fields. For chat models, use 'messages' array. Minimum 100 examples recommended, but 500+ gives better results. Data quality matters more than quantity."
    },
    {
      question: "What's the difference between LoRA and QLoRA?",
      answer: "LoRA adds trainable adapters to frozen weights. QLoRA combines LoRA with 4-bit quantization for 70%+ memory reduction while maintaining quality. Use QLoRA for consumer GPUs (RTX 3090/4090)."
    },
    {
      question: "How long does fine-tuning take?",
      answer: "With Unsloth optimizations: 7B model on ~1000 examples takes 15-30 min on A100, 1-2 hours on RTX 4090. Enable Flash Attention and 4-bit mode for 2-5x speedup."
    },
    {
      question: "Can I run models offline?",
      answer: "Yes! All models run locally after download. GLM-4 and Qwen2.5 support 4-bit quantization for consumer hardware. Export to GGUF for llama.cpp/Ollama deployment."
    },
    {
      question: "Which model should I choose?",
      answer: "For general coding: Qwen2.5-Coder 7B (74.5% HumanEval). For explanation/docs: GLM-4. For speed: Qwen 0.5B/1.5B. For max quality: Qwen 32B or fine-tuned Llama 3.1."
    },
  ];

  return (
    <div className="grid h-[calc(100vh-8rem)] gap-4 lg:grid-cols-4">
      {/* Sidebar Navigation */}
      <Card className="border-border bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Documentation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setActiveSection(section.id)}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Content Area */}
      <Card className="border-border bg-card/50 lg:col-span-3">
        <ScrollArea className="h-full">
          <CardContent className="p-6">
            {activeSection === "quickstart" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Rocket className="h-5 w-5 text-blue-500" />
                    Quick Start Guide
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Get up and running with LLM Dev Tools in under 5 minutes.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">1. Installation</h3>
                  <CodeBlock
                    id="install"
                    language="bash"
                    code={`# Install via pip
pip install llm-dev-tools

# Install with GPU support (CUDA 12.x)
pip install llm-dev-tools[cuda12]

# Verify installation
llm-tools --version
# Output: llm-dev-tools v2.1.0 (CUDA 12.3)`}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">2. Your First Fine-Tune</h3>
                  <CodeBlock
                    id="first-finetune"
                    code={`from llm_tools import UnslothTrainer

# Initialize with 4-bit quantization (saves 70% VRAM)
trainer = UnslothTrainer(
    model_name="llama-3.1-8b",
    quantization="4bit",
    lora_rank=16,
    flash_attention=True
)

# Load dataset (JSON/JSONL format)
trainer.load_dataset("training_data.jsonl")

# Train with optimal defaults
trainer.train(
    max_steps=60,
    learning_rate=2e-4,
    batch_size=4
)

# Export for deployment
trainer.export("my_model.gguf", format="gguf")`}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">3. Code Generation</h3>
                  <CodeBlock
                    id="code-gen"
                    code={`from llm_tools import QwenCoder

# Initialize Qwen2.5-Coder (74.5% HumanEval)
coder = QwenCoder(
    model_size="7b",
    quantization="4bit"
)

# Generate code from description
code = coder.generate(
    prompt="Create an async REST client with retry logic",
    language="python",
    max_tokens=2048
)

# Generate comprehensive tests
tests = coder.generate_tests(
    code=code,
    framework="pytest"
)

print(code)
print(tests)`}
                  />
                </div>
              </div>
            )}

            {activeSection === "finetuning" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Fine-Tuning with Unsloth
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Train LLMs 2-5x faster with 70% less memory using Unsloth optimizations.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Cpu className="h-4 w-4 text-emerald-500" />
                        Supported Models
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-1">
                        <li>• Llama 3.1 (8B, 70B)</li>
                        <li>• Mistral 7B / Mixtral 8x7B</li>
                        <li>• Qwen 2.5 (0.5B - 72B)</li>
                        <li>• GLM-4 9B</li>
                        <li>• Gemma 7B / 2B</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Settings className="h-4 w-4 text-blue-500" />
                        Optimal Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="space-y-1">
                        <li>• 4-bit Quantization: ON</li>
                        <li>• Flash Attention: ON</li>
                        <li>• LoRA Rank: 16-32</li>
                        <li>• Learning Rate: 2e-4</li>
                        <li>• Batch Size: 4-8</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Data Format</h3>
                  <CodeBlock
                    id="data-format"
                    language="json"
                    code={`// Single instruction format
{
  "instruction": "Write a function to calculate factorial",
  "input": "",
  "response": "def factorial(n):\\n    return 1 if n <= 1 else n * factorial(n-1)"
}

// Chat format (for conversational models)
{
  "messages": [
    {"role": "user", "content": "How do I sort a list in Python?"},
    {"role": "assistant", "content": "Use sorted() or list.sort()..."}
  ]
}`}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Export Formats</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Card className="border-border p-4">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium">GGUF</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        For llama.cpp, Ollama, LM Studio
                      </p>
                    </Card>
                    <Card className="border-border p-4">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Safetensors</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        For PyTorch, Transformers
                      </p>
                    </Card>
                    <Card className="border-border p-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">HuggingFace</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Push directly to Hub
                      </p>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "coding" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Bot className="h-5 w-5 text-blue-500" />
                    Coding Agents
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    AI-powered code generation, explanation, and refactoring.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">GLM-4 Coding Agent</h3>
                  <Badge variant="secondary">71.8% HumanEval</Badge>
                  <CodeBlock
                    id="glm4-example"
                    code={`from llm_tools import GLM4Agent

agent = GLM4Agent(quantization="4bit")

# Generate code from natural language
code = agent.generate(
    prompt="Create a REST API with FastAPI",
    language="python"
)

# Explain existing code
explanation = agent.explain(code, detail_level="detailed")

# Fix bugs with context
fixed = agent.fix_bugs(
    code=buggy_code,
    error_message="TypeError: 'NoneType' object is not iterable"
)

# Add comprehensive documentation
documented = agent.add_docs(code, style="google")`}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Qwen2.5-Coder</h3>
                  <Badge className="bg-yellow-500/10 text-yellow-500">
                    <Trophy className="mr-1 h-3 w-3" />
                    74.5% HumanEval - Beats GPT-4
                  </Badge>
                  <CodeBlock
                    id="qwen-example"
                    code={`from llm_tools import QwenCoder

coder = QwenCoder(
    model_size="7b",  # Options: 0.5b, 1.5b, 7b, 14b, 32b
    quantization="4bit"
)

# Generate complete functions
code = coder.generate_function(
    prompt="Binary search with early termination",
    language="python"
)

# Code completion (fill-in-the-middle)
completed = coder.complete(
    prefix="def calculate_total(items):\\n    ",
    suffix="\\n    return total"
)

# Generate comprehensive test suites
tests = coder.generate_tests(
    code=code,
    framework="pytest",
    coverage="full"
)

# Refactor with patterns
refactored = coder.refactor(
    code=legacy_code,
    patterns=["SOLID", "DRY", "type-hints"]
)`}
                  />
                </div>
              </div>
            )}

            {activeSection === "api" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Terminal className="h-5 w-5 text-emerald-500" />
                    API Reference
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Complete API documentation with type definitions.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">UnslothTrainer</h3>
                  <CodeBlock
                    id="trainer-api"
                    code={`class UnslothTrainer:
    """Fast LLM fine-tuning with LoRA/QLoRA."""
    
    def __init__(
        self,
        model_name: str,                    # Base model name
        quantization: str = "4bit",         # "4bit", "8bit", "none"
        lora_rank: int = 16,                # LoRA adapter rank
        lora_alpha: int = 32,               # LoRA alpha scaling
        flash_attention: bool = True,       # Enable Flash Attention 2
        gradient_checkpointing: bool = True # Memory optimization
    ) -> None: ...
    
    def load_dataset(
        self,
        path: str,                          # Path to dataset
        format: str = "auto",               # "json", "jsonl", "csv", "auto"
        split: float = 0.9                  # Train/validation split
    ) -> int: ...                           # Returns number of examples
    
    def train(
        self,
        max_steps: int = 60,
        learning_rate: float = 2e-4,
        batch_size: int = 4,
        warmup_steps: int = 5,
        callbacks: list = None
    ) -> TrainingResult: ...
    
    def export(
        self,
        path: str,
        format: str = "gguf"                # "gguf", "safetensors", "huggingface"
    ) -> str: ...`}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">CodingAgent</h3>
                  <CodeBlock
                    id="agent-api"
                    code={`class CodingAgent:
    """Base class for coding agents (GLM-4, Qwen)."""
    
    def generate(
        self,
        prompt: str,
        language: str = "python",
        temperature: float = 0.7,
        max_tokens: int = 2048,
        stop: list[str] = None
    ) -> str: ...
    
    def explain(
        self,
        code: str,
        detail_level: str = "medium"        # "brief", "medium", "detailed"
    ) -> str: ...
    
    def fix_bugs(
        self,
        code: str,
        error_message: str = None
    ) -> tuple[str, list[BugFix]]: ...
    
    def refactor(
        self,
        code: str,
        style: str = "clean",               # "clean", "performance", "readable"
        patterns: list[str] = None          # ["SOLID", "DRY", etc.]
    ) -> str: ...
    
    def generate_tests(
        self,
        code: str,
        framework: str = "pytest",
        coverage: str = "standard"          # "minimal", "standard", "full"
    ) -> str: ...`}
                  />
                </div>
              </div>
            )}

            {activeSection === "faq" && (
              <div className="space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <HelpCircle className="h-5 w-5 text-purple-500" />
                    Frequently Asked Questions
                  </h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left text-sm">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default Documentation;
