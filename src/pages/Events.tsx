import { ExternalLink, Instagram, Linkedin } from "lucide-react";

const REGISTER_URL = "https://luma.com/rtlnnxg4";

export default function Events() {
  return (
    <main style={{ paddingTop: "4rem" }} className="bg-background">
      <iframe
        src="https://lightrail-visionary-glow.lovable.app"
        style={{ width: "100%", height: "calc(100vh - 4rem)", border: 0, display: "block" }}
        title="LightRail AI Event"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-forms"
      />
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4">
          <p className="text-muted-foreground">Follow LightRail AI</p>
          <div className="flex gap-4">
            <a
              href="https://www.linkedin.com/company/110890668/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-foreground hover:border-primary hover:text-primary"
            >
              <Linkedin className="h-5 w-5" /> LinkedIn
            </a>
            <a
              href="https://www.instagram.com/lightrail.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-foreground hover:border-primary hover:text-primary"
            >
              <Instagram className="h-5 w-5" /> Instagram
            </a>
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:opacity-90"
            >
              Register on Luma <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
