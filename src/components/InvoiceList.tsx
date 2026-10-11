import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PLAN_DISPLAY, formatMoney, type PlanCode } from "@/lib/billing";

interface Invoice { id: string; invoice_number: string; plan_code: string | null; amount_minor: number; currency: string; razorpay_payment_id: string; status: string; period_start: string | null; period_end: string | null; created_at: string }

/** Invoices are written only by the payment webhook; users can read their own. */
export default function InvoiceList({ email }: { email?: string }) {
  const [rows, setRows] = useState<Invoice[] | null>(null);
  const [open, setOpen] = useState<Invoice | null>(null);
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("invoices").select("*").order("created_at", { ascending: false })
      .then(({ data }: { data: Invoice[] | null }) => setRows(data ?? []));
  }, []);
  const planName = (c: string | null) => (c && PLAN_DISPLAY[c as PlanCode]?.name) || "Stroke Companion";

  return (
    <section className="glass rounded-xl p-4 space-y-3">
      <h2 className="font-semibold">Invoices</h2>
      {rows === null ? <p className="text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payments yet. An invoice appears here after each monthly or yearly charge.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.id} className="py-2 flex items-center justify-between gap-2 text-sm">
              <div><p className="font-medium">{planName(r.plan_code)}</p><p className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()} · {r.invoice_number}</p></div>
              <div className="flex items-center gap-2"><span className="font-semibold tabular-nums">{formatMoney(r.amount_minor, r.currency)}</span>
                <Button size="sm" variant="outline" className="min-h-11" onClick={() => setOpen(r)}>View</Button></div>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4" onClick={() => setOpen(null)}>
          <div className="bg-card text-card-foreground rounded-xl p-6 max-w-md w-full space-y-2 border border-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Invoice {open.invoice_number}</h3>
            <p className="text-sm">Stroke Companion</p>
            {email && <p className="text-sm">Billed to: {email}</p>}
            <p className="text-sm">Date: {new Date(open.created_at).toLocaleString()}</p>
            <p className="text-sm">Plan: {planName(open.plan_code)}</p>
            {open.period_end && <p className="text-sm">Period: {open.period_start ? new Date(open.period_start).toLocaleDateString() : "—"} to {new Date(open.period_end).toLocaleDateString()}</p>}
            <p className="text-sm">Payment ID: <span className="font-mono">{open.razorpay_payment_id}</span></p>
            <p className="text-sm">Status: {open.status}</p>
            <p className="text-xl font-bold tabular-nums">Total: {formatMoney(open.amount_minor, open.currency)}</p>
            <div className="flex gap-2 pt-2"><Button className="min-h-11" onClick={() => window.print()}>Print</Button><Button variant="outline" className="min-h-11" onClick={() => setOpen(null)}>Close</Button></div>
          </div>
        </div>
      )}
    </section>
  );
}
