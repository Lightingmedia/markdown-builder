import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingDown, Zap, Leaf, BarChart3 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ContactFormDialog from "@/components/ContactFormDialog";
import { useState } from "react";
import logoTechscale from "@/assets/logo-techscale.png";
import logoDataflow from "@/assets/logo-dataflow.png";
import logoGreentech from "@/assets/logo-greentech.png";
import logoNexus from "@/assets/logo-nexus.png";

const caseStudies = [
  {
    id: "techscale-ai",
    company: "TechScale AI",
    logo: logoTechscale,
    industry: "AI/ML Infrastructure",
    headline: "60% Reduction in AI Training Costs",
    summary: "TechScale AI transformed their data center operations by migrating to LightRail's photonic computing infrastructure, achieving unprecedented energy efficiency.",
    challenge: "TechScale AI was facing unsustainable energy costs as they scaled their AI training operations. Their traditional GPU clusters consumed over 2.5MW of power, with cooling accounting for 40% of their operational expenses.",
    solution: "LightRail deployed a hybrid photonic-electronic computing solution that replaced their primary GPU training infrastructure. The migration was completed in phases over 8 weeks with zero downtime.",
    results: [
      { metric: "60%", label: "Cost Reduction" },
      { metric: "75%", label: "Energy Savings" },
      { metric: "3x", label: "Training Speed" },
      { metric: "Zero", label: "Water Usage" },
    ],
    quote: "LightRail's photonic computing has reduced our AI training costs by 60%. The energy savings alone have transformed our sustainability metrics.",
    quotePerson: "Sarah Chen, VP of Infrastructure",
    tags: ["AI Training", "Cost Optimization", "Sustainability"],
  },
  {
    id: "dataflow-systems",
    company: "DataFlow Systems",
    logo: logoDataflow,
    industry: "Enterprise Data Analytics",
    headline: "Seamless Migration with Immediate ROI",
    summary: "DataFlow Systems achieved immediate performance improvements and power reduction after transitioning from traditional GPU clusters to LightRail infrastructure.",
    challenge: "DataFlow's legacy GPU infrastructure was becoming a bottleneck for their real-time analytics platform. Power consumption was limiting their ability to scale, and heat management was causing frequent throttling.",
    solution: "LightRail's team designed a custom photonic computing solution that integrated directly with DataFlow's existing software stack. The solution included optical interconnects that eliminated network bottlenecks.",
    results: [
      { metric: "45%", label: "Power Reduction" },
      { metric: "2x", label: "Query Performance" },
      { metric: "99.99%", label: "Uptime" },
      { metric: "$1.2M", label: "Annual Savings" },
    ],
    quote: "The transition from GPU clusters to LightRail was seamless. We saw immediate improvements in both performance and power consumption.",
    quotePerson: "Marcus Thompson, CTO",
    tags: ["Real-time Analytics", "Migration", "Performance"],
  },
  {
    id: "greentech-ventures",
    company: "GreenTech Ventures",
    logo: logoGreentech,
    industry: "Sustainable Technology",
    headline: "Carbon Neutral AI Operations",
    summary: "GreenTech Ventures achieved their carbon neutrality goals two years ahead of schedule by partnering with LightRail for their AI infrastructure needs.",
    challenge: "As a sustainability-focused investment firm, GreenTech needed AI infrastructure that aligned with their ESG commitments. Traditional data centers were incompatible with their carbon neutrality timeline.",
    solution: "LightRail provided a fully renewable-powered photonic computing cluster. The zero-water-cooling design eliminated one of the largest environmental impacts of traditional data centers.",
    results: [
      { metric: "100%", label: "Carbon Neutral" },
      { metric: "Zero", label: "Water Consumption" },
      { metric: "85%", label: "Energy Efficiency" },
      { metric: "2 Years", label: "Ahead of ESG Goals" },
    ],
    quote: "Finally, AI infrastructure that aligns with our carbon neutrality goals. LightRail is the future of sustainable computing.",
    quotePerson: "Emma Rodriguez, Chief Sustainability Officer",
    tags: ["ESG", "Carbon Neutral", "Renewable Energy"],
  },
  {
    id: "nexus-computing",
    company: "Nexus Computing",
    logo: logoNexus,
    industry: "Cloud Services",
    headline: "3x Scale at Lower Operating Costs",
    summary: "Nexus Computing expanded their AI services offerings by 3x while actually reducing their monthly energy bill through LightRail's photonic infrastructure.",
    challenge: "Nexus wanted to triple their AI compute capacity but their facility's power allocation was maxed out. Building new infrastructure was cost-prohibitive and would take 18+ months.",
    solution: "LightRail's energy-efficient photonic computing allowed Nexus to triple their compute capacity within their existing power envelope. The deployment was completed in just 6 weeks.",
    results: [
      { metric: "3x", label: "Compute Capacity" },
      { metric: "15%", label: "Lower Energy Bill" },
      { metric: "6 Weeks", label: "Deployment Time" },
      { metric: "ROI", label: "Under 12 Months" },
    ],
    quote: "The unit economics simply work. We've scaled our AI operations 3x while actually reducing our energy bill. That's unprecedented.",
    quotePerson: "James Park, Director of Engineering",
    tags: ["Cloud Scale", "Unit Economics", "Rapid Deployment"],
  },
];

