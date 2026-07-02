import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, ArrowLeft, Pill, CalendarCheck, Clock, ChevronDown, Repeat } from "lucide-react";

/**
 * Antiplatelet Switching Guide — Clopidogrel ⇄ Ticagrelor (Acute setting)
 * Visual infographic per ACS acute-setting P2Y12 switching consensus.
 */
const AntiplateletSwitchingGuide: React.FC = () => {
  return (
    <Card
      id="antiplatelet-switching"
      className="border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-4 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30">
          <Repeat className="h-5 w-5 text-cyan-300" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base sm:text-lg">
            Switching Between Clopidogrel &amp; Ticagrelor
          </h3>
          <p className="text-xs text-slate-400">Acute Coronary Syndrome (ACS) — Acute Setting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-3 items-stretch mt-4">
        {/* Left: Clopidogrel */}
        <div className="rounded-2xl border-2 border-purple-500/60 bg-white/95 dark:bg-slate-900 p-4 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="h-12 w-12 rounded-full bg-purple-500/15 border border-purple-400/40 flex items-center justify-center mb-2">
            <Pill className="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </div>
          <p className="text-lg font-extrabold tracking-wide text-purple-900 dark:text-purple-200">
            CLOPIDOGREL
          </p>
          <Badge variant="outline" className="mt-1 text-[10px] border-purple-400/40 text-purple-700 dark:text-purple-300">
            P2Y12 prodrug
          </Badge>
        </div>

        {/* Center: two arrows */}
        <div className="flex flex-col gap-3 justify-center">
          {/* Right arrow: Clopi → Tica */}
          <div className="relative rounded-2xl p-3 sm:p-4 text-white shadow-lg bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-500">
            <div className="flex items-start gap-3">
              <div className="shrink-0 h-9 w-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider opacity-90">Switch to Ticagrelor</p>
                <p className="font-bold text-base sm:text-lg leading-tight">Ticagrelor LD 180 mg</p>
                <p className="text-xs opacity-95 mt-0.5">
                  Give <strong>irrespective</strong> of prior clopidogrel timing or loading dose.
                </p>
                <p className="text-xs opacity-90 mt-0.5">Maintenance: 90 mg BID.</p>
              </div>
              <ArrowRight className="h-6 w-6 shrink-0 mt-1" />
            </div>
          </div>

          {/* Center pill label */}
          <div className="self-center px-4 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-[11px] font-bold tracking-widest text-indigo-900 dark:text-indigo-200">
            ACUTE SETTING
          </div>

          {/* Left arrow: Tica → Clopi */}
          <div className="relative rounded-2xl p-3 sm:p-4 text-white shadow-lg bg-gradient-to-l from-orange-500 via-rose-500 to-pink-600">
            <div className="flex items-start gap-3">
              <ArrowLeft className="h-6 w-6 shrink-0 mt-1" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider opacity-90">Switch to Clopidogrel</p>
                <p className="font-bold text-base sm:text-lg leading-tight">Clopidogrel LD 600 mg</p>
                <p className="text-xs opacity-95 mt-0.5">
                  Administer <strong>24 h after</strong> the last ticagrelor dose.
                </p>
                <p className="text-xs opacity-90 mt-0.5">Maintenance: 75 mg daily.</p>
              </div>
              <div className="shrink-0 h-9 w-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Ticagrelor */}
        <div className="rounded-2xl border-2 border-cyan-500/60 bg-white/95 dark:bg-slate-900 p-4 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="h-12 w-12 rounded-full bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center mb-2">
            <Pill className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
          </div>
          <p className="text-lg font-extrabold tracking-wide text-teal-900 dark:text-teal-200">
            TICAGRELOR
          </p>
          <Badge variant="outline" className="mt-1 text-[10px] border-cyan-400/40 text-cyan-700 dark:text-cyan-300">
            Reversible P2Y12
          </Badge>
        </div>
      </div>

      {/* Chronic / de-escalation collapsible */}
      <Collapsible className="mt-4">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 hover:bg-slate-800/70 transition">
            <span className="text-sm font-medium text-slate-200">
              Chronic / De-escalation switching &amp; clinical notes
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400 transition-transform data-[state=open]:rotate-180" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2 text-sm">
          <div className="rounded-md border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide font-semibold text-cyan-300 mb-1">
              Chronic setting (&gt;30 days post-ACS)
            </p>
            <ul className="list-disc list-inside text-slate-200 text-xs space-y-1">
              <li><strong>Clopidogrel → Ticagrelor:</strong> Ticagrelor 90 mg BID <em>without</em> a loading dose, 24 h after last clopidogrel dose.</li>
              <li><strong>Ticagrelor → Clopidogrel:</strong> Clopidogrel 600 mg loading dose, 24 h after last ticagrelor dose.</li>
            </ul>
          </div>
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs uppercase tracking-wide font-semibold text-amber-300 mb-1">Key points</p>
            <ul className="list-disc list-inside text-amber-100 text-xs space-y-1">
              <li>Never co-administer two P2Y12 inhibitors — always separate by the intervals above.</li>
              <li>Escalation (clopi → tica): give LD 180 mg immediately regardless of last clopidogrel timing.</li>
              <li>De-escalation (tica → clopi): 24 h gap avoids competitive binding and residual reversible inhibition.</li>
              <li>Hold ticagrelor 3–5 d before CABG; hold clopidogrel 5 d before CABG.</li>
            </ul>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Reference: 2020 ESC NSTE-ACS Guidelines; Angiolillo DJ et&nbsp;al. Circulation 2017;136:1955–1975 (International Expert Consensus on P2Y12 switching).
          </p>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AntiplateletSwitchingGuide;
