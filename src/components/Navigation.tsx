import { Link, useLocation } from "react-router-dom";
import { Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationProps {
  onGetStarted: () => void;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/monitor", label: "Portal" },
  { href: "/benchmark", label: "Benchmark" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navigation({ onGetStarted }: NavigationProps) {
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
        
        <div className="flex items-center gap-3">
          <Link to="/monitor/auth">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Button size="sm" onClick={onGetStarted}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}
