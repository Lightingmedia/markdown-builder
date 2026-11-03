import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Gauge, Network, Thermometer, Download, Layers, Cpu, Code2, Droplets } from "lucide-react";

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary mb-4">
    <span className="h-2 w-2 bg-primary" />
    {children}
  </div>
);

const metrics = [
  { tag: "01 // Interconnect Speed", value: "1.6", unit: "Tbps", text: "Sub-nanosecond on-chip optical routing with near-zero electrical-domain attenuation." },
  { tag: "02 // Power Efficiency", value: "10x", unit: "Reduction", text: "Energy consumption over copper traces via passive optical multiplexing." },
  { tag: "03 // Compute Throughput", value: "3.2", unit: "PFLOPS", text: "Direct photonic tensor processing matrix optimised for matrix GEMM operations." },
  { tag: "04 // Cluster Scalability", value: "1,024", unit: "Nodes", text: "Zero-loss coherent optical fabric spanning an entire cluster as a single virtual GPU." },
];

const modules = [
  { icon: Network, tag: "Module 01 // Interconnect", title: "Photonic Routing Engine", text: "Sub-5.3 picosecond routing eliminates copper resistance losses across wafer-scale reticles." },
  { icon: Layers, tag: "Module 02 // Packaging", title: "2.5D Heterogeneous Chiplet Stack", text: "Monolithic CMOS compute dies vertically bonded with optical transceivers and high-bandwidth SRAM." },
  { icon: Code2, tag: "Module 03 // Software", title: "RaySDK Compilation Fabric", text: "Direct PyTorch and JAX tensor compiler mapping computation graphs onto optical matrix topologies." },
  { icon: Droplets, tag: "Module 04 // Thermodynamics", title: "Microfluidic Die Thermal Dissipation", text: "Integrated silicon micro-channels with liquid cold-plates sustaining uniform die temperatures." },
];

const rows = [
  { metric: "Interconnect Latency", legacy: "28.4 µs (Electronic SerDes)", lr: "0.4 µs (Photonic Waveguide)", delta: "71x Faster" },
  { metric: "Bisection Bandwidth", legacy: "900 GB/s (Copper Mesh NVLink)", lr: "6.4 TB/s (Coherent Fiber Matrix)", delta: "7.1x Throughput" },
  { metric: "Thermal TDP per Blade", legacy: "700W TDP (Peak Thermal Draw)", lr: "140W TDP (Cold-Laser Core)", delta: "-79% Power" },
  { metric: "Scaling Bottleneck", legacy: "Parasitic Capacitance & Attenuation", lr: "Zero Dispersion Optical Routing", delta: "Linear O(1)" },
];

const PhotonicShowcase = ({ onContact, middle }: { onContact: () => void; middle?: React.ReactNode }) => {
  const [active, setActive] = useState(0);
  const [email, setEmail] = useState("");

  return (
    <>
      {/* Verified metrics */}
      <section className="py-20 border-y border-border/50 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between items-center mb-10 gap-2">
            <Label>Verified System Performance Metrics</Label>
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">Last Verified: Silicon Engineering Lab</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.tag} className="border border-border/60 bg-card/60 backdrop-blur p-6 hover:border-primary/60 transition-colors">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">{m.tag}</div>
                <div className="text-4xl font-bold mb-3">
                  {m.value} <span className="text-base text-primary uppercase">{m.unit}</span>
                </div>
                <p className="text-sm text-muted-foreground">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Substrate stack */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Label>Silicon-Level Architectural Modules</Label>
          <div className="grid lg:grid-cols-2 gap-6 mb-12 items-end">
            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight">The Photonic Substrate Stack</h2>
            <p className="text-lg text-muted-foreground">
              A full-stack convergence of electro-photonic packaging, low-power waveguides, and runtime compiler toolchains designed for transformer-scale workloads.
            </p>
          </div>
          <div className="grid lg:grid-cols-[2fr_3fr] gap-6">
            <div className="space-y-3">
              {modules.map((m, i) => (
                <button
                  key={m.title}
                  onClick={() => setActive(i)}
                  className={`w-full text-left p-5 border transition-all ${active === i ? "border-primary bg-primary/10 border-l-4" : "border-border/60 bg-card/40 hover:border-primary/40"}`}
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1">{m.tag}</div>
                  <div className="font-bold text-lg">{m.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{m.text}</p>
                </button>
              ))}
            </div>
            <div className="border border-border/60 bg-card/60 backdrop-blur p-6 flex flex-col">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
                <span className="text-primary">Diagnostic // Routing_Matrix_Beta</span>
                <span>Clock Synchronised</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Low-Latency Waveguide Network</h3>
                <span className="font-mono text-xs px-2 py-1 border border-primary text-primary">0.25 ps/mm</span>
              </div>
              <svg viewBox="0 0 400 160" className="w-full flex-1 min-h-[180px]">
                <line x1="20" y1="20" x2="20" y2="140" className="stroke-border" />
                <line x1="380" y1="20" x2="380" y2="140" className="stroke-border" />
                <path d="M20 50 C 120 50, 160 120, 220 100 S 320 40, 380 50" fill="none" className="stroke-secondary" strokeWidth="2.5" />
                <path d="M20 110 C 120 110, 160 40, 220 60 S 320 120, 380 110" fill="none" className="stroke-primary" strokeWidth="2.5" />
                <rect x="14" y="44" width="12" height="12" className="fill-secondary" />
                <rect x="14" y="104" width="12" height="12" className="fill-primary" />
                <circle cx="380" cy="50" r="5" className="fill-secondary" />
                <circle cx="380" cy="110" r="5" className="fill-primary" />
              </svg>
              <p className="text-sm text-muted-foreground mt-4">
                {modules[active].title}: {modules[active].text}
              </p>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest mt-6 pt-4 border-t border-border/50">
                <span className="text-muted-foreground">Channel Flux: 128 Channels per Reticle</span>
                <span className="text-primary">Status: Pass</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {middle}

      {/* Comparison */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <Label>Hardware Benchmark Audit</Label>
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-10">Legacy Silicon vs. LightRail AI</h2>
          <div className="overflow-x-auto border border-border/60">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-card/60">
                <tr>
                  <th className="text-left p-4">Performance Vector</th>
                  <th className="text-left p-4">Legacy Electronic GPU</th>
                  <th className="text-left p-4 text-primary">LightRail AI Photonic Blade</th>
                  <th className="text-right p-4">System Gain</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.metric} className="border-t border-border/50">
                    <td className="p-4 font-semibold">{r.metric}</td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{r.legacy}</td>
                    <td className="p-4 text-primary font-mono text-xs">{r.lr}</td>
                    <td className="p-4 text-right font-bold text-secondary">{r.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* White paper */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 border border-border/60 bg-card/40 p-8 md:p-12">
            <div>
              <Label>Engineering White Paper // Architecture Release</Label>
              <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">Silicon Photonics for 100T+ Parameter Transformers</h2>
              <p className="text-muted-foreground">
                Access the technical design blueprint detailing our electro-optical die routing, silicon packaging thermal tolerances, and compiler primitives.
              </p>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                onContact();
              }}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary">Enterprise Access Portal</div>
              <Input type="email" required placeholder="engineer@enterprise.ai" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Request White Paper
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default PhotonicShowcase;
