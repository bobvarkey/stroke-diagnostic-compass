import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Pill,
  Syringe,
  Droplets,
  ShieldAlert,
  Calculator,
  ChevronDown,
  AlertTriangle,
  Beaker,
} from "lucide-react";

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
    contraindications: "Antiplatelet-associated spontaneous ICH (PATCH trial — worse outcome)",
    monitoring: "Platelet count 10 min and 1 h post; TRALI, TACO",
    notes:
      "PATCH: platelet transfusion for aspirin/clopidogrel ICH → worse outcome. Only give if platelets <100 K + planned neurosurgery.",
    evidence: "PATCH trial (Lancet 2016)",
  },
];

/* ------------------------------------------------------------------ */
/* Weight-based calculator                                             */
/* ------------------------------------------------------------------ */
type CalcDrug =
  | "alteplase"
  | "tnk"
  | "tirofiban-load"
  | "tirofiban-maint"
  | "instant-load"
  | "instant-maint"
  | "eptifibatide-bolus"
  | "eptifibatide-maint"
  | "cangrelor"
  | "enoxaparin"
  | "heparin";

const CALC_DEFS: Record<
  CalcDrug,
  { label: string; unit: string; compute: (w: number) => string; notes?: string }
> = {
  alteplase: {
    label: "Alteplase total dose (0.9 mg/kg, max 90 mg)",
    unit: "mg",
    compute: (w) => {
      const total = Math.min(w * 0.9, 90);
      const bolus = total * 0.1;
      const infusion = total - bolus;
      return `${total.toFixed(1)} mg total — Bolus ${bolus.toFixed(1)} mg over 1 min, then ${infusion.toFixed(1)} mg over 60 min`;
    },
  },
  tnk: {
    label: "Tenecteplase (0.25 mg/kg, max 25 mg)",
    unit: "mg",
    compute: (w) => {
      const d = Math.min(w * 0.25, 25);
      return `${d.toFixed(1)} mg IV bolus over 5 seconds`;
    },
  },
  "tirofiban-load": {
    label: "Tirofiban IV loading (0.4 mcg/kg/min × 30 min)",
    unit: "mcg/min",
    compute: (w) => {
      const rate = w * 0.4;
      const total = rate * 30;
      const mlHr = (rate * 60) / 50; // 50 mcg/mL
      return `${rate.toFixed(1)} mcg/min × 30 min = ${total.toFixed(0)} mcg total | Pump ${mlHr.toFixed(1)} mL/hr @ 50 mcg/mL`;
    },
  },
  "tirofiban-maint": {
    label: "Tirofiban IV maintenance (0.1 mcg/kg/min)",
    unit: "mcg/min",
    compute: (w) => {
      const rate = w * 0.1;
      const mlHr = (rate * 60) / 50;
      return `${rate.toFixed(1)} mcg/min | Pump ${mlHr.toFixed(1)} mL/hr @ 50 mcg/mL × up to 24 h`;
    },
  },
  "instant-load": {
    label: "Tirofiban INSTANT loading (0.3 mcg/kg/min × 30 min, post-TNK)",
    unit: "mcg/min",
    compute: (w) => {
      const rate = w * 0.3;
      const mlHr = (rate * 60) / 50;
      return `${rate.toFixed(1)} mcg/min × 30 min | ${mlHr.toFixed(1)} mL/hr @ 50 mcg/mL`;
    },
  },
  "instant-maint": {
    label: "Tirofiban INSTANT maintenance (0.075 mcg/kg/min × 47.5 h)",
    unit: "mcg/min",
    compute: (w) => {
      const rate = w * 0.075;
      const mlHr = (rate * 60) / 50;
      return `${rate.toFixed(1)} mcg/min | ${mlHr.toFixed(1)} mL/hr @ 50 mcg/mL × 47.5 h`;
    },
  },
  "eptifibatide-bolus": {
    label: "Eptifibatide bolus (180 mcg/kg)",
    unit: "mcg",
    compute: (w) => {
      const dose = w * 180;
      const ml = dose / 2000; // 2 mg/mL
      return `${dose.toFixed(0)} mcg (${(dose / 1000).toFixed(2)} mg) IV bolus = ${ml.toFixed(2)} mL @ 2 mg/mL`;
    },
  },
  "eptifibatide-maint": {
    label: "Eptifibatide infusion (2 mcg/kg/min; halve if CrCl <50)",
    unit: "mcg/min",
    compute: (w) => {
      const rate = w * 2;
      const mlHr = (rate * 60) / 750; // 0.75 mg/mL
      return `${rate.toFixed(1)} mcg/min | ${mlHr.toFixed(1)} mL/hr @ 0.75 mg/mL`;
    },
  },
  cangrelor: {
    label: "Cangrelor low-dose neuro infusion (0.75 mcg/kg/min, no bolus)",
    unit: "mcg/min",
    compute: (w) => {
      const rate = w * 0.75;
      // Reconstitute 50 mg in 250 mL NS → 200 mcg/mL
      const mlHr = (rate * 60) / 200;
      return `${rate.toFixed(1)} mcg/min | ${mlHr.toFixed(1)} mL/hr @ 200 mcg/mL (50 mg / 250 mL NS)`;
    },
  },
  enoxaparin: {
    label: "Enoxaparin treatment (1 mg/kg SC q12h)",
    unit: "mg",
    compute: (w) => `${(w * 1).toFixed(0)} mg SC q12h — or ${(w * 1.5).toFixed(0)} mg SC daily`,
  },
  heparin: {
    label: "UFH: 80 U/kg bolus + 18 U/kg/h infusion",
    unit: "U",
    compute: (w) => `Bolus ${(w * 80).toFixed(0)} U | Infusion ${(w * 18).toFixed(0)} U/hr — titrate to aPTT 1.5–2×`,
  },
};

