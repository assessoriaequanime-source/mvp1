import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/app-context";
import Index from "./pages/Index";
import Connect from "./pages/Connect";
import { DashboardLayout } from "./components/dashboard/dashboard-layout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import TokensPage from "./pages/dashboard/TokensPage";
import StakingPage from "./pages/dashboard/StakingPage";
import AvatarPage from "./pages/dashboard/AvatarPage";
import TimeCapsulePage from "./pages/dashboard/TimeCapsulePage";
import LegacyPage from "./pages/dashboard/LegacyPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import NotFound from "./pages/NotFound";

// Private route component
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("auth_token");
  const wallet = localStorage.getItem("user_wallet");
  
  if (!token || !wallet) {
    return <Navigate to="/connect" replace />;
  }
  
  return <>{children}</>;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/connect" element={<Connect />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="tokens" element={<TokensPage />} />
              <Route path="staking" element={<StakingPage />} />
              <Route path="avatar" element={<AvatarPage />} />
              <Route path="timecapsule" element={<TimeCapsulePage />} />
              <Route path="legacy" element={<LegacyPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
