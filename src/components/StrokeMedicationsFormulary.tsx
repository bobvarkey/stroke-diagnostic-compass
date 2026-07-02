import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Pill,
  Syringe,
  Droplets,
  ShieldAlert,
  Calculator,
  ChevronDown,
  AlertTriangle,
  Beaker,
  Download,
  Copy,
  CheckCircle2,
  X,
} from "lucide-react";
import AntiplateletSwitchingGuide from "./AntiplateletSwitchingGuide";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type DrugCategory =
  | "antiplatelet"
  | "anticoagulant"
  | "thrombolytic"
  | "reversal"
  | "blood-product";

interface Drug {
  name: string;
  aliases?: string;
  category: DrugCategory;
  class: string;
  indication: string;
  dose: string;
  route: string;
  duration?: string;
  onset?: string;
  contraindications: string;
  monitoring: string;
  notes?: string;
  evidence?: string;
}

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */
const DRUGS: Drug[] = [
  /* --------------- Antiplatelets --------------- */
  {
    name: "Aspirin",
    aliases: "ASA, acetylsalicylic acid",
    category: "antiplatelet",
    class: "COX-1 inhibitor (irreversible)",
    indication: "AIS secondary prevention; DAPT after minor stroke/TIA; post-EVT; SAH nimodipine adjunct not required",
    dose:
      "Load 162–325 mg PO/PR × 1 (within 24–48 h of AIS, after IVT delayed 24 h). Maintenance 75–100 mg PO daily. DAPT: 81 mg daily.",
    route: "PO / PR / NG",
    onset: "15–30 min (antiplatelet effect); peak 1–2 h",
    duration: "Indefinite for secondary prevention; 21–30 d in DAPT window",
    contraindications:
      "Active bleeding, aspirin allergy, severe thrombocytopenia (<50 K), within 24 h of IVT",
    monitoring: "Bleeding, GI symptoms, platelet count if DAPT",
    evidence: "IST, CAST, CHANCE, POINT, THALES",
  },
  {
    name: "Clopidogrel",
    aliases: "Plavix",
    category: "antiplatelet",
    class: "P2Y12 inhibitor (prodrug, CYP2C19)",
    indication: "AIS secondary prevention; DAPT for minor stroke/TIA (NIHSS ≤3 or ABCD² ≥4)",
    dose:
      "Load 300–600 mg PO × 1; maintenance 75 mg PO daily. In DAPT, 21 d with aspirin then continue mono ≤ 90 d.",
    route: "PO / NG",
    onset: "2–6 h after loading; antiplatelet effect persists 5–7 d",
    duration: "21 d DAPT (CHANCE/POINT); consider 90 d if intracranial stenosis",
    contraindications:
      "Active bleeding, hypersensitivity; caution CYP2C19 LOF alleles (*2/*3 → reduced response)",
    monitoring: "Bleeding, CBC; consider CYP2C19 genotyping if recurrent stroke on clopidogrel",
    notes:
      "CYP2C19 poor metabolizers: switch to Ticagrelor. Avoid concurrent PPI (omeprazole, esomeprazole).",
    evidence: "CHANCE, POINT, CHANCE-2 (CYP2C19 LOF)",
  },
  {
    name: "Ticagrelor",
    aliases: "Brilinta",
    category: "antiplatelet",
    class: "P2Y12 inhibitor (reversible, direct-acting)",
    indication: "Recurrent stroke on clopidogrel; CYP2C19 LOF; DAPT alternative (THALES)",
    dose:
      "Load 180 mg PO × 1; maintenance 90 mg PO BID. In THALES DAPT: 30 d with aspirin then continue 90 mg BID mono.",
    route: "PO",
    onset: "30 min; reversible offset 3–5 d",
    duration: "30 d DAPT then mono to day 90; long-term if HR indication",
    contraindications:
      "Active bleeding, prior ICH, severe hepatic impairment, strong CYP3A4 inhibitors/inducers",
    monitoring: "Dyspnea (~14%), bradyarrhythmia, uric acid, bleeding",
    notes: "Aspirin maintenance must be ≤100 mg (higher aspirin ↓ efficacy). No prior ICH!",
    evidence: "THALES, PLATO, CHANCE-2",
  },
  {
    name: "Prasugrel",
    aliases: "Effient",
    category: "antiplatelet",
    class: "P2Y12 inhibitor (irreversible, prodrug)",
    indication: "PCI/ACS — generally NOT recommended in stroke",
    dose: "Load 60 mg PO; maintenance 10 mg daily (5 mg if <60 kg or ≥75 y)",
    route: "PO",
    onset: "30 min; irreversible offset 7–10 d",
    contraindications:
      "PRIOR STROKE or TIA (absolute) — ↑ ICH risk. Active bleeding, age ≥75 (relative).",
    monitoring: "Bleeding",
    notes: "Contraindicated in stroke patients per TRITON-TIMI 38.",
  },
  {
    name: "Dipyridamole ER + Aspirin",
    aliases: "Aggrenox",
    category: "antiplatelet",
    class: "Phosphodiesterase inhibitor + COX-1",
    indication: "AIS secondary prevention (ESPS-2, ESPRIT)",
    dose: "200 mg ER dipyridamole + 25 mg aspirin PO BID",
    route: "PO",
    duration: "Indefinite",
    contraindications: "Severe CAD (may precipitate ischemia), migraine (headache limits use)",
    monitoring: "Headache (very common — start slow), hypotension, angina",
    notes: "Headache limits adherence; often replaced by clopidogrel monotherapy (PRoFESS: equivalent).",
    evidence: "ESPS-2, ESPRIT, PRoFESS",
  },
  {
    name: "Cilostazol",
    aliases: "Pletal",
    category: "antiplatelet",
    class: "PDE-3 inhibitor",
    indication: "AIS secondary prevention (esp. Asian populations, intracranial stenosis, CSPS trials)",
    dose: "100 mg PO BID (50 mg BID if elderly/frail)",
    route: "PO",
    onset: "1–2 h; duration 12 h",
    duration: "Long-term",
    contraindications: "CHF (any severity — BLACK BOX), hemorrhagic tendency, severe hepatic impairment",
    monitoring: "Headache, palpitations, diarrhea, HR",
    notes: "CSPS.com: cilostazol + aspirin/clopidogrel ↓ recurrent stroke vs mono.",
    evidence: "CSPS-2, CSPS.com",
  },
  {
    name: "Tirofiban",
    aliases: "Aggrastat",
    category: "antiplatelet",
    class: "GP IIb/IIIa inhibitor (small molecule)",
    indication: "AIS: post-IVT (RESCUE-BT2, INSTANT), rescue during EVT, tandem occlusion, ICAD",
    dose:
      "AIS IV loading: 0.4 mcg/kg/min × 30 min → 0.1 mcg/kg/min × up to 24 h. Post-TNK INSTANT: 0.3 mcg/kg/min × 30 min → 0.075 mcg/kg/min × 47.5 h. IA rescue bolus: 0.25–1 mg (max 1 mg per SAO).",
    route: "IV / IA",
    onset: "5 min; offset 4–8 h after stop",
    duration: "12–24 h (standard); 47.5 h (INSTANT post-TNK)",
    contraindications:
      "Active bleeding, ICH history, platelets <100 K, recent major surgery <30 d, severe HTN >180/110 uncontrolled",
    monitoring:
      "CBC (platelets, Hb) at 2–6 h then daily — RAPID-onset thrombocytopenia can occur; fibrinogen; neuro checks q1h × 6 h; BP <180/105",
    notes:
      "Reduce infusion 50% if CrCl <30. Hold if platelets <90 K, fibrinogen <200, or any bleeding.",
    evidence: "RESCUE-BT2 (NEJM 2023), INSTANT (JAMA 2026), SaTIS, TREND",
  },
  {
    name: "Cangrelor",
    aliases: "Kengreal",
    category: "antiplatelet",
    class: "IV P2Y12 inhibitor (reversible, rapid on/off)",
    indication: "Neurointervention (stent-assisted coiling, flow diverter, tandem carotid stent) as bridge to oral P2Y12",
    dose:
      "Low-dose neuro (no bolus): 0.75 mcg/kg/min. Intermediate stroke: 15 mcg/kg bolus + 2 mcg/kg/min. Cardiac PCI (label): 30 mcg/kg bolus + 4 mcg/kg/min × ≥2 h.",
    route: "IV infusion",
    onset: "2 min; offset 30–60 min after stop",
    duration: "During procedure + overlap with oral P2Y12 (Ticagrelor 180 mg 30 min before stop; Clopidogrel 600 mg AFTER stop; Prasugrel 60 mg AFTER stop)",
    contraindications: "Active bleeding, ICH, severe thrombocytopenia",
    monitoring: "Bleeding, puncture site, platelets. Effect resolves within ~60 min of stopping.",
    notes:
      "NEVER give oral clopidogrel/prasugrel WHILE running cangrelor (blocks binding). Ticagrelor may overlap.",
    evidence: "CHAMPION-PHOENIX (cardiac), growing neuro registry data",
  },
  {
    name: "Eptifibatide",
    aliases: "Integrilin",
    category: "antiplatelet",
    class: "GP IIb/IIIa inhibitor (cyclic peptide)",
    indication: "Rescue during EVT, ICAD stenting (off-label in stroke)",
    dose:
      "IV: 180 mcg/kg bolus × 1–2 (5 min apart) + 2 mcg/kg/min infusion up to 18–24 h. Reduce infusion 50% if CrCl <50.",
    route: "IV / IA",
    onset: "1–2 min; offset 4–6 h",
    duration: "Up to 18–24 h",
    contraindications:
      "Active bleeding, dialysis, prior ICH, severe HTN, platelets <100 K, major surgery <6 wk",
    monitoring: "Platelets 2–6 h then daily, Hb, ACT if peri-procedural, bleeding",
    notes: "Renal clearance — dose-adjust for CrCl. Reversal: platelet transfusion + supportive care.",
  },
  {
    name: "Abciximab",
    aliases: "ReoPro",
    category: "antiplatelet",
    class: "GP IIb/IIIa inhibitor (monoclonal Ab, irreversible)",
    indication: "Historical stroke use — largely replaced by tirofiban/eptifibatide",
    dose: "0.25 mg/kg IV bolus + 0.125 mcg/kg/min (max 10 mcg/min) × 12 h",
    route: "IV",
    onset: "5 min; offset 24–48 h (platelet-bound Fab)",
    contraindications: "Prior stroke <2 y (AbESTT-II halted for ↑ ICH). Active bleeding.",
    monitoring: "Platelets — profound thrombocytopenia; bleeding",
    notes: "No longer manufactured in US. AbESTT-II: excess ICH in stroke — AVOID.",
  },

  /* --------------- Anticoagulants --------------- */
  {
    name: "Unfractionated Heparin (UFH)",
    category: "anticoagulant",
    class: "Indirect thrombin/Xa inhibitor (antithrombin-mediated)",
    indication: "CVT, procedural anticoagulation, cardioembolic stroke bridging (rare), tandem occlusion during EVT",
    dose:
      "Full-dose IV: 80 U/kg bolus + 18 U/kg/h, titrate to aPTT 1.5–2× control (or anti-Xa 0.3–0.7). Prophylaxis: 5000 U SC q8–12h.",
    route: "IV / SC",
    duration: "Bridging until therapeutic warfarin (INR 2–3) or transition to DOAC",
    contraindications: "Active bleeding, HIT history, recent large infarct with hemorrhagic transformation risk",
    monitoring: "aPTT q6h until stable, platelets q2–3d (HIT surveillance), Hb daily",
    notes: "Reversal: Protamine 1 mg per 100 U heparin given in prior 2–3 h (max 50 mg per dose).",
  },
  {
    name: "Enoxaparin",
    aliases: "Lovenox",
    category: "anticoagulant",
    class: "LMWH (Xa > IIa)",
    indication: "DVT prophylaxis in AIS, CVT (once bleeding excluded), cancer-associated thrombosis",
    dose:
      "Prophylaxis: 40 mg SC daily (30 mg SC BID if high risk). Treatment: 1 mg/kg SC q12h or 1.5 mg/kg SC daily. CrCl <30: 30 mg SC daily prophylaxis / 1 mg/kg daily treatment.",
    route: "SC",
    onset: "Onset 3–5 h SC; duration 12–24 h",
    duration: "Until mobile / therapy transition",
    contraindications: "Active bleeding, HIT, CrCl <15 (relative), epidural catheter within 12 h",
    monitoring: "Anti-Xa (obese, renal, pregnancy), platelets, Hb",
    notes: "Reversal: Protamine 1 mg per 1 mg enoxaparin (only ~60% neutralization).",
  },
  {
    name: "Warfarin",
    aliases: "Coumadin",
    category: "anticoagulant",
    class: "Vitamin K antagonist (VKA)",
    indication: "Mechanical valves, moderate-severe MS, APLA syndrome, DOAC failure",
    dose: "Start 5 mg PO daily (2.5 mg elderly/frail), titrate to INR 2–3 (2.5–3.5 mechanical mitral)",
    route: "PO",
    onset: "Onset 24–72 h; duration 2–5 d after last dose",
    duration: "Indefinite for most indications",
    contraindications: "Pregnancy (except mechanical valve), active bleeding, non-adherence, severe hepatic dz",
    monitoring: "INR (daily → weekly → monthly), CBC, LFTs",
    notes: "Post-stroke initiation: 1-3-6-12 day rule based on infarct size (TIA d1, small d3, mod d6, large d12).",
  },
  {
    name: "Apixaban",
    aliases: "Eliquis",
    category: "anticoagulant",
    class: "Direct oral Xa inhibitor (DOAC)",
    indication: "Non-valvular AF, secondary stroke prevention",
    dose:
      "5 mg PO BID. Reduce to 2.5 mg BID if ≥2 of: age ≥80, weight ≤60 kg, SCr ≥1.5 mg/dL. Avoid if CrCl <15.",
    route: "PO",
    onset: "3–4 h; duration 24 h",
    duration: "Indefinite",
    contraindications: "Active bleeding, mechanical valves, severe hepatic dz, prosthetic valve",
    monitoring: "Renal function q6–12 mo, Hb, bleeding",
    notes: "Reversal: Andexanet alfa (preferred) or 4F-PCC 50 U/kg.",
    evidence: "ARISTOTLE, AVERROES",
  },
  {
    name: "Rivaroxaban",
    aliases: "Xarelto",
    category: "anticoagulant",
    class: "Direct oral Xa inhibitor (DOAC)",
    indication: "Non-valvular AF, VTE, ESUS (subgroup — not routine)",
    dose: "20 mg PO daily with evening meal. 15 mg if CrCl 15–50. Avoid CrCl <15.",
    route: "PO",
    onset: "2–4 h; duration 24 h",
    duration: "Indefinite",
    contraindications: "Active bleeding, mechanical valves, moderate-severe hepatic dz",
    monitoring: "Renal function, Hb",
    notes: "Reversal: Andexanet alfa; 4F-PCC 50 U/kg if unavailable. NAVIGATE-ESUS negative.",
  },
  {
    name: "Dabigatran",
    aliases: "Pradaxa",
    category: "anticoagulant",
    class: "Direct thrombin (IIa) inhibitor",
    indication: "Non-valvular AF, VTE",
    dose: "150 mg PO BID. 110 mg BID if age ≥80 or bleeding risk. Avoid CrCl <30.",
    route: "PO",
    onset: "1–3 h; duration 24–36 h",
    duration: "Indefinite",
    contraindications: "Mechanical valves (RE-ALIGN), active bleeding, CrCl <30",
    monitoring: "Renal function q6 mo, Hb, dyspepsia",
    notes: "Reversal: Idarucizumab 5 g IV (2 × 2.5 g) — specific antidote.",
    evidence: "RE-LY",
  },
  {
    name: "Edoxaban",
    aliases: "Savaysa, Lixiana",
    category: "anticoagulant",
    class: "Direct oral Xa inhibitor (DOAC)",
    indication: "Non-valvular AF, VTE",
    dose: "60 mg PO daily. 30 mg if CrCl 15–50, weight ≤60 kg, or P-gp inhibitor. Avoid CrCl >95 or <15.",
    route: "PO",
    onset: "1–2 h; duration 24 h",
    contraindications: "Active bleeding, mechanical valves, CrCl >95 (reduced efficacy)",
    monitoring: "Renal function, Hb",
    notes: "Reversal: Andexanet or 4F-PCC.",
    evidence: "ENGAGE AF-TIMI 48",
  },

  /* --------------- Thrombolytics --------------- */
  {
    name: "Alteplase",
    aliases: "tPA, Activase",
    category: "thrombolytic",
    class: "Recombinant tissue plasminogen activator (rt-PA)",
    indication: "AIS within 4.5 h of LKW (extended to 9 h with mismatch imaging per EXTEND)",
    dose:
      "0.9 mg/kg IV (max 90 mg): 10% as bolus over 1 min, remainder as infusion over 60 min",
    route: "IV",
    duration: "60 min infusion + 24 h monitoring",
    contraindications:
      "Active internal bleeding, recent ICH, BP >185/110 (must control first), platelets <100 K, INR >1.7, aPTT >40, heparin <48 h, DOAC <48 h (no reversal), major surgery <14 d, large infarct >1/3 MCA",
    monitoring:
      "BP q15min × 2 h → q30min × 6 h → q1h × 16 h (goal <180/105); neuro q15min × 2 h; NCCT at 24 h before starting AP/AC",
    notes: "ICH rate ~2–7%. Tenecteplase increasingly preferred (single bolus, non-inferior).",
    evidence: "NINDS, ECASS III, EXTEND, WAKE-UP",
  },
  {
    name: "Tenecteplase",
    aliases: "TNK, TNKase",
    category: "thrombolytic",
    class: "Modified rt-PA (single bolus, higher fibrin specificity)",
    indication: "AIS within 4.5 h; preferred over alteplase in many centers; LVO en route to EVT",
    dose:
      "0.25 mg/kg IV × 1 bolus over 5 s (max 25 mg). AHA 2026 alternative to alteplase for LVO.",
    route: "IV",
    onset: "Immediate; t½ ~20 min (single bolus)",
    duration: "Single bolus + 24 h monitoring",
    contraindications: "Same as alteplase",
    monitoring: "Same as alteplase (BP, neuro, 24 h NCCT)",
    notes: "EXTEND-IA TNK, AcT trial: non-inferior/superior for LVO. Simpler workflow (bolus only).",
    evidence: "EXTEND-IA TNK, AcT, ATTEST-2, TIMELESS",
  },

  /* --------------- Reversal Agents --------------- */
  {
    name: "Idarucizumab",
    aliases: "Praxbind",
    category: "reversal",
    class: "Humanized Fab fragment (specific dabigatran antidote)",
    indication: "Dabigatran-associated life-threatening bleed (ICH) or emergent surgery",
    dose: "5 g IV (2 × 2.5 g vials) as two consecutive infusions or bolus",
    route: "IV",
    onset: "Onset <15 min; effect ≥24 h",
    duration: "Onset <15 min; effect ≥24 h",
    contraindications: "None absolute (hypersensitivity rare)",
    monitoring: "aPTT, thrombin time, dabigatran level (if available); rebound thrombosis risk",
    evidence: "RE-VERSE AD",
  },
  {
    name: "Andexanet alfa",
    aliases: "Andexxa",
    category: "reversal",
    class: "Modified recombinant factor Xa decoy (Xa inhibitor reversal)",
    indication: "Apixaban/rivaroxaban-associated life-threatening bleed (ICH)",
    dose:
      "Low dose (last DOAC dose ≤5 mg apix/10 mg riva OR >8 h ago): 400 mg IV bolus + 4 mg/min × 120 min. High dose (>5 mg apix / >10 mg riva within 8 h): 800 mg bolus + 8 mg/min × 120 min.",
    route: "IV",
    onset: "Onset minutes; activity ~2 h",
    duration: "Bolus + 2 h infusion",
    contraindications: "None absolute; caution recent thrombotic event (rebound thrombosis ~10%)",
    monitoring: "Anti-Xa level (if available), neuro, thromboembolic events",
    notes: "Very expensive; 4F-PCC 50 U/kg is acceptable alternative per ANNEXA-I.",
    evidence: "ANNEXA-4, ANNEXA-I",
  },
  {
    name: "4F-PCC",
    aliases: "Kcentra, Beriplex, Octaplex (Factors II, VII, IX, X)",
    category: "reversal",
    class: "4-factor prothrombin complex concentrate",
    indication: "Warfarin/VKA reversal; DOAC (Xa) reversal if andexanet unavailable",
    dose:
      "VKA: INR 2–<4 → 25 U/kg; INR 4–6 → 35 U/kg; INR >6 → 50 U/kg (max 5000 U). DOAC: 50 U/kg fixed. Always give Vitamin K 10 mg IV concurrently for VKA.",
    route: "IV",
    onset: "Onset 10–30 min; duration 6–12 h",
    duration: "Onset within 10–30 min",
    contraindications: "HIT, DIC, hypersensitivity",
    monitoring: "INR at 30 min and 6–12 h; thromboembolic events",
    notes: "Preferred over FFP for VKA-ICH (faster INR correction, smaller volume).",
    evidence: "INCH trial, ANNEXA-I (DOAC comparison)",
  },
  {
    name: "Vitamin K (Phytonadione)",
    category: "reversal",
    class: "Fat-soluble vitamin (VKA reversal cofactor)",
    indication: "Warfarin reversal (with 4F-PCC for ICH); vitamin K deficiency",
    dose:
      "ICH: 10 mg IV over 30 min. Non-bleeding INR >10: 2.5–5 mg PO. INR 4.5–10 no bleeding: hold warfarin ± 1–2.5 mg PO.",
    route: "IV (slow) / PO",
    onset: "Onset 6–24 h; effect sustained ≥5 d",
    duration: "Effect 6–24 h; sustained ≥5 d",
    contraindications: "Anaphylactoid reaction with IV push (give slow infusion)",
    monitoring: "INR q6h × 24 h; anaphylaxis (rare with slow infusion)",
    notes: "Always co-administer with 4F-PCC for VKA-related ICH — PCC alone is transient.",
  },
  {
    name: "Protamine Sulfate",
    category: "reversal",
    class: "UFH / LMWH reversal (basic protein binds heparin)",
    indication: "UFH bleeding or over-anticoagulation; partial LMWH reversal",
    dose:
      "UFH: 1 mg per 100 U heparin in prior 2–3 h (max 50 mg per dose). LMWH <8 h: 1 mg per 1 mg enoxaparin (or 1 mg per 100 anti-Xa U dalteparin). LMWH 8–12 h: 0.5 mg per 1 mg.",
    route: "IV (slow, over 10 min)",
    onset: "Immediate; duration ~2 h",
    duration: "Immediate onset; heparin has short t½ so re-bolus rarely needed",
    contraindications:
      "Fish allergy (relative), prior protamine exposure (NPH insulin, vasectomy), hypotension with rapid push",
    monitoring: "aPTT/anti-Xa, BP (hypotension, anaphylaxis), pulmonary artery pressure",
    notes: "LMWH reversal only ~60% effective. Slow IV push to avoid hypotension.",
  },

  /* --------------- Blood Products --------------- */
  {
    name: "Fresh Frozen Plasma (FFP)",
    category: "blood-product",
    class: "Coagulation factor replacement (all factors)",
    indication:
      "Warfarin reversal when 4F-PCC unavailable; TTP (plasma exchange); massive transfusion 1:1:1",
    dose: "10–20 mL/kg (typically 4–6 units = 800–1200 mL for 70 kg adult)",
    route: "IV",
    onset: "Onset 30–60 min per unit; duration 6–12 h",
    duration: "30–60 min per unit; thaw time ~30 min",
    contraindications: "Volume overload risk, IgA deficiency (use IgA-deficient plasma)",
    monitoring: "INR pre/post, TACO/TRALI, volume status, calcium (citrate load)",
    notes:
      "Slower correction than 4F-PCC (hours vs minutes); large volume — avoid in ICH if PCC available.",
  },
  {
    name: "Cryoprecipitate",
    aliases: "Cryo",
    category: "blood-product",
    class: "Fibrinogen, FVIII, vWF, FXIII, fibronectin",
    indication:
      "Post-tPA/TNK ICH (fibrinogen <200); hypofibrinogenemia; massive transfusion; DIC",
    dose:
      "10 units (1 pool) raises fibrinogen ~50–70 mg/dL in 70 kg adult. Target fibrinogen >150–200. Post-IVT ICH: 10 U empiric.",
    route: "IV",
    onset: "Immediate; duration 8–12 h",
    duration: "Each unit 10–20 mL; infuse over ~15 min",
    contraindications: "None absolute; IgA deficiency caution",
    monitoring: "Fibrinogen (goal >150–200 for post-IVT ICH), TEG if available",
    notes:
      "Fibrinogen concentrate (RiaSTAP, FIBRES) preferred where available — faster, pathogen-reduced, no thaw.",
    evidence: "FIBRES trial (fibrinogen concentrate non-inferior)",
  },
  {
    name: "Fibrinogen Concentrate",
    aliases: "RiaSTAP, FIBRES",
    category: "blood-product",
    class: "Purified human fibrinogen (pathogen-reduced)",
    indication: "Post-IVT ICH; congenital afibrinogenemia; trauma with hypofibrinogenemia",
    dose:
      "Post-IVT ICH: 25–70 mg/kg IV (typical adult 4 g). Calculate: (target − actual fibrinogen) × weight × 1.7 = mg needed.",
    route: "IV",
    onset: "Immediate; t½ ~72 h",
    duration: "Immediate onset; t½ ~72 h",
    contraindications: "History of hypersensitivity",
    monitoring: "Fibrinogen q1h × 4 h then q6h; thrombotic events",
    notes: "Preferred over cryo when available — faster, no thaw, standardized dose.",
    evidence: "FIBRES (JAMA 2019)",
  },
  {
    name: "Platelets",
    category: "blood-product",
    class: "Platelet concentrate (apheresis or pooled)",
    indication:
      "Thrombocytopenia + bleeding; NOT routine for antiplatelet-associated ICH (PATCH — HARMFUL)",
    dose: "1 apheresis unit (~3–4 × 10¹¹) raises count ~30–50 K in adult",
    route: "IV",
    onset: "Immediate; count increment lasts 3–5 d",
    contraindications: "Antiplatelet-associated spontaneous ICH (PATCH trial — worse outcome)",
    monitoring: "Platelet count 10 min and 1 h post; TRALI, TACO",
    notes:
      "PATCH: platelet transfusion for aspirin/clopidogrel ICH → worse outcome. Only give if platelets <100 K + planned neurosurgery.",
    evidence: "PATCH trial (Lancet 2016)",
  },
];

