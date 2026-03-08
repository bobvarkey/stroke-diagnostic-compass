import React, { useState, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, TrendingUp, Plus, Timer, Droplets as DropletIcon, ClipboardCheck, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Ban, Syringe, Droplets, Activity, ShieldAlert, Clock, Brain, Stethoscope, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckItem {
  id: string;
  label: string;
  detail?: string;
}

const PhaseCard: React.FC<{
  phase: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ phase, title, icon, color, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap: Record<string, string> = {
    red: "border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50/60 dark:from-red-950/20 to-background",
    amber: "border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50/60 dark:from-amber-950/20 to-background",
    blue: "border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50/60 dark:from-blue-950/20 to-background",
    emerald: "border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50/60 dark:from-emerald-950/20 to-background",
  };
  const headerMap: Record<string, string> = {
    red: "bg-red-100/60 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    amber: "bg-amber-100/60 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
    blue: "bg-blue-100/60 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    emerald: "bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
  };
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn("border-2", colorMap[color])}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className={cn("py-3 px-4", headerMap[color])}>
            <CardTitle className="flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold px-2 py-0.5">
                  PHASE {phase}
                </Badge>
                {icon}
                <span className="font-bold">{title}</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform shrink-0", open && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const ActionChecklist: React.FC<{ items: CheckItem[]; prefix: string }> = ({ items, prefix }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label
          key={item.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px]",
            checked[item.id]
              ? "bg-primary/5 border-primary/30"
              : "bg-muted/30 border-border hover:bg-muted/50"
          )}
        >
          <Checkbox
            checked={!!checked[item.id]}
            onCheckedChange={(v) => setChecked((p) => ({ ...p, [item.id]: !!v }))}
            className="mt-0.5"
          />
          <div>
            <span className={cn("text-sm font-medium", checked[item.id] && "line-through opacity-60")}>
              {item.label}
            </span>
            {item.detail && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

const WarningBox: React.FC<{ children: React.ReactNode; variant?: "danger" | "caution" }> = ({ children, variant = "danger" }) => (
  <div
    className={cn(
      "p-3 rounded-lg border-l-4 text-sm",
      variant === "danger"
        ? "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-800 dark:text-red-300"
        : "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-800 dark:text-amber-300"
    )}
  >
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  </div>
);
/* ─── Cryoprecipitate Dose Calculator ─── */
const CryoDoseCalculator: React.FC = () => {
  const [weight, setWeight] = useState(70);
  const [currentFib, setCurrentFib] = useState(75);
  const [targetFib, setTargetFib] = useState(150);

  const plasmaVolume = weight * 70; // mL
  const fibPerUnit = 250; // mg average
  const unitsNeeded = useMemo(() => {
    const raw = ((targetFib - currentFib) * plasmaVolume * 0.01) / fibPerUnit;
    return Math.max(0, Math.ceil(raw));
  }, [weight, currentFib, targetFib]);
  const volumeML = useMemo(() => unitsNeeded * 15, [unitsNeeded]); // ~15mL per unit

  const quickRef = [
    { fib: 100, t150: "8–10", t200: "12–15", vol: "~250 mL" },
    { fib: 75, t150: "12–15", t200: "16–20", vol: "~350 mL" },
    { fib: 50, t150: "16–20", t200: "22–25", vol: "~500 mL" },
    { fib: 25, t150: "20–25", t200: "25+", vol: "Switch to Fib concentrate" },
  ];

  return (
    <div className="p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50/80 dark:from-blue-950/30 to-background space-y-4">
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-700 text-white text-xs">CALCULATOR</Badge>
        <span className="font-bold text-sm">Cryoprecipitate Dose Calculator</span>
      </div>

      {/* Formula */}
      <div className="p-2 bg-muted/40 rounded text-xs font-mono text-center border">
        Units = [(Target − Current Fib) × Plasma Vol × 0.01] ÷ Fib/Unit
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold">Patient Weight</span>
            <span className="font-bold text-blue-700 dark:text-blue-300">{weight} kg</span>
          </div>
          <input
            type="range" min={30} max={150} step={1} value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full h-2 bg-blue-200 dark:bg-blue-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>30</span><span>150 kg</span></div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold">Current Fibrinogen</span>
            <span className="font-bold text-amber-700 dark:text-amber-300">{currentFib} mg/dL</span>
          </div>
          <input
            type="range" min={0} max={200} step={5} value={currentFib}
            onChange={(e) => setCurrentFib(Number(e.target.value))}
            className="w-full h-2 bg-amber-200 dark:bg-amber-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>0</span><span>200 mg/dL</span></div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold">Target Fibrinogen</span>
            <div className="flex gap-2">
              {[150, 200].map((t) => (
                <button
                  key={t}
                  onClick={() => setTargetFib(t)}
                  className={cn(
                    "px-3 py-0.5 rounded text-xs font-bold border transition-all",
                    targetFib === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-muted-foreground/30 text-muted-foreground hover:border-blue-400"
                  )}
                >
                  {t} mg/dL
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className={cn(
        "p-3 rounded-lg border-2 text-center",
        currentFib >= targetFib
          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
          : unitsNeeded > 20
          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
          : "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
      )}>
        {currentFib >= targetFib ? (
          <p className="text-green-700 dark:text-green-300 font-bold">✓ Fibrinogen already at target</p>
        ) : (
          <>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{unitsNeeded} units</p>
            <p className="text-xs text-muted-foreground mt-1">
              Volume: ~{volumeML} mL · Infuse over 30–60 min · Plasma Vol: {(plasmaVolume / 1000).toFixed(1)}L
            </p>
            {unitsNeeded > 20 && (
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-1">
                ⚠️ Consider fibrinogen concentrate if &gt;20 units needed
              </p>
            )}
          </>
        )}
      </div>

      {/* Quick Reference Table */}
      <div>
        <p className="text-xs font-semibold mb-2">Quick Reference (70 kg Adult)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-1.5 border-b text-left font-medium text-muted-foreground">Current Fib</th>
                <th className="p-1.5 border-b text-center font-medium text-muted-foreground">Target 150</th>
                <th className="p-1.5 border-b text-center font-medium text-muted-foreground">Target 200</th>
                <th className="p-1.5 border-b text-center font-medium text-muted-foreground">Volume</th>
              </tr>
            </thead>
            <tbody>
              {quickRef.map((row) => (
                <tr key={row.fib} className="border-b border-border hover:bg-muted/30">
                  <td className="p-1.5 font-semibold">{row.fib} mg/dL</td>
                  <td className="p-1.5 text-center">{row.t150}</td>
                  <td className="p-1.5 text-center">{row.t200}</td>
                  <td className="p-1.5 text-center text-muted-foreground">{row.vol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Dosing */}
      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
        <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">🚨 Emergency Dosing (No Lab Available)</p>
        <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
          <li><strong>Rule of 10s:</strong> 10 units ≈ +50–100 mg/dL fibrinogen in adults</li>
          <li><strong>Post-IVT ICH:</strong> Start 10–12 units if fibrinogen &lt;100 mg/dL or bleeding persists</li>
          <li><strong>Recheck:</strong> 30–60 min post-infusion, repeat if needed</li>
        </ul>
      </div>

      {/* Administration */}
      <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-1">
        <p className="font-bold">Administration Notes:</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
          <li>Dose: 1 unit/5–10 kg → infuse 10–20 mL/kg/hr</li>
          <li>ABO-compatible preferred</li>
          <li>Monitor: Post-infusion fibrinogen at 1 hour</li>
        </ul>
      </div>
    </div>
  );
};

// Fibrinogen Trend Tracker
interface FibEntry {
  time: string;
  value: number;
  timestamp: number;
}

const FibrinogenTrendTracker: React.FC = () => {
  const [entries, setEntries] = useState<FibEntry[]>([]);
  const [fibValue, setFibValue] = useState("");
  const [timeLabel, setTimeLabel] = useState("");

  const addEntry = useCallback(() => {
    const val = parseFloat(fibValue);
    if (isNaN(val) || val < 0 || val > 1000) return;
    const label = timeLabel.trim() || `T${entries.length}`;
    setEntries(prev => [...prev, { time: label, value: val, timestamp: Date.now() }]);
    setFibValue("");
    setTimeLabel("");
  }, [fibValue, timeLabel, entries.length]);

  const removeEntry = useCallback((idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const latestValue = entries.length > 0 ? entries[entries.length - 1].value : null;
  const atTarget = latestValue !== null && latestValue >= 150;

  return (
    <div className="p-3 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/10 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="font-bold text-sm">Fibrinogen Trend Tracker</span>
        {latestValue !== null && (
          <Badge className={atTarget ? "bg-emerald-600 text-white text-xs" : "bg-red-600 text-white text-xs"}>
            Latest: {latestValue} mg/dL {atTarget ? "✓ At Target" : "✗ Below Target"}
          </Badge>
        )}
      </div>

      {/* Input Row */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Time Point</Label>
          <Input
            placeholder="e.g. Baseline, 1hr"
            value={timeLabel}
            onChange={(e) => setTimeLabel(e.target.value)}
            className="h-8 text-xs w-28"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Fibrinogen (mg/dL)</Label>
          <Input
            type="number"
            placeholder="mg/dL"
            value={fibValue}
            onChange={(e) => setFibValue(e.target.value)}
            className="h-8 text-xs w-28"
            min={0}
            max={1000}
          />
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addEntry}>
          <Plus className="h-3 w-3 mr-1" /> Log
        </Button>
      </div>

      {/* Chart */}
      {entries.length >= 2 && (
        <div className="bg-background rounded-lg border p-2">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={entries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <RechartsTooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(val: number) => [`${val} mg/dL`, "Fibrinogen"]}
              />
              <ReferenceLine y={150} stroke="hsl(142, 71%, 45%)" strokeDasharray="6 3" label={{ value: "Target 150", position: "right", fontSize: 10, fill: "hsl(142, 71%, 45%)" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(217, 91%, 60%)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Entries Table */}
      {entries.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="border p-1.5 text-left">Time</th>
                <th className="border p-1.5 text-left">Fibrinogen</th>
                <th className="border p-1.5 text-left">Status</th>
                <th className="border p-1.5 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.timestamp} className={e.value >= 150 ? "bg-emerald-50/50 dark:bg-emerald-950/10" : "bg-red-50/50 dark:bg-red-950/10"}>
                  <td className="border p-1.5 font-medium">{e.time}</td>
                  <td className="border p-1.5">{e.value} mg/dL</td>
                  <td className="border p-1.5">
                    <Badge variant="outline" className={`text-[10px] ${e.value >= 150 ? "border-emerald-500 text-emerald-700 dark:text-emerald-400" : "border-red-500 text-red-700 dark:text-red-400"}`}>
                      {e.value >= 150 ? "≥150 ✓" : `${150 - e.value} below target`}
                    </Badge>
                  </td>
                  <td className="border p-1.5">
                    <button onClick={() => removeEntry(i)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-xs text-muted-foreground italic">Log serial fibrinogen levels to track progress toward the 150 mg/dL target.</p>
      )}
    </div>
  );
};

// Blood Product Infusion Calculator with Order Summary
const PRODUCTS = [
  { id: "cryo", label: "Cryoprecipitate", volumePerUnit: 15, defaultRate: 200, rateRange: [100, 300], notes: "~15 mL/unit pooled; infuse over 30–60 min" },
  { id: "platelets", label: "Platelets (Apheresis)", volumePerUnit: 250, defaultRate: 300, rateRange: [150, 500], notes: "~250 mL/unit; infuse over 30–60 min" },
  { id: "platelet_random", label: "Platelets (Random Donor)", volumePerUnit: 50, defaultRate: 300, rateRange: [150, 500], notes: "~50 mL/unit; pool 6–8 units" },
  { id: "ffp", label: "FFP", volumePerUnit: 250, defaultRate: 200, rateRange: [100, 400], notes: "~250 mL/unit; infuse over 30–60 min per unit" },
] as const;

const NURSING_CHECKS = [
  { id: "abo", label: "Verify ABO compatibility", detail: "Two-person verification of patient ID and blood product label" },
  { id: "consent", label: "Confirm transfusion consent on file", detail: "Or emergency exception documented" },
  { id: "baseline", label: "Baseline vitals obtained", detail: "T, HR, BP, RR, SpO2 before starting infusion" },
  { id: "iv", label: "Adequate IV access confirmed", detail: "18–20G peripheral or central line; use blood tubing with filter" },
  { id: "slow_start", label: "Start slow for first 15 min", detail: "Infuse at 50 mL/hr × 15 min, then increase to ordered rate" },
  { id: "vitals_15", label: "Vitals q15 min × first hour", detail: "Then q30 min for remainder of infusion" },
  { id: "reaction", label: "Monitor for transfusion reactions", detail: "Fever, rigors, urticaria, dyspnea, hypotension, back/flank pain" },
  { id: "post_vitals", label: "Post-infusion vitals at 1 hour", detail: "Document completion time and any adverse events" },
];

interface OrderedProduct {
  productId: string;
  units: number;
  rate: number;
}

const TransfusionReactionProtocol: React.FC = () => {
  const reactions = [
    {
      type: "Febrile Non-Hemolytic",
      color: "amber",
      signs: "Temperature rise ≥1°C, rigors, chills (no hemolysis)",
      frequency: "Most common (1–3%)",
      steps: [
        "SLOW or STOP the infusion",
        "Assess vitals: T, HR, BP, RR, SpO2",
        "Administer Acetaminophen 650 mg PO/PR",
        "Consider Meperidine 25–50 mg IV for severe rigors",
        "If symptoms resolve in 30 min → may resume at slower rate",
        "If symptoms persist or worsen → STOP infusion, send blood cultures + transfusion reaction workup",
      ],
    },
    {
      type: "Allergic / Urticarial",
      color: "blue",
      signs: "Urticaria, pruritus, flushing, mild angioedema",
      frequency: "Common (1–3%)",
      steps: [
        "STOP the infusion",
        "Administer Diphenhydramine 25–50 mg IV",
        "Mild urticaria only → may resume after symptoms resolve",
        "If angioedema, wheezing, or hypotension → treat as ANAPHYLAXIS:",
        "  → Epinephrine 0.3 mg IM (1:1000) — repeat q5–15 min PRN",
        "  → Normal saline bolus 500–1000 mL IV",
        "  → Methylprednisolone 125 mg IV",
        "  → Albuterol nebulizer for bronchospasm",
      ],
    },
    {
      type: "Acute Hemolytic (ABO Incompatibility)",
      color: "red",
      signs: "Fever, flank/back pain, dark urine, hypotension, DIC, hemoglobinuria",
      frequency: "Rare but FATAL (~1:76,000; mortality 10–40%)",
      steps: [
        "STOP INFUSION IMMEDIATELY — do NOT resume",
        "Disconnect tubing; maintain IV access with NS",
        "Send STAT: Direct Coombs, haptoglobin, LDH, free Hgb, UA, DIC panel",
        "Return blood bag + tubing to blood bank for re-crossmatch",
        "Aggressive IV hydration: NS 200–300 mL/hr to maintain UOP >1 mL/kg/hr",
        "Monitor for DIC: PT, aPTT, fibrinogen, D-dimer q4–6h",
        "Consider vasopressors if hemodynamically unstable",
        "Notify blood bank + attending physician IMMEDIATELY",
      ],
    },
    {
      type: "TRALI (Transfusion-Related Acute Lung Injury)",
      color: "violet",
      signs: "Acute dyspnea, hypoxemia (SpO2 <90%), bilateral pulmonary infiltrates on CXR within 6 hrs of transfusion; NO evidence of circulatory overload",
      frequency: "Incidence ~1:5,000; leading cause of transfusion-related death",
      steps: [
        "STOP INFUSION IMMEDIATELY",
        "Supportive care: High-flow O2, consider BIPAP/CPAP",
        "Intubate + mechanical ventilation if PaO2/FiO2 <200 (use lung-protective strategy: TV 6 mL/kg IBW)",
        "AVOID diuretics — this is NON-cardiogenic pulmonary edema",
        "Send STAT: CXR (bilateral infiltrates), ABG, BNP (should be LOW/normal)",
        "Notify blood bank — donor implicated products must be quarantined",
        "Supportive IV fluids if hypotensive (NOT volume overload)",
        "Most cases resolve within 48–72 hours with supportive care",
        "Report to blood bank for donor HLA/HNA antibody testing",
      ],
    },
    {
      type: "TACO (Transfusion-Associated Circulatory Overload)",
      color: "teal",
      signs: "Dyspnea, orthopnea, JVD, peripheral edema, hypertension, elevated BNP, pulmonary edema on CXR",
      frequency: "Common (1–8%); highest risk in elderly, cardiac/renal disease, rapid infusion",
      steps: [
        "STOP or SLOW the infusion",
        "Sit patient UPRIGHT (head of bed >45°)",
        "Administer Furosemide 20–40 mg IV (titrate to response)",
        "Apply supplemental O2 to maintain SpO2 >92%",
        "Send STAT: BNP/NT-proBNP (elevated = TACO), CXR, ABG",
        "Strict I/O monitoring — target negative fluid balance",
        "Consider BIPAP/CPAP if persistent respiratory distress",
        "Reassess volume status before resuming ANY transfusion",
        "Future transfusions: slower rate (1 mL/kg/hr), pre-medicate with diuretics, single-unit orders",
      ],
    },
  ];

  const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    amber: {
      border: "border-amber-400 dark:border-amber-600",
      bg: "bg-amber-50/60 dark:bg-amber-950/20",
      text: "text-amber-800 dark:text-amber-300",
      badge: "bg-amber-600 text-white",
    },
    blue: {
      border: "border-blue-400 dark:border-blue-600",
      bg: "bg-blue-50/60 dark:bg-blue-950/20",
      text: "text-blue-800 dark:text-blue-300",
      badge: "bg-blue-600 text-white",
    },
    red: {
      border: "border-red-400 dark:border-red-600",
      bg: "bg-red-50/60 dark:bg-red-950/20",
      text: "text-red-800 dark:text-red-300",
      badge: "bg-red-600 text-white",
    },
    violet: {
      border: "border-violet-400 dark:border-violet-600",
      bg: "bg-violet-50/60 dark:bg-violet-950/20",
      text: "text-violet-800 dark:text-violet-300",
      badge: "bg-violet-600 text-white",
    },
    teal: {
      border: "border-teal-400 dark:border-teal-600",
      bg: "bg-teal-50/60 dark:bg-teal-950/20",
      text: "text-teal-800 dark:text-teal-300",
      badge: "bg-teal-600 text-white",
    },
  };

  return (
    <div className="p-3 rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-950/10 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <span className="font-bold text-sm">Transfusion Reaction Protocol</span>
        <Badge className="bg-orange-600 text-white text-xs">FLOWCHART</Badge>
      </div>

      {/* Universal First Response */}
      <div className="p-3 rounded-lg border-2 border-foreground/20 bg-muted/50 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" /> Universal First Response (ALL Reactions)
        </p>
        <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
          <li><strong>STOP</strong> the transfusion</li>
          <li>Keep IV line open with <strong>Normal Saline</strong></li>
          <li>Check vitals: <strong>T, HR, BP, RR, SpO2</strong></li>
          <li>Verify patient ID ↔ blood product label match</li>
          <li>Notify blood bank + physician</li>
        </ol>
      </div>

      {/* Reaction-specific protocols */}
      <div className="space-y-3">
        {reactions.map((rxn) => {
          const colors = colorMap[rxn.color];
          return (
            <div key={rxn.type} className={cn("p-3 rounded-lg border-2 space-y-2", colors.border, colors.bg)}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("text-xs", colors.badge)}>{rxn.type}</Badge>
                <span className="text-[10px] text-muted-foreground">{rxn.frequency}</span>
              </div>
              <div className="p-2 rounded bg-background/60 border text-xs">
                <span className="font-semibold">Signs: </span>
                <span className="text-muted-foreground">{rxn.signs}</span>
              </div>
              <div className="space-y-1">
                <p className={cn("text-xs font-bold", colors.text)}>Step-by-Step Management:</p>
                <ol className="text-xs space-y-1 list-decimal list-inside">
                  {rxn.steps.map((step, i) => (
                    <li key={i} className={step.startsWith("  →") ? "ml-4 list-none text-muted-foreground" : ""}>
                      {step.startsWith("  →") ? step : step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Differentiators Table */}
      <div className="overflow-x-auto">
        <p className="text-xs font-bold mb-1.5">Quick Differentiation Guide</p>
        <table className="w-full text-[10px] sm:text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-1.5 text-left">Feature</th>
              <th className="border p-1.5 text-left">Febrile</th>
              <th className="border p-1.5 text-left">Allergic</th>
              <th className="border p-1.5 text-left">Hemolytic</th>
              <th className="border p-1.5 text-left">TRALI</th>
              <th className="border p-1.5 text-left">TACO</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Fever", "Yes", "Rare", "Yes (high)", "Possible", "No"],
              ["Rash/Hives", "No", "Yes", "No", "No", "No"],
              ["Hypotension", "Rare", "If anaphylaxis", "Yes", "Yes", "No (HTN)"],
              ["Dyspnea", "No", "If anaphylaxis", "Rare", "YES — acute", "YES — acute"],
              ["Back/Flank Pain", "No", "No", "YES", "No", "No"],
              ["Dark Urine", "No", "No", "YES", "No", "No"],
              ["CXR Infiltrates", "No", "No", "No", "Bilateral", "Pulm edema"],
              ["BNP Level", "Normal", "Normal", "Normal", "Normal/Low", "ELEVATED"],
              ["JVD/Edema", "No", "No", "No", "No", "YES"],
              ["Diuretics?", "N/A", "N/A", "N/A", "AVOID", "YES — first-line"],
              ["Can Resume?", "Maybe", "Mild only", "NEVER", "NEVER", "Cautiously, slow"],
              ["Mortality", "Very low", "Low", "HIGH", "5–10%", "Low if treated"],
            ].map(([feature, feb, allerg, hemo, trali, taco]) => (
              <tr key={feature} className="hover:bg-muted/30">
                <td className="border p-1.5 font-medium">{feature}</td>
                <td className="border p-1.5">{feb}</td>
                <td className="border p-1.5">{allerg}</td>
                <td className="border p-1.5 font-semibold">{hemo}</td>
                <td className="border p-1.5">{trali}</td>
                <td className="border p-1.5">{taco}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TRALI vs TACO Critical Distinction */}
      <div className="p-3 rounded-lg border-2 border-foreground/20 bg-muted/40 space-y-2">
        <p className="text-xs font-bold flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" /> TRALI vs TACO — Critical Distinction
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded border border-violet-300 dark:border-violet-700 bg-violet-50/40 dark:bg-violet-950/10">
            <p className="font-bold text-violet-800 dark:text-violet-300 mb-1">TRALI = Non-cardiogenic</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              <li>Normal/low BNP</li>
              <li>Normal cardiac filling pressures</li>
              <li>Do NOT give diuretics</li>
              <li>Caused by donor antibodies → lung injury</li>
            </ul>
          </div>
          <div className="p-2 rounded border border-teal-300 dark:border-teal-700 bg-teal-50/40 dark:bg-teal-950/10">
            <p className="font-bold text-teal-800 dark:text-teal-300 mb-1">TACO = Cardiogenic</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              <li>Elevated BNP (&gt;1.5× baseline)</li>
              <li>Elevated cardiac filling pressures</li>
              <li>Diuretics are FIRST-LINE</li>
              <li>Caused by volume overload → pulm edema</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const BloodProductInfusionCalculator: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>(PRODUCTS[0].id);
  const [units, setUnits] = useState("10");
  const [rateOverride, setRateOverride] = useState("");
  const [nursingChecks, setNursingChecks] = useState<Record<string, boolean>>({});
  const [orders, setOrders] = useState<OrderedProduct[]>([]);

  const product = PRODUCTS.find(p => p.id === selectedProduct)!;
  const unitsNum = parseInt(units) || 0;
  const totalVolume = unitsNum * product.volumePerUnit;
  const rate = parseInt(rateOverride) || product.defaultRate;
  const durationMin = rate > 0 ? Math.ceil((totalVolume / rate) * 60) : 0;
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;

  const toggleCheck = useCallback((id: string) => {
    setNursingChecks(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const addToOrder = useCallback(() => {
    if (unitsNum <= 0) return;
    setOrders(prev => {
      const existing = prev.findIndex(o => o.productId === selectedProduct);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { productId: selectedProduct, units: unitsNum, rate };
        return updated;
      }
      return [...prev, { productId: selectedProduct, units: unitsNum, rate }];
    });
  }, [selectedProduct, unitsNum, rate]);

  const removeOrder = useCallback((idx: number) => {
    setOrders(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const checkedCount = Object.values(nursingChecks).filter(Boolean).length;

  // Order summary calculations
  const orderSummary = useMemo(() => {
    let totalVol = 0;
    let totalDur = 0;
    const items = orders.map(o => {
      const p = PRODUCTS.find(pr => pr.id === o.productId)!;
      const vol = o.units * p.volumePerUnit;
      const dur = Math.ceil((vol / o.rate) * 60);
      totalVol += vol;
      totalDur += dur;
      return { ...o, label: p.label, volume: vol, duration: dur };
    });
    return { items, totalVol, totalDur };
  }, [orders]);

  return (
    <div className="p-3 rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-purple-50/30 dark:bg-purple-950/10 space-y-3">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <span className="font-bold text-sm">Blood Product Infusion Calculator</span>
      </div>

      {/* Inputs */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Product</Label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="h-8 text-xs w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCTS.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-xs">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Units</Label>
          <Input
            type="number"
            value={units}
            onChange={e => setUnits(e.target.value)}
            className="h-8 text-xs w-20"
            min={1}
            max={50}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Rate (mL/hr)</Label>
          <Input
            type="number"
            placeholder={`${product.defaultRate}`}
            value={rateOverride}
            onChange={e => setRateOverride(e.target.value)}
            className="h-8 text-xs w-24"
            min={50}
            max={999}
          />
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addToOrder}>
          <Plus className="h-3 w-3 mr-1" /> Add to Order
        </Button>
      </div>

      {/* Results */}
      {unitsNum > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-background border text-center">
            <p className="text-[10px] text-muted-foreground">Total Volume</p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{totalVolume} <span className="text-xs font-normal">mL</span></p>
          </div>
          <div className="p-2 rounded-lg bg-background border text-center">
            <p className="text-[10px] text-muted-foreground">Flow Rate</p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{rate} <span className="text-xs font-normal">mL/hr</span></p>
          </div>
          <div className="p-2 rounded-lg bg-background border text-center">
            <p className="text-[10px] text-muted-foreground">Duration</p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {hours > 0 && `${hours}h `}{mins}m
            </p>
          </div>
        </div>
      )}

      {/* Product Info */}
      <div className="p-2 rounded bg-muted/40 border text-xs text-muted-foreground flex items-start gap-2">
        <DropletIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <div>
          <p>{product.notes}</p>
          <p className="mt-0.5">Rate range: {product.rateRange[0]}–{product.rateRange[1]} mL/hr</p>
        </div>
      </div>

      {/* Combined Order Summary */}
      {orders.length > 0 && (
        <div className="p-3 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm">Combined Order Summary</span>
            <Badge variant="outline" className="text-[10px]">{orders.length} product{orders.length > 1 ? "s" : ""}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border p-1.5 text-left">Product</th>
                  <th className="border p-1.5 text-left">Units</th>
                  <th className="border p-1.5 text-left">Volume</th>
                  <th className="border p-1.5 text-left">Rate</th>
                  <th className="border p-1.5 text-left">Duration</th>
                  <th className="border p-1.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {orderSummary.items.map((item, i) => (
                  <tr key={item.productId}>
                    <td className="border p-1.5 font-medium">{item.label}</td>
                    <td className="border p-1.5">{item.units}</td>
                    <td className="border p-1.5">{item.volume} mL</td>
                    <td className="border p-1.5">{item.rate} mL/hr</td>
                    <td className="border p-1.5">{Math.floor(item.duration / 60) > 0 ? `${Math.floor(item.duration / 60)}h ` : ""}{item.duration % 60}m</td>
                    <td className="border p-1.5">
                      <button onClick={() => removeOrder(i)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 rounded-lg bg-background border text-center">
              <p className="text-[10px] text-muted-foreground">Total Volume (All Products)</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{orderSummary.totalVol} <span className="text-xs font-normal">mL</span></p>
            </div>
            <div className="p-2 rounded-lg bg-background border text-center">
              <p className="text-[10px] text-muted-foreground">Total Infusion Time (Sequential)</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {Math.floor(orderSummary.totalDur / 60) > 0 && `${Math.floor(orderSummary.totalDur / 60)}h `}{orderSummary.totalDur % 60}m
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nursing Infusion Monitoring Checklist */}
      <div className="p-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-sm">Nursing Infusion Monitoring</span>
          </div>
          <Badge variant="outline" className={`text-[10px] ${checkedCount === NURSING_CHECKS.length ? "border-emerald-500 text-emerald-700 dark:text-emerald-400" : "border-amber-500 text-amber-700 dark:text-amber-400"}`}>
            {checkedCount}/{NURSING_CHECKS.length} complete
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {NURSING_CHECKS.map(check => (
            <label
              key={check.id}
              className={cn(
                "flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors text-xs",
                nursingChecks[check.id]
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700"
                  : "bg-background border-border hover:bg-muted/50"
              )}
            >
              <Checkbox
                checked={!!nursingChecks[check.id]}
                onCheckedChange={() => toggleCheck(check.id)}
                className="mt-0.5"
              />
              <div>
                <p className={cn("font-medium", nursingChecks[check.id] && "line-through text-muted-foreground")}>{check.label}</p>
                <p className="text-[10px] text-muted-foreground">{check.detail}</p>
              </div>
            </label>
          ))}
        </div>
        {checkedCount === NURSING_CHECKS.length && (
          <div className="p-2 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-300 font-medium text-center">
            ✓ All pre-transfusion and monitoring checks complete
          </div>
        )}

        {/* Transfusion Reaction Protocol — appears when "reaction" checkbox is checked */}
        {nursingChecks["reaction"] && (
          <TransfusionReactionProtocol />
        )}
      </div>

      {/* Quick Reference */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border p-1.5 text-left">Product</th>
              <th className="border p-1.5 text-left">Vol/Unit</th>
              <th className="border p-1.5 text-left">Typical Rate</th>
              <th className="border p-1.5 text-left">Typical Duration</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(p => {
              const typVol = p.id === "cryo" ? 10 * p.volumePerUnit : p.id === "platelet_random" ? 6 * p.volumePerUnit : p.volumePerUnit;
              const typDur = Math.ceil((typVol / p.defaultRate) * 60);
              return (
                <tr key={p.id} className={p.id === selectedProduct ? "bg-purple-50/50 dark:bg-purple-950/10 font-medium" : ""}>
                  <td className="border p-1.5">{p.label}</td>
                  <td className="border p-1.5">{p.volumePerUnit} mL</td>
                  <td className="border p-1.5">{p.defaultRate} mL/hr</td>
                  <td className="border p-1.5">{typDur} min ({p.id === "cryo" ? "10 units" : p.id === "platelet_random" ? "6 units" : "1 unit"})</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PostThrombolysisICHManagement: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-red-500 dark:border-red-700 bg-gradient-to-br from-red-50 dark:from-red-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-red-100/50 dark:bg-red-900/30">
            <CardTitle className="flex items-center justify-between text-red-800 dark:text-red-300">
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <ShieldAlert className="h-5 w-5" />
                Post-IV Thrombolysis Hemorrhage Management
                <Badge className="bg-red-600 text-white text-xs">CRITICAL</Badge>
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform shrink-0", isOpen && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Protocol Summary Banner */}
            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
              <p className="font-semibold mb-1">Protocol: 6-Step Management</p>
              <div className="flex flex-wrap gap-2">
                {["SUSPECT", "DIAGNOSE", "REVERSE", "SUPPORT", "EVALUATE", "MAINTAIN"].map((s, i) => (
                  <Badge key={s} variant="outline" className="text-xs">
                    {i + 1}. {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* PHASE 1 */}
            <PhaseCard phase={1} title="Recognition & Immediate Action" icon={<AlertTriangle className="h-4 w-4" />} color="red">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-2">Clinical Suspicion Triggers:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Altered consciousness", "Motor deterioration", "New/worsened headache", "Nausea/vomiting", "Acute BP spike"].map((t) => (
                      <div key={t} className="flex items-center gap-1.5 text-xs p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                        <span className="text-red-500">⚠</span> {t}
                      </div>
                    ))}
                  </div>
                </div>

                <ActionChecklist
                  prefix="p1"
                  items={[
                    { id: "p1-stop", label: "STOP the infusion immediately", detail: "Discontinue IV tPA/alteplase or tenecteplase if still running" },
                    { id: "p1-compress", label: "Apply direct compression to visible bleeding sites", detail: "IV sites, abrasions, epistaxis — consider ice" },
                  ]}
                />
              </div>
            </PhaseCard>

            {/* PHASE 2 */}
            <PhaseCard phase={2} title="Diagnostic Workup (STAT)" icon={<Brain className="h-4 w-4" />} color="amber">
              <ActionChecklist
                prefix="p2"
                items={[
                  { id: "p2-ct", label: "STAT Non-Contrast CT Head", detail: "Confirm presence and extent of intracranial hemorrhage" },
                  { id: "p2-cbc", label: "STAT CBC", detail: "Complete blood count" },
                  { id: "p2-pt", label: "STAT PT/INR + Type & Crossmatch" },
                  { id: "p2-fibrinogen", label: "STAT Fibrinogen Level", detail: "Critical decision driver — determines reversal strategy" },
                ]}
              />
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border text-sm">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  🔑 Fibrinogen is the critical decision driver — tPA depletes fibrinogen, so reversal must replace substrate, not just factors.
                </p>
              </div>
            </PhaseCard>

            {/* PHASE 3 */}
            <PhaseCard phase={3} title="Reversing the Fibrinolytic State" icon={<Syringe className="h-4 w-4" />} color="blue">
              <WarningBox variant="danger">
                <p className="font-bold">Do NOT use 4-Factor PCC or rFVIIa for routine tPA reversal</p>
                <p className="mt-1 text-xs">PCC provides clotting factors but NO fibrinogen substrate. Without fibrinogen replacement (cryoprecipitate), PCC factors have no substrate to form a clot. High thrombotic risk with no definitive benefit.</p>
              </WarningBox>

              <div className="space-y-3 mt-3">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">First-Line Reversal Agents:</p>

                {/* Cryoprecipitate */}
                <div className="p-3 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600 text-white text-xs">PRIMARY</Badge>
                    <span className="font-bold text-sm">Cryoprecipitate</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Dose:</span> 10 units empirically
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Target:</span> Fibrinogen &gt; 150 mg/dL
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Mechanism:</span> Replaces fibrinogen, Factor VIII, vWF
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Administer additional doses as needed to reach and maintain target.</p>
                </div>

                {/* Cryoprecipitate Dose Calculator */}
                <CryoDoseCalculator />

                {/* Fibrinogen Trend Tracker */}
                <FibrinogenTrendTracker />

                {/* Blood Product Infusion Calculator */}
                <BloodProductInfusionCalculator />

                {/* Platelets */}
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">ADJUVANT</Badge>
                    <span className="font-bold text-sm">Platelets</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Dose:</span> 6–8 units immediately
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Indication:</span> Thrombocytopenia or platelet dysfunction
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Adjuvant to cryoprecipitate — tPA primarily affects fibrinogen but platelet function can be compromised.</p>
                </div>

                {/* Alternative */}
                <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20">
                  <p className="text-sm font-semibold mb-2">Alternative (if Cryoprecipitate Unavailable):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2 rounded border bg-background text-xs space-y-1">
                      <p className="font-bold">Tranexamic Acid (TXA)</p>
                      <p>1000 mg IV over 10 minutes</p>
                      <p className="text-muted-foreground">Or 10 mg/kg weight-based</p>
                    </div>
                    <div className="p-2 rounded border bg-background text-xs space-y-1">
                      <p className="font-bold">Aminocaproic Acid (Amicar)</p>
                      <p>4–5 g IV over 1 hour</p>
                      <p className="text-muted-foreground">Followed by 1 g/hr until bleeding controlled</p>
                    </div>
                  </div>
                </div>

                {/* Warfarin Exception */}
                <WarningBox variant="caution">
                  <p className="font-bold">Exception: Prior Warfarin Patient</p>
                  <p className="mt-1 text-xs">If patient was on Warfarin prior to tPA: Administer <strong>4-Factor PCC + Vitamin K</strong>. FFP is an alternative if PCC unavailable (inferior due to volume/speed).</p>
                </WarningBox>
              </div>

              {/* Blood Product Selection Matrix */}
              <div className="mt-4">
                <p className="text-sm font-bold mb-2">Blood Product Selection Matrix:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-2 text-left">Product</th>
                        <th className="border p-2 text-left">Primary Indication</th>
                        <th className="border p-2 text-left">Onset</th>
                        <th className="border p-2 text-left">Key Limitations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Cryoprecipitate", "First-line for tPA (Fibrinogen)", "Rapid", "Transfusion risk"],
                        ["4-Factor PCC", "First-line for Warfarin ONLY", "5–15 min", "No fibrinogen content"],
                        ["FFP", "Second-line alternative", "1–4 hours", "Volume overload risk"],
                        ["Platelets", "Thrombocytopenia", "N/A", "Potential harm in routine use"],
                        ["rFVIIa", "Fondaparinux reversal", "Rapid", "High thrombotic risk"],
                      ].map(([product, indication, onset, limitation]) => (
                        <tr key={product} className="hover:bg-muted/30">
                          <td className="border p-2 font-medium">{product}</td>
                          <td className="border p-2">{indication}</td>
                          <td className="border p-2">{onset}</td>
                          <td className="border p-2">{limitation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </PhaseCard>

            {/* PHASE 4 */}
            <PhaseCard phase={4} title="Ongoing Medical & Surgical Management" icon={<HeartPulse className="h-4 w-4" />} color="emerald">
              <div className="space-y-4">
                {/* BP Management */}
                <div>
                  <p className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Blood Pressure Management
                  </p>
                  <ActionChecklist
                    prefix="p4bp"
                    items={[
                      { id: "p4-bp-lower", label: "Lower BP if > 185/110 mmHg", detail: "Aggressively manage to prevent hematoma expansion" },
                      { id: "p4-bp-monitor", label: "Check BP & neuro status every 15 minutes" },
                    ]}
                  />
                </div>

                {/* Surgical Evaluation */}
                <div>
                  <p className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" /> Surgical Evaluation
                  </p>
                  <ActionChecklist
                    prefix="p4surg"
                    items={[
                      { id: "p4-surg-eval", label: "Consider neurosurgical evacuation", detail: "Cerebellar hemorrhage, severe mass effect, or ongoing deterioration" },
                    ]}
                  />
                  <WarningBox variant="danger">
                    <p className="font-bold">CRITICAL: Surgery ONLY after sufficient reversal</p>
                    <p className="text-xs mt-1">Surgical evacuation must only be considered AFTER sufficient reversal with cryoprecipitate and platelets. Surgery before reversal = uncontrollable bleeding.</p>
                  </WarningBox>
                </div>

                {/* Post-Bleed Antiplatelet */}
                <div>
                  <p className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Post-Bleed Antithrombotic Therapy
                  </p>
                  <ActionChecklist
                    prefix="p4anti"
                    items={[
                      { id: "p4-hold", label: "HOLD all antiplatelet/anticoagulant therapies ≥ 24 hours" },
                      { id: "p4-restart", label: "Restart only after clinical stabilization", detail: "Confirmed by repeat brain imaging excluding expansion — case-by-case risk assessment" },
                    ]}
                  />
                </div>
              </div>
            </PhaseCard>

            {/* Agent Comparison Table */}
            <Collapsible>
              <Card className="border">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Fibrinolytic Agent Comparison (Tenecteplase vs Alteplase)
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="border p-2 text-left">Property</th>
                            <th className="border p-2 text-left">Tenecteplase</th>
                            <th className="border p-2 text-left">Alteplase</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["Dose (AIS)", "0.25 mg/kg (max 25 mg)", "0.9 mg/kg (max 90 mg)"],
                            ["Administration", "Single 5-sec IV bolus", "10% bolus + 60-min infusion"],
                            ["Fibrin Specificity", "15× higher than alteplase", "Standard"],
                            ["sICH Rate", "~1%", "1–2.7%"],
                            ["Fibrinogen Depletion", "Less consumption", "Significant hypofibrinogenemia"],
                            ["Reperfusion (>50%)", "22%", "10%"],
                            ["mRS 0-1 at 90d", "Superior (cOR 1.7)", "63%"],
                          ].map(([prop, tnk, tpa]) => (
                            <tr key={prop} className="hover:bg-muted/30">
                              <td className="border p-2 font-medium">{prop}</td>
                              <td className="border p-2">{tnk}</td>
                              <td className="border p-2">{tpa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Data from StatPearls, ASSENT-2, and coagulation/fibrinolysis studies of TNK vs alteplase in AIS.
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PostThrombolysisICHManagement;
