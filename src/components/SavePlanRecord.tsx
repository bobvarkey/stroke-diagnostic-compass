import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { saveRecord, type PatientRecord } from "@/lib/patientRecords";

const RECORD_ID_KEY = "strokeCurrentRecordId";

/** Saves the current notes + plan as a patient record (offline-first, synced to the server). */
export default function SavePlanRecord({ notes, plan }: { notes: string; plan: PatientRecord["plan"] }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [label, setLabel] = useState(() => localStorage.getItem("strokeCurrentRecordLabel") ?? "");
  if (!user) return null;
  const save = async () => {
    const name = label.trim();
    if (!name) { toast({ title: "Enter a patient identifier first", variant: "destructive" }); return; }
    let id = localStorage.getItem(RECORD_ID_KEY);
    if (!id || localStorage.getItem("strokeCurrentRecordLabel") !== name) id = crypto.randomUUID();
    localStorage.setItem(RECORD_ID_KEY, id); localStorage.setItem("strokeCurrentRecordLabel", name);
    await saveRecord({ id, owner_id: user.id, label: name, notes, plan });
    toast({ title: navigator.onLine ? "Patient record saved" : "Saved offline", description: navigator.onLine ? "View it any time under My patient records." : "It will upload when you're back online." });
  };
  return (
    <div className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-2 sm:items-end">
      <div className="flex-1 space-y-1">
        <Label htmlFor="record-label">Patient identifier (MRN or initials)</Label>
        <Input id="record-label" maxLength={60} value={label} onChange={(e) => setLabel(e.target.value)} className="min-h-11" placeholder="e.g. MRN 12345" />
      </div>
      <Button className="min-h-11" onClick={save}><Save className="h-4 w-4 mr-1" />Save patient record</Button>
    </div>
  );
}
