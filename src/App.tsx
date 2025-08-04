
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AFE from "./pages/AFE";
import CostCenters from "./pages/CostCenters";
import CostCodes from "./pages/CostCodes";
import Permissions from "./pages/Permissions";
import Vendor from "./pages/Vendor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

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
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/afe" element={<ProtectedRoute><AFE /></ProtectedRoute>} />
              <Route path="/cost-centers" element={<ProtectedRoute><CostCenters /></ProtectedRoute>} />
              <Route path="/cost-codes" element={<ProtectedRoute><CostCodes /></ProtectedRoute>} />
              <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
              <Route path="/vendor" element={<ProtectedRoute><Vendor /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
