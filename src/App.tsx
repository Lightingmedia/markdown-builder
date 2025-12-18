import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FeoaAuth from "./pages/feoa/Auth";
import FeoaLayout from "./components/feoa/FeoaLayout";
import FeoaDashboard from "./pages/feoa/Dashboard";
import EnergyLab from "./pages/feoa/EnergyLab";
import Connectivity from "./pages/feoa/Connectivity";
import Reports from "./pages/feoa/Reports";
import Settings from "./pages/feoa/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* FEOA Routes */}
          <Route path="/monitor/auth" element={<FeoaAuth />} />
          <Route path="/monitor" element={<FeoaLayout />}>
            <Route index element={<FeoaDashboard />} />
            <Route path="energy-lab" element={<EnergyLab />} />
            <Route path="connectivity" element={<Connectivity />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
