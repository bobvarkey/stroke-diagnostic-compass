import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Syringe, Clock, ShieldAlert, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrugSafetyData {
  drug: string;
  accentClass?: string; // e.g. "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
  dosing: string[];
  duration: string[];
  contraindications: string[];
  monitoring: string[];
  evidence?: string;
}

const sectionConfig = [
  { key: "dosing", title: "Dosing (weight-based)", icon: Syringe, color: "text-blue-600" },
  { key: "duration", title: "Infusion Duration", icon: Clock, color: "text-green-600" },
  { key: "contraindications", title: "Contraindications", icon: ShieldAlert, color: "text-red-600" },
  { key: "monitoring", title: "Monitoring", icon: Activity, color: "text-purple-600" },
] as const;

const DrugSafetyCard: React.FC<{ data: DrugSafetyData }> = ({ data }) => {
  return (
    <Card className={cn("border-2 mb-3", data.accentClass ?? "border-border bg-muted/20")}>
      <CardContent className="pt-4 pb-3 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-semibold text-sm">{data.drug} — Quick Reference</h4>
          {data.evidence && (
            <Badge variant="outline" className="text-[10px]">{data.evidence}</Badge>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sectionConfig.map(({ key, title, icon: Icon, color }) => {
            const items = data[key as keyof DrugSafetyData] as string[];
            if (!items || items.length === 0) return null;
            return (
              <div key={key} className="p-2.5 rounded-md bg-background/60 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className={cn("h-3.5 w-3.5", color)} />
                  <span className="text-xs font-medium">{title}</span>
                </div>
                <ul className="text-[11px] space-y-0.5 text-muted-foreground list-disc list-inside leading-snug">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DrugSafetyCard;
