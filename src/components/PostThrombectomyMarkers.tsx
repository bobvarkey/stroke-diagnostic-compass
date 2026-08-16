import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  ChevronDown, 
  Activity, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle,
  Clock,
  User,
  Zap
} from "lucide-react";

const PostThrombectomyMarkers: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors py-3">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Activity className="h-5 w-5" />
                Post-Thrombectomy Radiological Signs (HARM & GLOS)
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* HARM Marker */}
              <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-800 dark:text-rose-300">HARM</h4>
                  <Badge className="bg-rose-600">High Risk</Badge>
                </div>
                <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Hyperintense Acute Reperfusion Marker</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>• <strong>Finding:</strong> Gadolinium enhancement in CSF spaces on FLAIR imaging.</p>
                  <p>• <strong>Significance:</strong> Marker of early blood-brain barrier (BBB) disruption.</p>
                  <div className="mt-2 pt-2 border-t border-rose-200/50 dark:border-rose-800/50">
                    <p className="font-semibold text-rose-700 dark:text-rose-400">Clinical Impact (aOR):</p>
                    <ul className="list-disc list-inside">
                      <li>Early Neurologic Deterioration (3.45)</li>
                      <li>Infarct Growth (2.46)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* GLOS Marker */}
              <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-800 dark:text-blue-300">GLOS</h4>
                  <Badge variant="secondary">Frequent</Badge>
                </div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Global Late Gadolinium Obscuration Score</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>• <strong>Finding:</strong> Diffuse gadolinium-induced signal changes on post-contrast FLAIR.</p>
                  <p>• <strong>Significance:</strong> Observed in 41.9% of patients; frequently overlaps with HARM.</p>
                  <div className="mt-2 pt-2 border-t border-blue-200/50 dark:border-blue-800/50">
                    <p className="font-semibold text-blue-700 dark:text-blue-400">Clinical Impact:</p>
                    <p>Not independently associated with clinical or radiologic outcomes in recent large cohorts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Results / Statistics */}
            <div className="p-3 rounded-lg bg-muted/50 border space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Large Thrombectomy Cohort Data (n=229)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Total Markers", value: "60.3%", sub: "HARM or GLOS" },
                  { label: "Both Markers", value: "29.3%", sub: "Co-occurrence" },
                  { label: "Isolated HARM", value: "19.7%", sub: "Standalone" },
                  { label: "Isolated GLOS", value: "11.4%", sub: "Standalone" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-2 rounded bg-background/50 border border-border/50">
                    <div className="text-sm font-bold text-primary">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictors & Predictor Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Independent Predictors</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-xs">
                  <User className="h-4 w-4 text-amber-600 shrink-0" />
                  <span><strong>Common to Both:</strong> Older age, higher creatinine, shorter FLAIR interval.</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                  <span><strong>HARM Only:</strong> Single-pass recanalization (independent predictor).</span>
                </div>
              </div>
            </div>

            {/* Clinical Alert */}
            <Alert className="bg-amber-100/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-xs font-bold text-amber-800 dark:text-amber-300">Clinical Takeaway</AlertTitle>
              <AlertDescription className="text-[11px] text-amber-700 dark:text-amber-400">
                HARM is an independent marker of <strong>early neurologic deterioration</strong> and <strong>infarct progression</strong> after thrombectomy. GLOS, while frequent, lacks independent prognostic relevance.
              </AlertDescription>
            </Alert>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default PostThrombectomyMarkers;