/* ------------------------------------------------------------------ */
/* Weight-based calculator — structured specs                          */
/* ------------------------------------------------------------------ */
type DoseUnit = "mg" | "mcg" | "U" | "mcg/min" | "mcg/kg/min" | "mg/kg" | "U/kg" | "U/hr";

interface CalcSpec {
  id: string;
  label: string;
  category: DrugCategory;
  route: "IV bolus" | "IV infusion" | "IA" | "SC";
  perKg: number;              // dose per kg in output unit
  outputUnit: DoseUnit;        // display unit for the primary dose
  capMax?: number;             // absolute cap regardless of weight
  weightMin?: number;          // guideline weight floor
  weightMax?: number;          // guideline weight ceiling
  round?: number;              // rounding increment (e.g. 0.5, 1, 5)
  durationMin?: number;        // infusion window in minutes (for total)
  concentration?: { mg: number; mL: number }; // for mL/hr calc
  concentrationUnit?: "mg/mL" | "mcg/mL" | "U/mL";
  renalReduce?: { crclBelow: number; factor: number; note: string };
  contraindicationCrCl?: number; // absolute contra below this CrCl
  notes?: string;
  reference?: string;
  drugName?: string;           // link to Drug entry for details panel
}

const round = (v: number, step = 0.1) => Math.round(v / step) * step;

