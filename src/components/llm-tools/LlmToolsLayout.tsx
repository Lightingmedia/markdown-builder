import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Zap, 
  Bot, 
  Code2, 
  BookOpen,
  ArrowLeft,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/llm-tools" },
  { title: "Unsloth Fine-Tuning", icon: Zap, path: "/llm-tools/unsloth" },
  { title: "GLM-4 Coding Agent", icon: Bot, path: "/llm-tools/glm4" },
  { title: "Qwen2.5-Coder", icon: Code2, path: "/llm-tools/qwen" },
  { title: "Documentation", icon: BookOpen, path: "/llm-tools/docs" },
];

const LlmToolsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const currentItem = menuItems.find(item => 
      item.path === currentPath || 
      (currentPath.startsWith(item.path) && item.path !== "/llm-tools")
    );
    return currentItem?.title || "Dashboard";
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Code2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">LLM Dev Tools</h2>
                <p className="text-xs text-muted-foreground">AI-Powered Development</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
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
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to LightRail
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <h1 className="text-xl font-semibold text-foreground">{getCurrentPageTitle()}</h1>
          </header>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LlmToolsLayout;
