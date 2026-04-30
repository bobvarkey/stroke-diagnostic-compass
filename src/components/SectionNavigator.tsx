import React, { useState } from "react";
import { ChevronDown, ChevronRight, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SectionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

interface SectionNavigatorProps {
  sections: SectionItem[];
  title: string;
  onNavigateToSection: (id: string) => void;
}

const SectionNavigator: React.FC<SectionNavigatorProps> = ({ sections, title, onNavigateToSection }) => {
  const [isOpen, setIsOpen] = useState(true);

  const scrollToSection = (id: string) => {
    onNavigateToSection(id);

    // Force-mount the LazySection containing the target so it has real height
    window.dispatchEvent(new CustomEvent('force-mount-section', { detail: id }));

    const headerOffset = 80;
    const scrollToTarget = (behavior: ScrollBehavior = 'smooth') => {
      const element = document.getElementById(id);
      if (!element) return;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior });
    };

    // Repeat corrections to handle layout shifts as lazy content mounts
    setTimeout(() => scrollToTarget('instant'), 100);
    setTimeout(() => scrollToTarget('instant'), 400);
    setTimeout(() => scrollToTarget('smooth'), 800);
    setTimeout(() => scrollToTarget('smooth'), 1500);
    setTimeout(() => scrollToTarget('smooth'), 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="rounded-xl border border-border/50 glass-strong overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{title}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {sections.length} sections
          </Badge>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Section Grid */}
      {isOpen && (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all",
                  "border border-border/40 hover:border-primary/40 hover:bg-primary/5",
                  "active:scale-[0.98] min-h-[44px]"
                )}
              >
                <span className="shrink-0">{section.icon}</span>
                <span className="text-xs font-medium leading-tight truncate">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Navigation hint */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-border/30">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded"
            >
              <Home className="h-3 w-3" />
              Back to Top
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionNavigator;
