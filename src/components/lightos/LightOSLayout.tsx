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
} from "@/components/ui/sidebar";
import { 
  Home,
  Rocket,
  Eye,
  FolderKanban,
  LayoutTemplate,
  BookOpen,
  ArrowLeft,
  PanelLeftClose,
  PanelLeft,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Home", icon: Home, path: "/lightos" },
  { title: "Build", icon: Rocket, path: "/lightos/build" },
  { title: "Preview", icon: Eye, path: "/lightos/preview" },
  { title: "Projects", icon: FolderKanban, path: "/lightos/projects" },
  { title: "Templates", icon: LayoutTemplate, path: "/lightos/templates" },
  { title: "Documentation", icon: BookOpen, path: "/lightos/docs" },
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

const LightOSLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#0f172a]">
        <Sidebar className="border-r border-indigo-900/30 bg-[#0f172a]/95 backdrop-blur-xl">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 shadow-lg shadow-indigo-500/20">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">LightOS</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Dev Environment</span>
                </div>
              </div>
              <SidebarToggle />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-slate-400 hover:bg-indigo-500/10 hover:text-slate-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-indigo-500/20 data-[active=true]:to-teal-500/10 data-[active=true]:text-white data-[active=true]:border-l-2 data-[active=true]:border-indigo-500"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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

        <main className="flex flex-1 flex-col overflow-hidden bg-[#0f172a]">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LightOSLayout;
