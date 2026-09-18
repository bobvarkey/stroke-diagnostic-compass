import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertTriangle,
  ChevronDown,
  Droplets,
  Layers,
  RotateCcw,
  ScanSearch,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BRAIN_HOURS_POINTS,
  BRAIN_IVH_POINTS,
  BRAIN_MAX_SCORE,
  BRAIN_RECURRENT_ICH_POINTS,
  BRAIN_VOLUME_POINTS,
  BRAIN_WARFARIN_POINTS,
  HEMATOMA_EXPANSION_DEFINITION,
  NCCT_EXPANSION_SIGNS,
  NCCT_SIGNS_NOTE,
  calculateBrainScore,
  calculateSpotSignScore,
  interpretBrainScore,
  interpretSpotSignScore,
  predictedBrainGrowthPercent,
  type BrainHoursToCtCategory,
  type BrainScoreInput,
  type BrainVolumeCategory,
  type SpotAttenuationCategory,
  type SpotCountCategory,
  type SpotSignScoreInput,
  type SpotSizeCategory,
} from "@/lib/ichExpansionScores";

function scoreButtonClass(selected: boolean, accent = "red") {
  const selectedMap: Record<string, string> = {
    red: "border-red-500 bg-red-100 dark:bg-red-900/40",
    cyan: "border-cyan-500 bg-cyan-100 dark:bg-cyan-900/40",
    indigo: "border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40",
  };
  const hoverMap: Record<string, string> = {
    red: "hover:border-red-300 dark:hover:border-red-600",
    cyan: "hover:border-cyan-300 dark:hover:border-cyan-600",
    indigo: "hover:border-indigo-300 dark:hover:border-indigo-600",
  };
  return cn(
    "p-3 rounded-lg border-2 text-center transition-all",
    selected
      ? selectedMap[accent]
      : cn("border-slate-200 dark:border-slate-700", hoverMap[accent]),
  );
}

function OptionButton({
  selected,
  onClick,
  label,
  points,
  accent = "red",
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  points?: string;
  accent?: "red" | "cyan" | "indigo";
}) {
  return (
    <button type="button" onClick={onClick} className={scoreButtonClass(selected, accent)}>
      <div className="font-medium text-sm">{label}</div>
      {points !== undefined && (
        <div className="text-xs text-slate-500 dark:text-slate-400">{points}</div>
      )}
    </button>
  );
}

