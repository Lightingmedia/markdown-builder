import { useEffect } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  MapPin,
  Calendar,
  Clock,
  Mic,
  Zap,
  Network,
  Cpu,
  Leaf,
  Eye,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const REGISTER_URL = "https://luma.com/rtlnnxg4";
const WEBSITE_URL = "https://lightrailabs.ai";
const LINKEDIN_URL = "https://www.linkedin.com/company/lightrail-ai";
const INSTAGRAM_URL = "https://www.instagram.com/lightrail.ai/";

const launchStructuredData = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Photonic Computing — LightRail AI Pre-Launch Event",
  description:
    "Unveiling a faster, cooler, more energy-efficient AI datacenter infrastructure. Friday, October 2, 2026 · 101 Broadway, Oakland, CA · 5:00–8:00 PM PDT.",
  startDate: "2026-10-02T17:00:00-07:00",
  endDate: "2026-10-02T20:00:00-07:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "101 Broadway",
    address: {
      "@type": "PostalAddress",
      streetAddress: "101 Broadway",
      addressLocality: "Oakland",
      addressRegion: "CA",
      postalCode: "94607",
      addressCountry: "US",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "LightRail AI",
    url: "https://lightrailabs.ai",
  },
  performer: {
    "@type": "Person",
    name: "Bola Olatunji",
  },
};

const DETAILS = [
  {
    icon: MapPin,
    label: "Location",
    value: "101 Broadway",
    sub: "Oakland, CA 94607",
  },
  {
    icon: Calendar,
    label: "Date",
    value: "Friday, October 2, 2026",
    sub: "Following Oakland Tech Week",
  },
  {
    icon: Clock,
    label: "Time",
    value: "5:00 PM – 8:00 PM PDT",
    sub: "Keynote · Panel · Live demos · Q&A",
  },
  {
    icon: Mic,
    label: "Host",
    value: "Kyle Valiton",
    sub: "of Informal Spaces",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Introducing LightRail AI",
    text: "A full-stack photonic computing architecture — from hardware primitives to fabric-scale software orchestration.",
  },
  {
    icon: Network,
    title: "AI-Native Optical Interconnect",
    text: "Replacing copper with light: Gen3 NCE modular architecture, detachable fiber arrays and high-density optical routing.",
  },
  {
    icon: Cpu,
    title: "Hyper Performance Computing",
    text: "Co-packaged optics and Thin-Film Lithium Niobate modulators pushing bandwidth past the electrical I/O wall.",
  },
  {
    icon: Leaf,
    title: "Energy-Efficient Datacenter",
    text: "Move data with photons, not electrons — slashing thermal load, power draw and the grid stress of AI at scale.",
  },
  {
    icon: Eye,
    title: "Fabric OS (LightOS) Observability",
    text: "Live telemetry into routing, scheduling, latency and projected energy efficiency across the fabric.",
  },
  {
    icon: Mic,
    title: "Keynote: The Light Age of Compute",
    text: "Founder & CEO Bola Olatunji on why the industry must rethink how data moves — followed by panel and audience Q&A.",
  },
];

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function LaunchEvent() {
  useScrollReveal();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <SEO
        title="Photonic Computing — LightRail AI Pre-Launch Event | Oakland, Oct 2 2026"
        description="Join LightRail AI in Oakland on Friday, October 2, 2026 for Photonic Computing: unveiling a faster, cooler, more energy-efficient AI datacenter infrastructure. 5–8 PM PDT at 101 Broadway."
        canonical="/launch"
        type="website"
        structuredData={launchStructuredData}
      />

      <AnimatedBackground />

      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center" aria-label="LightRail AI website">
            <span className="font-sans text-lg font-bold tracking-tight text-primary">
              LightRail<span className="text-foreground"> AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
            <a href="#details" className="transition-colors hover:text-primary">Details</a>
            <a href="#discover" className="transition-colors hover:text-primary">Discover</a>
            <a href="#about" className="transition-colors hover:text-primary">About</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/60 hover:text-primary sm:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              lightrailabs.ai
            </Link>
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-bold text-background shadow-[0_0_28px_rgba(29,201,168,0.4)] transition-transform hover:scale-[1.04] active:scale-95 sm:px-5"
            >
              Register
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </header>

      <main>
        <Hero />
        <EventDetails />
        <Discover />
        <About />
      </main>

      <Footer />
    </div>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="reveal reveal-visible mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary backdrop-blur-sm sm:text-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
          </span>
          Pre-Launch Event · Following Oakland Tech Week
        </p>

        <h1 className="font-sans text-[3.4rem] font-extrabold uppercase leading-[0.92] tracking-tight sm:text-8xl lg:text-9xl">
          <span className="block text-foreground drop-shadow-[0_0_28px_rgba(29,201,168,0.35)]">
            Photonic
          </span>
          <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-[0_0_36px_rgba(6,182,212,0.35)]">
            Computing
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-foreground/90 sm:text-2xl">
          Unveiling a faster, cooler, more energy-efficient AI datacenter
          infrastructure.
        </p>

        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          LightRail AI replaces key electrical copper interconnects with light —
          moving data faster, cutting thermal load and unlocking the full
          utilization of expensive AI compute.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-4 text-base font-bold text-background shadow-[0_0_32px_rgba(29,201,168,0.35)] transition-transform hover:scale-[1.04] active:scale-95 sm:w-auto"
          >
            Register Now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary/50 bg-primary/5 px-8 py-4 text-base font-semibold text-primary backdrop-blur-sm transition-all hover:border-primary hover:bg-primary/15 sm:w-auto"
          >
            Learn More
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium sm:gap-3 sm:text-sm">
          <HeroChip icon={<MapPin className="h-4 w-4" />} text="101 Broadway, Oakland, CA 94607" />
          <HeroChip icon={<Calendar className="h-4 w-4" />} text="Friday, October 2, 2026" />
          <HeroChip icon={<Clock className="h-4 w-4" />} text="5:00 PM – 8:00 PM PDT" />
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Hosted by <span className="font-semibold text-secondary">Kyle Valiton</span> of{" "}
          <span className="font-semibold text-foreground">Informal Spaces</span>
        </p>
      </div>
    </section>
  );
}

