import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Zap, 
  Bot, 
  Code2, 
  BookOpen,
  ArrowLeft,
  HelpCircle,
  LogIn,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Unsloth Fine-Tuning", icon: Zap, path: "/llm-tools/unsloth" },
  { title: "GLM-4 Agent", icon: Bot, path: "/llm-tools/glm4" },
  { title: "Qwen2.5-Coder", icon: Code2, path: "/llm-tools/qwen" },
];

const bottomMenuItems = [
  { title: "About us", icon: HelpCircle, path: "/llm-tools/docs" },
  { title: "Request access", icon: BookOpen, path: "/llm-tools/docs" },
  { title: "Login", icon: LogIn, path: "/llm-tools" },
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

const LlmToolsLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                  <Code2 className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground">LLM Dev</span>
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
                    className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-2">
            <SidebarMenu>
              {bottomMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={location.pathname === item.path}
                    className="w-full justify-start gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <Button 
              variant="ghost" 
              className="mt-2 w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to LightRail</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default LlmToolsLayout;
