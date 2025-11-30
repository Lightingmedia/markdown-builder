import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ArrowRight, Zap, TrendingDown, Gauge, Activity, Cpu, Server, Layers, Thermometer, CheckCircle2, Users, Download, Calendar, Cloud } from "lucide-react";
import heroChipset from "@/assets/hero-chipset.jpg";
import serverRack from "@/assets/server-rack.jpg";
import chipsetCrossSection from "@/assets/chipset-cross-section.jpg";
import dataCenter from "@/assets/data-center.jpg";
import logo from "@/assets/lightrail-logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <img src={logo} alt="LightRail AI Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-primary">LightRail AI</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroChipset} 
            alt="Silicon photonic chipset with glowing light paths" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-32 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            Next-Generation Infrastructure
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Photonic Computing
            <br />
            <span className="text-primary">Infrastructure for AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Traditional AI data centers consume massive amounts of electricity and water for cooling—
            a single ChatGPT query uses enough energy to power a home for hours and requires bottles of water. 
            <span className="block mt-4 text-primary font-semibold">
              Our photonic computing eliminates these issues with 100x energy efficiency and zero water usage.
            </span>
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="group">
              Explore Solutions
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              Request Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Key Statistics Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, stat: "2-3x", label: "Performance per Watt" },
            { icon: TrendingDown, stat: "60%", label: "CO₂ Reduction" },
            { icon: Gauge, stat: "40%", label: "Lower Power per Token" },
            { icon: Activity, stat: "85%", label: "System Utilization" },
          ].map((item, i) => (
            <Card key={i} className="group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="pt-6">
                <item.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <div className="text-4xl font-bold mb-2 text-primary">{item.stat}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Chipset Technology Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Silicon Photonic Chipset Architecture
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Breakthrough integration of photonic technology with traditional silicon processing
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src={chipsetCrossSection} 
                alt="Detailed cross-section of silicon photonic chipset architecture" 
                className="w-full rounded-lg shadow-2xl shadow-primary/10"
              />
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Cpu,
                  title: "Photonic Linear Algebra Engine",
                  description: "Hardware-accelerated matrix operations using light, delivering unprecedented computational efficiency for AI workloads."
                },
                {
                  icon: Layers,
                  title: "Integrated Photonic Mesh",
                  description: "Revolutionary interconnect technology reducing latency and power consumption while increasing bandwidth by orders of magnitude."
                },
                {
                  icon: Thermometer,
                  title: "Thermal Efficient Design",
                  description: "Optical signal processing generates minimal heat compared to electronic alternatives, dramatically reducing cooling requirements."
                }
              ].map((feature, i) => (
                <Card key={i} className="group hover:shadow-md hover:shadow-secondary/20 transition-all duration-300 border-l-4 border-l-primary hover:border-l-secondary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <feature.icon className="h-6 w-6 text-primary group-hover:text-secondary transition-colors" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Server Rack Solution Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Full-Stack <span className="text-primary">TPU Server Racks</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete infrastructure solution from edge to hyperscale
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              {[
                {
                  title: "Compact Rack",
                  subtitle: "For edge deployment",
                  specs: "2U Form Factor • 100 TFLOPS • 1.2kW Power"
                },
                {
                  title: "Standard Rack",
                  subtitle: "For enterprise data centers",
                  specs: "42U Standard • 2.1 PFLOPS • 35kW Power"
                },
                {
                  title: "Cluster Configuration",
                  subtitle: "For hyperscale operations",
                  specs: "Multi-Rack • 10+ PFLOPS • Modular Scaling"
                }
              ].map((config, i) => (
                <Card key={i} className="group hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300 border-2 hover:border-secondary/50">
                  <CardHeader>
                    <CardTitle className="text-2xl">{config.title}</CardTitle>
                    <CardDescription className="text-base">{config.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-mono text-muted-foreground">{config.specs}</p>
                    <Button variant="link" className="mt-2 p-0 h-auto text-primary">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="relative order-1 lg:order-2">
              <img 
                src={serverRack} 
                alt="Full-stack TPU server rack with photonic interconnects" 
                className="w-full rounded-lg shadow-2xl shadow-secondary/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Performance Comparison Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              LightRail vs Traditional GPU Infrastructure
            </h2>
            <p className="text-xl text-muted-foreground">
              Quantifiable advantages across critical metrics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { metric: "Power Consumption", improvement: "60% Lower", icon: Zap },
              { metric: "Thermal Output", improvement: "70% Reduction", icon: Thermometer },
              { metric: "Performance/Watt", improvement: "3x Better", icon: Gauge },
              { metric: "Scalability", improvement: "Linear Scaling", icon: TrendingDown },
              { metric: "Cost per TFLOP", improvement: "45% Lower", icon: Activity },
              { metric: "Latency", improvement: "50% Faster", icon: Cpu },
            ].map((item, i) => (
              <Card key={i} className="text-center hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <CardContent className="pt-6">
                  <item.icon className="h-10 w-10 text-primary mx-auto mb-3" />
                  <div className="font-semibold text-lg mb-1">{item.metric}</div>
                  <div className="text-2xl font-bold text-primary">{item.improvement}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powering the Future of <span className="text-primary">AI</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Deployed across industries and applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Large Language Models",
                description: "Training and inference at unprecedented efficiency",
                icon: Cpu
              },
              {
                title: "Data Center Optimization",
                description: "Upgrade existing infrastructure with photonic acceleration",
                icon: Server
              },
              {
                title: "Edge AI Deployment",
                description: "Distributed computing with minimal power footprint",
                icon: Activity
              },
              {
                title: "Climate-Conscious Computing",
                description: "Sustainable AI infrastructure for the future",
                icon: TrendingDown
              }
            ].map((useCase, i) => (
              <Card key={i} className="group hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/50">
                <CardHeader>
                  <useCase.icon className="h-12 w-12 text-secondary mb-2 group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-3">{useCase.description}</CardDescription>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Go-To-Market Timeline
            </h2>
            <p className="text-xl text-muted-foreground">
              Phased deployment strategy for enterprise adoption
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {[
              {
                year: "2025",
                title: "Fabric OS & Compiler",
                description: "Software-first approach enabling integration with existing GPU infrastructure"
              },
              {
                year: "2026",
                title: "Photonic Interposer Blades",
                description: "Hardware launch with drop-in compatible accelerator modules"
              },
              {
                year: "2027",
                title: "Full TPU Server Production",
                description: "Complete rack-scale systems for hyperscale deployments"
              }
            ].map((phase, i) => (
              <Card key={i} className="relative group hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
                <div className="absolute -top-4 left-6">
                  <Badge variant="default" className="text-lg px-4 py-1">
                    {phase.year}
                  </Badge>
                </div>
                <CardHeader className="pt-8">
                  <CardTitle className="text-xl">{phase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{phase.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose LightRail Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-primary">LightRail AI</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              "Mathematical optimization foundation",
              "Proven photonic technology",
              "Enterprise-grade reliability",
              "Sustainability commitment",
              "Expert support team",
              "Seamless integration"
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-6 rounded-lg border-2 border-border hover:border-primary/50 transition-colors">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-lg">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Flexible Deployment Options
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the solution that fits your infrastructure needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Software License",
                subtitle: "Fabric OS & Compiler",
                price: "Custom",
                features: [
                  "Fabric OS platform",
                  "Compiler toolchain",
                  "Integration support",
                  "Quarterly updates"
                ]
              },
              {
                title: "Blade Solution",
                subtitle: "Interposer + Accelerators",
                price: "Contact Sales",
                features: [
                  "All software features",
                  "Photonic interposer blades",
                  "Installation support",
                  "Priority support",
                  "Performance optimization"
                ],
                featured: true
              },
              {
                title: "Full System",
                subtitle: "Complete TPU Servers",
                price: "Enterprise",
                features: [
                  "Complete solution",
                  "Full rack systems",
                  "Dedicated support team",
                  "Custom configurations",
                  "On-site training"
                ]
              }
            ].map((tier, i) => (
              <Card key={i} className={`${tier.featured ? 'border-primary border-4 shadow-xl shadow-primary/20 scale-105' : 'border-2'} transition-all duration-300`}>
                {tier.featured && (
                  <div className="bg-primary text-primary-foreground text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.title}</CardTitle>
                  <CardDescription className="text-base">{tier.subtitle}</CardDescription>
                  <div className="text-3xl font-bold mt-4">{tier.price}</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  <Button className="w-full mt-6" variant={tier.featured ? "default" : "outline"}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "How does photonic computing differ from traditional GPUs?",
                a: "Photonic computing uses light instead of electricity for data transmission and processing, resulting in dramatically lower power consumption, reduced heat generation, and higher bandwidth capabilities. Our silicon photonic chipsets integrate seamlessly with existing infrastructure while delivering 2-3x better performance per watt."
              },
              {
                q: "What is the typical deployment timeline?",
                a: "Deployment varies by solution tier. Software licenses can be deployed in weeks, blade solutions typically require 2-3 months including integration, and full rack systems are deployed over 3-6 months depending on configuration and site requirements."
              },
              {
                q: "Is LightRail compatible with existing AI frameworks?",
                a: "Yes, our Fabric OS and compiler support standard ML frameworks including TensorFlow, PyTorch, and JAX. We provide seamless integration with existing GPU workflows, allowing gradual migration to photonic acceleration."
              },
              {
                q: "What kind of sustainability benefits can we expect?",
                a: "LightRail systems deliver up to 60% CO₂ reduction compared to traditional GPU clusters through reduced power consumption and cooling requirements. This translates to significant operational cost savings and progress toward sustainability goals."
              },
              {
                q: "What support and maintenance is included?",
                a: "All tiers include our standard support package with quarterly software updates. Enterprise customers receive dedicated support teams, custom configurations, and on-site training. We offer 24/7 critical support for production deployments."
              }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-2 border-border rounded-lg px-6">
                <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={dataCenter} alt="Data center infrastructure" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your AI Infrastructure?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join leading organizations leveraging photonic computing for next-generation AI workloads
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="text-lg">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Demo
              </Button>
              <Button size="lg" variant="outline" className="text-lg">
                <Download className="mr-2 h-5 w-5" />
                Download Whitepaper
              </Button>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Stay Updated</CardTitle>
                <CardDescription>Get the latest news on photonic computing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input type="email" placeholder="Enter your email" />
                  <Button>Subscribe</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t-2 border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-xl mb-4 text-primary">LightRail AI</h3>
              <p className="text-sm text-muted-foreground">
                Next-generation photonic computing infrastructure for AI workloads.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Chipsets</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Server Racks</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Fabric OS</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Compiler</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Whitepapers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 LightRail AI. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Users className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Cloud className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Activity className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
