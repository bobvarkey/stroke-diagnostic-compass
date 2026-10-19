import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import CollapsibleModule from "@/components/CollapsibleModule";
import { Activity, AlertTriangle, Brain, Lightbulb, ShieldCheck, Stethoscope } from "lucide-react";

type Trial = {
  name: string;
  year: string;
  population: string;
  finding: ReactNode;
  source?: { label: string; href: string };
};

function TrialCard({ trial, tone }: { trial: Trial; tone: string }) {
  return (
    <div className={`rounded-lg border p-3 ${tone}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-bold">{trial.name}</span>
        <Badge variant="outline" className="shrink-0 text-[10px]">
          {trial.year}
        </Badge>
      </div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide opacity-80">
        {trial.population}
      </div>
      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed">{trial.finding}</p>
      {trial.source && (
        <a
          href={trial.source.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block text-[11px] underline underline-offset-2 opacity-80 hover:opacity-100"
        >
          {trial.source.label}
        </a>
      )}
    </div>
  );
}

const symptomaticTrials: Trial[] = [
  {
    name: "NASCET",
    year: "1991 / 1998",
    population: "Symptomatic carotid stenosis",
    finding: (
      <>
        CEA strongly beneficial for <strong>≥70% stenosis</strong> (≈17% absolute risk reduction in
        ipsilateral stroke at 2 years) and modestly beneficial for <strong>50–69%</strong>.
      </>
    ),
  },
  {
    name: "ECST",
    year: "1998",
    population: "High-grade symptomatic stenosis",
    finding: (
      <>
        Confirmed benefit of CEA for high-grade symptomatic stenosis; results aligned with NASCET
        after method standardisation.
      </>
    ),
    source: {
      label: "Source: VEITH Symposium abstract",
      href: "https://www.veithsymposium.org/2025/abstracts/vei/1273.pdf",
    },
  },
];

const asymptomaticTrials: Trial[] = [
  {
    name: "ACAS",
    year: "1995",
    population: "Asymptomatic ≥60% stenosis",
    finding: (
      <>
        CEA reduced 5-year ipsilateral stroke risk from <strong>11% to 5.1%</strong>; benefit only
        if perioperative risk is <strong>&lt;3%</strong>.
      </>
    ),
  },
  {
    name: "ACST-1",
    year: "2004",
    population: "Asymptomatic stenosis",
    finding: (
      <>
        Confirmed long-term benefit of immediate CEA vs deferred surgery/medical therapy — absolute
        benefit ≈<strong>4.6–5.4%</strong> at 5–10 years.
      </>
    ),
    source: {
      label: "Source: NEJM review table (NCBI Bookshelf)",
      href: "https://www.ncbi.nlm.nih.gov/books/NBK615139/table/article-170125.table0/",
    },
  },
];

const comparisonTrials: Trial[] = [
  {
    name: "CREST",
    year: "2010",
    population: "Symptomatic and asymptomatic stenosis",
    finding: (
      <>
        Similar long-term primary outcomes for CEA and CAS; CAS associated with more
        periprocedural strokes, CEA with more MI.
      </>
    ),
  },
  {
    name: "CREST-2",
    year: "2025 · NEJM",
    population: "Asymptomatic ≥70% stenosis",
    finding: (
      <>
        CAS + intensive medical management reduced the 4-year composite of stroke/death or
        ipsilateral stroke vs medical therapy alone (<strong>2.8% vs 6.0%</strong>); CEA did not
        reach significance (<strong>3.7% vs 5.3%</strong>).
      </>
    ),
    source: {
      label: "Source: NEJM",
      href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2508800",
    },
  },
  {
    name: "CREST-H substudy",
    year: "2026 · JAMA",
    population: "Asymptomatic stenosis with haemodynamic impairment",
    finding: <>No cognitive benefit from revascularisation, even with haemodynamic impairment.</>,
  },
];

const CarotidRevascularisation = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-teal-300 bg-teal-50 p-3 dark:border-teal-700 dark:bg-teal-950/40">
        <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-teal-700 dark:text-teal-300" />
        <p className="text-sm leading-relaxed text-teal-900 dark:text-teal-100">
          <strong>Carotid revascularisation.</strong> The evidence base compares carotid
          endarterectomy (CEA), carotid artery stenting (CAS) and intensive medical therapy, with
          benefit tied to symptom status, stenosis severity and procedural risk.
        </p>
      </div>

      <div id="carotid-symptomatic" className="scroll-mt-36">
        <CollapsibleModule
          title="Symptomatic disease"
          subtitle="CEA for recently symptomatic carotid stenosis"
          icon={<AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
          badge={<Badge className="border-0 bg-rose-600 text-white hover:bg-rose-600">CEA</Badge>}
          defaultOpen
          className="border-rose-300 dark:border-rose-700"
          headerClassName="bg-rose-50 dark:bg-rose-950/30"
        >
          <div className="space-y-3 pt-4">
            {symptomaticTrials.map((trial) => (
              <TrialCard
                key={trial.name}
                trial={trial}
                tone="border-rose-200 bg-rose-50/70 text-rose-900 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-100"
              />
            ))}
          </div>
        </CollapsibleModule>
      </div>

      <div id="carotid-asymptomatic" className="scroll-mt-36">
        <CollapsibleModule
          title="Asymptomatic disease (classic trials)"
          subtitle="Benefit depends on low perioperative risk"
          icon={<ShieldCheck className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
          badge={<Badge className="border-0 bg-sky-600 text-white hover:bg-sky-600">&lt;3% risk</Badge>}
          defaultOpen
          className="border-sky-300 dark:border-sky-700"
          headerClassName="bg-sky-50 dark:bg-sky-950/30"
        >
          <div className="space-y-3 pt-4">
            {asymptomaticTrials.map((trial) => (
              <TrialCard
                key={trial.name}
                trial={trial}
                tone="border-sky-200 bg-sky-50/70 text-sky-900 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-100"
              />
            ))}
          </div>
        </CollapsibleModule>
      </div>

      <div id="carotid-cea-vs-cas" className="scroll-mt-36">
        <CollapsibleModule
          title="CEA vs CAS and modern medical therapy"
          subtitle="Procedural safety and best medical management"
          icon={<Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
          badge={<Badge className="border-0 bg-violet-600 text-white hover:bg-violet-600">CAS / MT</Badge>}
          defaultOpen
          className="border-violet-300 dark:border-violet-700"
          headerClassName="bg-violet-50 dark:bg-violet-950/30"
        >
          <div className="space-y-3 pt-4">
            {comparisonTrials.map((trial) => (
              <TrialCard
                key={trial.name}
                trial={trial}
                tone="border-violet-200 bg-violet-50/70 text-violet-900 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-100"
              />
            ))}
          </div>
        </CollapsibleModule>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-700 dark:bg-emerald-950/40">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
        <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
          <strong>Bottom line.</strong> These trials form the evidence base for current guidelines,
          with ongoing emphasis on <strong>low procedural risk</strong> and{" "}
          <strong>intensive medical therapy</strong> for asymptomatic patients.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 p-3">
        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Stenosis percentages follow the measurement method used in each trial; NASCET and ECST
          are not directly interchangeable without method standardisation. Revascularisation
          decisions should weigh symptom status, life expectancy, comorbidity and operator/institutional
          outcomes.
        </p>
      </div>
    </div>
  );
};

export default CarotidRevascularisation;
