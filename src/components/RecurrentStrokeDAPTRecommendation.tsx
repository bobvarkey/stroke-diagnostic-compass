import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  RefreshCw,
  Pill,
  Clock,
  Shield,
  BookOpen,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

/**
 * Summary Recommendation for the Field — Recurrent ischemic stroke
 * occurring on aspirin + clopidogrel ("breakthrough on DAPT").
 *
 * Provides a 4-phase pathway: Load/Switch → DAPT → Monotherapy Extension →
 * Indefinite Maintenance, with full reference citations.
 */
const RecurrentStrokeDAPTRecommendation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-violet-300 dark:border-violet-700 bg-gradient-to-br from-violet-50/60 dark:from-violet-950/20 to-background">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="bg-violet-100/50 dark:bg-violet-900/30">
            <CardTitle className="flex items-center justify-between text-violet-800 dark:text-violet-300">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                <span className="text-sm sm:text-base">
                  Recurrent Stroke on Aspirin + Clopidogrel — Field Summary
                </span>
                <Badge variant="outline" className="ml-1 text-[10px] border-violet-400 text-violet-700 dark:text-violet-300">
                  Switch to Ticagrelor
                </Badge>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-5">
            <Alert className="mb-4 border-violet-300 bg-violet-50/40 dark:bg-violet-950/20">
              <AlertTriangle className="h-4 w-4 text-violet-700 dark:text-violet-300" />
              <AlertTitle className="text-violet-800 dark:text-violet-300 text-sm">
                Clinical Scenario
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                Patient experiences a <strong>recurrent ischemic stroke / high-risk TIA</strong>{" "}
                while already on aspirin + clopidogrel (presumed clopidogrel failure,
                often CYP2C19 LOF in Indian/East-Asian populations).
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="pathway" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="pathway" className="text-xs gap-1">
                  <ArrowRight className="h-3.5 w-3.5" /> Pathway
                </TabsTrigger>
                <TabsTrigger value="dosing" className="text-xs gap-1">
                  <Pill className="h-3.5 w-3.5" /> Dosing
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="text-xs gap-1">
                  <Shield className="h-3.5 w-3.5" /> Monitoring
                </TabsTrigger>
                <TabsTrigger value="refs" className="text-xs gap-1">
                  <BookOpen className="h-3.5 w-3.5" /> References
                </TabsTrigger>
              </TabsList>

              {/* ---------- PATHWAY ---------- */}
              <TabsContent value="pathway" className="space-y-3 mt-4">
                {[
                  {
                    n: 1,
                    title: "Load / Switch",
                    color: "border-blue-300 bg-blue-50/40 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300",
                    body: (
                      <>
                        Transition from <strong>clopidogrel → Ticagrelor</strong>:
                        <ul className="list-disc ml-5 mt-1 text-xs space-y-0.5">
                          <li>Loading dose: <strong>180 mg PO</strong> (single dose)</li>
                          <li>Then: <strong>90 mg PO twice daily</strong></li>
                          <li>Continue aspirin 75–100 mg daily concurrently</li>
                        </ul>
                      </>
                    ),
                  },
                  {
                    n: 2,
                    title: "DAPT Duration",
                    color: "border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300",
                    body: (
                      <>
                        Maintain <strong>Aspirin + Ticagrelor</strong> for{" "}
                        <strong>21 to 30 days</strong> covering the highest-risk
                        early recurrence window.
                      </>
                    ),
                  },
                  {
                    n: 3,
                    title: "Monotherapy Extension",
                    color: "border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300",
                    body: (
                      <>
                        At <strong>day 21 or 30</strong>: <strong>drop aspirin</strong>{" "}
                        and continue <strong>Ticagrelor 90 mg BID monotherapy</strong>{" "}
                        through <strong>Day 90</strong> to cover the subacute
                        recurrence window.
                      </>
                    ),
                  },
                  {
                    n: 4,
                    title: "Indefinite Maintenance",
                    color: "border-violet-300 bg-violet-50/40 dark:bg-violet-950/20 text-violet-800 dark:text-violet-300",
                    body: (
                      <>
                        At <strong>Day 90</strong>: switch to long-term{" "}
                        <strong>single antiplatelet therapy</strong> — typically{" "}
                        <strong>aspirin 75–100 mg daily monotherapy</strong>{" "}
                        (given prior clopidogrel failure, avoid returning to it
                        unless CYP2C19 status confirms responder).
                      </>
                    ),
                  },
                ].map((step) => (
                  <div
                    key={step.n}
                    className={`p-3 rounded-lg border-2 ${step.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-background border-2 border-current flex items-center justify-center font-bold text-sm shrink-0">
                        {step.n}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">{step.title}</div>
                        <div className="text-xs text-foreground/80">{step.body}</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="p-3 rounded-lg border bg-muted/40 text-xs flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                  <span>
                    <strong>Timeline at a glance:</strong> Day 0 → Load → Day 21–30
                    (stop ASA) → Day 90 (stop Ticagrelor, start ASA mono) → indefinite.
                  </span>
                </div>
              </TabsContent>

              {/* ---------- DOSING ---------- */}
              <TabsContent value="dosing" className="space-y-3 mt-4">
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Phase</th>
                        <th className="text-left p-2">Drug</th>
                        <th className="text-left p-2">Dose</th>
                        <th className="text-left p-2">Window</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-2 font-medium">Loading</td>
                        <td className="p-2">Ticagrelor</td>
                        <td className="p-2">180 mg PO ×1</td>
                        <td className="p-2">Day 0</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">DAPT</td>
                        <td className="p-2">Aspirin + Ticagrelor</td>
                        <td className="p-2">ASA 75–100 mg OD + Ticagrelor 90 mg BID</td>
                        <td className="p-2">Day 0 → Day 21–30</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Mono extension</td>
                        <td className="p-2">Ticagrelor</td>
                        <td className="p-2">90 mg BID</td>
                        <td className="p-2">Day 21–30 → Day 90</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-medium">Indefinite</td>
                        <td className="p-2">Aspirin</td>
                        <td className="p-2">75–100 mg OD</td>
                        <td className="p-2">Day 90 → lifelong</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Alert className="border-amber-300 bg-amber-50/40 dark:bg-amber-950/20">
                  <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                  <AlertTitle className="text-amber-800 dark:text-amber-300 text-sm">
                    Contraindications & Cautions
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    <ul className="list-disc ml-4 mt-1 space-y-0.5">
                      <li>Active bleeding or history of intracranial hemorrhage</li>
                      <li>Severe hepatic impairment (Child-Pugh C)</li>
                      <li>Strong CYP3A4 inhibitors / inducers (ketoconazole, rifampin)</li>
                      <li>Caution with bradyarrhythmias, severe asthma/COPD (dyspnea, ventricular pauses)</li>
                      <li>Avoid concurrent ASA dose &gt;100 mg/day — reduces Ticagrelor benefit (PLATO)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* ---------- MONITORING ---------- */}
              <TabsContent value="monitoring" className="space-y-3 mt-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-card">
                    <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Clinical Monitoring
                    </h5>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• NIHSS at 24 h, 7 d, 30 d, 90 d</li>
                      <li>• Bleeding (BARC) at every visit</li>
                      <li>• Dyspnea screen (Ticagrelor side effect)</li>
                      <li>• BP, HR (rule out pauses ≥3 s)</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg border bg-card">
                    <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Lab Monitoring
                    </h5>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• CBC, creatinine baseline + day 30</li>
                      <li>• LFTs at 30 d (esp. AST/ALT)</li>
                      <li>• Uric acid (Ticagrelor ↑ urate)</li>
                      <li>• Consider CYP2C19 genotyping to confirm clopidogrel LOF</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 rounded-lg border bg-muted/40 text-xs">
                  <strong>De-escalation triggers:</strong> major bleeding, intolerable
                  dyspnea, symptomatic bradycardia → discontinue Ticagrelor and revert
                  to aspirin monotherapy; reconsider DAPT only after multidisciplinary
                  review.
                </div>
              </TabsContent>

              {/* ---------- REFERENCES ---------- */}
              <TabsContent value="refs" className="space-y-2 mt-4">
                <ol className="text-xs space-y-2 list-decimal ml-5 text-muted-foreground">
                  <li>
                    <strong>Johnston SC, et al. THALES trial.</strong> Ticagrelor and
                    Aspirin or Aspirin Alone in Acute Ischemic Stroke or TIA. <em>N Engl
                    J Med.</em> 2020;383(3):207-217. doi:10.1056/NEJMoa1916870
                  </li>
                  <li>
                    <strong>Wang Y, et al. CHANCE-2 trial.</strong> Ticagrelor versus
                    Clopidogrel in CYP2C19 Loss-of-Function Carriers with Stroke or TIA.
                    <em> N Engl J Med.</em> 2021;385(27):2520-2530.
                    doi:10.1056/NEJMoa2111749
                  </li>
                  <li>
                    <strong>Wallentin L, et al. PLATO trial.</strong> Ticagrelor versus
                    Clopidogrel in Patients with Acute Coronary Syndromes. <em>N Engl
                    J Med.</em> 2009;361(11):1045-1057. doi:10.1056/NEJMoa0904327
                  </li>
                  <li>
                    <strong>Kleindorfer DO, et al.</strong> 2021 Guideline for the
                    Prevention of Stroke in Patients With Stroke and TIA: AHA/ASA
                    Guideline. <em>Stroke.</em> 2021;52(7):e364-e467.
                    doi:10.1161/STR.0000000000000375
                  </li>
                  <li>
                    <strong>Powers WJ, et al.</strong> 2019 Update to the 2018
                    Guidelines for the Early Management of Acute Ischemic Stroke
                    (AHA/ASA). <em>Stroke.</em> 2019;50(12):e344-e418.
                    doi:10.1161/STR.0000000000000211
                  </li>
                  <li>
                    <strong>Wang Y, et al. CHANCE trial.</strong> Clopidogrel with
                    aspirin in acute minor stroke or TIA. <em>N Engl J Med.</em>{" "}
                    2013;369(1):11-19. doi:10.1056/NEJMoa1215340
                  </li>
                  <li>
                    <strong>Johnston SC, et al. POINT trial.</strong> Clopidogrel and
                    Aspirin in Acute Ischemic Stroke and High-Risk TIA. <em>N Engl
                    J Med.</em> 2018;379(3):215-225. doi:10.1056/NEJMoa1800410
                  </li>
                  <li>
                    <strong>Scott SA, et al. CPIC Guideline</strong> for CYP2C19
                    Genotype and Clopidogrel Therapy: 2022 Update. <em>Clin Pharmacol
                    Ther.</em> 2022;112(5):959-967. doi:10.1002/cpt.2526
                  </li>
                </ol>
                <p className="text-[10px] text-muted-foreground italic pt-2 border-t">
                  Decision support summary; not a substitute for individualized clinical
                  judgment. Verify dose, contraindications, and local guidelines before
                  prescribing.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default RecurrentStrokeDAPTRecommendation;
