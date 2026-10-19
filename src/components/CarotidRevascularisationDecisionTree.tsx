import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ExternalLink, GitBranch, RotateCcw, ShieldAlert } from "lucide-react";

type Option = {
  label: string;
  next?: string;
  recommendation?: string;
  source?: string;
};

type AlgorithmNode = {
  question?: string;
  options?: Option[];
  recommendation?: string;
  source?: string;
};

type View =
  | { kind: "node"; id: string }
  | { kind: "recommendation"; text: string; source?: string };

const CREST_H_SOURCE = "https://jamanetwork.com/journals/jama/article-abstract/2854196";

type HistoryEntry = { view: View; path: string[] };

const START_NODE = "symptoms";

const NODES: Record<string, AlgorithmNode> = {
  symptoms: {
    question:
      "Recent ipsilateral carotid territory symptoms (TIA or stroke) within the past 6 months?",
    options: [
      { label: "Yes (Symptomatic)", next: "symptomatic_timing_check" },
      { label: "No (Asymptomatic)", next: "asymptomatic_stenosis" },
    ],
  },
  symptomatic_timing_check: {
    question:
      "Is the patient neurologically stable (mRS 0–2, non-disabling symptoms)?",
    options: [
      { label: "Yes – stable", next: "symptomatic_stenosis" },
      {
        label: "No – disabling stroke (mRS ≥3) or large infarct",
        recommendation:
          "Defer revascularization until neurological improvement. Early intervention risks hemorrhagic transformation.",
      },
    ],
  },
  symptomatic_stenosis: {
    question: "Degree of ipsilateral stenosis (NASCET method)?",
    options: [
      { label: "70–99% (High-grade)", next: "symptomatic_high_grade" },
      { label: "50–69%", next: "symptomatic_moderate" },
      { label: "<50%", next: "medical_only_symptomatic" },
    ],
  },
  symptomatic_high_grade: {
    question: "Contralateral carotid status?",
    options: [
      {
        label: "Contralateral occlusion",
        next: "symptomatic_high_grade_contralateral_occlusion",
      },
      {
        label: "Significant contralateral stenosis (≥50%)",
        next: "symptomatic_high_grade_contralateral_stenosis",
      },
      {
        label: "No significant contralateral disease",
        next: "symptomatic_severe_timing",
      },
    ],
  },
  symptomatic_high_grade_contralateral_occlusion: {
    question:
      "High-grade ipsilateral + contralateral occlusion. Time since symptoms?",
    options: [
      { label: "48 hours to 14 days", next: "symptomatic_procedural_risk" },
      {
        label: "Other timing",
        recommendation:
          "Contralateral occlusion is a high-risk feature. Aim for the preferred window if proceeding. Carefully assess procedural risk.",
      },
    ],
  },
  symptomatic_high_grade_contralateral_stenosis: {
    question:
      "High-grade ipsilateral + significant contralateral stenosis. Time since symptoms?",
    options: [
      { label: "48 hours to 14 days", next: "symptomatic_procedural_risk" },
      {
        label: "Other timing",
        recommendation:
          "Significant contralateral stenosis increases overall risk. Intervention on the symptomatic side is still supported in the preferred window if procedural risk is acceptable.",
      },
    ],
  },
  symptomatic_severe_timing: {
    question: "Time since last symptomatic event?",
    options: [
      {
        label: "48 hours to 14 days (preferred window)",
        next: "symptomatic_procedural_risk",
      },
      { label: "<48 hours", next: "very_early_decision" },
      {
        label: ">14 days",
        recommendation:
          "Benefit declines after 14 days. Proceed only if still indicated and risk remains low.",
      },
    ],
  },
  very_early_decision: {
    question: "Is this crescendo TIA or stroke-in-evolution?",
    options: [
      {
        label: "Yes",
        recommendation:
          "Urgent CEA may be considered in highly selected cases.",
      },
      {
        label: "No",
        recommendation:
          "Avoid intervention within the first 48 hours due to higher stroke risk.",
      },
    ],
  },
  symptomatic_procedural_risk: {
    question:
      "Can the procedure be performed with documented 30-day stroke/death risk <6%?",
    options: [
      { label: "Yes", next: "symptomatic_method_choice" },
      {
        label: "No / High risk",
        recommendation:
          "Optimize intensive medical therapy. Consider only in experienced high-volume centers.",
      },
    ],
  },
  symptomatic_method_choice: {
    question: "Preferred revascularization method",
    options: [
      {
        label: "CEA",
        recommendation:
          "CEA recommended for high-grade symptomatic stenosis. Preferred early.",
      },
      {
        label: "TCAR",
        recommendation:
          "TCAR may be considered, especially with contralateral disease or high surgical risk.",
      },
      {
        label: "Transfemoral CAS",
        recommendation:
          "Alternative in selected patients. Higher early stroke risk.",
      },
    ],
  },
  symptomatic_moderate: {
    question: "Contralateral status or other high-risk features?",
    options: [
      {
        label: "Contralateral occlusion",
        recommendation:
          "CEA can be considered for 50–69% stenosis with contralateral occlusion. Aim for the 48 h–14 day window.",
      },
      {
        label: "Significant contralateral stenosis (≥50%)",
        recommendation:
          "CEA may be considered with shared decision-making. Contralateral stenosis is a relative high-risk feature.",
      },
      {
        label: "Other high-risk features",
        recommendation: "CEA can be considered (modest benefit).",
      },
      { label: "None", recommendation: "Intensive medical therapy preferred." },
    ],
  },
  medical_only_symptomatic: {
    recommendation:
      "No role for revascularization. Intensive medical therapy only.",
  },
  asymptomatic_stenosis: {
    question: "Degree of stenosis?",
    options: [
      { label: "≥70% (High-grade)", next: "asymptomatic_high_grade" },
      { label: "60–69%", next: "asymptomatic_moderate" },
      { label: "<60%", next: "medical_only_asymptomatic" },
    ],
  },
  asymptomatic_high_grade: {
    question: "Contralateral carotid status?",
    options: [
      {
        label: "Contralateral occlusion",
        next: "asymptomatic_high_grade_contralateral_occlusion",
      },
      {
        label: "Significant contralateral stenosis (≥50–70%)",
        next: "asymptomatic_high_grade_contralateral_stenosis",
      },
      {
        label: "No significant contralateral disease",
        next: "asymptomatic_high_grade_other",
      },
    ],
  },
  asymptomatic_high_grade_contralateral_occlusion: {
    question:
      "High-grade asymptomatic + contralateral occlusion. Life expectancy >5 years and perioperative risk ≤3%?",
    options: [
      { label: "Yes", next: "asymptomatic_choice_high_risk" },
      {
        label: "No",
        recommendation:
          "Intensive medical therapy preferred. Contralateral occlusion is high-risk, but absolute benefit remains modest without favorable life expectancy and low procedural risk.",
      },
    ],
  },
  asymptomatic_high_grade_contralateral_stenosis: {
    question:
      "High-grade asymptomatic + significant contralateral stenosis. Life expectancy >5 years and perioperative risk ≤3%?",
    options: [
      { label: "Yes", next: "asymptomatic_choice_high_risk" },
      {
        label: "No",
        recommendation:
          "Intensive medical therapy preferred. Contralateral stenosis is a relative high-risk feature.",
      },
    ],
  },
  asymptomatic_high_grade_other: {
    question:
      "Other high-risk features present (progressive stenosis, high-risk plaque, silent infarcts, impaired reserve)? Note: CREST-H did not establish a cognitive benefit from treating impaired perfusion.",
    options: [
      { label: "Yes", next: "asymptomatic_choice_high_risk" },
      {
        label: "No",
        recommendation:
          "Intensive medical therapy alone is preferred for high-grade asymptomatic stenosis without high-risk features. Shared decision-making recommended. CREST-H found no cognitive improvement attributable to revascularization.",
      },
      {
        label: "Explore cognition / hypoperfusion evidence (CREST-H)",
        next: "crest_h_intro",
      },
    ],
  },
  crest_h_intro: {
    question:
      "CREST-H (2026): Is cognitive impairment or cerebral hypoperfusion being considered as an indication for carotid revascularization?",
    options: [
      { label: "Yes: baseline cognitive impairment", next: "crest_h_cognition" },
      {
        label: "Yes: impaired cerebral perfusion / reserve",
        next: "crest_h_hemodynamics",
      },
      {
        label: "No: stroke prevention is the indication",
        recommendation:
          "Evaluate stroke-prevention benefits and procedural risks using the other asymptomatic branches. CREST-H addresses cognitive outcomes, not whether revascularization prevents stroke.",
      },
    ],
  },
  crest_h_cognition: {
    recommendation:
      "CREST-H (JAMA, September 2026): Among 291 analyzed patients with asymptomatic ICA stenosis ≥70%, 51 had reduced cognition at baseline. At 1 year, revascularization (CEA/CAS) + intensive medical management did not significantly improve cognition vs medical management alone (adjusted cognitive z-score difference −0.15 SD; 95% CI −0.54 to 0.24). Cognitive impairment alone is not an established indication for revascularization.",
    source: CREST_H_SOURCE,
  },
  crest_h_hemodynamics: {
    recommendation:
      "CREST-H (2026): Baseline CT/MR perfusion time-to-peak delay did not identify a subgroup with significant cognitive benefit from revascularization. Treatment-by-hemodynamic-status interaction: P = 0.40. Do not assume that restoring flow improves cognition in chronic asymptomatic ICA stenosis. This cognitive finding does not rule out revascularization for selected stroke-prevention indications.",
    source: CREST_H_SOURCE,
  },
  asymptomatic_choice_high_risk: {
    question:
      "Preferred strategy for high-grade asymptomatic stenosis with high-risk features (contralateral occlusion or stenosis)",
    options: [
      {
        label: "CAS + intensive medical therapy",
        recommendation:
          "Supported by CREST-2 (significant reduction vs medical therapy alone). Reasonable in selected patients.",
      },
      {
        label: "CEA + intensive medical therapy",
        recommendation:
          "ESVS Class IIa in selected patients. CREST-2 did not show significant benefit of CEA over medical therapy alone.",
      },
      {
        label: "TCAR + intensive medical therapy",
        recommendation:
          "May be considered, especially with contralateral disease or high surgical risk.",
      },
      {
        label: "Intensive medical therapy alone",
        recommendation:
          "Valid option. CREST-H showed no significant cognitive benefit from revascularization at 1 year, even with hemodynamic impairment.",
      },
      {
        label: "CREST-H: cognition / hemodynamic evidence",
        next: "crest_h_intro",
      },
    ],
  },
  asymptomatic_moderate: {
    recommendation:
      "Intensive medical therapy preferred. Revascularization rarely indicated unless multiple high-risk features and very low risk.",
  },
  medical_only_asymptomatic: {
    recommendation:
      "Intensive medical therapy only. Routine revascularization not indicated.",
  },
};

