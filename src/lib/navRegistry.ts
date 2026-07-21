import {
  AlertTriangle, Activity, Brain, Heart, TestTube, Calculator, ClipboardList,
  FileText, Scale, Target, Zap, Droplets, Stethoscope, Beaker, BookOpen,
  Pill, ShieldAlert, Waves, GitBranch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItemMeta {
  id: string;
  label: string;
  keywords?: string[];
  icon: LucideIcon;
  color: string; // tailwind text-* class
  parent: string;
}

export interface NavGroupMeta {
  title: string;
  color: string;
  items: NavItemMeta[];
}

export const NAV_GROUPS: NavGroupMeta[] = [
  {
    title: "Acute Management",
    color: "text-orange-500",
    items: [
      { id: "stroke-code", label: "⚡ STROKE CODE", icon: Zap, color: "text-red-500", parent: "Acute Management", keywords: ["emergency","activate","code","alert"] },
      { id: "acute-algorithm", label: "Acute Stroke Algorithm", icon: AlertTriangle, color: "text-orange-500", parent: "Acute Management", keywords: ["algorithm","decision","tree"] },
      { id: "ivt-management", label: "IVT Management", icon: Zap, color: "text-amber-500", parent: "Acute Management", keywords: ["alteplase","tnk","thrombolysis","tpa"] },
      { id: "post-ivt-hemorrhage", label: "Post IVT-ICH", icon: Droplets, color: "text-rose-500", parent: "Acute Management", keywords: ["bleed","hemorrhage","reversal"] },
      { id: "cvt-management", label: "CVT Management", icon: Brain, color: "text-violet-500", parent: "Acute Management", keywords: ["venous","sinus","thrombosis"] },
      { id: "lvo-dashboard", label: "LVO Dashboard", icon: Target, color: "text-fuchsia-500", parent: "Acute Management", keywords: ["large vessel","evt","thrombectomy"] },
      { id: "treatment-decision", label: "Treatment Decisions", icon: Scale, color: "text-blue-400", parent: "Acute Management", keywords: ["decide","aid"] },
    ],
  },
  {
    title: "Imaging & Assessment",
    color: "text-cyan-400",
    items: [
      { id: "ctp-penumbra", label: "CTP Penumbra", icon: Brain, color: "text-cyan-400", parent: "Imaging & Assessment", keywords: ["perfusion","dawn","defuse"] },
      { id: "aspects-calculator", label: "ASPECTS Calculator", icon: Brain, color: "text-sky-400", parent: "Imaging & Assessment", keywords: ["ct","score","early ischemic"] },
      { id: "vascular-anatomy", label: "Vascular Anatomy", icon: Heart, color: "text-pink-500", parent: "Imaging & Assessment", keywords: ["circle of willis","mca","ica"] },
    ],
  },
  {
    title: "Clinical Scores",
    color: "text-emerald-400",
    items: [
      { id: "nihss-calculator", label: "NIHSS Calculator", icon: Calculator, color: "text-emerald-400", parent: "Clinical Scores", keywords: ["severity","stroke scale"] },
      { id: "gcs-calculator", label: "GCS Calculator", icon: Brain, color: "text-teal-400", parent: "Clinical Scores", keywords: ["coma","consciousness"] },
      { id: "prevent-score", label: "PREVENT Score", icon: Activity, color: "text-lime-400", parent: "Clinical Scores", keywords: ["cardiovascular","risk"] },
    ],
  },
  {
    title: "Risk Assessment",
    color: "text-amber-400",
    items: [
      { id: "kdigo-heatmap", label: "KDIGO Heat Map", icon: Activity, color: "text-amber-400", parent: "Risk Assessment", keywords: ["ckd","kidney","egfr"] },
      { id: "prime-tool", label: "PRIME Tool", icon: ShieldAlert, color: "text-orange-400", parent: "Risk Assessment", keywords: ["malignancy","cancer"] },
      { id: "lipid-risk", label: "Lipid Risk", icon: TestTube, color: "text-yellow-400", parent: "Risk Assessment", keywords: ["ldl","apob","lpa"] },
    ],
  },
  {
    title: "Medications",
    color: "text-fuchsia-400",
    items: [
      { id: "stroke-meds", label: "Meds Formulary", icon: Pill, color: "text-fuchsia-400", parent: "Medications", keywords: ["drugs","antiplatelet","anticoagulant","heparin"] },
      { id: "thrombolytics-anticoagulants", label: "Thrombolytics & Anticoagulants", icon: Waves, color: "text-rose-400", parent: "Medications", keywords: ["tirofiban","cangrelor","tnk","alteplase"] },
      { id: "antiplatelet-switching", label: "Antiplatelet Switching", icon: GitBranch, color: "text-pink-400", parent: "Medications", keywords: ["clopidogrel","ticagrelor","prasugrel"] },
    ],
  },
  {
    title: "Documentation",
    color: "text-violet-400",
    items: [
      { id: "stroke-history", label: "Stroke History", icon: ClipboardList, color: "text-violet-400", parent: "Documentation", keywords: ["template","documentation"] },
      { id: "stroke-phenotyping", label: "Stroke Phenotyping", icon: FileText, color: "text-purple-400", parent: "Documentation", keywords: ["isps25","toast","etiology"] },
      { id: "workup-checklist", label: "Workup Checklist", icon: ClipboardList, color: "text-indigo-400", parent: "Documentation", keywords: ["checklist","order set"] },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItemMeta[] = NAV_GROUPS.flatMap((g) => g.items);
