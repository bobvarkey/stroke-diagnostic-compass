import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Ban, Syringe, Droplets, Activity, ShieldAlert, Clock, Brain, Stethoscope, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckItem {
  id: string;
  label: string;
  detail?: string;
}

const PhaseCard: React.FC<{
  phase: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ phase, title, icon, color, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap: Record<string, string> = {
    red: "border-red-400 dark:border-red-600 bg-gradient-to-br from-red-50/60 dark:from-red-950/20 to-background",
    amber: "border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50/60 dark:from-amber-950/20 to-background",
    blue: "border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50/60 dark:from-blue-950/20 to-background",
    emerald: "border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50/60 dark:from-emerald-950/20 to-background",
  };
  const headerMap: Record<string, string> = {
    red: "bg-red-100/60 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    amber: "bg-amber-100/60 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
    blue: "bg-blue-100/60 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    emerald: "bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
  };
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn("border-2", colorMap[color])}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className={cn("py-3 px-4", headerMap[color])}>
            <CardTitle className="flex items-center justify-between text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-bold px-2 py-0.5">
                  PHASE {phase}
                </Badge>
                {icon}
                <span className="font-bold">{title}</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform shrink-0", open && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const ActionChecklist: React.FC<{ items: CheckItem[]; prefix: string }> = ({ items, prefix }) => {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label
          key={item.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors min-h-[44px]",
            checked[item.id]
              ? "bg-primary/5 border-primary/30"
              : "bg-muted/30 border-border hover:bg-muted/50"
          )}
        >
          <Checkbox
            checked={!!checked[item.id]}
            onCheckedChange={(v) => setChecked((p) => ({ ...p, [item.id]: !!v }))}
            className="mt-0.5"
          />
          <div>
            <span className={cn("text-sm font-medium", checked[item.id] && "line-through opacity-60")}>
              {item.label}
            </span>
            {item.detail && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

const WarningBox: React.FC<{ children: React.ReactNode; variant?: "danger" | "caution" }> = ({ children, variant = "danger" }) => (
  <div
    className={cn(
      "p-3 rounded-lg border-l-4 text-sm",
      variant === "danger"
        ? "bg-red-50 dark:bg-red-950/30 border-red-500 text-red-800 dark:text-red-300"
        : "bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-800 dark:text-amber-300"
    )}
  >
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  </div>
);

const PostThrombolysisICHManagement: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-red-500 dark:border-red-700 bg-gradient-to-br from-red-50 dark:from-red-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-red-100/50 dark:bg-red-900/30">
            <CardTitle className="flex items-center justify-between text-red-800 dark:text-red-300">
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <ShieldAlert className="h-5 w-5" />
                Post-IV Thrombolysis Hemorrhage Management
                <Badge className="bg-red-600 text-white text-xs">CRITICAL</Badge>
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform shrink-0", isOpen && "rotate-180")} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Protocol Summary Banner */}
            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
              <p className="font-semibold mb-1">Protocol: 6-Step Management</p>
              <div className="flex flex-wrap gap-2">
                {["SUSPECT", "DIAGNOSE", "REVERSE", "SUPPORT", "EVALUATE", "MAINTAIN"].map((s, i) => (
                  <Badge key={s} variant="outline" className="text-xs">
                    {i + 1}. {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* PHASE 1 */}
            <PhaseCard phase={1} title="Recognition & Immediate Action" icon={<AlertTriangle className="h-4 w-4" />} color="red">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-2">Clinical Suspicion Triggers:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Altered consciousness", "Motor deterioration", "New/worsened headache", "Nausea/vomiting", "Acute BP spike"].map((t) => (
                      <div key={t} className="flex items-center gap-1.5 text-xs p-2 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                        <span className="text-red-500">⚠</span> {t}
                      </div>
                    ))}
                  </div>
                </div>

                <ActionChecklist
                  prefix="p1"
                  items={[
                    { id: "p1-stop", label: "STOP the infusion immediately", detail: "Discontinue IV tPA/alteplase or tenecteplase if still running" },
                    { id: "p1-compress", label: "Apply direct compression to visible bleeding sites", detail: "IV sites, abrasions, epistaxis — consider ice" },
                  ]}
                />
              </div>
            </PhaseCard>

            {/* PHASE 2 */}
            <PhaseCard phase={2} title="Diagnostic Workup (STAT)" icon={<Brain className="h-4 w-4" />} color="amber">
              <ActionChecklist
                prefix="p2"
                items={[
                  { id: "p2-ct", label: "STAT Non-Contrast CT Head", detail: "Confirm presence and extent of intracranial hemorrhage" },
                  { id: "p2-cbc", label: "STAT CBC", detail: "Complete blood count" },
                  { id: "p2-pt", label: "STAT PT/INR + Type & Crossmatch" },
                  { id: "p2-fibrinogen", label: "STAT Fibrinogen Level", detail: "Critical decision driver — determines reversal strategy" },
                ]}
              />
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border text-sm">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  🔑 Fibrinogen is the critical decision driver — tPA depletes fibrinogen, so reversal must replace substrate, not just factors.
                </p>
              </div>
            </PhaseCard>

            {/* PHASE 3 */}
            <PhaseCard phase={3} title="Reversing the Fibrinolytic State" icon={<Syringe className="h-4 w-4" />} color="blue">
              <WarningBox variant="danger">
                <p className="font-bold">Do NOT use 4-Factor PCC or rFVIIa for routine tPA reversal</p>
                <p className="mt-1 text-xs">PCC provides clotting factors but NO fibrinogen substrate. Without fibrinogen replacement (cryoprecipitate), PCC factors have no substrate to form a clot. High thrombotic risk with no definitive benefit.</p>
              </WarningBox>

              <div className="space-y-3 mt-3">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-300">First-Line Reversal Agents:</p>

                {/* Cryoprecipitate */}
                <div className="p-3 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-600 text-white text-xs">PRIMARY</Badge>
                    <span className="font-bold text-sm">Cryoprecipitate</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Dose:</span> 10 units empirically
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Target:</span> Fibrinogen &gt; 150 mg/dL
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Mechanism:</span> Replaces fibrinogen, Factor VIII, vWF
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Administer additional doses as needed to reach and maintain target.</p>
                </div>

                {/* Platelets */}
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">ADJUVANT</Badge>
                    <span className="font-bold text-sm">Platelets</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Dose:</span> 6–8 units immediately
                    </div>
                    <div className="p-2 rounded bg-background border">
                      <span className="font-semibold">Indication:</span> Thrombocytopenia or platelet dysfunction
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Adjuvant to cryoprecipitate — tPA primarily affects fibrinogen but platelet function can be compromised.</p>
                </div>

                {/* Alternative */}
                <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20">
                  <p className="text-sm font-semibold mb-2">Alternative (if Cryoprecipitate Unavailable):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2 rounded border bg-background text-xs space-y-1">
                      <p className="font-bold">Tranexamic Acid (TXA)</p>
                      <p>1000 mg IV over 10 minutes</p>
                      <p className="text-muted-foreground">Or 10 mg/kg weight-based</p>
                    </div>
                    <div className="p-2 rounded border bg-background text-xs space-y-1">
                      <p className="font-bold">Aminocaproic Acid (Amicar)</p>
                      <p>4–5 g IV over 1 hour</p>
                      <p className="text-muted-foreground">Followed by 1 g/hr until bleeding controlled</p>
                    </div>
                  </div>
                </div>

                {/* Warfarin Exception */}
                <WarningBox variant="caution">
                  <p className="font-bold">Exception: Prior Warfarin Patient</p>
                  <p className="mt-1 text-xs">If patient was on Warfarin prior to tPA: Administer <strong>4-Factor PCC + Vitamin K</strong>. FFP is an alternative if PCC unavailable (inferior due to volume/speed).</p>
                </WarningBox>
              </div>

              {/* Blood Product Selection Matrix */}
              <div className="mt-4">
                <p className="text-sm font-bold mb-2">Blood Product Selection Matrix:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border p-2 text-left">Product</th>
                        <th className="border p-2 text-left">Primary Indication</th>
                        <th className="border p-2 text-left">Onset</th>
                        <th className="border p-2 text-left">Key Limitations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Cryoprecipitate", "First-line for tPA (Fibrinogen)", "Rapid", "Transfusion risk"],
                        ["4-Factor PCC", "First-line for Warfarin ONLY", "5–15 min", "No fibrinogen content"],
                        ["FFP", "Second-line alternative", "1–4 hours", "Volume overload risk"],
                        ["Platelets", "Thrombocytopenia", "N/A", "Potential harm in routine use"],
                        ["rFVIIa", "Fondaparinux reversal", "Rapid", "High thrombotic risk"],
                      ].map(([product, indication, onset, limitation]) => (
                        <tr key={product} className="hover:bg-muted/30">
                          <td className="border p-2 font-medium">{product}</td>
                          <td className="border p-2">{indication}</td>
                          <td className="border p-2">{onset}</td>
                          <td className="border p-2">{limitation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </PhaseCard>

            {/* PHASE 4 */}
            <PhaseCard phase={4} title="Ongoing Medical & Surgical Management" icon={<HeartPulse className="h-4 w-4" />} color="emerald">
              <div className="space-y-4">
                {/* BP Management */}
                <div>
                  <p className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Blood Pressure Management
                  </p>
                  <ActionChecklist
                    prefix="p4bp"
                    items={[
                      { id: "p4-bp-lower", label: "Lower BP if > 185/110 mmHg", detail: "Aggressively manage to prevent hematoma expansion" },
                      { id: "p4-bp-monitor", label: "Check BP & neuro status every 15 minutes" },
                    ]}
                  />
                </div>

                {/* Surgical Evaluation */}
                <div>
                  <p className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" /> Surgical Evaluation
                  </p>
                  <ActionChecklist
                    prefix="p4surg"
                    items={[
                      { id: "p4-surg-eval", label: "Consider neurosurgical evacuation", detail: "Cerebellar hemorrhage, severe mass effect, or ongoing deterioration" },
                    ]}
                  />
                  <WarningBox variant="danger">
                    <p className="font-bold">CRITICAL: Surgery ONLY after sufficient reversal</p>
                    <p className="text-xs mt-1">Surgical evacuation must only be considered AFTER sufficient reversal with cryoprecipitate and platelets. Surgery before reversal = uncontrollable bleeding.</p>
                  </WarningBox>
                </div>

                {/* Post-Bleed Antiplatelet */}
                <div>
                  <p className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Post-Bleed Antithrombotic Therapy
                  </p>
                  <ActionChecklist
                    prefix="p4anti"
                    items={[
                      { id: "p4-hold", label: "HOLD all antiplatelet/anticoagulant therapies ≥ 24 hours" },
                      { id: "p4-restart", label: "Restart only after clinical stabilization", detail: "Confirmed by repeat brain imaging excluding expansion — case-by-case risk assessment" },
                    ]}
                  />
                </div>
              </div>
            </PhaseCard>

            {/* Agent Comparison Table */}
            <Collapsible>
              <Card className="border">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Fibrinolytic Agent Comparison (Tenecteplase vs Alteplase)
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="border p-2 text-left">Property</th>
                            <th className="border p-2 text-left">Tenecteplase</th>
                            <th className="border p-2 text-left">Alteplase</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ["Dose (AIS)", "0.25 mg/kg (max 25 mg)", "0.9 mg/kg (max 90 mg)"],
                            ["Administration", "Single 5-sec IV bolus", "10% bolus + 60-min infusion"],
                            ["Fibrin Specificity", "15× higher than alteplase", "Standard"],
                            ["sICH Rate", "~1%", "1–2.7%"],
                            ["Fibrinogen Depletion", "Less consumption", "Significant hypofibrinogenemia"],
                            ["Reperfusion (>50%)", "22%", "10%"],
                            ["mRS 0-1 at 90d", "Superior (cOR 1.7)", "63%"],
                          ].map(([prop, tnk, tpa]) => (
                            <tr key={prop} className="hover:bg-muted/30">
                              <td className="border p-2 font-medium">{prop}</td>
                              <td className="border p-2">{tnk}</td>
                              <td className="border p-2">{tpa}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Data from StatPearls, ASSENT-2, and coagulation/fibrinolysis studies of TNK vs alteplase in AIS.
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default PostThrombolysisICHManagement;
