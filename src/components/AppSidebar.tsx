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
        id: "thrombolytics-anticoag", 
        label: "Thrombolytic Dosing", 
        icon: <Beaker className="h-4 w-4 text-amber-600" /> 
      },
      { 
        id: "post-ivt-hemorrhage", 
        label: "Post IVT-ICH", 
        icon: <Droplets className="h-4 w-4 text-red-600" /> 
      },
      { 
        id: "cvt-management", 
        label: "CVT Management", 
        icon: <Brain className="h-4 w-4 text-purple-600" /> 
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

    if (isMobile) {
      setOpenMobile(false);
    }

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      window.setTimeout(() => {
        const corrected = document.getElementById(sectionId);
        corrected?.scrollIntoView({ behavior: "instant", block: "start", inline: "nearest" });
      }, 250);
    }
  };

  return (
    <Sidebar collapsible="icon" className="w-full max-w-[300px] min-w-[240px] border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
      <SidebarHeader className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/95 dark:bg-slate-950/95 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col gap-0.5">
              <span className="text-base font-semibold text-foreground">Stroke Workup</span>
              <span className="text-sm text-muted-foreground">Fast access to clinical tools</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="min-h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] px-3 py-4">
          {navGroups.map((group) => (
            <Collapsible key={group.title} defaultOpen={group.defaultOpen} className="group/collapsible mb-4 last:mb-0">
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className={cn(
                    "flex items-center justify-between rounded-2xl bg-slate-100/80 dark:bg-slate-900/75 px-3 text-xs uppercase tracking-[0.24em] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900 transition-colors duration-200",
                    collapsed ? "py-2" : "py-3"
                  )}>
                    <span>{group.title} ({group.items.length})</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent className="mt-3 space-y-1">
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => handleClick(item.id)}
                            isActive={activeSection === item.id}
                            tooltip={item.label}
                            aria-current={activeSection === item.id ? "page" : undefined}
                            className={cn(
                              "flex items-start gap-3 w-full rounded-2xl px-3 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                              collapsed ? "py-2" : "py-3",
                              activeSection === item.id
                                ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white shadow-sm"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                            )}
                          >
                            <span className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 transition-colors duration-200",
                              activeSection === item.id
                                ? "bg-primary/10 text-primary"
                                : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                            )}>
                              {item.icon}
                            </span>
                            <span className="flex-1 text-left leading-tight">{item.label}</span>
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

      <SidebarFooter className="border-t border-slate-200/80 dark:border-slate-800/80 px-4 py-4">
        {!collapsed && (
          <div className="text-xs text-muted-foreground text-center font-medium">
            Guided workflow · Easy navigation
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
