import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Info, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CVT_ENDOVASCULAR_ATTRIBUTION,
  CVT_ENDOVASCULAR_LABELS,
  CVT_ENDOVASCULAR_PANELS,
  CVT_ENDOVASCULAR_TECHNIQUES,
  CVT_ENDOVASCULAR_TITLE,
  getCvtEndovascularTechnique,
  type CvtEndovascularTechniqueId,
} from "@/lib/cvtEndovascularTechniques";

export default function CVTEndovascularTechniques() {
  const [isOpen, setIsOpen] = useState(false);
  const [techniqueId, setTechniqueId] = useState<CvtEndovascularTechniqueId>("venoplasty");
  const technique = getCvtEndovascularTechnique(techniqueId);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        id="cvt-endovascular-techniques"
        className="scroll-mt-24 border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/70 dark:from-orange-950/30 to-background"
      >
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-orange-100/50 dark:bg-orange-900/30">
            <CardTitle className="flex items-center justify-between text-orange-800 dark:text-orange-200 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Target className="h-5 w-5 shrink-0" />
                <span className="text-base sm:text-lg leading-snug text-left">{CVT_ENDOVASCULAR_TITLE}</span>
                <Badge className="ml-1 bg-orange-600 text-white hidden sm:inline-flex shrink-0">
                  A–D teaching
                </Badge>
              </div>
              <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform", isOpen && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-5 space-y-4">
            <p className="text-xs text-orange-800 dark:text-orange-300">
              Use when the management pathway reaches clinical or imaging progression (e.g. thrombus
              propagation) and endovascular therapy is being considered — intrasinus thrombolysis or
              thrombectomy constructs built from these techniques.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] gap-3">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-orange-900 dark:text-orange-100">Techniques</h4>
                {CVT_ENDOVASCULAR_TECHNIQUES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTechniqueId(item.id)}
                    aria-pressed={techniqueId === item.id}
                    className={cn(
                      "w-full rounded-lg border-2 px-3 py-2 text-left transition-all",
                      techniqueId === item.id
                        ? "border-orange-600 bg-orange-600 text-white"
                        : "border-orange-200 bg-orange-50 text-orange-900 hover:border-orange-400 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-100",
                    )}
                  >
                    <p className="text-xs font-semibold">
                      {item.number}. {item.name}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-[11px] leading-snug",
                        techniqueId === item.id ? "text-white/90" : "text-orange-800 dark:text-orange-300",
                      )}
                    >
                      {item.summary}
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20">
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">{technique.name}</p>
                  <p className="mt-1 text-xs text-orange-800 dark:text-orange-300">{technique.detail}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CVT_ENDOVASCULAR_PANELS.map((panel) => (
                    <div
                      key={panel.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {panel.id}. {panel.title}
                        </p>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {panel.labels.map((label) => (
                            <Badge
                              key={label}
                              variant="outline"
                              className="text-[10px] border-slate-400 text-slate-700 dark:text-slate-200"
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">{panel.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <p>
                {CVT_ENDOVASCULAR_LABELS.map((item, i) => (
                  <span key={item.abbr}>
                    {i > 0 && " · "}
                    <strong>{item.abbr}</strong> = {item.definition}
                  </span>
                ))}
                . Profile diagrams show jugular access into the cerebral venous sinuses, especially the
                superior sagittal sinus.
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground">{CVT_ENDOVASCULAR_ATTRIBUTION}</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
