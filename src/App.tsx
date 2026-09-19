import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import NotFound from "./pages/NotFound";
import PrivacyScreen from "./compliance/PrivacyScreen";
import TermsScreen from "./compliance/TermsScreen";
import DisclaimerScreen from "./compliance/DisclaimerScreen";
import SettingsScreen from "./compliance/SettingsScreen";
import { getFocusStyleOverrides } from "./services/accessibility";

const queryClient = new QueryClient();

/**
 * App — root component with routing and global setup.
 *
 * Routes:
 *   /           — Main clinical app (opens directly, no onboarding gate)
 *   /preview    — Mobile preview landing
 *   /privacy    — Standalone privacy policy
 *   /terms      — Standalone terms of use
 *   /disclaimer — Standalone disclaimer
 *   /settings   — Settings screen
 *   *           — 404
 */
const App = () => {
  // Inject accessibility focus styles on mount
  useEffect(() => {
    const styleId = "stroke-accessibility-overrides";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = getFocusStyleOverrides();
      document.head.appendChild(style);
    }

    // Add skip-to-content link for keyboard users
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-to-content";
    skipLink.textContent = "Skip to main content";
    if (!document.querySelector(".skip-to-content")) {
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    return () => {
      const s = document.getElementById(styleId);
      if (s) s.remove();
      const sl = document.querySelector(".skip-to-content");
      if (sl) sl.remove();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Main app — opens directly */}
              <Route path="/" element={<Index />} />
              {/* Standalone compliance screens */}
              <Route path="/privacy" element={<PrivacyScreen standalone onBack={() => window.history.back()} />} />
              <Route path="/terms" element={<TermsScreen standalone onBack={() => window.history.back()} />} />
              <Route path="/disclaimer" element={<DisclaimerScreen standalone onBack={() => window.history.back()} />} />
              <Route path="/settings" element={<SettingsScreen onBack={() => window.history.back()} />} />
              {/* Preview / marketing page */}
              <Route path="/preview" element={<Preview />} />
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
