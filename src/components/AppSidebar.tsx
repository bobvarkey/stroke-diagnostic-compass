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
    <Sidebar collapsible="icon" className="border-r border-slate-800 bg-slate-950/95 shadow-lg shadow-slate-950/10">
      <SidebarHeader className="border-b border-slate-800/80 bg-slate-950/95 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 ring-1 ring-slate-700/60">
            <Stethoscope className="h-5 w-5 text-sky-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">Stroke Workup</span>
              <span className="text-xs text-slate-500">Quick navigation</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-148px)] px-2 py-3">
          {navGroups.map((group) => (
            <Collapsible key={group.title} defaultOpen={group.defaultOpen} className="group/collapsible mb-3 last:mb-0">
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="cursor-pointer rounded-2xl px-3 py-2 text-xs uppercase tracking-[0.24em] font-semibold text-slate-500 transition-colors hover:bg-slate-900 hover:text-slate-100">
                    <span>{group.title}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
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
                            aria-current={activeSection === item.id ? "page" : undefined}
                            className={cn(
                              "group/menu-button rounded-2xl px-3 py-3 text-sm font-medium text-slate-300 transition duration-200",
                              "hover:bg-slate-900/80 hover:text-slate-100",
                              activeSection === item.id &&
                                "bg-slate-900 text-slate-100 font-semibold shadow-[0_0_0_2px_rgba(56,189,248,0.12)]",
                            )}
                          >
                            <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl transition", activeSection === item.id ? "bg-slate-800 text-sky-300" : "bg-slate-900 text-slate-400")}>{item.icon}</span>
                            <span className="truncate text-left">{item.label}</span>
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

      <SidebarFooter className="border-t border-slate-800/70 p-3">
        {!collapsed && (
          <div className="text-xs text-slate-500 text-center font-medium">
            Guided workflow · low-glare palette
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
