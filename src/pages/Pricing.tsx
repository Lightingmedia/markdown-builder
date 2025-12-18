import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Check, Building2, Cpu } from "lucide-react";
import { Link } from "react-router-dom";
import ContactFormDialog from "@/components/ContactFormDialog";
import SEO from "@/components/SEO";

const pricingStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "LightRail AI Energy Optimization Platform",
  "description": "Industrial IoT SaaS for facility energy optimization with AI-powered recommendations",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter",
      "price": "499",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31"
    },
    {
      "@type": "Offer", 
      "name": "Professional",
      "price": "1499",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31"
    }
  ]
};

const pricingPlans = [
  {
    name: "Starter",
    price: "$499",
    period: "/month",
    description: "Perfect for small facilities",
    features: [
      "Up to 5 telemetry endpoints",
      "7-day data retention",
      "Basic anomaly detection",
      "Email alerts",
      "Standard support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$1,499",
    period: "/month",
    description: "For growing enterprises",
    features: [
      "Up to 25 telemetry endpoints",
      "30-day data retention",
      "Advanced AI analysis",
      "Custom report builder",
      "Priority support",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale operations",
    features: [
      "Unlimited endpoints",
      "Unlimited data retention",
      "Custom AI models",
      "Dedicated account manager",
      "24/7 premium support",
      "On-premise deployment option",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing - Energy Optimization Plans"
        description="Flexible pricing plans for LightRail AI's facility energy optimization platform. From $499/month for startups to enterprise solutions with unlimited endpoints."
        canonical="/pricing"
        structuredData={pricingStructuredData}
      />
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
            <Link to="/benchmark" className="text-sm hover:text-primary transition-colors">Benchmark</Link>
            <Link to="/pricing" className="text-sm text-primary font-medium">Pricing</Link>
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
        <Badge variant="outline" className="mb-4">Transparent Pricing</Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Simple, Predictable <span className="text-primary">Pricing</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your facility's needs. All plans include our core energy optimization features.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => setContactOpen(true)}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "What's included in the free trial?",
                a: "The 14-day free trial includes full access to the Professional plan features with no credit card required.",
              },
              {
                q: "Can I change plans later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees for Starter and Professional plans. Enterprise plans may include implementation services.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, wire transfers, and can accommodate purchase orders for Enterprise customers.",
              },
            ].map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 container mx-auto px-4 text-center">
        <Card className="max-w-2xl mx-auto border-primary/30 bg-gradient-to-br from-card to-muted/50">
          <CardContent className="pt-8 pb-8">
            <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Ready to optimize your facility?</h3>
            <p className="text-muted-foreground mb-6">
              Start your free trial today and see up to 60% reduction in energy costs.
            </p>
            <Button size="lg" onClick={() => setContactOpen(true)}>
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      <ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
