import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface SearchEntry {
  label: string;
  tab: string;                // top-level tab value
  sectionId?: string;         // DOM id to scroll to
  keywords: string;           // free-form searchable terms
  category: string;           // badge label
}

/** Curated searchable index across the whole app. */
export const SEARCH_INDEX: SearchEntry[] = [
  // ── Ischemic ────────────────────────────────────────────────────────
  { label: "Treatment Pathway Recommender", tab: "ischemic", sectionId: "treatment-recommender", keywords: "recommend pathway eligible tpa evt decision engine", category: "Ischemic" },
  { label: "Stroke Code Activation", tab: "ischemic", sectionId: "stroke-code", keywords: "code activate call twilio dial nsa notification", category: "Ischemic" },
  { label: "Acute Stroke Algorithm", tab: "ischemic", sectionId: "acute-algorithm", keywords: "algorithm flowchart interactive lkw evt cascade", category: "Ischemic" },
  { label: "IVT Management (Alteplase/TNK)", tab: "ischemic", sectionId: "ivt-management", keywords: "ivt tpa alteplase tenecteplase tnk thrombolysis lytic", category: "Ischemic" },
  { label: "Treatment Decision Aids", tab: "ischemic", sectionId: "treatment-decision", keywords: "decision matrix scenario patient handout", category: "Ischemic" },
  { label: "LVO Decision Dashboard", tab: "ischemic", sectionId: "lvo-dashboard", keywords: "lvo large vessel evt heads up etici tal collateral", category: "Ischemic" },
  { label: "CTP / Penumbra Analysis", tab: "ischemic", sectionId: "ctp-penumbra", keywords: "ctp perfusion penumbra dawn defuse mismatch core", category: "Ischemic" },
  { label: "Vascular Anatomy Diagram", tab: "ischemic", sectionId: "vascular-anatomy", keywords: "circle willis mca ica basilar anatomy vessel", category: "Ischemic" },
  { label: "ASPECTS Calculator", tab: "ischemic", sectionId: "aspects-calculator", keywords: "aspects score mca early ischemic changes", category: "Score" },
  { label: "NIHSS Calculator", tab: "ischemic", sectionId: "nihss-calculator", keywords: "nihss stroke scale severity untestable", category: "Score" },
  { label: "GCS / FOUR Score", tab: "ischemic", sectionId: "gcs-calculator", keywords: "gcs glasgow coma four score consciousness", category: "Score" },
  { label: "PREVENT Cardiovascular Risk", tab: "ischemic", sectionId: "prevent-score", keywords: "prevent cardiovascular risk ascvd", category: "Risk" },
  { label: "KDIGO Heat Map (eGFR/uACR)", tab: "ischemic", sectionId: "kdigo-heatmap", keywords: "kdigo egfr uacr kidney ckd renal", category: "Risk" },
  { label: "PRIME Tool (Malignancy)", tab: "ischemic", sectionId: "prime-tool", keywords: "prime malignancy cancer stroke ohri", category: "Risk" },
  { label: "Lipid Risk Classification", tab: "ischemic", sectionId: "lipid-risk", keywords: "lipid ldl apob lp(a) lipoprotein cholesterol extreme risk lai", category: "Lipid" },
  { label: "Stroke History Template", tab: "ischemic", sectionId: "stroke-history", keywords: "history template 36 items summary", category: "Ischemic" },
  { label: "ISPS25 Phenotyping", tab: "ischemic", sectionId: "stroke-phenotyping", keywords: "isps25 phenotype etiology classification tost", category: "Ischemic" },
  { label: "Lab Investigations (OCR)", tab: "ischemic", sectionId: "lab-investigations", keywords: "labs ocr metropolis thrombophilia panel gemini", category: "Labs" },
  { label: "Workup Checklist", tab: "ischemic", sectionId: "workup-checklist", keywords: "checklist workup tests investigations", category: "Ischemic" },

  // ── ICH / Post-IVT ──────────────────────────────────────────────────
  { label: "ICH Management", tab: "hemorrhagic", sectionId: "acute-ich", keywords: "ich intracerebral hemorrhage bleed", category: "ICH" },
  { label: "ICH Score", tab: "hemorrhagic", sectionId: "ich-score", keywords: "ich score prognosis mortality", category: "Score" },
  { label: "Post-IVT Hemorrhage Protocol", tab: "post-ivt", sectionId: "post-ivt-hemorrhage", keywords: "post ivt tpa hemorrhage bleed fibrinogen cryo fibres reversal", category: "Post-IVT" },

  // ── CVT / SAH / SDH ─────────────────────────────────────────────────
  { label: "CVT Management & Scoring", tab: "cvt", sectionId: "cvt-management", keywords: "cvt cerebral venous thrombosis heldner sinus", category: "CVT" },
  { label: "SAH Management", tab: "sah", sectionId: "sah-management", keywords: "sah subarachnoid ottawa wfns fisher vasospasm dci nimodipine", category: "SAH" },
  { label: "SDH / Subdural Management", tab: "sdh", sectionId: "sdh-management", keywords: "sdh subdural markwalder hygroma recurrence", category: "SDH" },

  // ── Medications Formulary ───────────────────────────────────────────
  { label: "Medications Formulary", tab: "medications", sectionId: "medications-formulary", keywords: "medications drugs formulary reference", category: "Meds" },
  { label: "Aspirin", tab: "medications", sectionId: "medications-formulary", keywords: "aspirin asa acetylsalicylic antiplatelet", category: "Meds" },
  { label: "Clopidogrel (Plavix)", tab: "medications", sectionId: "medications-formulary", keywords: "clopidogrel plavix p2y12 cyp2c19", category: "Meds" },
  { label: "Ticagrelor (Brilinta)", tab: "medications", sectionId: "medications-formulary", keywords: "ticagrelor brilinta p2y12 thales chance-2", category: "Meds" },
  { label: "Dipyridamole + Aspirin (Aggrenox)", tab: "medications", sectionId: "medications-formulary", keywords: "dipyridamole aggrenox esps espprit", category: "Meds" },
  { label: "Cilostazol (Pletal)", tab: "medications", sectionId: "medications-formulary", keywords: "cilostazol pletal pde3 csps", category: "Meds" },
  { label: "Tirofiban (Aggrastat)", tab: "medications", sectionId: "medications-formulary", keywords: "tirofiban aggrastat gp2b3a instant rescue-bt2 iv ia", category: "Meds" },
  { label: "Cangrelor (Kengreal)", tab: "medications", sectionId: "medications-formulary", keywords: "cangrelor kengreal iv p2y12 neurointervention", category: "Meds" },
  { label: "Eptifibatide (Integrilin)", tab: "medications", sectionId: "medications-formulary", keywords: "eptifibatide integrilin gp2b3a", category: "Meds" },
  { label: "Alteplase (tPA)", tab: "medications", sectionId: "medications-formulary", keywords: "alteplase tpa activase thrombolytic", category: "Meds" },
  { label: "Tenecteplase (TNK)", tab: "medications", sectionId: "medications-formulary", keywords: "tenecteplase tnk tnkase thrombolytic bolus", category: "Meds" },
  { label: "Heparin (UFH)", tab: "medications", sectionId: "medications-formulary", keywords: "heparin ufh unfractionated aptt protamine", category: "Meds" },
  { label: "Enoxaparin (Lovenox)", tab: "medications", sectionId: "medications-formulary", keywords: "enoxaparin lovenox lmwh", category: "Meds" },
  { label: "Warfarin (Coumadin)", tab: "medications", sectionId: "medications-formulary", keywords: "warfarin coumadin vka inr", category: "Meds" },
  { label: "Apixaban / Rivaroxaban / Dabigatran / Edoxaban", tab: "medications", sectionId: "medications-formulary", keywords: "doac noac apixaban eliquis rivaroxaban xarelto dabigatran pradaxa edoxaban savaysa", category: "Meds" },
  { label: "Idarucizumab (Praxbind)", tab: "medications", sectionId: "medications-formulary", keywords: "idarucizumab praxbind dabigatran reversal", category: "Reversal" },
  { label: "Andexanet alfa (Andexxa)", tab: "medications", sectionId: "medications-formulary", keywords: "andexanet andexxa xa reversal apixaban rivaroxaban", category: "Reversal" },
  { label: "4F-PCC (Kcentra)", tab: "medications", sectionId: "medications-formulary", keywords: "pcc kcentra prothrombin complex warfarin reversal", category: "Reversal" },
  { label: "Vitamin K / Protamine", tab: "medications", sectionId: "medications-formulary", keywords: "vitamin k phytonadione protamine heparin reversal", category: "Reversal" },
  { label: "FFP / Cryoprecipitate / Fibrinogen Concentrate", tab: "medications", sectionId: "medications-formulary", keywords: "ffp fresh frozen plasma cryoprecipitate fibrinogen riastap fibres blood product", category: "Blood Product" },
  { label: "Platelets", tab: "medications", sectionId: "medications-formulary", keywords: "platelet transfusion patch antiplatelet ich", category: "Blood Product" },
  { label: "Weight-based Dose Calculator", tab: "medications", sectionId: "medications-formulary", keywords: "calculator weight mg mcg kg pump ml hr rounding renal crcl", category: "Calc" },
];

