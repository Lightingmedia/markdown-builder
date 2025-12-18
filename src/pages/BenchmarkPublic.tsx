import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ArrowRight, Zap, TrendingDown, Building2, Leaf, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import ContactFormDialog from "@/components/ContactFormDialog";

const benchmarkData = [
  { name: "Traditional GPU", power: 450, cooling: 180, total: 630 },
  { name: "LightRail Photonic", power: 180, cooling: 20, total: 200 },
];

const industryComparison = [
  { metric: "Power per TFLOP", traditional: 100, lightrail: 35, unit: "W" },
  { metric: "Cooling Requirements", traditional: 100, lightrail: 15, unit: "%" },
  { metric: "Carbon Footprint", traditional: 100, lightrail: 40, unit: "%" },
  { metric: "Cost per Query", traditional: 100, lightrail: 45, unit: "%" },
];

export default function BenchmarkPublic() {
  const [contactOpen, setContactOpen] = useState(false);

  const chartConfig = {
    power: { label: "Compute Power (W)", color: "hsl(var(--primary))" },
    cooling: { label: "Cooling (W)", color: "hsl(var(--destructive))" },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cpu className="h-7 w-7 text-primary" aria-hidden="true" />
            <span className="text-xl font-bold text-primary">LightRail AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-primary transition-colors">Home</Link>
            <Link to="/monitor" className="text-sm hover:text-primary transition-colors">Portal</Link>
            <Link to="/benchmark" className="text-sm text-primary font-medium">Benchmark</Link>
            <Link to="/pricing" className="text-sm hover:text-primary transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/monitor/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Button size="sm" onClick={() => setContactOpen(true)}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 container mx-auto px-4 text-center">
        <Badge variant="outline" className="mb-4">Industry Benchmark</Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          How We <span className="text-primary">Compare</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See how LightRail's photonic computing infrastructure outperforms traditional GPU-based data centers.
        </p>
      </section>

      {/* Power Comparison Chart */}
      <section className="pb-16 container mx-auto px-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Power Consumption Comparison</CardTitle>
            <CardDescription>
              Watts required per equivalent AI workload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <BarChart data={benchmarkData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="power" name="Compute Power (W)" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} stackId="a" />
                <Bar dataKey="cooling" name="Cooling (W)" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} stackId="a" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      {/* Key Metrics */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Performance Metrics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryComparison.map((item, index) => (
              <Card key={item.metric} className="text-center">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    {index === 0 && <Zap className="h-10 w-10 text-primary mx-auto" />}
                    {index === 1 && <TrendingDown className="h-10 w-10 text-primary mx-auto" />}
                    {index === 2 && <Leaf className="h-10 w-10 text-primary mx-auto" />}
                    {index === 3 && <Building2 className="h-10 w-10 text-primary mx-auto" />}
                  </div>
                  <h3 className="font-semibold mb-2">{item.metric}</h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">{item.traditional}{item.unit}</div>
                      <div className="text-xs text-muted-foreground">Traditional</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{item.lightrail}{item.unit}</div>
                      <div className="text-xs text-primary">LightRail</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Savings Calculator Teaser */}
      <section className="py-24 container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-primary/30 bg-gradient-to-br from-card to-muted/50">
          <CardContent className="pt-8 pb-8 text-center">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Calculate Your Savings</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Access our full benchmark comparison tool in the Customer Portal. Compare your facility's metrics against industry standards.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/monitor">
                <Button size="lg">
                  Access Full Benchmark Tool
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={() => setContactOpen(true)}>
                Request Custom Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