/* ------------------------------------------------------------------ */
/* UI                                                                  */
/* ------------------------------------------------------------------ */
const CATEGORY_STYLE: Record<
  DrugCategory,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  antiplatelet: {
    label: "Antiplatelets",
    badge: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    icon: <Pill className="h-4 w-4" />,
  },
  anticoagulant: {
    label: "Anticoagulants",
    badge: "bg-purple-500/15 text-purple-300 border-purple-400/30",
    icon: <Syringe className="h-4 w-4" />,
  },
  thrombolytic: {
    label: "Thrombolytics",
    badge: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    icon: <Beaker className="h-4 w-4" />,
  },
  reversal: {
    label: "Reversal Agents",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    icon: <ShieldAlert className="h-4 w-4" />,
  },
  "blood-product": {
    label: "Blood Products",
    badge: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    icon: <Droplets className="h-4 w-4" />,
  },
};

const DrugCard: React.FC<{ drug: Drug }> = ({ drug }) => {
  const [open, setOpen] = useState(false);
  const style = CATEGORY_STYLE[drug.category];
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-slate-700 bg-slate-900/60">
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <CardHeader className="py-3 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {style.icon}
                  <div className="min-w-0">
                    <CardTitle className="text-base text-white truncate">
                      {drug.name}
                      {drug.aliases && (
                        <span className="text-xs font-normal text-slate-400 ml-2">
                          ({drug.aliases})
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-slate-400 truncate">{drug.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={style.badge}>
                    {drug.route}
                  </Badge>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </div>
              </div>
            </CardHeader>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3 text-sm">
            <Row label="Indication" value={drug.indication} />
            <Row label="Dose" value={drug.dose} highlight />
            {drug.duration && <Row label="Duration" value={drug.duration} />}
            <Row
              label="Contraindications"
              value={drug.contraindications}
              tone="danger"
            />
            <Row label="Monitoring" value={drug.monitoring} tone="warn" />
            {drug.notes && <Row label="Notes" value={drug.notes} />}
            {drug.evidence && (
              <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-700">
                Evidence: {drug.evidence}
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  tone?: "danger" | "warn";
  highlight?: boolean;
}> = ({ label, value, tone, highlight }) => {
  const toneCls =
    tone === "danger"
      ? "text-red-300 bg-red-500/10 border-red-500/30"
      : tone === "warn"
      ? "text-amber-200 bg-amber-500/10 border-amber-500/30"
      : highlight
      ? "text-cyan-100 bg-cyan-500/10 border-cyan-500/30"
      : "text-slate-200 bg-slate-800/40 border-slate-700";
  return (
    <div className={`rounded-md border p-2 ${toneCls}`}>
      <p className="text-[11px] uppercase tracking-wide font-semibold opacity-80">{label}</p>
      <p className="text-sm leading-snug">{value}</p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */
const StrokeMedicationsFormulary: React.FC = () => {
  const [tab, setTab] = useState<DrugCategory | "all" | "calc">("all");
  const [q, setQ] = useState("");
  const [weight, setWeight] = useState<string>("70");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return DRUGS.filter((d) => {
      if (tab !== "all" && tab !== "calc" && d.category !== tab) return false;
      if (!query) return true;
      return (
        d.name.toLowerCase().includes(query) ||
        (d.aliases ?? "").toLowerCase().includes(query) ||
        d.class.toLowerCase().includes(query) ||
        d.indication.toLowerCase().includes(query)
      );
    });
  }, [tab, q]);

  const w = parseFloat(weight);
  const wValid = !isNaN(w) && w >= 20 && w <= 250;

  return (
    <Card id="medications-formulary" className="border-slate-700 bg-slate-950/70">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30">
            <Pill className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <CardTitle className="text-xl text-white">
              Stroke, SAH, CVT &amp; ICH Medications Formulary
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Comprehensive drug reference with weight-based dose calculator
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search drug, brand, class, indication…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-7 h-auto bg-slate-900 border border-slate-700 p-1 gap-1">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
              All ({DRUGS.length})
            </TabsTrigger>
            <TabsTrigger value="antiplatelet" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300">
              Antiplatelets
            </TabsTrigger>
            <TabsTrigger value="anticoagulant" className="text-xs data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300">
              Anticoagulants
            </TabsTrigger>
            <TabsTrigger value="thrombolytic" className="text-xs data-[state=active]:bg-amber-600 data-[state=active]:text-white text-slate-300">
              Thrombolytics
            </TabsTrigger>
            <TabsTrigger value="reversal" className="text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-300">
              Reversal
            </TabsTrigger>
            <TabsTrigger value="blood-product" className="text-xs data-[state=active]:bg-rose-600 data-[state=active]:text-white text-slate-300">
              Blood Products
            </TabsTrigger>
            <TabsTrigger value="calc" className="text-xs data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-300">
              <Calculator className="h-3 w-3 mr-1" />
              Calc
            </TabsTrigger>
          </TabsList>

          {(["all", "antiplatelet", "anticoagulant", "thrombolytic", "reversal", "blood-product"] as const).map(
            (t) => (
              <TabsContent key={t} value={t} className="mt-4 space-y-2">
                {filtered.length === 0 ? (
                  <p className="text-sm text-slate-400 py-8 text-center">No matches.</p>
                ) : (
                  filtered.map((d) => <DrugCard key={d.name} drug={d} />)
                )}
              </TabsContent>
            )
          )}

          <TabsContent value="calc" className="mt-4 space-y-4">
            <Card className="border-cyan-500/40 bg-cyan-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-cyan-200 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Weight-based dose calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-xs">
                  <Label htmlFor="wt" className="text-slate-200">
                    Patient weight (kg)
                  </Label>
                  <Input
                    id="wt"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min={20}
                    max={250}
                    className="bg-slate-900 border-slate-700 text-white mt-1"
                  />
                  {!wValid && (
                    <p className="text-xs text-amber-300 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Enter weight between 20 and 250 kg
                    </p>
                  )}
                </div>

                {wValid && (
                  <div className="grid gap-2">
                    {(Object.keys(CALC_DEFS) as CalcDrug[]).map((k) => {
                      const def = CALC_DEFS[k];
                      return (
                        <div
                          key={k}
                          className="p-3 rounded-md bg-slate-900/70 border border-slate-700"
                        >
                          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                            {def.label}
                          </p>
                          <p className="text-sm text-cyan-100 font-mono mt-1">
                            {def.compute(w)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-md p-3 flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    Calculator is a bedside aid. Always verify against institutional protocol,
                    renal function, and package insert. Reduce tirofiban/eptifibatide by 50% if
                    CrCl &lt;30 (tirofiban) or &lt;50 (eptifibatide). Cap tPA at 90 mg and TNK at 25 mg.
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