const CALCS: CalcSpec[] = [
  {
    id: "alteplase",
    label: "Alteplase (IV tPA)",
    category: "thrombolytic",
    route: "IV infusion",
    perKg: 0.9,
    outputUnit: "mg",
    capMax: 90,
    weightMin: 40,
    weightMax: 150,
    round: 0.1,
    durationMin: 60,
    notes: "10% as bolus over 1 min, remainder over 60 min.",
    reference: "NINDS, ECASS III",
    drugName: "Alteplase",
  },
  {
    id: "tnk",
    label: "Tenecteplase (TNK)",
    category: "thrombolytic",
    route: "IV bolus",
    perKg: 0.25,
    outputUnit: "mg",
    capMax: 25,
    weightMin: 40,
    weightMax: 150,
    round: 0.5,
    notes: "Single bolus over 5 seconds.",
    reference: "AcT, EXTEND-IA TNK",
    drugName: "Tenecteplase",
  },
  {
    id: "tirofiban-load",
    label: "Tirofiban IV loading (RESCUE-BT2)",
    category: "antiplatelet",
    route: "IV infusion",
    perKg: 0.4,
    outputUnit: "mcg/kg/min",
    durationMin: 30,
    concentration: { mg: 12.5, mL: 250 },
    concentrationUnit: "mcg/mL",
    renalReduce: { crclBelow: 30, factor: 0.5, note: "Reduce infusion by 50% if CrCl <30" },
    reference: "RESCUE-BT2 NEJM 2023",
    drugName: "Tirofiban",
  },
  {
    id: "tirofiban-maint",
    label: "Tirofiban IV maintenance",
    category: "antiplatelet",
    route: "IV infusion",
    perKg: 0.1,
    outputUnit: "mcg/kg/min",
    concentration: { mg: 12.5, mL: 250 },
    concentrationUnit: "mcg/mL",
    renalReduce: { crclBelow: 30, factor: 0.5, note: "Reduce by 50% if CrCl <30" },
    notes: "Continue up to 24 h.",
    drugName: "Tirofiban",
  },
  {
    id: "instant-load",
    label: "Tirofiban INSTANT loading (post-TNK)",
    category: "antiplatelet",
    route: "IV infusion",
    perKg: 0.3,
    outputUnit: "mcg/kg/min",
    durationMin: 30,
    concentration: { mg: 12.5, mL: 250 },
    concentrationUnit: "mcg/mL",
    renalReduce: { crclBelow: 30, factor: 0.5, note: "Reduce by 50% if CrCl <30" },
    reference: "INSTANT JAMA 2026",
    drugName: "Tirofiban",
  },
  {
    id: "instant-maint",
    label: "Tirofiban INSTANT maintenance",
    category: "antiplatelet",
    route: "IV infusion",
    perKg: 0.075,
    outputUnit: "mcg/kg/min",
    concentration: { mg: 12.5, mL: 250 },
    concentrationUnit: "mcg/mL",
    renalReduce: { crclBelow: 30, factor: 0.5, note: "Reduce by 50% if CrCl <30" },
    notes: "Continue 47.5 h.",
    drugName: "Tirofiban",
  },
  {
    id: "eptifibatide-bolus",
    label: "Eptifibatide IV bolus",
    category: "antiplatelet",
    route: "IV bolus",
    perKg: 180,
    outputUnit: "mcg",
    round: 100,
    contraindicationCrCl: 15,
    notes: "May repeat once at 5 min.",
    drugName: "Eptifibatide",
  },
  {
    id: "eptifibatide-maint",
    label: "Eptifibatide infusion",
    category: "antiplatelet",
    route: "IV infusion",
    perKg: 2,
    outputUnit: "mcg/kg/min",
    concentration: { mg: 75, mL: 100 },
    concentrationUnit: "mcg/mL",
    renalReduce: { crclBelow: 50, factor: 0.5, note: "Halve infusion if CrCl <50" },
    contraindicationCrCl: 15,
    drugName: "Eptifibatide",
  },
  {
    id: "cangrelor",
    label: "Cangrelor neuro infusion (low-dose, no bolus)",
    category: "antiplatelet",
    route: "IV infusion",
    perKg: 0.75,
    outputUnit: "mcg/kg/min",
    concentration: { mg: 50, mL: 250 },
    concentrationUnit: "mcg/mL",
    notes: "Do NOT give oral clopidogrel/prasugrel while infusing.",
    drugName: "Cangrelor",
  },
  {
    id: "enoxaparin-tx",
    label: "Enoxaparin treatment dose",
    category: "anticoagulant",
    route: "SC",
    perKg: 1,
    outputUnit: "mg",
    round: 5,
    renalReduce: { crclBelow: 30, factor: 1, note: "CrCl <30: give 1 mg/kg SC DAILY (not q12h)" },
    notes: "1 mg/kg SC q12h — or 1.5 mg/kg SC daily.",
    drugName: "Enoxaparin",
  },
  {
    id: "heparin-bolus",
    label: "UFH bolus",
    category: "anticoagulant",
    route: "IV bolus",
    perKg: 80,
    outputUnit: "U",
    round: 100,
    capMax: 10000,
    notes: "Titrate infusion to aPTT 1.5–2× control.",
    drugName: "Unfractionated Heparin (UFH)",
  },
  {
    id: "heparin-infusion",
    label: "UFH infusion",
    category: "anticoagulant",
    route: "IV infusion",
    perKg: 18,
    outputUnit: "U/hr",
    round: 50,
    drugName: "Unfractionated Heparin (UFH)",
  },
];

