import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Calculators from "./pages/Calculators";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ContrastTest from "./pages/ContrastTest";
import Pricing from "./pages/Pricing";
import GlossaryDrawer from "./components/GlossaryDrawer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workup" element={<Index />} />
            <Route path="/calculators" element={<Calculators />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/contrast-test" element={<ContrastTest />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <GlossaryDrawer />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
