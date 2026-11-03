import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Zap, Gauge, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import ContactFormDialog from "@/components/ContactFormDialog";
import BackToTop from "@/components/BackToTop";
import PhotonicShowcase from "@/components/home/PhotonicShowcase";
import blade from "@/assets/LightRail_form_factor.png";
import campus from "@/assets/data-center.jpg";
import logo from "@/assets/lightrail-logo.png";

const navLinks = [
  { href: "/case-studies", label: "Case Studies" },
  { href: "/launch", label: "Launch Event" },
  { href: "/monitor", label: "Portal" },
  { href: "/benchmark", label: "Benchmark" },
  { href: "/pricing", label: "Pricing" },
  { href: "/llm-tools", label: "LLM Dev Tools" },
  { href: "/events", label: "Events" },
];

const mono = "font-mono text-[10px] uppercase tracking-[0.2em]";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LightRail AI",
  url: "https://lightrailabs.ai",
  email: "hello@lightrailabs.ai",
};

const Index = () => {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const contact = () => setOpen(true);

  const campusSection = (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className={`${mono} text-primary mb-4 flex items-center gap-2`}><span className="h-2 w-2 bg-primary" />Campus Validation & High-Density Deployment</div>
        <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">Facility A-01: 120MW Photonic Campus</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mb-10">
          Purpose-built hyperscale facility running production optical clusters. Zero electrical interconnect bottlenecks delivering unprecedented MW-to-FLOPS density.
        </p>
        <div className="relative border border-border/60 overflow-hidden">
          <img src={campus} alt="LightRail AI photonic campus" className="w-full h-[420px] object-cover opacity-60" loading="lazy" />
          <div className={`absolute top-4 right-4 ${mono} border border-primary/60 bg-background/80 px-3 py-1 text-primary`}>LightRail Hyperscale North Campus // PH-1</div>
          <div className="absolute inset-x-0 bottom-0 grid md:grid-cols-3 gap-4 p-4">
            {[
              { icon: Zap, tag: "Co-located Power", v: "120 MW", t: "Dedicated on-site optical substations feeding high-density modular data halls." },
              { icon: Gauge, tag: "Cooling Efficiency", v: "PUE 1.08", t: "Direct photonic die liquid cooling minimising chiller pump parasitic overhead." },
              { icon: Activity, tag: "Multi-Hall Latency", v: "< 0.8 µs", t: "Rack-to-rack optical link delays equivalent to single-motherboard PCIe distances." },
            ].map((c) => (
              <div key={c.tag} className="bg-background/85 backdrop-blur border border-border/60 p-5">
                <div className="flex justify-between mb-2"><span className={`${mono} text-muted-foreground`}>{c.tag}</span><c.icon className="h-4 w-4 text-primary" /></div>
                <div className="text-3xl font-bold text-primary mb-2">{c.v}</div>
                <p className="text-sm text-muted-foreground">{c.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="LightRail AI | AI workload placement and interconnect efficiency"
        description="Fabric OS runs on GPU clusters you already have. It intercepts All-Reduce and reroutes it across the cluster fabric. Efficiency is measured per cluster during the pilot."
        canonical="/"
        structuredData={structuredData}
      />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="LightRail AI" className="h-7" />
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} to={l.href} className={`${mono} text-muted-foreground hover:text-primary transition-colors`}>{l.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className={`hidden md:flex items-center gap-2 ${mono} text-muted-foreground`}><span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />Sys Online</span>
            <Button size="sm" className={mono} onClick={contact}>Request Specs</Button>
            <button className="lg:hidden" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {menu && (
          <nav className="lg:hidden border-t border-border/60 px-4 py-3 flex flex-col gap-3 bg-background">
            {navLinks.map((l) => (
              <Link key={l.href} to={l.href} onClick={() => setMenu(false)} className={`${mono} text-muted-foreground`}>{l.label}</Link>
            ))}
          </nav>
        )}
      </header>

      {/* Hero */}
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className={`inline-flex items-center gap-2 ${mono} border border-primary/50 text-primary px-3 py-1 mb-8`}>
            <span className="h-1.5 w-1.5 bg-primary" />Silicon Photonics Architecture Live // Rev 3.1
          </div>
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 items-end mb-12">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.95] mb-6">
                Photonic-speed AI compute built for <span className="text-primary">next-gen models</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Fabric OS runs on GPU clusters you already have. It intercepts All-Reduce and reroutes it across the cluster fabric. Efficiency is measured per cluster during the pilot.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button size="lg" className={mono} onClick={contact}>Explore Architecture →</Button>
              <Button size="lg" variant="outline" className={mono} asChild><Link to="/benchmark">View Benchmarks</Link></Button>
            </div>
          </div>

          <div className="relative border border-border/60 bg-card/40 overflow-hidden">
            <div className="absolute top-4 left-4 z-10 bg-background/85 border border-border/60 p-4 max-w-xs">
              <div className={`${mono} text-muted-foreground mb-1`}>LR1 Reticle // X-003 <span className="text-primary ml-2">● Online</span></div>
              <div className="font-bold">Coherent Optical Blade</div>
              <div className={`${mono} text-muted-foreground mt-1`}>3D monolithic transceiver array bonded to compute cores</div>
            </div>
            <img src={blade} alt="LightRail AI coherent optical blade" className="w-full h-[520px] object-contain px-8 pb-8 pt-36 md:pt-8 md:pl-80" />
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-border/60">
              {[
                ["Node Bandwidth", "12.8", "Tbps Full Duplex"],
                ["Thermal Flux", "-75%", "vs Copper Base"],
                ["Optical Link", "ACTIVE", "0.1µs Latency"],
                ["Fabric Integrity", "99.999%", "BER < 10⁻¹⁵"],
              ].map(([t, v, s]) => (
                <div key={t} className="p-5 border-r border-border/60 last:border-r-0">
                  <div className={`${mono} text-muted-foreground mb-2`}>{t}</div>
                  <div className="text-3xl font-bold text-primary">{v}</div>
                  <div className={`${mono} text-muted-foreground mt-1`}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PhotonicShowcase onContact={contact} middle={campusSection} />

      {/* Footer */}
      <footer className="border-t border-border/60 py-14">
        <div className="container mx-auto px-4 grid md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <img src={logo} alt="LightRail AI" className="h-7 mb-4" />
            <p className="text-sm text-muted-foreground mb-3">High-throughput electro-photonic neural accelerators and silicon-substrate optical interconnect fabrics.</p>
            <a href="mailto:hello@lightrailabs.ai" className="text-sm text-primary">hello@lightrailabs.ai</a>
            <p className="text-sm text-muted-foreground mt-2">LightRail AI Labs, pre-seed, raising $15M.</p>
          </div>
          {[
            ["Product", [["Pricing", "/pricing"], ["Benchmark", "/benchmark"], ["LLM Dev Tools", "/llm-tools"]]],
            ["Company", [["Case Studies", "/case-studies"], ["Launch Event", "/launch"], ["Events", "/events"]]],
            ["Platform", [["Portal", "/monitor"]]],
            ["Connect", [["LinkedIn", "https://www.linkedin.com/company/110890668"], ["Instagram", "https://www.instagram.com/lightrail.ai/"]]],
          ].map(([h, items]) => (
            <div key={h as string}>
              <div className={`${mono} text-primary mb-4`}>{h as string}</div>
              <ul className="space-y-2">
                {(items as string[][]).map(([l, href]) => (
                  <li key={l}>
                    {href.startsWith("http") ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">{l}</a>
                    ) : (
                      <Link to={href} className="text-sm text-muted-foreground hover:text-primary">{l}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`container mx-auto px-4 mt-10 pt-6 border-t border-border/60 flex flex-wrap justify-between gap-2 ${mono} text-muted-foreground`}>
          <span>Photonic Cluster 0.4 // Latency: 0.1µs/hop</span>
          <span>© 2026 LightRail AI Labs. All rights reserved.</span>
        </div>
      </footer>

      <ContactFormDialog open={open} onOpenChange={setOpen} />
      <BackToTop />
    </div>
  );
};

export default Index;
