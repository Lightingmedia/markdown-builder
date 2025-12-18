import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cpu, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onGetStarted: () => void;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/monitor", label: "Portal" },
  { href: "/benchmark", label: "Benchmark" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navigation({ onGetStarted }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Cpu className="h-7 w-7 text-primary" aria-hidden="true" />
          <span className="text-xl font-bold text-primary">LightRail AI</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm transition-colors",
                isActive(link.href)
                  ? "text-primary font-medium"
                  : "hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/monitor/auth">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Button size="sm" onClick={onGetStarted}>
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "py-3 px-4 rounded-md text-sm transition-colors",
                  isActive(link.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
              <Link to="/monitor/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Button className="w-full" onClick={() => { onGetStarted(); setMobileMenuOpen(false); }}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
