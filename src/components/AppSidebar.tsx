import React from "react";
import { 
  AlertTriangle,
  Activity,
  Brain,
  Heart,
  TestTube,
  Calculator,
  ClipboardList,
  FileText,
  Scale,
  Target,
  Zap,
  Beaker,
  BookOpen,
  ChevronUp,
  ChevronDown,
  Home,
  Stethoscope,
  Droplets
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    title: "Acute Management",
    defaultOpen: true,
    items: [
      { 
        id: "stroke-code", 
        label: "⚡ STROKE CODE", 
        icon: <Zap className="h-4 w-4 text-red-500 animate-pulse" /> 
      },
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
        id: "thrombolytic-dose", 
        label: "Thrombolytic Dosing", 
        icon: <Beaker className="h-4 w-4 text-amber-600" /> 
      },
      { 
        id: "post-ivt-hemorrhage", 
        label: "Post-IVT Hemorrhage", 
        icon: <Droplets className="h-4 w-4 text-red-600" /> 
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
    ]
  },
  {
    title: "Imaging & Assessment",
    defaultOpen: true,
    items: [
      { 
        id: "ctp-penumbra", 
        label: "CTP Penumbra", 
        icon: <Brain className="h-4 w-4 text-purple-500" /> 
      },
      { 
        id: "aspects-calculator", 
        label: "ASPECTS Calculator", 
        icon: <Brain className="h-4 w-4 text-cyan-500" /> 
      },
      { 
        id: "vascular-anatomy", 
        label: "Vascular Anatomy", 
        icon: <Heart className="h-4 w-4 text-pink-500" /> 
      },
    ]
  },
  {
    title: "Clinical Scores",
    defaultOpen: false,
    items: [
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
        id: "prevent-score", 
        label: "PREVENT Score", 
        icon: <Activity className="h-4 w-4 text-emerald-500" /> 
      },
    ]
  },
  {
    title: "Risk Assessment",
    defaultOpen: false,
    items: [
      { 
        id: "kdigo-heatmap", 
        label: "KDIGO Heat Map", 
        icon: <Activity className="h-4 w-4 text-rose-500" /> 
      },
      { 
        id: "prime-tool", 
        label: "PRIME Tool", 
        icon: <AlertTriangle className="h-4 w-4 text-orange-500" /> 
      },
      { 
        id: "lipid-risk", 
        label: "Lipid Risk", 
        icon: <TestTube className="h-4 w-4 text-yellow-500" /> 
      },
    ]
  },
  {
    title: "Documentation",
    defaultOpen: false,
    items: [
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
        id: "workup-checklist", 
        label: "Workup Checklist", 
        icon: <ClipboardList className="h-4 w-4 text-slate-500" /> 
      },
    ]
  },
];

interface AppSidebarProps {
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function AppSidebar({ activeSection, onSectionClick }: AppSidebarProps) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const handleClick = (sectionId: string) => {
    onSectionClick?.(sectionId);
    
    // Close sidebar on mobile after clicking a link
    if (isMobile) {
      setOpenMobile(false);
    }

    // Switch to the correct tab if needed
    const tabMap: Record<string, string> = {
      "post-ivt-hemorrhage": "post-ivt",
    };
    const hemorrhagicSections = ["ich-score"];
    const targetTab = tabMap[sectionId] 
      || (hemorrhagicSections.includes(sectionId) ? "hemorrhagic" : "ischemic");
    
    // Find and click the correct tab trigger
    const tabTrigger = document.querySelector(`[data-state][role="tab"][value="${targetTab}"]`) as HTMLElement;
    if (tabTrigger && tabTrigger.getAttribute("data-state") !== "active") {
      tabTrigger.click();
    }
    
    // Dispatch a custom event so LazySection can force-mount the target
    window.dispatchEvent(new CustomEvent('force-mount-section', { detail: sectionId }));
    
    // Scroll to the target section with repeated corrections for layout shifts
    const scrollToTarget = (behavior: ScrollBehavior = 'smooth') => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior, block: 'start' });
      }
    };
    
    // Instant jump first to get close, then smooth corrections
    setTimeout(() => scrollToTarget('instant'), 100);
    setTimeout(() => scrollToTarget('instant'), 400);
    setTimeout(() => scrollToTarget('smooth'), 800);
    setTimeout(() => scrollToTarget('smooth'), 1500);
    setTimeout(() => scrollToTarget('smooth'), 2500);
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm">Stroke Workup</span>
              <span className="text-xs text-muted-foreground">Quick Navigation</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-140px)]">
          {navGroups.map((group) => (
            <Collapsible key={group.title} defaultOpen={group.defaultOpen} className="group/collapsible">
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md transition-colors flex items-center justify-between pr-2">
                    <span>{group.title}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => handleClick(item.id)}
                            isActive={activeSection === item.id}
                            tooltip={item.label}
                            className={cn(
                              "transition-colors min-h-[44px] md:min-h-0",
                              activeSection === item.id && "bg-primary/10 text-primary font-medium"
                            )}
                          >
                            {item.icon}
                            <span className="truncate">{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        {!collapsed && (
          <div className="text-xs text-muted-foreground text-center">
            AHA 2026 Guidelines
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
