import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";
import { useCollapsibleState } from "@/hooks/useCollapsibleState";

/**
 * Anticoagulant Reversal — NCS/SCCM focused guideline update (Neurocritical Care, Sept 2026).
 * Covers 4F-PCC, andexanet alfa, platelet transfusion, and desmopressin for
 * antithrombotic-associated intracranial hemorrhage.
 */
const AnticoagulantReversalSection: React.FC = () => {
  const { isOpen, toggle } = useCollapsibleState("anticoagulant-reversal");

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <Collapsible open={isOpen} onOpenChange={toggle}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              Anticoagulant Reversal — NCS/SCCM Guideline Update
            </CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <p className="text-xs text-muted-foreground">
            Neurocritical Care Society / SCCM focused guideline update on antithrombotic-associated intracranial hemorrhage (Neurocritical Care, Sept 2026). All recommendations are conditional — evidence remains limited.
          </p>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 text-sm">
            {/* 4F-PCC preferred */}
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 space-y-1.5">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Factor Xa inhibitor–associated ICH: favor 4F-PCC over andexanet alfa</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>ANNEXA-I: andexanet improved hematoma control but showed <strong>no mortality or functional benefit</strong>.</li>
                <li>Thrombosis risk higher with andexanet (RR 1.37 overall; RR 1.99 in observational spontaneous IPH cohorts).</li>
                <li>Andexanet alfa was <strong>withdrawn from the US market (Dec 2025)</strong>; availability varies internationally.</li>
                <li>In transfers, verify which reversal agent was already given before repeating.</li>
              </ul>
            </div>

            {/* Andexanet caution */}
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-1.5">
              <p className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Andexanet alfa — not preferred
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Avoid combining andexanet with PCC unless exceptional benefit clearly outweighs thrombotic risk.</li>
                <li>Confirm drug, last dose, and renal function before any reversal decision.</li>
              </ul>
            </div>

            {/* Platelets */}
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 space-y-1.5">
              <p className="font-semibold">Platelet transfusion</p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li><strong>Do NOT</strong> give routine platelet transfusion for non-surgical spontaneous intraparenchymal hemorrhage (PATCH).</li>
                <li><strong>DO</strong> give platelets to aspirin users with spontaneous IPH who require neurosurgery (conditional recommendation).</li>
              </ul>
            </div>

            {/* Desmopressin */}
            <div className="rounded-lg border border-border/60 bg-muted/40 p-3 space-y-1.5">
              <p className="font-semibold">Desmopressin</p>
              <p className="text-muted-foreground">No recommendation — no demonstrated effect on outcomes; evidence insufficient.</p>
            </div>

            <a
              href="https://link.springer.com/article/10.1007/s12028-026-02442-6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline underline-offset-2 text-xs"
            >
              NCS/SCCM Antithrombotic-Associated ICH Guideline — Neurocritical Care (Sept 2026)
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AnticoagulantReversalSection;
