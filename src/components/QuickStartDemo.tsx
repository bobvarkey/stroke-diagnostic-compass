import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, Sparkles, X, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

/**
 * Demo-first Quick Start:
 * - One screen, one idea, one CTA per step
 * - Progressive disclosure (step 2 & 3 appear only after step 1)
 * - No signup, no permissions — value in <30s
 * - Dismissible and remembers preference in localStorage
 */
const LS_KEY = "quickstart-demo-dismissed-v1";

export default function QuickStartDemo() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(LS_KEY) === "1";
  });
  const [lkwMinutes, setLkwMinutes] = useState<string>("");
  const [disabling, setDisabling] = useState<null | boolean>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) {
      try { localStorage.setItem("quickstart-demo-completed", "1"); } catch {}
    }
  }, [completed]);

  const mins = parseInt(lkwMinutes, 10);
  const validLkw = !Number.isNaN(mins) && mins >= 0 && mins <= 24 * 60;

  const verdict = useMemo(() => {
    if (!validLkw || disabling === null) return null;
    if (!disabling) {
      return {
        tone: "warn" as const,
        title: "IVT usually deferred",
        body: "Non-disabling deficit. Reassess with BATHE mnemonic; consider DAPT if minor stroke.",
        cta: { to: "/workup?section=ivt-decisions", label: "Open IVT Decision Tool" },
      };
    }
    if (mins <= 270) {
      return {
        tone: "good" as const,
        title: `Within 4.5h window (${mins} min)`,
        body: "Eligible for IV thrombolysis pending contraindication check. Confirm BP <185/110, glucose, and reversal status.",
        cta: { to: "/workup?section=tpa-eligibility", label: "Open tPA Checklist" },
      };
    }
    if (mins <= 9 * 60) {
      return {
        tone: "warn" as const,
        title: `Extended window (${mins} min)`,
        body: "Consider CTP/MRI mismatch (WAKE-UP, EXTEND). Evaluate for EVT if LVO.",
        cta: { to: "/workup?section=ctp-analysis", label: "Open CTP Analysis" },
      };
    }
    return {
      tone: "warn" as const,
      title: `Beyond 9h (${mins} min)`,
      body: "IVT unlikely. Evaluate for EVT up to 24h per DAWN/DEFUSE 3 criteria.",
      cta: { to: "/workup?section=lvo-dashboard", label: "Open LVO Dashboard" },
    };
  }, [validLkw, mins, disabling]);

  if (dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(LS_KEY, "1"); } catch {}
    setDismissed(true);
  };

  const step = !validLkw ? 1 : disabling === null ? 2 : 3;

  return (
    <Card className="relative p-5 md:p-6 border-border/50 bg-card/80 backdrop-blur shadow-glow overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-sunset opacity-80" />
      <button
        onClick={dismiss}
        aria-label="Dismiss quick start"
        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-accent/30 text-muted-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-gradient-sunset border-0"><Sparkles className="h-3 w-3 mr-1"/>Try it — no signup</Badge>
        <span className="text-xs text-muted-foreground">~20 seconds · 3 taps</span>
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-1">Quick IVT eligibility check</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Answer two quick questions to see a bedside recommendation. You can jump into the full workflow anytime.
      </p>

      {/* Progress */}
      <div className="flex items-center gap-1.5 mb-5" aria-label={`Step ${step} of 3`}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              n <= step ? "bg-gradient-sunset" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="space-y-4">
        {/* Step 1: LKW */}
        <div>
          <label className="text-sm font-semibold flex items-center gap-1.5 mb-1.5">
            <Clock className="h-4 w-4 text-primary" />
            Time since last known well
            <span className="text-xs font-normal text-muted-foreground">— get a window-based recommendation</span>
          </label>
          <div className="flex gap-2 items-center">
            <Input
              inputMode="numeric"
              type="number"
              min={0}
              max={1440}
              placeholder="e.g. 90"
              value={lkwMinutes}
              onChange={(e) => setLkwMinutes(e.target.value)}
              className="max-w-[160px] h-11 text-base"
            />
            <span className="text-sm text-muted-foreground">minutes</span>
            <div className="flex gap-1 ml-auto">
              {[30, 90, 240, 480].map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs"
                  onClick={() => setLkwMinutes(String(v))}
                >
                  {v}m
                </Button>
              ))}
            </div>
          </div>
          {lkwMinutes && !validLkw && (
            <p className="text-xs text-destructive mt-1">Enter a value between 0 and 1440.</p>
          )}
        </div>

        {/* Step 2: Disabling (progressive disclosure) */}
        {validLkw && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="text-sm font-semibold mb-1.5 block">
              Is the deficit disabling?
              <span className="text-xs font-normal text-muted-foreground ml-1">— e.g. aphasia, hemiparesis, neglect</span>
            </label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={disabling === true ? "default" : "outline"}
                className={disabling === true ? "bg-gradient-sunset border-0" : ""}
                onClick={() => { setDisabling(true); setCompleted(true); }}
              >
                Yes, disabling
              </Button>
              <Button
                size="sm"
                variant={disabling === false ? "default" : "outline"}
                className={disabling === false ? "bg-gradient-sunset border-0" : ""}
                onClick={() => { setDisabling(false); setCompleted(true); }}
              >
                No, minor
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verdict */}
        {verdict && (
          <div
            className={`animate-in fade-in slide-in-from-top-2 duration-300 rounded-lg p-4 border ${
              verdict.tone === "good"
                ? "bg-primary/5 border-primary/40"
                : "bg-accent/5 border-accent/40"
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle2 className={`h-5 w-5 mt-0.5 ${verdict.tone === "good" ? "text-primary" : "text-accent"}`} />
              <div>
                <h3 className="font-bold">{verdict.title}</h3>
                <p className="text-sm text-muted-foreground">{verdict.body}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link to={verdict.cta.to}>
                <Button size="sm" className="bg-gradient-sunset border-0 shadow-glow">
                  {verdict.cta.label} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
              <Link to="/workup">
                <Button size="sm" variant="outline">
                  <Zap className="h-3.5 w-3.5 mr-1" /> Full Workup
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={dismiss} className="ml-auto">
                Hide this
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
