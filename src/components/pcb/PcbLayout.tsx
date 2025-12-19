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
  CircuitBoard,
  FolderOpen,
  Layers,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Home,
  GitBranch,
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "sonner";

const menuItems = [
  { title: "Projects", icon: FolderOpen, path: "/pcb-copilot" },
  { title: "Design Canvas", icon: Layers, path: "/pcb-copilot/design" },
  { title: "Versions", icon: GitBranch, path: "/pcb-copilot/versions" },
  { title: "AI Copilot", icon: MessageSquare, path: "/pcb-copilot/chat" },
  { title: "Settings", icon: Settings, path: "/pcb-copilot/settings" },
];

export default function PcbLayout() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }
      return data === true;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/monitor/auth");
        return;
      }
      
      const adminStatus = await checkAdminStatus(session.user.id);
      setIsAdmin(adminStatus);
      setLoading(false);
      
      if (!adminStatus) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/monitor");
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/monitor/auth");
        return;
      }
      
      const adminStatus = await checkAdminStatus(session.user.id);
      setIsAdmin(adminStatus);
      setLoading(false);
      
      if (!adminStatus) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/monitor");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/monitor/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 border-b border-border">
            <Link to="/monitor" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <CircuitBoard className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-xl font-bold">PCB Copilot</span>
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
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/pcb-copilot/settings")}>
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
              {menuItems.find((item) => item.path === location.pathname)?.title || "PCB EDA Copilot"}
            </h1>
            <span className="ml-auto text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
              Admin Only
            </span>
          </header>
          <div className="flex-1 p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
