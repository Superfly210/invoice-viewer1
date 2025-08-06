
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SubmissionAuth from "./pages/SubmissionAuth";
import SubmissionPortal from "./pages/SubmissionPortal";
import Index from "./pages/Index";
import AFE from "./pages/AFE";
import CostCenters from "./pages/CostCenters";
import CostCodes from "./pages/CostCodes";
import Permissions from "./pages/Permissions";
import Vendor from "./pages/Vendor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component for viewer portal
const ViewerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/viewer-auth" replace />;
  }
  
  return <>{children}</>;
};

// Protected Route component for submission portal
const SubmissionProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/submission-auth" replace />;
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
              {/* Landing page with portal selection */}
              <Route path="/" element={<Landing />} />
              
              {/* Submission Portal Routes */}
              <Route path="/submission-auth" element={<SubmissionAuth />} />
              <Route path="/submission-portal" element={<SubmissionProtectedRoute><SubmissionPortal /></SubmissionProtectedRoute>} />
              
              {/* Viewer Portal Routes */}
              <Route path="/viewer-auth" element={<Auth />} />
              <Route path="/viewer" element={<ViewerProtectedRoute><Index /></ViewerProtectedRoute>} />
              <Route path="/afe" element={<ViewerProtectedRoute><AFE /></ViewerProtectedRoute>} />
              <Route path="/cost-centers" element={<ViewerProtectedRoute><CostCenters /></ViewerProtectedRoute>} />
              <Route path="/cost-codes" element={<ViewerProtectedRoute><CostCodes /></ViewerProtectedRoute>} />
              <Route path="/permissions" element={<ViewerProtectedRoute><Permissions /></ViewerProtectedRoute>} />
              <Route path="/vendor" element={<ViewerProtectedRoute><Vendor /></ViewerProtectedRoute>} />
              
              {/* Legacy route redirects */}
              <Route path="/auth" element={<Navigate to="/viewer-auth" replace />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
