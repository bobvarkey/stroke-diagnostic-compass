import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertTriangle,
  Anchor,
  BookOpen,
  ChevronDown,
  Crosshair,
  Gauge,
  Target,
  Syringe,
  Waves,
  Wind,
} from "lucide-react";
import {
  CVT_ACCESS,
  CVT_ALTEPLASE_SOURCE_RANGES,
  CVT_ANGIOJET,
  CVT_ANGIOPLASTY_STENTING,
  CVT_ASPIRATION,
  CVT_BALLOON_THROMBECTOMY,
  CVT_EVT_GOAL,
  CVT_EVT_GOAL_EVIDENCE,
  CVT_PERIPROCEDURAL_AC,
  CVT_PHARM_THROMBOLYSIS,
  CVT_STENT_RETRIEVER,
  CVT_TECHNIQUE_LIST,
  CVT_TECHNIQUES_ATTRIBUTION,
  CVT_TECHNIQUES_DISCLAIMER,
} from "@/lib/cvtProceduralTechniques";

const CVTProceduralTechniques: React.FC = () => (
  <Card
    id="cvt-procedural-techniques"
    className="scroll-mt-24 border-2 border-teal-200 dark:border-teal-800"
  >
    <Collapsible className="group" defaultOpen>
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 min-w-0">
              <Crosshair className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-base sm:text-lg">Procedural techniques</span>
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  {CVT_EVT_GOAL}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-300 dark:border-teal-700">
                Teaching
              </Badge>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </CardTitle>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CVT_TECHNIQUE_LIST.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center rounded-md border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 px-2 py-1 text-[11px] text-teal-800 dark:text-teal-200"
              >
                <span className="font-semibold">{item.label}</span>
                <span className="mx-1 text-teal-600 dark:text-teal-300">·</span>
                <span className="text-teal-700 dark:text-teal-300">{item.summary}</span>
              </span>
            ))}
          </div>
        </CardHeader>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <CardContent className="space-y-4 pt-0">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg">
            <p className="text-xs text-teal-800 dark:text-teal-200 flex items-start gap-2">
              <BookOpen className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>{CVT_TECHNIQUES_ATTRIBUTION}</strong>
                . Key numbers below are reproduced as supplied; no additional doses
                have been added.
              </span>
            </p>
          </div>

          <div className="p-3 border border-teal-200 dark:border-teal-800 rounded-lg bg-teal-50/50 dark:bg-teal-950/20">
            <h4 className="font-semibold text-sm text-teal-800 dark:text-teal-200 mb-1 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals of endovascular therapy
            </h4>
            <p className="text-xs text-teal-700 dark:text-teal-300">{CVT_EVT_GOAL}.</p>
            <p className="text-xs text-muted-foreground mt-1.5">{CVT_EVT_GOAL_EVIDENCE}.</p>
          </div>

          <Accordion type="multiple" className="rounded-lg border border-border px-3">
            <AccordionItem value="access">
              <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground">
                <span className="flex items-center gap-2">
                  <Crosshair className="h-4 w-4 text-teal-500" />
                  Arterial and venous access
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Arterial:</strong> {CVT_ACCESS.arterial}.</p>
                <p><strong className="text-foreground">Femoral venous:</strong> {CVT_ACCESS.femoralVenous}.</p>
                <p><strong className="text-foreground">Guiding position:</strong> {CVT_ACCESS.guiding}.</p>
                <p><strong className="text-foreground">Direct IJV:</strong> {CVT_ACCESS.directIjv}.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pharm">
              <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground">
                <span className="flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-rose-500" />
                  Pharmacological thrombolysis
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs space-y-3">
                <p className="text-muted-foreground">{CVT_PHARM_THROMBOLYSIS.historical}.</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>{CVT_PHARM_THROMBOLYSIS.extensiveCvt}.</li>
                  <li>
                    Continuous intrasinus <strong className="text-foreground">alteplase {CVT_PHARM_THROMBOLYSIS.alteplaseInfusion}</strong>;
                    repeat angio in <strong className="text-foreground">{CVT_PHARM_THROMBOLYSIS.angioInterval}</strong> to
                    judge response and when to stop.
                  </li>
                  <li>{CVT_PHARM_THROMBOLYSIS.combineWithMt}.</li>
                </ul>

                <div className="overflow-x-auto">
                  <p className="text-[11px] font-semibold text-foreground mb-1.5">
                    Alteplase source ranges differ — both transcribed as given
                  </p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-100/70 dark:bg-rose-950/40">
                        <th className="p-2 border border-rose-200 dark:border-rose-800 text-left text-rose-800 dark:text-rose-200 font-medium">
                          Source
                        </th>
                        <th className="p-2 border border-rose-200 dark:border-rose-800 text-left text-rose-800 dark:text-rose-200 font-medium">
                          Bolus
                        </th>
                        <th className="p-2 border border-rose-200 dark:border-rose-800 text-left text-rose-800 dark:text-rose-200 font-medium">
                          Infusion
                        </th>
                        <th className="p-2 border border-rose-200 dark:border-rose-800 text-left text-rose-800 dark:text-rose-200 font-medium">
                          Angiography
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {CVT_ALTEPLASE_SOURCE_RANGES.map((row) => (
                        <tr key={row.id} className="bg-background">
                          <td className="p-2 border border-rose-200 dark:border-rose-800 text-foreground">
                            <div className="font-medium">{row.label}</div>
                            <div className="text-muted-foreground">{row.citations}</div>
                          </td>
                          <td className="p-2 border border-rose-200 dark:border-rose-800 text-foreground">
                            {row.bolus}
                          </td>
                          <td className="p-2 border border-rose-200 dark:border-rose-800 font-semibold text-foreground">
                            {row.infusion}
                          </td>
                          <td className="p-2 border border-rose-200 dark:border-rose-800 text-foreground">
                            {row.angio}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {CVT_ALTEPLASE_SOURCE_RANGES[0].other}. {CVT_ALTEPLASE_SOURCE_RANGES[1].other}.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="aspiration">
              <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground">
                <span className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-sky-500" />
                  Direct aspiration thrombectomy
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                {CVT_ASPIRATION}.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stent">
              <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground">
                <span className="flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-indigo-500" />
                  Stent retriever thrombectomy
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-1.5">
                <p>{CVT_STENT_RETRIEVER.uses}.</p>
                <p>{CVT_STENT_RETRIEVER.combined}.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="balloon">
              <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground">
                <span className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-amber-500" />
                  Balloon thrombectomy
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-1.5">
                <p>{CVT_BALLOON_THROMBECTOMY.sequence}.</p>
                <p>
                  <strong className="text-foreground">Balloon size:</strong>{" "}
                  {CVT_BALLOON_THROMBECTOMY.fogartyNote}.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="angioplasty">
              <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground">
                <span className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-orange-500" />
                  Balloon angioplasty and stenting
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground space-y-1.5">
                <p>{CVT_ANGIOPLASTY_STENTING.role}.</p>
                <p>{CVT_ANGIOPLASTY_STENTING.firstLine}.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="angiojet">
              <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground">
                <span className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-slate-500" />
                  AngioJet
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs space-y-2">
                <p className="text-muted-foreground">{CVT_ANGIOJET.mechanism}.</p>
                <p className="text-muted-foreground">{CVT_ANGIOJET.practical}.</p>
                <div className="p-2 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                  <strong>Evidence note:</strong> {CVT_ANGIOJET.evidenceNote}.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="act" className="border-b-0">
              <AccordionTrigger className="text-sm py-3 hover:no-underline text-foreground">
                <span className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-emerald-500" />
                  Periprocedural anticoagulation
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-xs space-y-2">
                <p className="text-muted-foreground">{CVT_PERIPROCEDURAL_AC.context}.</p>
                <div className="p-3 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-center">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300 font-semibold">
                    Suite ACT target
                  </div>
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                    {CVT_PERIPROCEDURAL_AC.actTarget}
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    during endovascular therapy
                  </div>
                </div>
                <p className="text-muted-foreground">{CVT_PERIPROCEDURAL_AC.reocclusion}.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="p-3 border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 rounded-lg">
            <p className="text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{CVT_TECHNIQUES_DISCLAIMER}</span>
            </p>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  </Card>
);

export default CVTProceduralTechniques;
