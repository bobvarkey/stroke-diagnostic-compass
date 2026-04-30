import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar } from "lucide-react";

export interface DurationPreset {
  value: string;
  label: string;
  hours: number;
  context: string;
}

interface Props {
  drugName: string;
  presets: DurationPreset[];
  defaultPreset?: string;
  /** Optional callback receiving chosen hours */
  onChange?: (hours: number, presetValue: string) => void;
  /** Optional schedule items to render. Use {{H}} placeholder to substitute hours. */
  scheduleTemplate?: { tHours: number | "end" | "endPlus1"; event: string }[];
}

const InfusionDurationPicker: React.FC<Props> = ({
  drugName,
  presets,
  defaultPreset,
  onChange,
  scheduleTemplate,
}) => {
  const [preset, setPreset] = useState<string>(defaultPreset ?? presets[0].value);
  const [customHours, setCustomHours] = useState<string>("12");

  const hours = useMemo(() => {
    if (preset === "custom") return parseFloat(customHours) || 0;
    return presets.find((p) => p.value === preset)?.hours ?? 0;
  }, [preset, customHours, presets]);

  React.useEffect(() => {
    onChange?.(hours, preset);
  }, [hours, preset, onChange]);

  const activePreset = presets.find((p) => p.value === preset);

  const events = useMemo(() => {
    if (!scheduleTemplate || hours <= 0) return [];
    return scheduleTemplate.map((s) => {
      let t: number;
      if (s.tHours === "end") t = hours;
      else if (s.tHours === "endPlus1") t = hours + 1;
      else t = s.tHours;
      return { t: `T = ${t} h`, event: s.event };
    });
  }, [scheduleTemplate, hours]);

  return (
    <div className="p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2 my-3">
      <Label className="text-xs font-medium text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" /> {drugName} — Infusion Duration / Protocol Window
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Select value={preset} onValueChange={setPreset}>
          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {presets.map((p) => (
              <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
            ))}
            <SelectItem value="custom" className="text-xs">Custom duration…</SelectItem>
          </SelectContent>
        </Select>
        {preset === "custom" && (
          <Input
            type="number" min="0.5" max="120" step="0.5"
            value={customHours}
            onChange={(e) => setCustomHours(e.target.value)}
            placeholder="Hours"
            className="h-9 text-xs"
          />
        )}
      </div>
      <p className="text-[10px] text-indigo-700 dark:text-indigo-400 italic">
        {activePreset?.context ?? "Custom protocol window"}
      </p>

      {events.length > 0 && (
        <div className="pt-1 space-y-1">
          <div className="text-[11px] font-medium text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Schedule
          </div>
          {events.map((ev, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] p-1.5 bg-background/60 rounded border border-indigo-100 dark:border-indigo-900">
              <Badge variant="outline" className="text-[9px] shrink-0">{ev.t}</Badge>
              <span className="flex-1 text-muted-foreground">{ev.event}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InfusionDurationPicker;
