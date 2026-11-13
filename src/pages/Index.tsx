import { useState, useEffect } from "react";
import StrokeWorkupChecklist from "@/components/StrokeWorkupChecklist";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { goBack } from "@/lib/navHistory";
import InstallAppButton from "@/components/InstallAppButton";
import { ChevronUp, Users, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface Patient {
  id: string;
  patient_id: string;
  name: string | null;
  weight: number | null;
  age: number | null;
  sex: string | null;
  last_known_well: string | null;
  demographics: Record<string, unknown>;
  clinical_data: Record<string, unknown>;
  created_by: string | null;
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
}

// Default working patient (app opens directly, no sign-in required)
const DEMO_PATIENT: Patient = {
  id: "local-patient-001",
  patient_id: "PATIENT-001",
  name: "Current Patient",
  weight: 70,
  age: 65,
  sex: "M",
  last_known_well: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  demographics: { mrn: "PATIENT-001", chief_complaint: "Left-sided weakness" },
  clinical_data: {},
  created_by: null,
  last_edited_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(DEMO_PATIENT);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      const sections = [
        "stroke-code", "acute-algorithm", "tpa-eligibility", "ivt-ais", "minor-non-disabling-stroke", "thrombolytics-anticoag", "post-ivt-hemorrhage", "cvt-management",
        "cvt-evaluation-pathway", "cvt-intraclot-thrombolysis", "cvt-procedural-techniques", "cvt-endovascular-techniques",
        "lvo-dashboard", "treatment-decision",
        "ctp-penumbra", "aspects-calculator", "vascular-anatomy",
        "nihss-calculator", "gcs-calculator", "prevent-score", "kdigo-heatmap",
        "prime-tool", "lipid-risk", "stroke-history", "stroke-phenotyping", "workup-checklist",
        "mevo-oriental", "vessel-occlusion-spectrum"
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

  const handleReturnToPatientList = () => {
    setSelectedPatient(null);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full relative z-10 bg-background tabular-nums">
        <AppSidebar activeSection={activeSection} onSectionClick={setActiveSection} />
        <SidebarInset className="flex-1 min-w-0 bg-background">
          <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b border-border/70 bg-background/85 backdrop-blur-md px-2 sm:px-4 safe-top shadow-sm">
            <SidebarTrigger className="-ml-1" />

            {/* Home & Back navigation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goBack(() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); })}
              className="h-9 w-9"
              aria-label="Go back to previous tab or page"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="h-9 w-9"
              aria-label="Go to home page"
              title="Home"
            >
              <Home className="h-4 w-4" />
            </Button>

            
            {/* Patient info */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 min-w-0">
              <Badge variant="outline" className="font-mono text-xs shrink-0 bg-primary/5 border-primary/20">
                {selectedPatient?.patient_id}
              </Badge>
              {selectedPatient?.name && (
                <span className="text-sm text-muted-foreground hidden sm:inline truncate">
                  {selectedPatient.name}
                </span>
              )}
            </div>

            <div className="flex-1" />
            <InstallAppButton />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReturnToPatientList}
              className="flex items-center gap-1 h-9 px-2 sm:px-3"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Cases</span>
            </Button>
          </header>
          <main className="flex-1 relative">
            <StrokeWorkupChecklist patient={selectedPatient} />
          </main>
        </SidebarInset>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg h-12 w-12 bg-primary/90 backdrop-blur-sm hover:bg-primary safe-bottom"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </SidebarProvider>
  );
};

export default Index;
