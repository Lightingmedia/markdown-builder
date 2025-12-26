import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import JobScheduler from "@/pages/feoa/JobScheduler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import BenchmarkPublic from "./pages/BenchmarkPublic";
import CaseStudies from "./pages/CaseStudies";
import FeoaAuth from "./pages/feoa/Auth";
import FeoaLayout from "./components/feoa/FeoaLayout";
import FeoaDashboard from "./pages/feoa/Dashboard";
import EnergyLab from "./pages/feoa/EnergyLab";
import Connectivity from "./pages/feoa/Connectivity";
import Reports from "./pages/feoa/Reports";
import Settings from "./pages/feoa/Settings";
import Notifications from "./pages/feoa/Notifications";
import TrendAnalysis from "./pages/feoa/TrendAnalysis";
import Benchmark from "./pages/feoa/Benchmark";
import OptimizationDashboard from "./pages/feoa/OptimizationDashboard";
import SimulationInterface from "./pages/feoa/SimulationInterface";
import GlobalData from "./pages/feoa/GlobalData";
import DcApiManagement from "./pages/feoa/DcApiManagement";

// PCB EDA Copilot (Admin Only)
import PcbLayout from "./components/pcb/PcbLayout";
import PcbProjects from "./pages/pcb/Projects";
import PcbDesignCanvas from "./pages/pcb/DesignCanvas";
import PcbVersions from "./pages/pcb/Versions";
import PcbChat from "./pages/pcb/Chat";
import PcbSettings from "./pages/pcb/Settings";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/benchmark" element={<BenchmarkPublic />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            
            {/* FEOA Routes */}
            <Route path="/monitor/auth" element={<FeoaAuth />} />
            <Route path="/monitor" element={<FeoaLayout />}>
              <Route index element={<FeoaDashboard />} />
              <Route path="global-data" element={<GlobalData />} />
              <Route path="energy-lab" element={<EnergyLab />} />
              <Route path="trends" element={<TrendAnalysis />} />
              <Route path="benchmark" element={<Benchmark />} />
              <Route path="connectivity" element={<Connectivity />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="optimization" element={<OptimizationDashboard />} />
              <Route path="simulation" element={<SimulationInterface />} />
              <Route path="scheduler" element={<JobScheduler />} />
              <Route path="dc-api" element={<DcApiManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* PCB EDA Copilot Routes (Admin Only) */}
            <Route path="/pcb-copilot" element={<PcbLayout />}>
              <Route index element={<PcbProjects />} />
              <Route path="design" element={<PcbDesignCanvas />} />
              <Route path="versions" element={<PcbVersions />} />
              <Route path="chat" element={<PcbChat />} />
              <Route path="settings" element={<PcbSettings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
