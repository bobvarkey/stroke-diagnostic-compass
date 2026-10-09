import Dexie, { type Table } from "dexie";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { PlanStep } from "@/lib/strokePlan";

/** A saved patient record: history notes + imaging steps + treatment plan snapshot. */
export interface PatientRecord {
  id: string;            // client UUID; also the server row id
  owner_id: string;
  label: string;         // patient identifier shown in the list
  notes: string;
  plan: (PlanStep & { historyNotes?: string[]; references?: { label: string; url: string }[] })[];
  updated_at: string;
  deleted: boolean;
  sync_status: "synced" | "pending";
}

class RecordsDB extends Dexie {
  records!: Table<PatientRecord, string>;
  constructor() { super("stroke-companion-records"); this.version(1).stores({ records: "id, owner_id, updated_at, sync_status" }); }
}
export const db = new RecordsDB();

export const IMAGING_STEP = /(ct|mri|cta|angiogram|imaging|scan|dsa)/i;

function toRow(r: PatientRecord) {
  return {
    id: r.id, patient_id: r.label, created_by: r.owner_id, last_edited_by: r.owner_id,
    clinical_data: JSON.parse(JSON.stringify({ stroke_record: { notes: r.notes, plan: r.plan, updated_at: r.updated_at, deleted: r.deleted } })) as Json,
  };
}

/** Saves locally first (works offline), then pushes to the server when online. */
export async function saveRecord(r: Omit<PatientRecord, "updated_at" | "sync_status" | "deleted">) {
  const rec: PatientRecord = { ...r, deleted: false, updated_at: new Date().toISOString(), sync_status: "pending" };
  await db.records.put(rec);
  await syncRecords(r.owner_id);
  return rec;
}

/** Push pending local edits, then pull the server copy. Newer updated_at wins on conflict. */
export async function syncRecords(ownerId: string): Promise<boolean> {
  if (!navigator.onLine) return false;
  const pending = await db.records.where("sync_status").equals("pending").filter((r) => r.owner_id === ownerId).toArray();
  for (const r of pending) {
    const { error } = await supabase.from("patients").upsert(toRow(r), { onConflict: "id" });
    if (!error) await db.records.update(r.id, { sync_status: "synced" });
  }
  const { data, error } = await supabase.from("patients").select("id, patient_id, created_by, clinical_data").eq("created_by", ownerId);
  if (error || !data) return false;
  for (const row of data) {
    const sr = (row.clinical_data as { stroke_record?: { notes: string; plan: PatientRecord["plan"]; updated_at: string; deleted?: boolean } } | null)?.stroke_record;
    if (!sr) continue;
    const local = await db.records.get(row.id);
    // A local edit that never reached the server must not be overwritten or relabelled. If a push
    // failed, this row is still pending; leave it alone so the next sync retries it. Overwriting it
    // here both discarded the clinician's edit and stamped it "synced", reporting a sync that never
    // happened. Patients.tsx already shows pending rows as "not uploaded yet".
    if (local?.sync_status === "pending") continue;
    await db.records.put({ id: row.id, owner_id: ownerId, label: row.patient_id, notes: sr.notes, plan: sr.plan ?? [], updated_at: sr.updated_at, deleted: !!sr.deleted, sync_status: "synced" });
  }
  return true;
}

export const listRecords = (ownerId: string) =>
  db.records.where("owner_id").equals(ownerId).filter((r) => !r.deleted).reverse().sortBy("updated_at");

/** Clears offline copies (e.g. on sign-out) so patient data doesn't linger on shared devices. */
export const clearLocalRecords = () => db.records.clear();