function HeroChip(props: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-foreground/90 backdrop-blur-md">
      <span className="text-secondary">{props.icon}</span>
      {props.text}
    </span>
  );
}

/* ---------- event details ---------- */

function EventDetails() {
  return (
    <section id="details" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading kicker="When & Where" title="Event Details" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DETAILS.map((d) => (
            <div
              key={d.label}
              className="reveal group rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_0_32px_rgba(29,201,168,0.25)]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/15 p-3 text-primary transition-transform duration-300 group-hover:scale-110">
                <d.icon className="h-7 w-7" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {d.label}
              </p>
              <p className="mt-2 font-sans text-2xl font-bold leading-tight text-foreground">
                {d.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{d.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- what you'll discover ---------- */

function Discover() {
  return (
    <section id="discover" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Technology Showcase"
          title="What You'll Discover"
          sub="Live demonstrations and technical walkthroughs of LightRail AI's architecture."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="reveal group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-secondary/50 hover:shadow-[0_0_32px_rgba(6,182,212,0.25)]"
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-secondary/15" />
              <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-primary/20 to-secondary/15 p-3.5 text-primary transition-all duration-300 group-hover:scale-110 group-hover:text-secondary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-sans text-2xl font-bold text-foreground">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- about ---------- */

function About() {
  return (
    <section id="about" className="relative scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="reveal">
          <SectionHeading
            align="left"
            kicker="About This Event"
            title="The AI Infrastructure Crisis Is a Physical Wall"
          />
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              As AI models and infrastructure scale, datacenters are hitting hard
              limits: power availability, cooling, data movement and GPU
              efficiency. Today, 50–70% of GPUs sit idle waiting for data —
              compute utilization stuck at 30–50%.
            </p>
            <p>
              LightRail AI is developing a full-stack photonic computing
              architecture that combines optical interconnect technologies with
              software orchestration through its Fabric OS platform — using
              light to create a more efficient foundation for the next
              generation of AI systems.
            </p>
            <p>
              Joining leaders across AI, datacenter infrastructure,
              semiconductors, photonics, energy and investment. Attendance is
              curated and space is limited.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-sm font-bold text-background transition-transform hover:scale-[1.04] active:scale-95"
            >
              Register Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary/50 px-7 py-3.5 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/10"
            >
              Visit lightrailabs.ai
            </Link>
          </div>
        </div>

        <div className="reveal relative">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/25 via-transparent to-secondary/25 blur-2xl" />
          <figure className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-[0_0_32px_rgba(29,201,168,0.3)]">
            <img
              src="/LightRail_form_factor.png"
              alt="LightRail AI photonic computing form factor"
              className="w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              loading="lazy"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent px-5 pb-4 pt-10 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              LightRail AI // Unveiling the Future of Compute
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer className="relative border-t border-border/60 bg-background/80 px-4 pb-10 pt-16 backdrop-blur-sm sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
          <div className="max-w-sm">
            <span className="font-sans text-xl font-bold tracking-tight text-primary">
              LightRail<span className="text-foreground"> AI</span>
            </span>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Building photonic computing infrastructure for a faster, cooler and
              more energy-efficient generation of AI.
            </p>
            <p className="mt-3 font-sans text-lg font-bold uppercase tracking-wide text-secondary">
              Own the Light Age of Compute.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Connect
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <FooterLink href={WEBSITE_URL}>lightrailabs.ai</FooterLink>
                <FooterLink href={LINKEDIN_URL}>LinkedIn</FooterLink>
                <FooterLink href={INSTAGRAM_URL}>Instagram</FooterLink>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                On this page
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <FooterLink href="#details">Event details</FooterLink>
                <FooterLink href="#discover">What you'll discover</FooterLink>
                <FooterLink href="#about">About</FooterLink>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 lg:items-end">
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-7 py-3.5 text-sm font-bold text-background transition-transform hover:scale-[1.04] active:scale-95"
            >
              Register Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary/60 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to lightrailabs.ai
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 LightRail AI · Photonic Computing: Unveiling Next-Gen AI Infrastructure</p>
          <p>
            Hosted with <span className="font-medium text-foreground/80">Informal Spaces</span> ·
            Curating technology gatherings across the Bay Area
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink(props: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={props.href}
        target={props.href.startsWith("http") ? "_blank" : undefined}
        rel={props.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="text-muted-foreground transition-colors hover:text-primary"
      >
        {props.children}
      </a>
    </li>
  );
}

/* ---------- shared ---------- */

function SectionHeading(props: {
  kicker: string;
  title: string;
  sub?: string;
  align?: "center" | "left";
}) {
  const align = props.align ?? "center";
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-secondary">{props.kicker}</p>
      <h2 className="mt-3 font-sans text-4xl font-extrabold uppercase tracking-tight text-foreground sm:text-5xl">
        {props.title}
      </h2>
      <div
        className={
          "mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-secondary " +
          (align === "center" ? "mx-auto" : "")
        }
      />
      {props.sub && (
        <p
          className={
            "mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base " +
            (align === "center" ? "mx-auto" : "")
          }
        >
          {props.sub}
        </p>
      )}
    </div>
  );
}
