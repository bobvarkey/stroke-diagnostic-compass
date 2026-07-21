import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import { PatientSelector } from "@/components/PatientSelector";
import StrokeWorkupChecklist from "@/components/StrokeWorkupChecklist";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Users, LogOut, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";
import PatientConflictDialog, { ConflictInfo } from "@/components/PatientConflictDialog";


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

// Default in-memory patient (not persisted until saved)
const DEFAULT_PATIENT: Patient = {
  id: "local-patient",
  patient_id: "",
  name: "",
  weight: 70,
  age: 65,
  sex: "M",
  last_known_well: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  demographics: {},
  clinical_data: {},
  created_by: null,
  last_edited_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const Index = () => {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(DEFAULT_PATIENT);
  const [patientData, setPatientData] = useState<Record<string, unknown>>({});
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const pendingSaveRef = useRef<Record<string, unknown> | null>(null);
  // Last remote `updated_at` we know about — anything newer in DB means another device saved.
  const knownUpdatedAtRef = useRef<string | null>(null);

  // Auto-scroll to ?section= from Home / Calculators links
  useEffect(() => {
    const s = searchParams.get("section");
    if (!s) return;
    const scrollTo = (b: ScrollBehavior = "smooth") => {
      const el = document.getElementById(s);
      if (el) el.scrollIntoView({ behavior: b, block: "start" });
    };
    setActiveSection(s);
    window.dispatchEvent(new CustomEvent("force-mount-section", { detail: s }));
    setTimeout(() => scrollTo("instant"), 400);
    setTimeout(() => scrollTo("smooth"), 1000);
    setTimeout(() => scrollTo("smooth"), 2000);
  }, [searchParams]);



  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      const sections = [
        "stroke-code", "acute-algorithm", "tpa-eligibility", "thrombolytic-dose", "post-ivt-hemorrhage", "cvt-management",
        "lvo-dashboard", "treatment-decision",
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

  // Auto-save patient data when it changes — with conflict detection
  const savePatientData = useCallback(async (data: Record<string, unknown>, opts?: { force?: boolean }) => {
    if (!selectedPatient || !user || selectedPatient.id === DEFAULT_PATIENT.id) return;

    try {
      // 1. Check current remote version
      const { data: remote, error: fetchErr } = await supabase
        .from('patients')
        .select('updated_at, last_edited_by, clinical_data')
        .eq('id', selectedPatient.id)
        .maybeSingle();
      if (fetchErr) throw fetchErr;

      const remoteUpdatedAt = remote?.updated_at ?? null;
      const known = knownUpdatedAtRef.current;

      // 2. Conflict = remote is newer than what we last saw AND the edit wasn't ours
      const isConflict =
        !opts?.force &&
        remoteUpdatedAt &&
        known &&
        remoteUpdatedAt !== known &&
        remote?.last_edited_by !== user.id;

      if (isConflict) {
        pendingSaveRef.current = data;
        let editorLabel = "another user";
        if (remote?.last_edited_by) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('user_id', remote.last_edited_by)
            .maybeSingle();
          if (prof) editorLabel = prof.display_name || prof.username || editorLabel;
        }
        setConflict({
          remoteUpdatedAt: remoteUpdatedAt!,
          remoteEditorLabel: editorLabel,
          localSavedAt: new Date().toISOString(),
        });
        return;
      }

      // 3. Write
      const nowIso = new Date().toISOString();
      const { data: updated, error } = await supabase
        .from('patients')
        .update({
          clinical_data: data as Json,
          last_edited_by: user.id,
          updated_at: nowIso,
        })
        .eq('id', selectedPatient.id)
        .select('updated_at')
        .maybeSingle();
      if (error) throw error;
      knownUpdatedAtRef.current = updated?.updated_at ?? nowIso;
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
    knownUpdatedAtRef.current = patient.updated_at ?? null;
    pendingSaveRef.current = null;
    setConflict(null);
    toast({ title: 'Patient Selected', description: `Now viewing ${patient.patient_id}` });
  };

  const handleReturnToPatientList = () => {
    setSelectedPatient(null);
    setPatientData({});
    knownUpdatedAtRef.current = null;
    pendingSaveRef.current = null;
    setConflict(null);
  };

  const handleSignOut = async () => {
    await signOut();
    setSelectedPatient(null);
    setPatientData({});
    toast({ title: 'Signed out', description: 'You have been logged out' });
  };

  const handleKeepMine = async () => {
    const data = pendingSaveRef.current ?? patientData;
    setConflict(null);
    pendingSaveRef.current = null;
    await savePatientData(data, { force: true });
    toast({ title: 'Your version saved', description: 'The cloud copy was overwritten.' });
  };

  const handleKeepRemote = async () => {
    if (!selectedPatient) return;
    setConflict(null);
    pendingSaveRef.current = null;
    const { data: remote, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', selectedPatient.id)
      .maybeSingle();
    if (error || !remote) {
      toast({ title: 'Sync failed', description: error?.message ?? 'Could not fetch cloud version', variant: 'destructive' });
      return;
    }
    setSelectedPatient(remote as unknown as Patient);
    setPatientData(((remote as { clinical_data?: Record<string, unknown> }).clinical_data) || {});
    knownUpdatedAtRef.current = (remote as { updated_at?: string }).updated_at ?? null;
    toast({ title: 'Cloud version loaded', description: 'Your local edits were discarded.' });
  };



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="text-center relative z-10 glass-strong rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show patient selector if no patient selected
  if (!selectedPatient) {
    return <PatientSelector onSelectPatient={handleSelectPatient} />;
  }



  // Show main workup interface with selected patient
  return (
    <SidebarProvider defaultOpen={false}>
      {/* Background orbs for glassmorphic effect */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <div className="min-h-screen flex w-full relative z-10">
        <AppSidebar activeSection={activeSection} onSectionClick={setActiveSection} />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-50 border-b glass-strong safe-top">
            <div className="flex h-14 items-center gap-2 px-2 sm:px-4">
              <SidebarTrigger className="-ml-1" />

              {/* Patient info */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-1 sm:ml-2 min-w-0">
                <Badge variant="outline" className="font-mono text-xs shrink-0 bg-gradient-sunset/10 border-primary/30 text-foreground">
                  {selectedPatient?.patient_id}
                </Badge>
                {selectedPatient?.name && (
                  <span className="text-sm text-muted-foreground hidden sm:inline truncate">
                    {selectedPatient.name}
                  </span>
                )}
              </div>

              <div className="flex-1" />

              {/* User info and actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs text-muted-foreground hidden md:inline">
                  {profile?.display_name || profile?.username}
                </span>
                {isAdmin && (
                  <Badge variant="secondary" className="items-center gap-1 hidden md:flex text-xs bg-gradient-sunset border-0 text-primary-foreground">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReturnToPatientList}
                  className="flex items-center gap-1 h-9 px-2 sm:px-3"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Cases</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Sunset accent stripe — matches Home */}
            <div className="h-[2px] bg-gradient-sunset opacity-70" />
          </header>
          <main className="flex-1 relative">
            <StrokeWorkupChecklist
              patient={selectedPatient}
              onPatientDataChange={(partial) =>
                setPatientData((prev) => ({ ...prev, ...partial }))
              }
            />
          </main>
        </SidebarInset>
      </div>

      <PatientConflictDialog
        open={!!conflict}
        info={conflict}
        onKeepMine={handleKeepMine}
        onKeepRemote={handleKeepRemote}
        onCancel={() => { setConflict(null); pendingSaveRef.current = null; }}
      />
    </SidebarProvider>
  );
};

export default Index;