interface CalcResult {
  dose: number;
  displayDose: string;
  totalDose?: string;
  mlHr?: string;
  warnings: string[];
  errors: string[];
  capped: boolean;
  renalAdjusted: boolean;
}

export interface RoundingPrefs {
  mg?: number;      // override for mg-unit doses
  mcg?: number;     // override for mcg-unit doses
  units?: number;   // override for U doses
  rate?: number;    // override for mcg/kg/min display rounding (mcg/min)
  mlHr?: number;    // rounding for mL/hr pump rate
}

function pickRound(spec: CalcSpec, prefs?: RoundingPrefs): number {
  if (!prefs) return spec.round ?? 0.1;
  if (spec.outputUnit === "mg" && prefs.mg !== undefined) return prefs.mg;
  if (spec.outputUnit === "mcg" && prefs.mcg !== undefined) return prefs.mcg;
  if ((spec.outputUnit === "U" || spec.outputUnit === "U/hr") && prefs.units !== undefined) return prefs.units;
  if (spec.outputUnit === "mcg/kg/min" && prefs.rate !== undefined) return prefs.rate;
  return spec.round ?? 0.1;
}

function calcDose(spec: CalcSpec, weightKg: number, crcl?: number, prefs?: RoundingPrefs): CalcResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let capped = false;
  let renalAdjusted = false;

  if (spec.weightMin && weightKg < spec.weightMin) {
    warnings.push(`Weight ${weightKg} kg below tested range (${spec.weightMin}–${spec.weightMax} kg) — verify pediatric protocol.`);
  }
  if (spec.weightMax && weightKg > spec.weightMax) {
    warnings.push(`Weight ${weightKg} kg above tested range (max ${spec.weightMax} kg) — use max-cap dosing.`);
  }

  if (spec.contraindicationCrCl !== undefined && crcl !== undefined && crcl < spec.contraindicationCrCl) {
    errors.push(`CONTRAINDICATED: CrCl ${crcl} < ${spec.contraindicationCrCl} mL/min — do not administer.`);
  }

  let dose = weightKg * spec.perKg;

  if (spec.capMax && dose > spec.capMax) {
    dose = spec.capMax;
    capped = true;
    warnings.push(`Dose capped at guideline maximum ${spec.capMax} ${spec.outputUnit}.`);
  }

  if (spec.renalReduce && crcl !== undefined && crcl < spec.renalReduce.crclBelow) {
    if (spec.renalReduce.factor !== 1) {
      dose = dose * spec.renalReduce.factor;
      renalAdjusted = true;
    }
    warnings.push(spec.renalReduce.note);
  }

  const step = pickRound(spec, prefs);
  const rounded = round(dose, step);

  const displayDose = spec.outputUnit === "mcg/kg/min"
    ? `${(spec.perKg * (renalAdjusted ? spec.renalReduce!.factor : 1)).toFixed(3)} mcg/kg/min → ${(rounded).toFixed(2)} mcg/min for ${weightKg} kg`
    : `${rounded.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${spec.outputUnit}`;

  let totalDose: string | undefined;
  if (spec.id === "alteplase") {
    const bolus = round(rounded * 0.1, step);
    const infusion = round(rounded - bolus, step);
    totalDose = `Bolus ${bolus.toFixed(1)} mg over 1 min → then ${infusion.toFixed(1)} mg over 60 min`;
  } else if (spec.durationMin && spec.outputUnit === "mcg/kg/min") {
    const totalMcg = rounded * spec.durationMin;
    totalDose = `Cumulative over ${spec.durationMin} min: ${totalMcg.toLocaleString(undefined, { maximumFractionDigits: 0 })} mcg (${(totalMcg / 1000).toFixed(2)} mg)`;
  }

  let mlHr: string | undefined;
  if (spec.concentration && spec.outputUnit === "mcg/kg/min") {
    const concMcgPerMl = (spec.concentration.mg * 1000) / spec.concentration.mL;
    const mcgPerHr = rounded * 60;
    const rate = mcgPerHr / concMcgPerMl;
    const mlStep = prefs?.mlHr ?? 0.1;
    mlHr = `${round(rate, mlStep).toFixed(mlStep < 1 ? 1 : 0)} mL/hr @ ${concMcgPerMl.toFixed(0)} mcg/mL (${spec.concentration.mg} mg in ${spec.concentration.mL} mL)`;
  }

  return { dose: rounded, displayDose, totalDose, mlHr, warnings, errors, capped, renalAdjusted };
}