interface Props {
  onNavigate: (tab: string, sectionId?: string) => void;
}

const GlobalAppSearch: React.FC<Props> = ({ onNavigate }) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const tokens = query.split(/\s+/);
    const scored = SEARCH_INDEX.map((entry) => {
      const hay = `${entry.label} ${entry.keywords} ${entry.category}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (!hay.includes(t)) return { entry, score: -1 };
        if (entry.label.toLowerCase().includes(t)) score += 3;
        if (entry.keywords.toLowerCase().includes(t)) score += 1;
      }
      return { entry, score };
    })
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
    return scored.map((r) => r.entry);
  }, [q]);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => setHighlight(0), [q]);

  const pick = (entry: SearchEntry) => {
    onNavigate(entry.tab, entry.sectionId);
    setOpen(false);
    setQ("");
    // Attempt scroll after tab render
    if (entry.sectionId) {
      setTimeout(() => {
        document.getElementById(entry.sectionId!)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
      setTimeout(() => {
        document.getElementById(entry.sectionId!)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 700);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && results[highlight]) {
              e.preventDefault();
              pick(results[highlight]);
            }
          }}
          placeholder="Search anything — NIHSS, tirofiban, DOAC reversal, LVO, SAH… (⌘K)"
          className="pl-9 pr-16 h-11 bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
        />
        {q && (
          <button
            onClick={() => { setQ(""); inputRef.current?.focus(); }}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <kbd className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
          ⌘K
        </kbd>
      </div>

      {open && q && (
        <div className="absolute z-[60] mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/95 backdrop-blur-xl shadow-2xl max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-slate-400 text-center">
              No matches. Try "tirofiban", "SAH", "NIHSS", "reversal"…
            </p>
          ) : (
            <ul>
              {results.map((r, i) => (
                <li key={`${r.tab}-${r.label}`}>
                  <button
                    onClick={() => pick(r)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                      i === highlight ? "bg-cyan-500/15" : "hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate font-medium">{r.label}</p>
                      <p className="text-[11px] text-slate-400 truncate">{r.keywords}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 bg-slate-800 text-slate-300 border-slate-600 text-[10px]">
                      {r.category}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-[10px] text-slate-500 text-center py-2 border-t border-slate-800">
            ↑↓ navigate · ↵ open · esc close
          </p>
        </div>
      )}
    </div>
  );
};

export default GlobalAppSearch;
