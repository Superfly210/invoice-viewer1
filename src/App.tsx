
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./components/AuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AFE from "./pages/AFE";
import CostCenters from "./pages/CostCenters";
import Permissions from "./pages/Permissions";
import Vendor from "./pages/Vendor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/afe" element={<AFE />} />
              <Route path="/cost-centers" element={<CostCenters />} />
              <Route path="/permissions" element={<Permissions />} />
              <Route path="/vendor" element={<Vendor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