/* ------------------------------------------------------------------ */
/* UI                                                                  */
/* ------------------------------------------------------------------ */
const CATEGORY_STYLE: Record<
  DrugCategory,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  antiplatelet: { label: "Antiplatelets", badge: "bg-blue-500/15 text-blue-300 border-blue-400/30", icon: <Pill className="h-4 w-4" /> },
  anticoagulant: { label: "Anticoagulants", badge: "bg-purple-500/15 text-purple-300 border-purple-400/30", icon: <Syringe className="h-4 w-4" /> },
  thrombolytic: { label: "Thrombolytics", badge: "bg-amber-500/15 text-amber-300 border-amber-400/30", icon: <Beaker className="h-4 w-4" /> },
  reversal: { label: "Reversal Agents", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30", icon: <ShieldAlert className="h-4 w-4" /> },
  "blood-product": { label: "Blood Products", badge: "bg-rose-500/15 text-rose-300 border-rose-400/30", icon: <Droplets className="h-4 w-4" /> },
};

const Row: React.FC<{ label: string; value: string; tone?: "danger" | "warn"; highlight?: boolean }> = ({ label, value, tone, highlight }) => {
  const toneCls =
    tone === "danger" ? "text-red-300 bg-red-500/10 border-red-500/30"
    : tone === "warn" ? "text-amber-200 bg-amber-500/10 border-amber-500/30"
    : highlight ? "text-cyan-100 bg-cyan-500/10 border-cyan-500/30"
    : "text-slate-200 bg-slate-800/40 border-slate-700";
  return (
    <div className={`rounded-md border p-2 ${toneCls}`}>
      <p className="text-[11px] uppercase tracking-wide font-semibold opacity-80">{label}</p>
      <p className="text-sm leading-snug whitespace-pre-wrap">{value}</p>
    </div>
  );
};

