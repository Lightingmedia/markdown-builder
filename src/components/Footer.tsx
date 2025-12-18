import { Link } from "react-router-dom";
import { Cpu, Linkedin, Twitter, Github, Mail, MapPin } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Benchmark", href: "/benchmark" },
    { label: "Pricing", href: "/pricing" },
    { label: "Customer Portal", href: "/monitor" },
  ],
  company: [
    { label: "About Us", href: "/#about" },
    { label: "Careers", href: "/#careers" },
    { label: "Contact", href: "/#contact" },
  ],
  resources: [
    { label: "Documentation", href: "/#docs" },
    { label: "API Reference", href: "/#api" },
    { label: "Blog", href: "/#blog" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com/lightrailai", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/lightrailai", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/lightrailai", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Cpu className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-primary">LightRail AI</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 max-w-xs">
              Next-generation photonic computing infrastructure delivering 100x energy efficiency for AI workloads.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:contact@lightrail.ai" className="hover:text-primary transition-colors">
                  contact@lightrail.ai
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LightRail AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/#privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/#terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
