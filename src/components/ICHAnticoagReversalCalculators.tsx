import React, { useState, useMemo } from "react";
import { Calculator, AlertTriangle, Syringe, Clock, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

type AgentTab = "pcc" | "idarucizumab" | "andexanet" | "protamine" | "vitK" | "desmopressin";

const ICHAnticoagReversalCalculators = ({ weight: initialWeight = 70 }: { weight?: number }) => {
  const [activeTab, setActiveTab] = useState<AgentTab>("pcc");
  const [weight, setWeight] = useState(initialWeight);
  const [inr, setInr] = useState(3.0);
  const [lastDoseHrs, setLastDoseHrs] = useState(4);
  const [fxaAgent, setFxaAgent] = useState<"rivaroxaban" | "apixaban" | "edoxaban">("rivaroxaban");
  const [heparinType, setHeparinType] = useState<"ufh" | "lmwh">("ufh");
  const [heparinUnits, setHeparinUnits] = useState(5000);
  const [timeSinceHeparin, setTimeSinceHeparin] = useState(1);

  // 4F-PCC for VKA (Warfarin) - ICH-specific INR tiers
  const pccDose = useMemo(() => {
    if (inr < 1.3) return { tier: "INR <1.3", unitsPerKg: 0, maxUnits: 0, note: "No reversal indicated" };
    if (inr < 2.0) return { tier: "INR 1.3–1.9", unitsPerKg: 15, maxUnits: 2500, note: "Class 2b — consider reversal" };
    if (inr < 4.0) return { tier: "INR 2.0–3.9", unitsPerKg: 25, maxUnits: 2500, note: "Class 1 — rapid reversal" };
    if (inr < 6.0) return { tier: "INR 4.0–5.9", unitsPerKg: 35, maxUnits: 3500, note: "Class 1 — rapid reversal" };
    return { tier: "INR ≥6.0", unitsPerKg: 50, maxUnits: 5000, note: "Class 1 — rapid reversal" };
  }, [inr]);

  const pccTotalUnits = useMemo(() => {
    const raw = pccDose.unitsPerKg * weight;
    return Math.min(raw, pccDose.maxUnits);
  }, [pccDose, weight]);

  const pccInfusionRate = useMemo(() => Math.round(0.12 * weight * 60), [weight]); // units/min approximation
  const pccInfusionTime = useMemo(() => pccTotalUnits > 0 ? Math.ceil(pccTotalUnits / pccInfusionRate) : 0, [pccTotalUnits, pccInfusionRate]);

  // Vitamin K dose — fixed 10mg IV for ICH
  const vitKDose = { dose: 10, route: "IV", infusionTime: "20–60 min" };

  // Idarucizumab (Praxbind) — fixed 5g (2 × 2.5g vials)
  const idarucizumabDose = { totalDose: 5, vials: 2, vialSize: 2.5, route: "IV push or infusion", time: "≤15 min" };

  // Andexanet alfa — dose depends on last FXa dose and timing
  const andexanetDose = useMemo(() => {
    const isHighDose = (fxaAgent === "rivaroxaban" && lastDoseHrs <= 8) ||
      (fxaAgent === "apixaban" && lastDoseHrs <= 8) ||
      (fxaAgent === "edoxaban" && lastDoseHrs <= 8);

    if (fxaAgent === "rivaroxaban") {
      if (lastDoseHrs <= 8) {
        return { regimen: "High Dose", bolus: 800, bolusRate: "30 mg/min", bolusDuration: "~27 min", infusion: 960, infusionRate: "8 mg/min", infusionDuration: "120 min", totalMg: 1760 };
      }
      return { regimen: "Low Dose", bolus: 400, bolusRate: "30 mg/min", bolusDuration: "~13 min", infusion: 480, infusionRate: "4 mg/min", infusionDuration: "120 min", totalMg: 880 };
    }
    if (fxaAgent === "apixaban") {
      if (lastDoseHrs <= 8) {
        return { regimen: "Low Dose", bolus: 400, bolusRate: "30 mg/min", bolusDuration: "~13 min", infusion: 480, infusionRate: "4 mg/min", infusionDuration: "120 min", totalMg: 880 };
      }
      return { regimen: "Low Dose", bolus: 400, bolusRate: "30 mg/min", bolusDuration: "~13 min", infusion: 480, infusionRate: "4 mg/min", infusionDuration: "120 min", totalMg: 880 };
    }
    // edoxaban
    if (lastDoseHrs <= 8) {
      return { regimen: "High Dose", bolus: 800, bolusRate: "30 mg/min", bolusDuration: "~27 min", infusion: 960, infusionRate: "8 mg/min", infusionDuration: "120 min", totalMg: 1760 };
    }
    return { regimen: "Low Dose", bolus: 400, bolusRate: "30 mg/min", bolusDuration: "~13 min", infusion: 480, infusionRate: "4 mg/min", infusionDuration: "120 min", totalMg: 880 };
  }, [fxaAgent, lastDoseHrs]);

  // Protamine — dose depends on heparin type and time since last dose
  const protamineDose = useMemo(() => {
    if (heparinType === "ufh") {
      let ratio = 1.0; // 1 mg per 100 units
      if (timeSinceHeparin > 0.5 && timeSinceHeparin <= 1) ratio = 0.5;
      if (timeSinceHeparin > 1 && timeSinceHeparin <= 2) ratio = 0.375;
      if (timeSinceHeparin > 2) ratio = 0.25;
      const dose = Math.min((heparinUnits / 100) * ratio, 50);
      return { dose: Math.round(dose * 10) / 10, maxDose: 50, rate: "≤5 mg/min (≤20 mg over any 10 min)", note: `${ratio * 100}% neutralization (${timeSinceHeparin > 2 ? ">2h" : timeSinceHeparin > 1 ? "1–2h" : timeSinceHeparin > 0.5 ? "30–60 min" : "<30 min"} since last dose)` };
    }
    // LMWH (enoxaparin)
    if (timeSinceHeparin <= 8) {
      const dose = Math.min(weight * 1, 50); // 1 mg per 1 mg enoxaparin (weight-based approx)
      return { dose: Math.round(dose), maxDose: 50, rate: "≤5 mg/min", note: "Partial reversal only (~60%); consider 2nd dose of 0.5 mg/kg if bleeding continues" };
    }
    return { dose: Math.round(weight * 0.5), maxDose: 50, rate: "≤5 mg/min", note: ">8h since LMWH — reduced protamine dose; partial reversal" };
  }, [heparinType, heparinUnits, timeSinceHeparin, weight]);

  // Desmopressin (DDAVP) — for antiplatelet reversal
  const desmopressinDose = useMemo(() => {
    const dose = Math.round(weight * 0.3 * 10) / 10;
    return { dose, dilution: "Dilute in 50 mL NS", infusionTime: "15–30 min", note: "Single dose; may repeat ×1 in 12h if needed" };
  }, [weight]);

  const tabs: { id: AgentTab; label: string; shortLabel: string; color: string }[] = [
    { id: "pcc", label: "4F-PCC (Warfarin)", shortLabel: "4F-PCC", color: "bg-amber-500" },
    { id: "idarucizumab", label: "Idarucizumab (Dabigatran)", shortLabel: "Idarucizumab", color: "bg-emerald-500" },
    { id: "andexanet", label: "Andexanet (FXa Inhibitors)", shortLabel: "Andexanet", color: "bg-blue-500" },
    { id: "protamine", label: "Protamine (Heparin)", shortLabel: "Protamine", color: "bg-purple-500" },
    { id: "vitK", label: "Vitamin K", shortLabel: "Vit K", color: "bg-green-500" },
    { id: "desmopressin", label: "Desmopressin (DDAVP)", shortLabel: "DDAVP", color: "bg-pink-500" },
  ];

  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-lg border-2 border-amber-300 dark:border-amber-700">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h4 className="font-bold text-amber-800 dark:text-amber-300 text-base">
          Anticoagulation Reversal Dose Calculators
        </h4>
        <Badge className="bg-red-600 text-white text-xs">ICH</Badge>
      </div>

      {/* Agent Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? `${tab.color} text-white shadow-lg scale-105`
                : "bg-white/70 dark:bg-gray-800/70 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Shared Weight Slider */}
      <div className="mb-4 p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient Weight</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{weight} kg</span>
        </div>
        <Slider value={[weight]} onValueChange={(v) => setWeight(v[0])} min={30} max={150} step={1} className="mt-1" />
        <div className="flex justify-between text-xs text-gray-500 mt-1"><span>30</span><span>150 kg</span></div>
      </div>

      {/* ===== 4F-PCC (Warfarin) ===== */}
      {activeTab === "pcc" && (
        <div className="space-y-3">
          <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current INR</span>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{inr.toFixed(1)}</span>
            </div>
            <Slider value={[inr]} onValueChange={(v) => setInr(v[0])} min={1.0} max={10.0} step={0.1} className="mt-1" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1.0</span><span>10.0</span></div>
          </div>

          {/* INR Tier Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-amber-200 dark:bg-amber-800">
                  <th className="p-2 text-left text-amber-900 dark:text-amber-200">INR Range</th>
                  <th className="p-2 text-center text-amber-900 dark:text-amber-200">Dose (IU/kg)</th>
                  <th className="p-2 text-center text-amber-900 dark:text-amber-200">Max Dose</th>
                  <th className="p-2 text-center text-amber-900 dark:text-amber-200">Class</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: "1.3–1.9", dose: "10–20", max: "2500", cls: "2b", minInr: 1.3, maxInr: 1.9 },
                  { range: "2.0–3.9", dose: "25", max: "2500", cls: "1", minInr: 2.0, maxInr: 3.9 },
                  { range: "4.0–5.9", dose: "35", max: "3500", cls: "1", minInr: 4.0, maxInr: 5.9 },
                  { range: "≥6.0", dose: "50", max: "5000", cls: "1", minInr: 6.0, maxInr: 99 },
                ].map((row) => (
                  <tr key={row.range} className={`border-b border-amber-200 dark:border-amber-700 ${inr >= row.minInr && inr <= row.maxInr ? "bg-amber-100 dark:bg-amber-900/50 font-bold" : ""}`}>
                    <td className="p-2">{row.range}</td>
                    <td className="p-2 text-center">{row.dose}</td>
                    <td className="p-2 text-center">{row.max} IU</td>
                    <td className="p-2 text-center">{row.cls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Result */}
          {pccDose.unitsPerKg > 0 ? (
            <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-lg text-center">
              <div className="text-3xl font-black text-amber-700 dark:text-amber-300">{pccTotalUnits} IU</div>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                {pccDose.unitsPerKg} IU/kg × {weight} kg · Max rate: {pccInfusionRate} IU/min · Est. time: ~{pccInfusionTime} min
              </p>
              <p className="text-xs text-amber-500 dark:text-amber-500 mt-1 italic">{pccDose.note}</p>
            </div>
          ) : (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-center text-sm text-gray-500">INR below reversal threshold</div>
          )}

          <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-green-700 dark:text-green-400">+ Vitamin K 10 mg IV (always co-administer)</p>
            <p className="text-green-600 dark:text-green-500">Infuse over 20–60 min · Recheck INR at 30 min post-infusion</p>
          </div>

          <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Contains heparin — <strong>contraindicated in HIT</strong>. Use aPCC (FEIBA) if HIT history.</span>
          </div>
        </div>
      )}

      {/* ===== Idarucizumab (Dabigatran) ===== */}
      {activeTab === "idarucizumab" && (
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-lg text-center">
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300">5 g</div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              2 × 2.5 g/50 mL vials · IV push or infusion · ≤15 min total
            </p>
            <p className="text-xs text-emerald-500 mt-1 italic">Fixed dose — weight-independent (Class 2a)</p>
          </div>

          <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg text-xs space-y-2">
            <h5 className="font-semibold text-emerald-700 dark:text-emerald-400">Administration (Praxbind):</h5>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Administer as <strong>2 consecutive IV infusions</strong> (5–10 min each) or bolus injection</li>
              <li>• Full reversal in <strong>&lt;5 minutes</strong></li>
              <li>• Duration of reversal: <strong>~24 hours</strong></li>
              <li>• May re-dose if clinically indicated (recurrent bleeding or emergent surgery)</li>
              <li>• Lab: dTT or ECT normalize post-administration</li>
            </ul>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-blue-700 dark:text-blue-400">If Idarucizumab NOT available:</p>
            <ul className="text-blue-600 dark:text-blue-500 space-y-1">
              <li>• aPCC (FEIBA) 50 IU/kg → <strong>{Math.min(weight * 50, 5000)} IU</strong> (max 5000 IU)</li>
              <li>• 4F-PCC 50 IU/kg → <strong>{Math.min(weight * 50, 5000)} IU</strong> (Class 2b)</li>
              <li>• Consider hemodialysis (removes ~60% dabigatran in 2–3 hrs)</li>
            </ul>
          </div>

          <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2">
            <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Activated charcoal if dabigatran ingested <strong>≤2 hours</strong> ago (potential efficacy up to 8 hrs) — Class 2b</span>
          </div>
        </div>
      )}

      {/* ===== Andexanet Alfa (FXa Inhibitors) ===== */}
      {activeTab === "andexanet" && (
        <div className="space-y-3">
          <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Factor Xa Inhibitor</span>
            <div className="flex flex-wrap gap-2">
              {(["rivaroxaban", "apixaban", "edoxaban"] as const).map((agent) => (
                <button key={agent} onClick={() => setFxaAgent(agent)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    fxaAgent === agent ? "bg-blue-500 text-white shadow" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}>
                  {agent.charAt(0).toUpperCase() + agent.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Since Last Dose</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{lastDoseHrs} hrs</span>
            </div>
            <Slider value={[lastDoseHrs]} onValueChange={(v) => setLastDoseHrs(v[0])} min={0} max={24} step={1} className="mt-1" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>0 hrs</span><span>24 hrs</span></div>
          </div>

          {/* Dosing Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-blue-200 dark:bg-blue-800">
                  <th className="p-2 text-left text-blue-900 dark:text-blue-200">DOAC</th>
                  <th className="p-2 text-center text-blue-900 dark:text-blue-200">Last Dose</th>
                  <th className="p-2 text-center text-blue-900 dark:text-blue-200">Regimen</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className={`border-b ${fxaAgent === "rivaroxaban" && lastDoseHrs <= 8 ? "bg-blue-100 dark:bg-blue-900/40 font-bold" : ""}`}>
                  <td className="p-2">Rivaroxaban &gt;10mg or unknown</td><td className="p-2 text-center">≤8 hrs</td><td className="p-2 text-center">High Dose</td>
                </tr>
                <tr className={`border-b ${fxaAgent === "rivaroxaban" && lastDoseHrs > 8 ? "bg-blue-100 dark:bg-blue-900/40 font-bold" : ""}`}>
                  <td className="p-2">Rivaroxaban ≤10mg or &gt;8 hrs</td><td className="p-2 text-center">&gt;8 hrs</td><td className="p-2 text-center">Low Dose</td>
                </tr>
                <tr className={`border-b ${fxaAgent === "apixaban" ? "bg-blue-100 dark:bg-blue-900/40 font-bold" : ""}`}>
                  <td className="p-2">Apixaban (any dose)</td><td className="p-2 text-center">Any</td><td className="p-2 text-center">Low Dose</td>
                </tr>
                <tr className={`border-b ${fxaAgent === "edoxaban" && lastDoseHrs <= 8 ? "bg-blue-100 dark:bg-blue-900/40 font-bold" : ""}`}>
                  <td className="p-2">Edoxaban ≤8 hrs</td><td className="p-2 text-center">≤8 hrs</td><td className="p-2 text-center">High Dose</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Result */}
          <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg">
            <div className="text-center mb-3">
              <Badge className="bg-blue-600 text-white mb-2">{andexanetDose.regimen}</Badge>
              <div className="text-3xl font-black text-blue-700 dark:text-blue-300">{andexanetDose.totalMg} mg total</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 bg-white/60 dark:bg-gray-900/40 rounded text-center">
                <p className="font-bold text-blue-700 dark:text-blue-300">Bolus</p>
                <p className="text-lg font-black text-blue-600">{andexanetDose.bolus} mg</p>
                <p className="text-blue-500">{andexanetDose.bolusRate} · {andexanetDose.bolusDuration}</p>
              </div>
              <div className="p-2 bg-white/60 dark:bg-gray-900/40 rounded text-center">
                <p className="font-bold text-blue-700 dark:text-blue-300">Infusion</p>
                <p className="text-lg font-black text-blue-600">{andexanetDose.infusion} mg</p>
                <p className="text-blue-500">{andexanetDose.infusionRate} · {andexanetDose.infusionDuration}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-orange-700 dark:text-orange-400">If Andexanet NOT available:</p>
            <ul className="text-orange-600 dark:text-orange-500 space-y-1">
              <li>• 4F-PCC 50 IU/kg → <strong>{Math.min(weight * 50, 5000)} IU</strong> (Class 2b)</li>
              <li>• aPCC (FEIBA) 50 IU/kg → <strong>{Math.min(weight * 50, 5000)} IU</strong></li>
            </ul>
          </div>

          <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>ANNEXA-I trial: ↑ thrombotic events (10%). Monitor for VTE/MI/stroke post-reversal.</span>
          </div>
        </div>
      )}

      {/* ===== Protamine (Heparin) ===== */}
      {activeTab === "protamine" && (
        <div className="space-y-3">
          <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Heparin Type</span>
            <div className="flex gap-2">
              {([{ id: "ufh" as const, label: "UFH (Unfractionated)" }, { id: "lmwh" as const, label: "LMWH (Enoxaparin)" }]).map((h) => (
                <button key={h.id} onClick={() => setHeparinType(h.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex-1 transition-all ${
                    heparinType === h.id ? "bg-purple-500 text-white shadow" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}>
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {heparinType === "ufh" && (
            <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last UFH Dose</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{heparinUnits.toLocaleString()} units</span>
              </div>
              <Slider value={[heparinUnits]} onValueChange={(v) => setHeparinUnits(v[0])} min={1000} max={30000} step={500} className="mt-1" />
              <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1,000</span><span>30,000 units</span></div>
            </div>
          )}

          <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Since Last Heparin</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{timeSinceHeparin < 1 ? `${Math.round(timeSinceHeparin * 60)} min` : `${timeSinceHeparin} hrs`}</span>
            </div>
            <Slider value={[timeSinceHeparin]} onValueChange={(v) => setTimeSinceHeparin(v[0])} min={0} max={8} step={0.5} className="mt-1" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>0</span><span>8 hrs</span></div>
          </div>

          {/* UFH Neutralization Table */}
          {heparinType === "ufh" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-purple-200 dark:bg-purple-800">
                    <th className="p-2 text-left text-purple-900 dark:text-purple-200">Time Since UFH</th>
                    <th className="p-2 text-center text-purple-900 dark:text-purple-200">Protamine per 100 U heparin</th>
                    <th className="p-2 text-center text-purple-900 dark:text-purple-200">Neutralization</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  {[
                    { time: "<30 min", ratio: "1.0 mg", pct: "100%", min: 0, max: 0.5 },
                    { time: "30–60 min", ratio: "0.5 mg", pct: "50%", min: 0.5, max: 1 },
                    { time: "1–2 hrs", ratio: "0.375 mg", pct: "37.5%", min: 1, max: 2 },
                    { time: ">2 hrs", ratio: "0.25 mg", pct: "25%", min: 2, max: 99 },
                  ].map((row) => (
                    <tr key={row.time} className={`border-b ${timeSinceHeparin >= row.min && timeSinceHeparin < row.max ? "bg-purple-100 dark:bg-purple-900/40 font-bold" : ""}`}>
                      <td className="p-2">{row.time}</td>
                      <td className="p-2 text-center">{row.ratio}</td>
                      <td className="p-2 text-center">{row.pct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Result */}
          <div className="p-4 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/50 dark:to-violet-900/50 rounded-lg text-center">
            <div className="text-3xl font-black text-purple-700 dark:text-purple-300">{protamineDose.dose} mg</div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Max single dose: {protamineDose.maxDose} mg · Rate: {protamineDose.rate}
            </p>
            <p className="text-xs text-purple-500 mt-1 italic">{protamineDose.note}</p>
          </div>

          <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Anaphylaxis risk — especially in patients with <strong>fish allergy, prior protamine exposure, or NPH insulin use</strong>. Administer slowly.</span>
          </div>
        </div>
      )}

      {/* ===== Vitamin K ===== */}
      {activeTab === "vitK" && (
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-green-100 to-lime-100 dark:from-green-900/50 dark:to-lime-900/50 rounded-lg text-center">
            <div className="text-3xl font-black text-green-700 dark:text-green-300">10 mg IV</div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Fixed dose · Infuse over 20–60 min · Weight-independent
            </p>
            <p className="text-xs text-green-500 mt-1 italic">Class 1 — Always co-administer with PCC for VKA-ICH</p>
          </div>

          <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg text-xs space-y-2">
            <h5 className="font-semibold text-green-700 dark:text-green-400">Administration Notes:</h5>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              <li>• Dilute in <strong>50 mL D5W or NS</strong></li>
              <li>• Infuse at <strong>≤1 mg/min</strong> (risk of anaphylactoid reaction if too fast)</li>
              <li>• Onset of effect: <strong>2–4 hours</strong> (full effect 12–24h)</li>
              <li>• PCC provides immediate reversal; Vitamin K sustains it</li>
              <li>• Recheck INR at <strong>30 min and 6 hours</strong> post-infusion</li>
              <li>• May repeat dose if INR remains elevated at 12 hours</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
              <Syringe className="h-5 w-5 mx-auto text-green-600 dark:text-green-400 mb-1" />
              <p className="font-bold text-green-700 dark:text-green-400">IV Route</p>
              <p className="text-green-600 dark:text-green-500">Preferred in ICH</p>
              <p className="text-green-500">Onset: 2–4 hrs</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
              <Shield className="h-5 w-5 mx-auto text-gray-500 dark:text-gray-400 mb-1" />
              <p className="font-bold text-gray-600 dark:text-gray-400">Oral Route</p>
              <p className="text-gray-500">NOT for acute ICH</p>
              <p className="text-gray-400">Onset: 6–24 hrs</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== Desmopressin (DDAVP) ===== */}
      {activeTab === "desmopressin" && (
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 rounded-lg text-center">
            <div className="text-3xl font-black text-pink-700 dark:text-pink-300">{desmopressinDose.dose} mcg</div>
            <p className="text-sm text-pink-600 dark:text-pink-400 mt-1">
              0.3 mcg/kg × {weight} kg · IV over 15–30 min
            </p>
            <p className="text-xs text-pink-500 mt-1 italic">For antiplatelet reversal pre-neurosurgery (Class 2b)</p>
          </div>

          <div className="p-3 bg-white/80 dark:bg-gray-900/60 rounded-lg text-xs space-y-2">
            <h5 className="font-semibold text-pink-700 dark:text-pink-400">Administration (DDAVP):</h5>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300">
              <li>• <strong>Dilute in 50 mL NS</strong>, infuse over 15–30 min</li>
              <li>• Onset: <strong>30–60 min</strong>, duration: 6–12 hours</li>
              <li>• Enhances platelet adhesion via vWF release</li>
              <li>• May repeat <strong>×1 in 12 hours</strong> if clinically needed</li>
              <li>• Monitor: <strong>sodium q6h</strong> (risk of hyponatremia)</li>
              <li>• Fluid restrict if Na+ trending down</li>
            </ul>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-xs space-y-1">
            <p className="font-semibold text-amber-700 dark:text-amber-400">Indications in ICH:</p>
            <ul className="text-amber-600 dark:text-amber-500 space-y-1">
              <li>• Aspirin reversal when proceeding to <strong>emergent neurosurgery</strong></li>
              <li>• Antiplatelet-associated ICH with hemorrhage expansion</li>
              <li>• Uremic platelet dysfunction</li>
              <li>• von Willebrand disease</li>
            </ul>
          </div>

          <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>REVERSE trial: Routine platelet transfusion in antiplatelet-ICH is <strong>HARMFUL</strong>. Use desmopressin only for surgical candidates.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ICHAnticoagReversalCalculators;