const DrugCard: React.FC<{
  drug: Drug;
  selected: boolean;
  onToggle: () => void;
}> = ({ drug, selected, onToggle }) => {
  const [open, setOpen] = useState(false);
  const style = CATEGORY_STYLE[drug.category];
  return (
    <Card className={`border transition-colors ${selected ? "border-cyan-500/60 bg-cyan-950/20" : "border-slate-700 bg-slate-900/60"}`}>
      <div className="flex items-start gap-2 p-3">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          className="mt-1 border-slate-500 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-500"
          aria-label={`Select ${drug.name}`}
        />
        <Collapsible open={open} onOpenChange={setOpen} className="flex-1 min-w-0">
          <CollapsibleTrigger asChild>
            <button className="w-full text-left">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {style.icon}
                  <div className="min-w-0">
                    <p className="text-base text-white truncate font-semibold">
                      {drug.name}
                      {drug.aliases && <span className="text-xs font-normal text-slate-400 ml-2">({drug.aliases})</span>}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{drug.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={style.badge}>{drug.route}</Badge>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="pt-3 space-y-2 text-sm">
              <Row label="Indication" value={drug.indication} />
              <Row label="Dose" value={drug.dose} highlight />
              <Row label="Onset & Duration" value={`${drug.onset || "Not specified"}${drug.duration ? ` · Duration: ${drug.duration}` : ""}`} />
              <Row label="Contraindications" value={drug.contraindications} tone="danger" />
              <Row label="Monitoring" value={drug.monitoring} tone="warn" />
              {drug.notes && <Row label="Notes" value={drug.notes} />}
              {drug.evidence && (
                <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-700">Evidence: {drug.evidence}</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/* Export helpers                                                      */
/* ------------------------------------------------------------------ */
function drugToText(d: Drug): string {
  const lines = [
    `━━━ ${d.name.toUpperCase()}${d.aliases ? ` (${d.aliases})` : ""} ━━━`,
    `Category    : ${CATEGORY_STYLE[d.category].label}`,
    `Class       : ${d.class}`,
    `Route       : ${d.route}`,
    `Indication  : ${d.indication}`,
    `Dose        : ${d.dose}`,
  ];
  if (d.onset) lines.push(`Onset       : ${d.onset}`);
  if (d.duration) lines.push(`Duration    : ${d.duration}`);
  lines.push(`Contra-Ind. : ${d.contraindications}`);
  lines.push(`Monitoring  : ${d.monitoring}`);
  if (d.notes) lines.push(`Notes       : ${d.notes}`);
  if (d.evidence) lines.push(`Evidence    : ${d.evidence}`);
  return lines.join("\n");
}

function buildExport(drugs: Drug[]): string {
  const header = [
    "STROKE MEDICATIONS REFERENCE EXPORT",
    `Generated: ${new Date().toLocaleString()}`,
    `Selected  : ${drugs.length} drug(s)`,
    "Reference only — verify all doses against institutional protocol.",
    "",
  ].join("\n");
  return header + drugs.map(drugToText).join("\n\n") + "\n";
}

function download(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
const StrokeMedicationsFormulary: React.FC = () => {
  const [tab, setTab] = useState<DrugCategory | "all" | "calc">("all");
  const [q, setQ] = useState("");
  const [weight, setWeight] = useState<string>("70");
  const [crclStr, setCrclStr] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());
  const [rounding, setRounding] = useState<RoundingPrefs>({
    mg: 0.1, mcg: 100, units: 100, rate: 0.01, mlHr: 0.1,
  });
  const toggleDetail = (id: string) =>
    setExpandedDetails((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  const drugByName = useMemo(() => {
    const m = new Map<string, Drug>();
    DRUGS.forEach((d) => m.set(d.name, d));
    return m;
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return DRUGS.filter((d) => {
      if (tab !== "all" && tab !== "calc" && d.category !== tab) return false;
      if (!query) return true;
      return (
        d.name.toLowerCase().includes(query) ||
        (d.aliases ?? "").toLowerCase().includes(query) ||
        d.class.toLowerCase().includes(query) ||
        d.indication.toLowerCase().includes(query) ||
        d.route.toLowerCase().includes(query)
      );
    });
  }, [tab, q]);

  const toggle = (name: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const selectAllVisible = () =>
    setSelected((s) => {
      const next = new Set(s);
      filtered.forEach((d) => next.add(d.name));
      return next;
    });

  const clearSelection = () => setSelected(new Set());

  const selectedDrugs = useMemo(() => DRUGS.filter((d) => selected.has(d.name)), [selected]);

  const doExport = (mode: "download" | "copy") => {
    if (selectedDrugs.length === 0) {
      toast.error("Select at least one drug to export.");
      return;
    }
    const text = buildExport(selectedDrugs);
    if (mode === "download") {
      download(text, `stroke-medications-${new Date().toISOString().slice(0, 10)}.txt`);
      toast.success(`Exported ${selectedDrugs.length} drug(s) as .txt`);
    } else {
      navigator.clipboard.writeText(text).then(
        () => toast.success(`Copied ${selectedDrugs.length} drug(s) to clipboard`),
        () => toast.error("Clipboard blocked — use download instead"),
      );
    }
  };

  const w = parseFloat(weight);
  const wValid = !isNaN(w) && w >= 20 && w <= 250;
  const crclNum = crclStr.trim() === "" ? undefined : parseFloat(crclStr);
  const crclValid = crclNum === undefined || (!isNaN(crclNum) && crclNum >= 5 && crclNum <= 200);

  return (
    <Card id="medications-formulary" className="border-slate-700 bg-slate-950/70">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30">
            <Pill className="h-6 w-6 text-cyan-300" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl text-white">Stroke, SAH, CVT &amp; ICH Medications Formulary</CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Search, filter, and export {DRUGS.length} drugs with weight-based dose calculator
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <Input
          placeholder="Search drug, brand, class, indication, route (e.g. IA, IV)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />

        {/* Selection toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-slate-900/60 border border-slate-700">
          <Badge variant="outline" className="bg-cyan-500/15 text-cyan-200 border-cyan-400/40">
            {selected.size} selected
          </Badge>
          <Button size="sm" variant="outline" onClick={selectAllVisible} className="h-8 border-slate-600 text-slate-200 hover:bg-slate-800">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Select visible
          </Button>
          <Button size="sm" variant="outline" onClick={clearSelection} className="h-8 border-slate-600 text-slate-200 hover:bg-slate-800" disabled={selected.size === 0}>
            <X className="h-3.5 w-3.5 mr-1" /> Clear
          </Button>
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={() => doExport("copy")} className="h-8 bg-slate-700 hover:bg-slate-600 text-white">
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy .txt
            </Button>
            <Button size="sm" onClick={() => doExport("download")} className="h-8 bg-cyan-600 hover:bg-cyan-500 text-white">
              <Download className="h-3.5 w-3.5 mr-1" /> Download .txt
            </Button>
          </div>
        </div>

        {/* Antiplatelet switching guide — shown on All & Antiplatelets tabs */}
        {(tab === "all" || tab === "antiplatelet") && (
          <AntiplateletSwitchingGuide
            onSelectDrug={(drugName) => {
              setTab("antiplatelet");
              setQ(drugName);
              setTimeout(() => {
                document
                  .getElementById("medications-formulary")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 50);
            }}
          />
        )}

        {/* Category filters */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-7 h-auto bg-slate-900 border border-slate-700 p-1 gap-1">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">All ({DRUGS.length})</TabsTrigger>
            <TabsTrigger value="antiplatelet" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">Antiplatelets</TabsTrigger>
            <TabsTrigger value="anticoagulant" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300">Anticoagulants</TabsTrigger>
            <TabsTrigger value="thrombolytic" className="text-xs data-[state=active]:bg-amber-600 data-[state=active]:text-white text-slate-300">Thrombolytics</TabsTrigger>
            <TabsTrigger value="reversal" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-300">Reversal</TabsTrigger>
            <TabsTrigger value="blood-product" className="text-xs data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-300">Blood Products</TabsTrigger>
            <TabsTrigger value="calc" className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-300">
              <Calculator className="h-3 w-3 mr-1" /> Calc
            </TabsTrigger>
          </TabsList>

          {(["all", "antiplatelet", "anticoagulant", "thrombolytic", "reversal", "blood-product"] as const).map((t) => (
            <TabsContent key={t} value={t} className="mt-4 space-y-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-400 py-8 text-center">No matches.</p>
              ) : (
                filtered.map((d) => (
                  <DrugCard key={d.name} drug={d} selected={selected.has(d.name)} onToggle={() => toggle(d.name)} />
                ))
              )}
            </TabsContent>
          ))}

          <TabsContent value="calc" className="mt-4 space-y-4">
            <Card className="border-cyan-500/40 bg-cyan-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-cyan-200 flex items-center gap-2">
                  <Calculator className="h-4 w-4" /> Unit-aware weight-based dose calculator
                </CardTitle>
                <p className="text-xs text-slate-400">
                  Enter weight (kg) and optionally CrCl (mL/min). Doses auto-round to safe increments and validate
                  against guideline ranges, weight caps, and renal thresholds.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                  <div>
                    <Label htmlFor="wt" className="text-slate-200 text-xs">Weight (kg)</Label>
                    <Input
                      id="wt"
                      type="number"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      min={20}
                      max={250}
                      className="bg-slate-900 border-slate-700 text-white mt-1"
                    />
                    {!wValid && (
                      <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Weight 20–250 kg required
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="crcl" className="text-slate-200 text-xs">CrCl (mL/min) — optional</Label>
                    <Input
                      id="crcl"
                      type="number"
                      inputMode="decimal"
                      value={crclStr}
                      onChange={(e) => setCrclStr(e.target.value)}
                      placeholder="e.g. 45"
                      min={5}
                      max={200}
                      className="bg-slate-900 border-slate-700 text-white mt-1"
                    />
                    {!crclValid && (
                      <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> CrCl 5–200 mL/min
                      </p>
                    )}
                  </div>
                </div>

                {/* Configurable rounding rules */}
                <div className="rounded-md border border-slate-700 bg-slate-900/60 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300 font-semibold mb-2">
                    Dose rounding rules
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    {([
                      { key: "mg", label: "mg doses", opts: [0.01, 0.1, 0.5, 1, 5] },
                      { key: "mcg", label: "mcg boluses", opts: [10, 50, 100, 250, 500] },
                      { key: "units", label: "Units (heparin)", opts: [10, 50, 100, 250, 500] },
                      { key: "rate", label: "mcg/min rate", opts: [0.01, 0.1, 0.5, 1] },
                      { key: "mlHr", label: "mL/hr pump", opts: [0.1, 0.5, 1] },
                    ] as const).map((f) => (
                      <div key={f.key}>
                        <Label className="text-slate-300 text-[11px]">{f.label}</Label>
                        <select
                          value={rounding[f.key]}
                          onChange={(e) =>
                            setRounding((p) => ({ ...p, [f.key]: parseFloat(e.target.value) }))
                          }
                          className="mt-1 w-full h-8 rounded-md bg-slate-800 border border-slate-700 text-white text-xs px-2"
                        >
                          {f.opts.map((o) => (
                            <option key={o} value={o}>nearest {o}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-2">
                    Rounding applies to every calculated dose below.
                  </p>
                </div>

                {wValid && crclValid && (
                  <div className="grid gap-2">
                    {CALCS.map((spec) => {
                      const r = calcDose(spec, w, crclNum, rounding);
                      const contra = r.errors.length > 0;
                      const linked = spec.drugName ? drugByName.get(spec.drugName) : undefined;
                      const detailOpen = expandedDetails.has(spec.id);
                      return (
                        <div
                          key={spec.id}
                          className={`p-3 rounded-md border ${
                            contra ? "bg-red-950/40 border-red-500/50"
                            : r.warnings.length > 0 ? "bg-amber-950/30 border-amber-500/40"
                            : "bg-slate-900/70 border-slate-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                              {spec.label} <span className="text-slate-500 normal-case">· {spec.route}</span>
                            </p>
                            <div className="flex gap-1 shrink-0">
                              {r.capped && <Badge className="bg-amber-600/30 text-amber-200 border-amber-500/40 text-[10px]">CAPPED</Badge>}
                              {r.renalAdjusted && <Badge className="bg-purple-600/30 text-purple-200 border-purple-500/40 text-[10px]">RENAL ADJ</Badge>}
                              {contra && <Badge className="bg-red-600/40 text-red-100 border-red-500/50 text-[10px]">CONTRA</Badge>}
                            </div>
                          </div>
                          <p className="text-sm text-cyan-100 font-mono mt-1">{r.displayDose}</p>
                          {r.totalDose && <p className="text-xs text-slate-300 font-mono">{r.totalDose}</p>}
                          {r.mlHr && <p className="text-xs text-slate-300 font-mono">Pump: {r.mlHr}</p>}
                          {r.errors.map((e, i) => (
                            <p key={`e${i}`} className="text-xs text-red-200 mt-1 flex gap-1 items-start">
                              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" /> {e}
                            </p>
                          ))}
                          {r.warnings.map((w2, i) => (
                            <p key={`w${i}`} className="text-xs text-amber-200 mt-1 flex gap-1 items-start">
                              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" /> {w2}
                            </p>
                          ))}
                          {spec.notes && <p className="text-[11px] text-slate-400 mt-1 italic">{spec.notes}</p>}
                          {spec.reference && <p className="text-[10px] text-slate-500 italic">Ref: {spec.reference}</p>}

                          {linked && (
                            <div className="mt-2">
                              <button
                                onClick={() => toggleDetail(spec.id)}
                                className="text-[11px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                              >
                                <ChevronDown className={`h-3 w-3 transition-transform ${detailOpen ? "rotate-180" : ""}`} />
                                {detailOpen ? "Hide" : "Show"} drug details (contraindications, renal, guideline range)
                              </button>
                              {detailOpen && (
                                <div className="mt-2 space-y-2 border-t border-slate-700 pt-2">
                                  <Row label="Guideline dose range" value={linked.dose} highlight />
                                  {linked.onset && (
                                    <Row label="Onset of action" value={linked.onset} />
                                  )}
                                  {linked.duration && (
                                    <Row label="Duration of action" value={linked.duration} />
                                  )}
                                  {(spec.weightMin || spec.weightMax || spec.capMax) && (
                                    <Row
                                      label="Validated weight / cap range"
                                      value={[
                                        spec.weightMin && spec.weightMax
                                          ? `Weight ${spec.weightMin}–${spec.weightMax} kg`
                                          : null,
                                        spec.capMax ? `Absolute max ${spec.capMax} ${spec.outputUnit}` : null,
                                      ].filter(Boolean).join(" · ")}
                                    />
                                  )}
                                  <Row label="Contraindications" value={linked.contraindications} tone="danger" />
                                  {(spec.renalReduce || spec.contraindicationCrCl !== undefined) && (
                                    <Row
                                      label="Renal adjustment"
                                      value={[
                                        spec.renalReduce ? spec.renalReduce.note : null,
                                        spec.contraindicationCrCl !== undefined
                                          ? `Contraindicated if CrCl < ${spec.contraindicationCrCl} mL/min`
                                          : null,
                                        !spec.renalReduce && spec.contraindicationCrCl === undefined
                                          ? "No renal dose adjustment required."
                                          : null,
                                      ].filter(Boolean).join(" · ")}
                                      tone="warn"
                                    />
                                  )}
                                  <Row label="Monitoring" value={linked.monitoring} tone="warn" />
                                  {linked.evidence && (
                                    <p className="text-[10px] text-slate-400 italic">
                                      Guideline reference: {linked.evidence}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-md p-3 flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    Bedside aid only. Doses are auto-rounded to safe increments (0.1 mg for tPA, 0.5 mg TNK,
                    5 mg enoxaparin, 100 U heparin). Warnings appear when weight is outside tested range, when
                    dose is capped, or when CrCl triggers renal adjustment/contraindication. Always verify
                    against your institutional protocol and package insert.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-[11px] text-slate-500 italic text-center pt-2 border-t border-slate-800">
          Reference only — verify all doses. AHA/ASA 2026, ESO 2024, package inserts.
        </p>
      </CardContent>
    </Card>
  );
};

export default StrokeMedicationsFormulary;

