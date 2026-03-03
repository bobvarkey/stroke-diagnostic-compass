import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AuthScreen } from "@/components/AuthScreen";
import { PatientSelector } from "@/components/PatientSelector";
import StrokeWorkupChecklist from "@/components/StrokeWorkupChecklist";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { ChevronUp, Users, LogOut, Shield, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

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

// Demo patient for demonstration mode
const DEMO_PATIENT: Patient = {
  id: "demo-patient-001",
  patient_id: "DEMO-001",
  name: "Demo Patient",
  weight: 70,
  age: 65,
  sex: "M",
  last_known_well: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  demographics: { mrn: "DEMO-001", chief_complaint: "Left-sided weakness" },
  clinical_data: {},
  created_by: null,
  last_edited_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const Index = () => {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(DEMO_PATIENT);
  const [patientData, setPatientData] = useState<Record<string, unknown>>({});
  const [isDemoMode, setIsDemoMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      const sections = [
        "stroke-code", "acute-algorithm", "tpa-eligibility", "lvo-dashboard", "treatment-decision",
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

  // Auto-save patient data when it changes (skip in demo mode)
  const savePatientData = useCallback(async (data: Record<string, unknown>) => {
    if (!selectedPatient || !user || isDemoMode) return;
    
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          clinical_data: data as Json,
          last_edited_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPatient.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving patient data:', error);
    }
  }, [selectedPatient, user, isDemoMode]);

  // Debounced save
  useEffect(() => {
    if (!selectedPatient) return;
    
    const timeoutId = setTimeout(() => {
      savePatientData(patientData);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [patientData, savePatientData, selectedPatient]);

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientData((patient.clinical_data as Record<string, unknown>) || {});
    toast({ title: 'Patient Selected', description: `Now viewing ${patient.patient_id}` });
  };

  const handleReturnToPatientList = () => {
    setSelectedPatient(null);
    setPatientData({});
    setIsDemoMode(false);
  };

  const handleSignOut = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setSelectedPatient(null);
      setPatientData({});
      toast({ title: 'Demo ended', description: 'Exited demonstration mode' });
      return;
    }
    await signOut();
    setSelectedPatient(null);
    setPatientData({});
    toast({ title: 'Signed out', description: 'You have been logged out' });
  };

  const handleEnterDemoMode = () => {
    setIsDemoMode(true);
    setSelectedPatient(DEMO_PATIENT);
    setPatientData({});
    toast({ 
      title: 'Demo Mode Active', 
      description: 'Exploring with sample patient data. Changes will not be saved.' 
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkipToApp = () => {
    setIsDemoMode(true);
    setSelectedPatient(DEMO_PATIENT);
    setPatientData({});
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in (unless in demo mode)
  if (!user && !isDemoMode) {
    return <AuthScreen onEnterDemoMode={handleEnterDemoMode} onSkipToApp={handleSkipToApp} />;
  }

  // Show patient selector if no patient selected (unless in demo mode)
  if (!selectedPatient && !isDemoMode) {
    return <PatientSelector onSelectPatient={handleSelectPatient} onEnterDemoMode={handleEnterDemoMode} />;
  }

  // Show main workup interface with selected patient
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeSection={activeSection} onSectionClick={setActiveSection} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-4">
            <SidebarTrigger className="-ml-1" />
            
            {/* Patient info */}
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="outline" className="font-mono">
                {selectedPatient?.patient_id}
              </Badge>
              {selectedPatient?.name && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {selectedPatient.name}
                </span>
              )}
              {isDemoMode && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300">
                  <Play className="h-3 w-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </div>

            <div className="flex-1" />
            
            {/* User info and actions */}
            <div className="flex items-center gap-2">
              {!isDemoMode && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {profile?.display_name || profile?.username}
                </span>
              )}
              {isAdmin && !isDemoMode && (
                <Badge variant="secondary" className="flex items-center gap-1 hidden sm:flex">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
              <Button
                variant="ghost" 
                size="sm" 
                onClick={handleReturnToPatientList}
                className="flex items-center gap-1"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">All Cases</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1">
            <StrokeWorkupChecklist 
              patient={selectedPatient}
              onPatientDataChange={setPatientData}
            />
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
