import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, BookOpen, ChevronDown, Clock, Droplets, Pill, Syringe } from "lucide-react";
import {
  CVT_INTRACLOT_AGENTS,
  CVT_INTRACLOT_ANTICOAGULATION,
  CVT_INTRACLOT_ATTRIBUTION,
  CVT_INTRACLOT_CITATIONS,
  CVT_INTRACLOT_DISCLAIMER,
  CVT_INTRACLOT_ENDPOINT,
  CVT_INTRACLOT_MAX_DURATION,
  CVT_INTRACLOT_MONITORING,
  CVT_INTRACLOT_SOURCE_NOTE,
} from "@/lib/cvtIntraclotThrombolysis";

const agentAccent: Record<(typeof CVT_INTRACLOT_AGENTS)[number]["id"], string> = {
  urokinase: "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30",
  alteplase: "border-fuchsia-300 bg-fuchsia-50 dark:border-fuchsia-800 dark:bg-fuchsia-950/30",
};

const agentText: Record<(typeof CVT_INTRACLOT_AGENTS)[number]["id"], string> = {
  urokinase: "text-rose-800 dark:text-rose-200",
  alteplase: "text-fuchsia-800 dark:text-fuchsia-200",
};

const agentMuted: Record<(typeof CVT_INTRACLOT_AGENTS)[number]["id"], string> = {
  urokinase: "text-rose-600 dark:text-rose-400",
  alteplase: "text-fuchsia-600 dark:text-fuchsia-400",
};

const CVTIntraclotThrombolysis: React.FC = () => (
  <Card
    id="cvt-intraclot-thrombolysis"
    className="border-2 border-rose-200 dark:border-rose-800"
  >
    <Collapsible className="group">
      <CollapsibleTrigger asChild>
        <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 min-w-0">
              <Syringe className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-base sm:text-lg">Intraclot / Local Thrombolysis</span>
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Until functional recanalization of involved dural venous sinuses · {CVT_INTRACLOT_MAX_DURATION}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                Protocol
              </Badge>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </CardTitle>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CVT_INTRACLOT_AGENTS.map((agent) => (
              <div
                key={agent.id}
                className={`rounded-lg border px-3 py-2 text-left ${agentAccent[agent.id]}`}
              >
                <div className={`text-[11px] font-semibold uppercase tracking-wide ${agentMuted[agent.id]}`}>
                  {agent.conjunction === "or" ? "OR " : ""}
                  {agent.name}
                </div>
                <div className={`text-xs sm:text-sm font-medium ${agentText[agent.id]}`}>
                  Bolus {agent.bolus}
                  <span className="text-muted-foreground font-normal"> then </span>
                  {agent.infusion}
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <CardContent className="space-y-4 pt-0">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
            <p className="text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <BookOpen className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>{CVT_INTRACLOT_ATTRIBUTION}</strong>
                {" "}
                (citations {CVT_INTRACLOT_CITATIONS.join(" and ")}).
                Doses and monitoring below are reproduced as supplied; no additional
                doses or durations have been added.
              </span>
            </p>
          </div>

          <div className="p-3 border border-border rounded-lg bg-muted/20">
            <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-500" />
              Treatment endpoint
            </h4>
            <p className="text-xs text-muted-foreground">{CVT_INTRACLOT_ENDPOINT}.</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">Thrombolytic doses</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-rose-100/70 dark:bg-rose-950/40">
                    <th className="p-2 border border-rose-200 dark:border-rose-800 text-left text-rose-800 dark:text-rose-200 font-medium">
                      Agent
                    </th>
                    <th className="p-2 border border-rose-200 dark:border-rose-800 text-left text-rose-800 dark:text-rose-200 font-medium">
                      Bolus
                    </th>
                    <th className="p-2 border border-rose-200 dark:border-rose-800 text-left text-rose-800 dark:text-rose-200 font-medium">
                      Continuous infusion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CVT_INTRACLOT_AGENTS.map((agent) => (
                    <tr key={agent.id} className="bg-background">
                      <td className="p-2 border border-rose-200 dark:border-rose-800 font-medium text-foreground">
                        {agent.conjunction === "or" ? "OR " : ""}
                        {agent.name}
                      </td>
                      <td className="p-2 border border-rose-200 dark:border-rose-800 text-foreground">
                        {agent.bolus}
                      </td>
                      <td className="p-2 border border-rose-200 dark:border-rose-800 text-foreground">
                        {agent.infusion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CVT_INTRACLOT_AGENTS.map((agent) => (
              <div
                key={`${agent.id}-card`}
                className={`p-4 rounded-lg border-2 ${agentAccent[agent.id]}`}
              >
                <Badge
                  className={
                    agent.id === "urokinase"
                      ? "mb-2 bg-rose-600 text-white"
                      : "mb-2 bg-fuchsia-600 text-white"
                  }
                >
                  {agent.conjunction === "or" ? "OR " : ""}
                  {agent.name}
                </Badge>
                <div className={`text-2xl font-bold ${agentText[agent.id]}`}>{agent.bolus}</div>
                <div className={`text-xs ${agentMuted[agent.id]} mt-0.5`}>Bolus</div>
                <div className={`text-lg font-semibold mt-3 ${agentText[agent.id]}`}>{agent.infusion}</div>
                <div className={`text-xs ${agentMuted[agent.id]}`}>then continuous infusion</div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">Monitoring and cessation</h4>
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-800 dark:text-red-200 flex items-start gap-2">
                <Droplets className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{CVT_INTRACLOT_MONITORING.bleeding}</span>
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{CVT_INTRACLOT_MONITORING.angiograms}</span>
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <strong>Source note (study context):</strong> {CVT_INTRACLOT_SOURCE_NOTE}.
            </p>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Anticoagulation after thrombolysis
            </h4>
            <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Heparin continued</strong> after thrombolytic therapy; dose adjusted to
                maintain <strong>{CVT_INTRACLOT_ANTICOAGULATION.heparinTarget}</strong>
              </li>
              <li>
                Subsequently <strong>long-term oral anticoagulation (warfarin)</strong> with target{" "}
                <strong>{CVT_INTRACLOT_ANTICOAGULATION.warfarinTarget}</strong>, continued for{" "}
                <strong>{CVT_INTRACLOT_ANTICOAGULATION.warfarinDuration}</strong>
              </li>
            </ul>
          </div>

          <div className="p-3 border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/20 rounded-lg">
            <p className="text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{CVT_INTRACLOT_DISCLAIMER}</span>
            </p>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Collapsible>
  </Card>
);

export default CVTIntraclotThrombolysis;
