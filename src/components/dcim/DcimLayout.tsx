import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard,
  Server,
  Activity,
  Bot,
  FileText,
  Settings,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  Zap,
  Thermometer,
  AlertCircle,
  TrendingUp,
  Network,
  Plug,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const observeItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dcim" },
  { title: "Inventory", icon: Server, path: "/dcim/inventory" },
  { title: "Telemetry", icon: Activity, path: "/dcim/telemetry" },
  { title: "Topology", icon: Network, path: "/dcim/topology" },
];

const agentItems = [
  { title: "Congestion Agent", icon: Zap, path: "/dcim/agents/congestion" },
  { title: "Thermal Agent", icon: Thermometer, path: "/dcim/agents/thermal" },
  { title: "Incident Copilot", icon: AlertCircle, path: "/dcim/agents/incident" },
  { title: "Capacity Planner", icon: TrendingUp, path: "/dcim/agents/capacity" },
];

const manageItems = [
  { title: "Adapters", icon: Plug, path: "/dcim/adapters" },
  { title: "Runbooks", icon: BookOpen, path: "/dcim/runbooks" },
  { title: "Reports", icon: FileText, path: "/dcim/reports" },
  { title: "Settings", icon: Settings, path: "/dcim/settings" },
];

const SidebarToggle = () => {
  const { toggleSidebar, open } = useSidebar();
  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="h-8 w-8"
      onClick={toggleSidebar}
    >
      {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
    </Button>
  );
};

const DcimLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-slate-950">
        <Sidebar className="border-r border-emerald-900/30 bg-slate-950/95 backdrop-blur-xl">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
                  <Server className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">LightRail</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">DCIM+</span>
                </div>
              </div>
              <SidebarToggle />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2">
            {/* Observe Section */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-emerald-500/70 uppercase text-[10px] tracking-wider mb-1">
                Observe
              </SidebarGroupLabel>
              <SidebarMenu>
                {observeItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname === item.path}
                      className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-slate-400 hover:bg-emerald-500/10 hover:text-slate-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-emerald-500/20 data-[active=true]:to-cyan-500/10 data-[active=true]:text-white data-[active=true]:border-l-2 data-[active=true]:border-emerald-500"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {/* Autonomous Agents Section */}
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-cyan-500/70 uppercase text-[10px] tracking-wider mb-1">
                Autonomous Agents
              </SidebarGroupLabel>
              <SidebarMenu>
                {agentItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname === item.path}
                      className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-slate-400 hover:bg-cyan-500/10 hover:text-slate-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-cyan-500/20 data-[active=true]:to-emerald-500/10 data-[active=true]:text-white data-[active=true]:border-l-2 data-[active=true]:border-cyan-500"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            {/* Manage Section */}
            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-slate-500 uppercase text-[10px] tracking-wider mb-1">
                Manage
              </SidebarGroupLabel>
              <SidebarMenu>
                {manageItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      isActive={location.pathname === item.path}
                      className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 data-[active=true]:bg-slate-800/50 data-[active=true]:text-white data-[active=true]:border-l-2 data-[active=true]:border-slate-500"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to LightRail</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex flex-1 flex-col overflow-hidden bg-slate-950">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DcimLayout;
