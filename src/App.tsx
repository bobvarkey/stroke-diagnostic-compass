import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import GlossaryDrawer from "./components/GlossaryDrawer";
import FloatingNavButtons from "./components/FloatingNavButtons";

// Route-level code splitting — keeps the initial bundle small.
const Index = lazy(() => import("./pages/Index"));
const Calculators = lazy(() => import("./pages/Calculators"));
const HistoryPage = lazy(() => import("./pages/History"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ContrastTest = lazy(() => import("./pages/ContrastTest"));
const Pricing = lazy(() => import("./pages/Pricing"));
const VO2Max = lazy(() => import("./pages/VO2Max"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workup" element={<Index />} />
              <Route path="/calculators" element={<Calculators />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/contrast-test" element={<ContrastTest />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/vo2-max" element={<VO2Max />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <GlossaryDrawer />
          <FloatingNavButtons />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
