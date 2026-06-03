import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import NotFound from "./pages/NotFound";
import ComplianceOnboarding from "./compliance/ComplianceOnboarding";
import PrivacyScreen from "./compliance/PrivacyScreen";
import TermsScreen from "./compliance/TermsScreen";
import DisclaimerScreen from "./compliance/DisclaimerScreen";
import SettingsScreen from "./compliance/SettingsScreen";
import { getFocusStyleOverrides } from "./services/accessibility";

const queryClient = new QueryClient();

/**
 * ComplianceGate — wraps the app and ensures the user has completed
 * the onboarding consent flow before accessing clinical features.
 * Uses localStorage so returning users don't re-onboard.
 */
function ComplianceGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if onboarding was already completed
    try {
      const complete = localStorage.getItem("stroke_onboarding_complete");
      setOnboardingComplete(complete === "true");
    } catch {
      setOnboardingComplete(false);
    }
  }, []);

  // Show loading while checking
  if (loading || onboardingComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not yet completed
  if (!onboardingComplete) {
    return (
      <ComplianceOnboarding
        userId={user?.id || null}
        onComplete={() => setOnboardingComplete(true)}
        onSkipToApp={() => {
          // Skip in demo mode — mark onboarding as complete for the session
          try {
            localStorage.setItem("stroke_onboarding_complete", "true");
          } catch { /* noop */ }
          setOnboardingComplete(true);
        }}
      />
    );
  }

  return <>{children}</>;
}

/**
 * App — root component with routing and global setup.
 * 
 * Routes:
 *   /           — Main clinical app (protected by ComplianceGate)
 *   /preview    — Mobile preview landing (no compliance gate)
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
              {/* Main app — protected by compliance gate */}
              <Route
                path="/"
                element={
                  <ComplianceGate>
                    <Index />
                  </ComplianceGate>
                }
              />
              {/* Standalone compliance screens (no gate needed) */}
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