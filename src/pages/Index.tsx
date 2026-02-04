import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AuthScreen } from "@/components/AuthScreen";
import { PatientSelector } from "@/components/PatientSelector";
import StrokeWorkupChecklist from "@/components/StrokeWorkupChecklist";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { ChevronUp, Users, LogOut, Shield } from "lucide-react";
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

const Index = () => {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientData, setPatientData] = useState<Record<string, unknown>>({});

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

  // Auto-save patient data when it changes
  const savePatientData = useCallback(async (data: Record<string, unknown>) => {
    if (!selectedPatient || !user) return;
    
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
  }, [selectedPatient, user]);

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
  };

  const handleSignOut = async () => {
    await signOut();
    setSelectedPatient(null);
    setPatientData({});
    toast({ title: 'Signed out', description: 'You have been logged out' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Show patient selector if no patient selected
  if (!selectedPatient) {
    return <PatientSelector onSelectPatient={handleSelectPatient} />;
  }

  // Show main workup interface with selected patient
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar activeSection={activeSection} onSectionClick={setActiveSection} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-50 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="-ml-1" />
            
            {/* Patient info */}
            <div className="flex items-center gap-2 ml-2">
              <Badge variant="outline" className="font-mono">
                {selectedPatient.patient_id}
              </Badge>
              {selectedPatient.name && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {selectedPatient.name}
                </span>
              )}
            </div>

            <div className="flex-1" />
            
            {/* User info and actions */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {profile?.display_name || profile?.username}
              </span>
              {isAdmin && (
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
