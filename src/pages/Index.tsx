import { useState, useEffect } from "react";
import StrokeWorkupChecklist from "@/components/StrokeWorkupChecklist";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

const Index = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      // Track active section based on scroll position
      const sections = [
        "acute-algorithm", "tpa-eligibility", "lvo-dashboard", "treatment-decision",
        "ctp-penumbra", "aspects-calculator", "collateral-grading", "vascular-anatomy",
        "nihss-calculator", "gcs-calculator", "prevent-score", "kdigo-heatmap",
        "prime-tool", "lipid-risk", "stroke-history", "stroke-phenotyping", "workup-checklist"
      ];
      
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeSection={activeSection} onSectionClick={setActiveSection} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Scroll to navigate sections
            </span>
          </header>
          <main className="flex-1">
            <StrokeWorkupChecklist />
          </main>
        </SidebarInset>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg h-12 w-12"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </SidebarProvider>
  );
};

export default Index;
