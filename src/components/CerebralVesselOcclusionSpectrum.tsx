import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Brain, ChevronDown, Info, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import spectrumFigure from "@/assets/spectrum-cerebral-vessel-occlusion.png";
import {
  VESSEL_OCCLUSION_SPECTRUM_CATEGORIES,
  VESSEL_OCCLUSION_SPECTRUM_FOOTER,
  VESSEL_OCCLUSION_SPECTRUM_TAKEAWAYS,
  VESSEL_OCCLUSION_SPECTRUM_TITLE,
} from "@/lib/cerebralVesselOcclusionSpectrum";

const CATEGORY_STYLES = [
  "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30",
  "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30",
  "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30",
  "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40",
] as const;

const CerebralVesselOcclusionSpectrum = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/70 dark:from-indigo-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-indigo-100/50 dark:bg-indigo-900/30">
            <CardTitle className="flex items-center justify-between text-indigo-800 dark:text-indigo-200 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Brain className="h-5 w-5 shrink-0" />
                <span className="text-base sm:text-lg leading-snug text-left">
                  {VESSEL_OCCLUSION_SPECTRUM_TITLE}
                </span>
                <Badge className="ml-1 bg-indigo-600 text-white hidden sm:inline-flex shrink-0">
                  LVO–MeVO–SVO
                </Badge>
              </div>
              <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", isOpen && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-5 space-y-4">
            <p className="text-xs text-indigo-900 dark:text-indigo-200">
              Angiogram-style teaching figure for imaging triage: occlusion site and vessel caliber
              stratify LVO, MeVO, SVO, and perforator stroke — and the treatment pathway that follows.
            </p>

            <figure className="teaching-figure rounded-lg overflow-hidden border border-slate-200 bg-white text-slate-900 dark:border-slate-700">
              <img
                src={spectrumFigure}
                alt="Spectrum of cerebral vessel occlusion in four angiogram-style columns: LVO (large vessel occlusion, 3 to 6 mm), MeVO (medium vessel occlusion, 1 to 3 mm, with PCA segments P1 to P4 labeled), SVO (small vessel occlusion, less than 1 mm), and perforator occlusion (50 to 500 micrometers)."
                className="w-full h-auto"
                loading="lazy"
              />
              <figcaption className="px-3 py-2 text-[11px] text-slate-600 bg-slate-50 dark:bg-slate-900/80 dark:text-slate-300">
                Source figure — {VESSEL_OCCLUSION_SPECTRUM_FOOTER}
              </figcaption>
            </figure>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
              {VESSEL_OCCLUSION_SPECTRUM_CATEGORIES.map((category, index) => (
                <div
                  key={category.id}
                  className={cn("rounded-lg border p-3", CATEGORY_STYLES[index])}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {category.acronym}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-slate-400 text-slate-700 dark:text-slate-200"
                    >
                      {category.diameter}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                    {category.name}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                    {category.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50/80 p-3 dark:border-indigo-800 dark:bg-indigo-950/20">
                <Brain className="h-3.5 w-3.5 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-300" />
                <p className="text-xs text-indigo-900 dark:text-indigo-100">
                  {VESSEL_OCCLUSION_SPECTRUM_TAKEAWAYS[0]}
                </p>
              </div>
              <div className="flex items-start gap-2 rounded-lg border border-violet-200 bg-violet-50/80 p-3 dark:border-violet-800 dark:bg-violet-950/20">
                <Settings2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-violet-600 dark:text-violet-300" />
                <p className="text-xs text-violet-900 dark:text-violet-100">
                  {VESSEL_OCCLUSION_SPECTRUM_TAKEAWAYS[1]}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p>{VESSEL_OCCLUSION_SPECTRUM_FOOTER}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default CerebralVesselOcclusionSpectrum;