const KEY_NOTES: ReactNode[] = [
  "Contralateral occlusion and significant contralateral stenosis (≥50–70%) are high-risk features.",
  "High-grade ipsilateral stenosis: ≥70% (NASCET).",
  "Symptomatic timing: after 48 h but within 14 days for maximum benefit.",
  "CREST-2: CAS + IMM showed benefit vs medical therapy; CEA did not reach significance.",
  <>
    <strong>CREST-H (JAMA 2026):</strong> No significant cognitive benefit at 1 year from
    revascularization plus intensive medical management (IMM) vs IMM alone, including patients
    with impaired cerebral hemodynamics.{" "}
    <a
      href={CREST_H_SOURCE}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2"
    >
      Read trial
    </a>
    .
  </>,
  "Always continue intensive medical therapy.",
];

const CarotidRevascularisationDecisionTree = () => {
  const [view, setView] = useState<View>({ kind: "node", id: START_NODE });
  const [path, setPath] = useState<string[]>(["Start"]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currentNode = useMemo(
    () => (view.kind === "node" ? NODES[view.id] : undefined),
    [view],
  );

  const activeRecommendation = useMemo(() => {
    if (view.kind === "recommendation") {
      return { text: view.text, source: view.source };
    }
    if (currentNode?.recommendation) {
      return { text: currentNode.recommendation, source: currentNode.source };
    }
    return undefined;
  }, [view, currentNode]);

  const advance = (option: Option) => {
    setHistory((prev) => [...prev, { view, path }]);
    setPath((prev) => [...prev, option.label]);
    if (option.recommendation) {
      setView({
        kind: "recommendation",
        text: option.recommendation,
        source: option.source,
      });
    } else if (option.next) {
      setView({ kind: "node", id: option.next });
    }
  };

  const goBack = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setView(last.view);
    setPath(last.path);
    setHistory(history.slice(0, -1));
  };

  const restart = () => {
    setView({ kind: "node", id: START_NODE });
    setPath(["Start"]);
    setHistory([]);
  };

  return (
    <Card className="border-teal-300 bg-gradient-to-br from-teal-50/70 to-background dark:border-teal-700 dark:from-teal-950/30">
      <CardHeader className="bg-teal-100/50 dark:bg-teal-900/30">
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm text-teal-900 dark:text-teal-100 sm:text-base">
          <GitBranch className="h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1">
            Carotid Revascularization Decision Tree
          </span>
          <Badge className="border-0 bg-teal-600 text-white hover:bg-teal-600">
            Interactive
          </Badge>
        </CardTitle>
        <p className="text-xs text-teal-800/80 dark:text-teal-300/80">
          Contralateral occlusion · Contralateral stenosis · High-grade · Timing ·
          TCAR · CREST-H (2026)
        </p>
        <a
          href="/carotid-revascularization-decision-tree.html"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-teal-800 underline underline-offset-2 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open standalone clickable HTML
        </a>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        <nav
          aria-label="Decision path"
          className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
        >
          {path.join(" → ")}
        </nav>

        {activeRecommendation ? (
          <div
            role="status"
            className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-950/30"
          >
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Recommendation
            </p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
              {activeRecommendation.text}
            </p>
            {activeRecommendation.source && (
              <a
                href={activeRecommendation.source}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-medium text-emerald-800 underline underline-offset-2 dark:text-emerald-200"
              >
                Read trial
              </a>
            )}
          </div>
        ) : (
          currentNode && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold leading-relaxed text-teal-900 dark:text-teal-100 sm:text-lg">
                {currentNode.question}
              </h3>
              <div className="flex flex-col gap-2">
                {currentNode.options?.map((option) => (
                  <Button
                    key={option.label}
                    type="button"
                    onClick={() => advance(option)}
                    className="h-auto justify-start whitespace-normal bg-teal-700 px-4 py-3 text-left text-sm font-medium text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )
        )}

        <div className="flex flex-wrap gap-2 border-t pt-3">
          {history.length > 0 && (
            <Button type="button" variant="outline" size="sm" onClick={goBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={restart}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Restart
          </Button>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" />
            Clinical decision support, not a substitute for judgement
          </span>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs font-semibold text-foreground">Key notes</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
            {KEY_NOTES.map((note, index) => (
              <li key={index}>{note}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarotidRevascularisationDecisionTree;
