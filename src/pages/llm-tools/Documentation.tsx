import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Copy,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Documentation = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
        className="absolute right-2 top-2 z-10"
        onClick={() => copyCode(code, id)}
      >
        {copiedCode === id ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
      <div className="overflow-hidden rounded-lg border border-border">
        <Editor
          height="200px"
          language={language}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "off",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );

  const faqs = [
    {
      question: "What are the system requirements?",
      answer: "For optimal performance, we recommend: NVIDIA GPU with 8GB+ VRAM for fine-tuning, 16GB RAM minimum, Python 3.9+, and CUDA 11.8+ for GPU acceleration. 4-bit quantization reduces VRAM requirements by ~70%."
    },
    {
      question: "How do I prepare my training data?",
      answer: "Training data should be in JSON or JSONL format with 'instruction' and 'response' fields. For chat models, use 'messages' array with 'role' and 'content'. Minimum 100 examples recommended, but more data generally improves results."
    },
    {
      question: "What's the difference between LoRA and QLoRA?",
      answer: "LoRA (Low-Rank Adaptation) adds trainable adapters to frozen base weights. QLoRA combines LoRA with 4-bit quantization, reducing memory usage by 70%+ while maintaining performance. Use QLoRA for consumer GPUs."
    },
    {
      question: "How long does fine-tuning take?",
      answer: "With Unsloth's optimizations, a 7B model on ~1000 examples takes 15-30 minutes on an A100. Consumer GPUs (RTX 3090/4090) take 1-2 hours. Enable Flash Attention and 4-bit mode for faster training."
    },
    {
      question: "Can I use the coding agents offline?",
      answer: "Yes! All models can run locally after download. GLM-4 and Qwen2.5-Coder support 4-bit quantization for running on consumer hardware. Smaller model sizes (0.5B-1.5B) work well on CPU-only systems."
    },
    {
      question: "How do I export my fine-tuned model?",
      answer: "After training, click 'Export Model' to download in GGUF, safetensors, or HuggingFace format. GGUF is recommended for llama.cpp/Ollama deployment. Safetensors for Python frameworks."
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="getting-started">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="getting-started" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span className="hidden sm:inline">Getting Started</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">User Guides</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            <span className="hidden sm:inline">API Reference</span>
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">FAQ</span>
          </TabsTrigger>
        </TabsList>

        {/* Getting Started */}
        <TabsContent value="getting-started" className="mt-6 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Rocket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Quick Start Guide</CardTitle>
                  <CardDescription>Get up and running in minutes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">1. Choose Your Tool</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Unsloth Fine-Tuning</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Train custom models 2-5x faster with 70% less memory
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">GLM-4 Agent</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Generate, explain, and fix code with 71.8% HumanEval
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Qwen2.5-Coder</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        State-of-the-art code model beating GPT-4
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">2. Installation</h3>
                <CodeBlock
                  id="install"
                  language="bash"
                  code={`# Install via pip
pip install llm-dev-tools

# Or with conda
conda install -c conda-forge llm-dev-tools

# Verify installation
llm-tools --version`}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">3. Your First Fine-Tune</h3>
                <CodeBlock
                  id="first-finetune"
                  code={`from llm_tools import UnslothTrainer

# Initialize trainer with 4-bit quantization
trainer = UnslothTrainer(
    model_name="llama-3.1-8b",
    quantization="4bit",
    lora_rank=16
)

# Load your dataset
trainer.load_dataset("training_data.jsonl")

# Start training
trainer.train(
    max_steps=60,
    learning_rate=2e-4,
    batch_size=4
)

# Export trained model
trainer.export("my_model.gguf")`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Guides */}
        <TabsContent value="guides" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Fine-Tuning Guide */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Fine-Tuning with Unsloth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">Preparing Your Data</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Format your training data as JSON with instruction-response pairs.
                  </p>
                  <CodeBlock
                    id="data-format"
                    language="json"
                    code={`{
  "instruction": "Write a Python function to calculate factorial",
  "input": "",
  "response": "def factorial(n):\\n    if n <= 1:\\n        return 1\\n    return n * factorial(n-1)"
}`}
                  />
                </div>

                <div>
                  <h4 className="font-medium text-foreground">Optimal Settings</h4>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>Enable 4-bit quantization for 70% memory reduction</li>
                    <li>Use Flash Attention for 2x training speed</li>
                    <li>Start with LoRA rank 16, increase for complex tasks</li>
                    <li>Learning rate 2e-4 works well for most cases</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Coding Agents Guide */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  Using Coding Agents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">GLM-4 Coding Agent</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Best for: Code explanation, documentation, and bug fixing.
                  </p>
                  <CodeBlock
                    id="glm4-example"
                    code={`from llm_tools import GLM4Agent

agent = GLM4Agent(quantization="4bit")

# Generate code from description
code = agent.generate(
    prompt="Create a REST API with FastAPI",
    language="python"
)

# Explain existing code
explanation = agent.explain(code)

# Fix bugs in code
fixed = agent.fix_bugs(buggy_code)`}
                  />
                </div>

                <div>
                  <h4 className="font-medium text-foreground">Qwen2.5-Coder</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Best for: Code completion, test generation, and refactoring.
                  </p>
                  <Badge className="mt-2" variant="secondary">74.5% HumanEval</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Reference */}
        <TabsContent value="api" className="mt-6 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                API Reference
              </CardTitle>
              <CardDescription>Complete API documentation with examples</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">UnslothTrainer</h3>
                <CodeBlock
                  id="trainer-api"
                  code={`class UnslothTrainer:
    """Fast LLM fine-tuning with LoRA/QLoRA."""
    
    def __init__(
        self,
        model_name: str,
        quantization: str = "4bit",  # "4bit", "8bit", "none"
        lora_rank: int = 16,
        lora_alpha: int = 32,
        flash_attention: bool = True
    ):
        """Initialize trainer with model and settings."""
    
    def load_dataset(
        self,
        path: str,
        format: str = "auto"  # "json", "jsonl", "csv", "auto"
    ) -> int:
        """Load training data. Returns number of examples."""
    
    def train(
        self,
        max_steps: int = 60,
        learning_rate: float = 2e-4,
        batch_size: int = 4,
        callbacks: list = None
    ) -> TrainingResult:
        """Run training loop. Returns metrics and stats."""
    
    def export(
        self,
        path: str,
        format: str = "gguf"  # "gguf", "safetensors", "huggingface"
    ) -> str:
        """Export trained model to file."""`}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">CodingAgent</h3>
                <CodeBlock
                  id="agent-api"
                  code={`class CodingAgent:
    """Base class for coding agents."""
    
    def generate(
        self,
        prompt: str,
        language: str = "python",
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate code from natural language description."""
    
    def explain(
        self,
        code: str,
        detail_level: str = "medium"  # "brief", "medium", "detailed"
    ) -> str:
        """Explain code with comments and documentation."""
    
    def fix_bugs(
        self,
        code: str,
        error_message: str = None
    ) -> tuple[str, list[dict]]:
        """Fix bugs and return corrected code with explanations."""
    
    def refactor(
        self,
        code: str,
        style: str = "clean"  # "clean", "performance", "readable"
    ) -> str:
        """Refactor code following best practices."""
    
    def generate_tests(
        self,
        code: str,
        framework: str = "pytest"
    ) -> str:
        """Generate comprehensive test suite."""`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="mt-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