function SpotSignScoreCalculator() {
  const [spotCount, setSpotCount] = useState<SpotCountCategory | null>(null);
  const [maxAxialDimension, setMaxAxialDimension] = useState<SpotSizeCategory | null>(null);
  const [maxAttenuation, setMaxAttenuation] = useState<SpotAttenuationCategory | null>(null);

  const input: SpotSignScoreInput = { spotCount, maxAxialDimension, maxAttenuation };
  const score = calculateSpotSignScore(input);
  const completed =
    spotCount === "none"
      ? 1
      : [spotCount, maxAxialDimension, maxAttenuation].filter((v) => v !== null).length;

  const scoreTone =
    score === null
      ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
      : score >= 2
        ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-400"
        : score === 1
          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-400"
          : "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-400";

  const reset = () => {
    setSpotCount(null);
    setMaxAxialDimension(null);
    setMaxAttenuation(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Composite 0–3 point CTA score. Higher scores identify patients at the highest risk of
          in-hospital mortality and poor outcome among survivors.
        </p>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 shrink-0"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className={cn("p-3 rounded-lg border text-sm font-medium", scoreTone)}>
        {score !== null ? (
          <span>
            Spot Sign Score: <strong>{score}/3</strong> — {interpretSpotSignScore(score).replace(/^Score \d\/3 — /, "")}
          </span>
        ) : (
          <span>{interpretSpotSignScore(null)} ({completed}/{spotCount === "none" || spotCount === null ? 1 : 3} fields)</span>
        )}
      </div>

      <div className="space-y-2">
        <h5 className="font-medium text-cyan-800 dark:text-cyan-300 text-sm">
          1. Number of spots
          {spotCount !== null && (
            <Badge variant="outline" className="ml-2 text-xs">
              {spotCount === "twoOrMore" ? "+1" : "+0"}
            </Badge>
          )}
        </h5>
        <div className="grid grid-cols-3 gap-2">
          <OptionButton
            accent="cyan"
            selected={spotCount === "none"}
            onClick={() => setSpotCount("none")}
            label="No spot"
            points="+0"
          />
          <OptionButton
            accent="cyan"
            selected={spotCount === "one"}
            onClick={() => setSpotCount("one")}
            label="1 spot"
            points="+0"
          />
          <OptionButton
            accent="cyan"
            selected={spotCount === "twoOrMore"}
            onClick={() => setSpotCount("twoOrMore")}
            label="≥2 spots"
            points="+1"
          />
        </div>
      </div>

      {spotCount !== "none" && (
        <>
          <div className="space-y-2">
            <h5 className="font-medium text-cyan-800 dark:text-cyan-300 text-sm">
              2. Maximum axial dimension
              {maxAxialDimension !== null && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {maxAxialDimension === "gte5" ? "+1" : "+0"}
                </Badge>
              )}
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton
                accent="cyan"
                selected={maxAxialDimension === "lt5"}
                onClick={() => setMaxAxialDimension("lt5")}
                label="<5 mm"
                points="+0"
              />
              <OptionButton
                accent="cyan"
                selected={maxAxialDimension === "gte5"}
                onClick={() => setMaxAxialDimension("gte5")}
                label="≥5 mm"
                points="+1 · larger spots"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium text-cyan-800 dark:text-cyan-300 text-sm">
              3. Maximum attenuation
              {maxAttenuation !== null && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {maxAttenuation === "gte180" ? "+1" : "+0"}
                </Badge>
              )}
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <OptionButton
                accent="cyan"
                selected={maxAttenuation === "lt180"}
                onClick={() => setMaxAttenuation("lt180")}
                label="<180 HU"
                points="+0"
              />
              <OptionButton
                accent="cyan"
                selected={maxAttenuation === "gte180"}
                onClick={() => setMaxAttenuation("gte180")}
                label="≥180 HU"
                points="+1 · denser spots"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BrainScoreCalculator() {
  const [baselineVolume, setBaselineVolume] = useState<BrainVolumeCategory | null>(null);
  const [recurrentIch, setRecurrentIch] = useState<boolean | null>(null);
  const [warfarinAtOnset, setWarfarinAtOnset] = useState<boolean | null>(null);
  const [intraventricularExtension, setIntraventricularExtension] = useState<boolean | null>(null);
  const [hoursToBaselineCt, setHoursToBaselineCt] = useState<BrainHoursToCtCategory | null>(null);

  const input: BrainScoreInput = {
    baselineVolume,
    recurrentIch,
    warfarinAtOnset,
    intraventricularExtension,
    hoursToBaselineCt,
  };
  const score = calculateBrainScore(input);
  const probability = score !== null ? predictedBrainGrowthPercent(score) : null;
  const completed = [
    baselineVolume,
    recurrentIch,
    warfarinAtOnset,
    intraventricularExtension,
    hoursToBaselineCt,
  ].filter((v) => v !== null).length;

  const scoreTone =
    probability === null
      ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
      : probability >= 60
        ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-400"
        : probability >= 30
          ? "bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 border-orange-400"
          : probability >= 10
            ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-400"
            : "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-400";

  const reset = () => {
    setBaselineVolume(null);
    setRecurrentIch(null);
    setWarfarinAtOnset(null);
    setIntraventricularExtension(null);
    setHoursToBaselineCt(null);
  };

  const hourOptions: { value: BrainHoursToCtCategory; label: string }[] = [
    { value: "gt5", label: ">5 h" },
    { value: "from4to5", label: ">4–5 h" },
    { value: "from3to4", label: ">3–4 h" },
    { value: "from2to3", label: ">2–3 h" },
    { value: "from1to2", label: ">1–2 h" },
    { value: "le1", label: "≤1 h" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Predicts ICH growth at 24 hours. Total score 0–{BRAIN_MAX_SCORE}; predicted probability
          rises from 3.4% (score 0) to 85.8% (score {BRAIN_MAX_SCORE}).
        </p>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600 shrink-0"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className={cn("p-3 rounded-lg border text-sm font-medium", scoreTone)}>
        {score !== null && probability !== null ? (
          <span>
            {interpretBrainScore(score)}
          </span>
        ) : (
          <span>
            {interpretBrainScore(null)} ({completed}/5 fields)
          </span>
        )}
      </div>

      <div className="space-y-2">
        <h5 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm">
          1. Baseline ICH volume
          {baselineVolume !== null && (
            <Badge variant="outline" className="ml-2 text-xs">
              +{BRAIN_VOLUME_POINTS[baselineVolume]}
            </Badge>
          )}
        </h5>
        <div className="grid grid-cols-3 gap-2">
          <OptionButton
            accent="indigo"
            selected={baselineVolume === "le10"}
            onClick={() => setBaselineVolume("le10")}
            label="≤10 mL"
            points={`+${BRAIN_VOLUME_POINTS.le10}`}
          />
          <OptionButton
            accent="indigo"
            selected={baselineVolume === "from10to20"}
            onClick={() => setBaselineVolume("from10to20")}
            label="10–20 mL"
            points={`+${BRAIN_VOLUME_POINTS.from10to20}`}
          />
          <OptionButton
            accent="indigo"
            selected={baselineVolume === "gt20"}
            onClick={() => setBaselineVolume("gt20")}
            label=">20 mL"
            points={`+${BRAIN_VOLUME_POINTS.gt20}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm">
          2. Recurrent ICH
          {recurrentIch !== null && (
            <Badge variant="outline" className="ml-2 text-xs">
              +{recurrentIch ? BRAIN_RECURRENT_ICH_POINTS : 0}
            </Badge>
          )}
        </h5>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton
            accent="indigo"
            selected={recurrentIch === false}
            onClick={() => setRecurrentIch(false)}
            label="No"
            points="+0"
          />
          <OptionButton
            accent="indigo"
            selected={recurrentIch === true}
            onClick={() => setRecurrentIch(true)}
            label="Yes"
            points={`+${BRAIN_RECURRENT_ICH_POINTS}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm">
          3. Anticoagulation with warfarin at onset
          {warfarinAtOnset !== null && (
            <Badge variant="outline" className="ml-2 text-xs">
              +{warfarinAtOnset ? BRAIN_WARFARIN_POINTS : 0}
            </Badge>
          )}
        </h5>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton
            accent="indigo"
            selected={warfarinAtOnset === false}
            onClick={() => setWarfarinAtOnset(false)}
            label="No"
            points="+0"
          />
          <OptionButton
            accent="indigo"
            selected={warfarinAtOnset === true}
            onClick={() => setWarfarinAtOnset(true)}
            label="Yes"
            points={`+${BRAIN_WARFARIN_POINTS}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm">
          4. Intraventricular extension
          {intraventricularExtension !== null && (
            <Badge variant="outline" className="ml-2 text-xs">
              +{intraventricularExtension ? BRAIN_IVH_POINTS : 0}
            </Badge>
          )}
        </h5>
        <div className="grid grid-cols-2 gap-2">
          <OptionButton
            accent="indigo"
            selected={intraventricularExtension === false}
            onClick={() => setIntraventricularExtension(false)}
            label="No"
            points="+0"
          />
          <OptionButton
            accent="indigo"
            selected={intraventricularExtension === true}
            onClick={() => setIntraventricularExtension(true)}
            label="Yes"
            points={`+${BRAIN_IVH_POINTS}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="font-medium text-indigo-800 dark:text-indigo-300 text-sm">
          5. Hours to baseline CT from onset
          {hoursToBaselineCt !== null && (
            <Badge variant="outline" className="ml-2 text-xs">
              +{BRAIN_HOURS_POINTS[hoursToBaselineCt]}
            </Badge>
          )}
        </h5>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Slide range: &gt;5 h = 0 points → ≤1 h = 5 points (earlier imaging scores higher).
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {hourOptions.map((option) => (
            <OptionButton
              key={option.value}
              accent="indigo"
              selected={hoursToBaselineCt === option.value}
              onClick={() => setHoursToBaselineCt(option.value)}
              label={option.label}
              points={`+${BRAIN_HOURS_POINTS[option.value]}`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Reference: Stroke. 2015;46(2):376–81.
      </p>
    </div>
  );
}

export default function ICHHematomaExpansion() {
  const [isOpen, setIsOpen] = useState(true);
  const def = HEMATOMA_EXPANSION_DEFINITION;

  const ncctRows = useMemo(() => NCCT_EXPANSION_SIGNS, []);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-rose-300 dark:border-rose-700 bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-rose-100/50 dark:bg-rose-900/30">
            <CardTitle className="flex items-center justify-between text-rose-800 dark:text-rose-300">
              <div className="flex items-center gap-2">
                <ScanSearch className="h-5 w-5" />
                <span>ICH Hematoma Expansion</span>
                <Badge className="ml-1 bg-rose-500 text-white hidden sm:inline-flex">
                  NCCT + CTA markers
                </Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Definition — first paint */}
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-700 rounded-lg">
              <h4 className="font-semibold text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                What Is Hematoma Expansion?
              </h4>
              <p className="text-sm text-rose-800 dark:text-rose-300">{def.summary}</p>
              <ul className="mt-2 text-sm text-rose-700 dark:text-rose-400 space-y-1">
                <li>
                  Most commonly defined as: <strong>&gt;{def.absoluteIncreaseMl} mL</strong> absolute
                  increase in volume, <strong>OR &gt;{def.relativeIncreasePercent}%</strong> relative
                  increase in volume.
                </li>
                <li className="flex items-start gap-1.5">
                  <Timer className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{def.timing}</span>
                </li>
              </ul>
            </div>

            <Accordion type="multiple" className="w-full">
              <AccordionItem value="ncct" className="border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:no-underline">
                  Non-Contrast CT Signs — Summary
                </AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="text-left p-2 font-medium">Sign</th>
                          <th className="text-left p-2 font-medium">Core Feature</th>
                          <th className="text-left p-2 font-medium">Reported Sensitivity for Expansion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ncctRows.map((row, i) => (
                          <tr
                            key={row.sign}
                            className={i % 2 === 0 ? "bg-slate-50 dark:bg-slate-900/40" : "bg-white dark:bg-slate-950/20"}
                          >
                            <td className="p-2 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                              {row.sign}
                            </td>
                            <td className="p-2 text-slate-700 dark:text-slate-300">{row.feature}</td>
                            <td className="p-2 text-slate-700 dark:text-slate-300">{row.sensitivity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                    {NCCT_SIGNS_NOTE}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="spot" className="border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 hover:no-underline">
                  Spot Sign Score — Refining the Prediction
                </AccordionTrigger>
                <AccordionContent>
                  <SpotSignScoreCalculator />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="leakage" className="border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="text-sm font-semibold text-teal-800 dark:text-teal-300 hover:no-underline">
                  Postcontrast Leakage Sign vs Spot Sign
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700 rounded-lg">
                      <h5 className="font-semibold text-teal-800 dark:text-teal-300 text-sm mb-2">
                        Postcontrast Leakage Sign (Delayed-Phase CTA)
                      </h5>
                      <ul className="text-sm text-teal-800 dark:text-teal-300 space-y-1.5">
                        <li>
                          Assessed by comparing an early-phase CTA image with a delayed-phase image
                          obtained several minutes later.
                        </li>
                        <li>
                          <strong>Leakage</strong> = an increase in the size or density of contrast
                          pooling over time — capturing ongoing extravasation that a single-phase
                          spot sign might miss.
                        </li>
                        <li>
                          May improve sensitivity for expansion prediction when added to single-phase
                          CTA protocols.
                        </li>
                      </ul>
                      <p className="text-xs text-teal-700 dark:text-teal-400 mt-2">
                        Reference: Stroke. 2016;47(4):958–63.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border border-cyan-200 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-950/20">
                        <h5 className="font-semibold text-cyan-800 dark:text-cyan-300 text-sm mb-2">
                          CTA Spot Sign
                        </h5>
                        <ul className="text-sm text-cyan-800 dark:text-cyan-300 space-y-1">
                          <li>Single-phase CTA, obtained once</li>
                          <li>Focal contrast enhancement within the hematoma</li>
                          <li>Widely validated across many cohorts</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/20">
                        <h5 className="font-semibold text-teal-800 dark:text-teal-300 text-sm mb-2">
                          Postcontrast Leakage Sign
                        </h5>
                        <ul className="text-sm text-teal-800 dark:text-teal-300 space-y-1">
                          <li>Requires early- and delayed-phase acquisition</li>
                          <li>Defined by a change in contrast pooling over time</li>
                          <li>May capture slower or more subtle extravasation</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      The two are complementary rather than competing — leakage sign can be positive
                      even when a single-phase spot sign is negative.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="brain" className="border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 hover:no-underline">
                  BRAIN Score — Predicting ICH Growth at 24 Hours
                </AccordionTrigger>
                <AccordionContent>
                  <BrainScoreCalculator />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dect" className="border-slate-200 dark:border-slate-700">
                <AccordionTrigger className="text-sm font-semibold text-amber-800 dark:text-amber-300 hover:no-underline">
                  Dual-energy CT — ICH vs Contrast
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg space-y-2">
                    <h5 className="font-semibold text-amber-800 dark:text-amber-300 text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Dual-energy CT to differentiate ICH vs contrast
                    </h5>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      After iodinated contrast or endovascular (IA) procedures, hyperdensity on
                      conventional CT may be <strong>true hemorrhage</strong> or{" "}
                      <strong>contrast staining</strong>. Dual-energy CT (DECT) separates iodine from
                      blood using material decomposition (virtual non-contrast and iodine overlay
                      maps).
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Use DECT when the clinical question is contrast staining versus ICH — for
                      example after CTA, CT perfusion, or intra-arterial therapy — rather than
                      relying on density alone.
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>
                        A related DECT use (membrane complexity / hematoma composition) appears in
                        the SDH module; here the indication is iodine versus blood.
                      </span>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
