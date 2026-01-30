import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  ChevronRight,
  AlertTriangle,
  Activity,
  Brain,
  Heart,
  TestTube,
  Calculator,
  ClipboardList,
  FileText,
  Stethoscope,
  Scale,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  subsections?: { id: string; label: string }[];
}

const sections: NavSection[] = [
  { 
    id: "acute-algorithm", 
    label: "Acute Stroke Algorithm", 
    icon: <AlertTriangle className="h-4 w-4 text-red-500" /> 
  },
  { 
    id: "tpa-eligibility", 
    label: "tPA Eligibility", 
    icon: <Zap className="h-4 w-4 text-amber-500" /> 
  },
  { 
    id: "lvo-dashboard", 
    label: "LVO Dashboard", 
    icon: <Target className="h-4 w-4 text-purple-500" /> 
  },
  { 
    id: "treatment-decision", 
    label: "Treatment Decisions", 
    icon: <Scale className="h-4 w-4 text-blue-500" /> 
  },
  { 
    id: "ctp-penumbra", 
    label: "CTP Penumbra", 
    icon: <Brain className="h-4 w-4 text-purple-500" /> 
  },
  { 
    id: "stroke-history", 
    label: "Stroke History", 
    icon: <ClipboardList className="h-4 w-4 text-orange-500" /> 
  },
  { 
    id: "stroke-phenotyping", 
    label: "Stroke Phenotyping", 
    icon: <FileText className="h-4 w-4 text-indigo-500" /> 
  },
  { 
    id: "nihss-calculator", 
    label: "NIHSS Calculator", 
    icon: <Calculator className="h-4 w-4 text-green-500" /> 
  },
  { 
    id: "gcs-calculator", 
    label: "GCS Calculator", 
    icon: <Brain className="h-4 w-4 text-blue-500" /> 
  },
  { 
    id: "aspects-calculator", 
    label: "ASPECTS Calculator", 
    icon: <Brain className="h-4 w-4 text-cyan-500" /> 
  },
  { 
    id: "collateral-grading", 
    label: "Collateral Grading", 
    icon: <Heart className="h-4 w-4 text-red-500" /> 
  },
  { 
    id: "vascular-anatomy", 
    label: "Vascular Anatomy", 
    icon: <Heart className="h-4 w-4 text-pink-500" /> 
  },
  { 
    id: "prevent-score", 
    label: "PREVENT Score", 
    icon: <Activity className="h-4 w-4 text-emerald-500" /> 
  },
  { 
    id: "kdigo-heatmap", 
    label: "KDIGO Heat Map", 
    icon: <Activity className="h-4 w-4 text-rose-500" /> 
  },
  { 
    id: "lipid-risk", 
    label: "Lipid Risk", 
    icon: <TestTube className="h-4 w-4 text-yellow-500" /> 
  },
  { 
    id: "workup-checklist", 
    label: "Workup Checklist", 
    icon: <ClipboardList className="h-4 w-4 text-slate-500" /> 
  },
];

interface SectionNavigationProps {
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({ 
  activeSection, 
  onSectionClick 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onSectionClick?.(sectionId);
    setIsOpen(false);
  };

  const NavContent = () => (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        <div className="px-3 py-2 mb-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Quick Navigation</h3>
        </div>
        {sections.map((section) => (
          <Button
            key={section.id}
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2 text-left h-auto py-2 px-3",
              activeSection === section.id && "bg-primary/10 text-primary"
            )}
            onClick={() => handleClick(section.id)}
          >
            {section.icon}
            <span className="text-sm truncate">{section.label}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );

  return (
    <>
      {/* Mobile Navigation - Sheet */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg h-14 w-14">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0">
            <div className="pt-12 h-full">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation - Sticky Sidebar */}
      <div className="hidden lg:block fixed left-4 top-24 w-56 z-40">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg shadow-lg max-h-[calc(100vh-120px)] overflow-hidden">
          <NavContent />
        </div>
      </div>
    </>
  );
};

export default SectionNavigation;
