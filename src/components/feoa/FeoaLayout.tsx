import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Cpu,
  LayoutDashboard,
  FlaskConical,
  Link2,
  FileBarChart,
  Settings,
  LogOut,
  User,
  Home,
  Bell,
  TrendingUp,
  Building2,
  CircuitBoard,
  Server,
  Calculator,
  CalendarClock,
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/monitor" },
  { title: "Energy Lab", icon: FlaskConical, path: "/monitor/energy-lab" },
  { title: "Trend Analysis", icon: TrendingUp, path: "/monitor/trends" },
  { title: "Benchmark", icon: Building2, path: "/monitor/benchmark" },
  { title: "Optimization", icon: Server, path: "/monitor/optimization" },
  { title: "Simulation", icon: Calculator, path: "/monitor/simulation" },
  { title: "Job Scheduler", icon: CalendarClock, path: "/monitor/scheduler" },
  { title: "Connectivity", icon: Link2, path: "/monitor/connectivity" },
  { title: "Eco-Efficiency Reports", icon: FileBarChart, path: "/monitor/reports" },
  { title: "Notifications", icon: Bell, path: "/monitor/notifications" },
  { title: "Settings", icon: Settings, path: "/monitor/settings" },
];

export default function FeoaLayout() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (!error && data === true) {
        setIsAdmin(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/monitor/auth");
      } else {
        checkAdminStatus();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/monitor/auth");
      } else {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/monitor/auth");
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Cpu className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-xl font-bold">LightRail AI</span>
              <Home className="h-4 w-4 text-muted-foreground ml-auto" />
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    className="w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Admin-only PCB Copilot Link */}
            {isAdmin && (
              <>
                <Separator className="my-3" />
                <div className="px-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Admin Tools
                  </span>
                </div>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => navigate("/pcb-copilot")}
                      isActive={location.pathname.startsWith("/pcb-copilot")}
                      className="w-full"
                    >
                      <CircuitBoard className="h-4 w-4" />
                      <span>PCB Copilot</span>
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                        Admin
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </>
            )}
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/monitor/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center px-4 gap-4">
            <SidebarTrigger />
            <h1 className="font-semibold">
              {menuItems.find((item) => item.path === location.pathname)?.title || "LightRail"}
            </h1>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