export default function CaseStudies() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Case Studies | LightRail AI - Photonic Computing Success Stories</title>
        <meta 
          name="description" 
          content="Discover how leading companies achieved 60% cost reduction and 100x energy efficiency with LightRail AI's photonic computing infrastructure. Read our customer success stories." 
        />
        <meta name="keywords" content="photonic computing case studies, AI infrastructure success stories, energy efficient data centers, sustainable AI" />
        <link rel="canonical" href="https://lightrail.ai/case-studies" />
        <meta property="og:title" content="Case Studies | LightRail AI - Photonic Computing Success Stories" />
        <meta property="og:description" content="Discover how leading companies achieved 60% cost reduction and 100x energy efficiency with LightRail AI's photonic computing infrastructure." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://lightrail.ai/case-studies" />
      </Helmet>

      <Navigation onGetStarted={() => setContactOpen(true)} />
      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />

      <main className="min-h-screen bg-background pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              <BarChart3 className="h-3 w-3 mr-1" />
              Success Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Real Results from <span className="text-primary">Real Companies</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              See how industry leaders have transformed their AI infrastructure with LightRail's 
              photonic computing technology, achieving unprecedented efficiency and cost savings.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">60%</div>
                <div className="text-sm text-muted-foreground">Avg. Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">100x</div>
                <div className="text-sm text-muted-foreground">Energy Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">Zero</div>
                <div className="text-sm text-muted-foreground">Water Usage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">&lt;12mo</div>
                <div className="text-sm text-muted-foreground">Avg. ROI Period</div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid gap-12">
              {caseStudies.map((study, index) => (
                <Card key={study.id} className="overflow-hidden border-2 hover:border-primary/30 transition-colors">
                  <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                    {/* Content Side */}
                    <div className={`p-8 ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-14 w-14 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                          <img 
                            src={study.logo} 
                            alt={`${study.company} logo`} 
                            className="h-10 w-10 object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{study.company}</h3>
                          <p className="text-sm text-muted-foreground">{study.industry}</p>
                        </div>
                      </div>

                      <h2 className="text-2xl md:text-3xl font-bold mb-4">{study.headline}</h2>
                      <p className="text-muted-foreground mb-6">{study.summary}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {study.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>

                      <div className="space-y-4 mb-6">
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" /> The Challenge
                          </h4>
                          <p className="text-sm text-muted-foreground">{study.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4" /> Our Solution
                          </h4>
                          <p className="text-sm text-muted-foreground">{study.solution}</p>
                        </div>
                      </div>

                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4">
                        "{study.quote}"
                        <footer className="text-sm font-medium text-foreground mt-2 not-italic">
                          — {study.quotePerson}
                        </footer>
                      </blockquote>
                    </div>

                    {/* Results Side */}
                    <div className={`bg-muted/30 p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                      <h4 className="font-semibold text-lg mb-6 flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-primary" /> Key Results
                      </h4>
                      <div className="grid grid-cols-2 gap-6">
                        {study.results.map((result) => (
                          <div key={result.label} className="text-center p-4 bg-background rounded-lg border">
                            <div className="text-3xl font-bold text-primary mb-1">{result.metric}</div>
                            <div className="text-sm text-muted-foreground">{result.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-primary/5">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join industry leaders who have transformed their AI infrastructure with 
              LightRail's photonic computing technology.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" onClick={() => setContactOpen(true)}>
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link to="/benchmark">
                <Button size="lg" variant="outline">
                  View Benchmarks
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
