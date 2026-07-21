import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GLOSSARY, GlossaryEntry } from "@/data/glossary";
import { Badge } from "@/components/ui/badge";

interface AcronymProps {
  term: string;
  children?: React.ReactNode;
}

export const Acronym: React.FC<AcronymProps> = ({ term, children }) => {
  const entry: GlossaryEntry | undefined = GLOSSARY[term];
  const label = children ?? term;
  if (!entry) return <>{label}</>;

  return (
    <Popover>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <PopoverTrigger asChild>
            <span
              className="cursor-help underline decoration-dotted decoration-primary/70 underline-offset-2 hover:decoration-primary"
              aria-label={`${entry.term}: ${entry.short}`}
            >
              {label}
            </span>
          </PopoverTrigger>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-64 text-xs">
          <div className="font-semibold text-gradient-sunset">{entry.term}</div>
          <div className="text-muted-foreground">{entry.short}</div>
          <div className="mt-1 text-[10px] opacity-70">Click for full definition</div>
        </HoverCardContent>
      </HoverCard>
      <PopoverContent side="top" className="w-80 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-base text-gradient-sunset">{entry.term}</span>
          {entry.category && <Badge variant="outline" className="text-[10px]">{entry.category}</Badge>}
        </div>
        <div className="text-xs font-medium text-foreground mb-1">{entry.short}</div>
        <div className="text-xs text-muted-foreground leading-relaxed">{entry.full}</div>
      </PopoverContent>
    </Popover>
  );
};

export default Acronym;
