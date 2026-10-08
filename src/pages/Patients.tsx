import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import PremiumGate from "@/components/PremiumGate";
import { listRecords, syncRecords, IMAGING_STEP, type PatientRecord } from "@/lib/patientRecords";

function RecordView({ r }: { r: PatientRecord }) {
  const imaging = r.plan.filter((s) => IMAGING_STEP.test(`${s.title} ${s.id}`));
  const treatment = r.plan.filter((s) => s.phase === "Treatment");
  const Step = ({ s }: { s: PatientRecord["plan"][number] }) => (
    <li className="text-sm border-l-2 border-primary/50 pl-2">
      <span className="font-semibold">{s.title}</span> <Badge variant="secondary" className="text-[10px]">{s.status}</Badge>
      <p className="text-muted-foreground">{s.detail}</p>
    </li>
  );
  return (
    <div className="space-y-3 pt-2">
      <div><h3 className="font-semibold text-sm">History notes</h3><p className="text-sm whitespace-pre-wrap">{r.notes || "—"}</p></div>
      <div><h3 className="font-semibold text-sm">Imaging steps</h3>{imaging.length ? <ul className="space-y-1">{imaging.map((s) => <Step key={s.id} s={s} />)}</ul> : <p className="text-sm">—</p>}</div>
      <div><h3 className="font-semibold text-sm">Treatment plan</h3>{treatment.length ? <ul className="space-y-1">{treatment.map((s) => <Step key={s.id} s={s} />)}</ul> : <p className="text-sm">—</p>}</div>
    </div>
  );
}

export default function Patients() {
  const { user } = useAuth();
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setRecords(await listRecords(user.id));
    if (navigator.onLine) { setSyncing(true); await syncRecords(user.id).catch(() => false); setSyncing(false); setRecords(await listRecords(user.id)); }
  }, [user]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const on = () => { setOnline(true); load(); }, off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, [load]);

  return (
    <main className="min-h-screen p-4 pt-20 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">My patient records</h1>
        <Badge variant="outline" className="gap-1">{syncing ? <><RefreshCw className="h-3 w-3 animate-spin" />Syncing</> : online ? <><Wifi className="h-3 w-3" />Online</> : <><WifiOff className="h-3 w-3" />Offline</>}</Badge>
      </div>
      {!user ? <p>Please <Link to="/account" className="underline">sign in</Link> to see your records.</p> : (
        <PremiumGate feature="Patient records">
          {records.length === 0 ? <p className="text-sm text-muted-foreground">No saved records yet. Use "Save patient record" in the Plan tab.</p> : (
            <ul className="space-y-2">
              {records.map((r) => (
                <li key={r.id} className="glass rounded-xl p-3">
                  <button className="w-full text-left min-h-11 flex items-center justify-between gap-2" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-xs text-muted-foreground">{new Date(r.updated_at).toLocaleString()}{r.sync_status === "pending" ? " · not uploaded yet" : ""}</span>
                  </button>
                  {open === r.id && <RecordView r={r} />}
                </li>
              ))}
            </ul>
          )}
          <Button variant="outline" className="min-h-11 mt-3" disabled={!online || syncing} onClick={load}><RefreshCw className="h-4 w-4 mr-1" />Sync now</Button>
        </PremiumGate>
      )}
    </main>
  );
}
