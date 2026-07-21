import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X, Stethoscope, Home, Calculator, History, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { NAV_GROUPS } from "@/lib/navRegistry";

const LS_GROUPS = "stroke-app:sidebar-groups:v1";

function loadGroupState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LS_GROUPS);
    if (raw) return JSON.parse(raw);
  } catch {}
  const defaults: Record<string, boolean> = {};
  NAV_GROUPS.forEach((g, i) => (defaults[g.title] = i < 2));
  return defaults;
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-gradient-sunset text-primary-foreground rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

interface AppSidebarProps {
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function AppSidebar({ activeSection, onSectionClick }: AppSidebarProps) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [groupOpen, setGroupOpen] = useState<Record<string, boolean>>(() => loadGroupState());

  // Persist group state
  useEffect(() => {
    try { localStorage.setItem(LS_GROUPS, JSON.stringify(groupOpen)); } catch {}
  }, [groupOpen]);

  // Blur backdrop when searching
  useEffect(() => {
    if (query.trim()) document.body.setAttribute("data-sidebar-search", "active");
    else document.body.removeAttribute("data-sidebar-search");
    return () => document.body.removeAttribute("data-sidebar-search");
  }, [query]);

  const q = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!q) return NAV_GROUPS.map(g => ({ ...g, forceOpen: false }));
    return NAV_GROUPS
      .map(g => {
        const items = g.items.filter(it =>
          it.label.toLowerCase().includes(q) ||
          it.keywords?.some(k => k.toLowerCase().includes(q))
        );
        return { ...g, items, forceOpen: items.length > 0 };
      })
      .filter(g => g.items.length > 0);
  }, [q]);

  const handleClick = (sectionId: string) => {
    onSectionClick?.(sectionId);
    if (isMobile) setOpenMobile(false);

    // Navigate to workup if not there
    if (window.location.pathname !== "/workup") {
      navigate(`/workup?section=${sectionId}`);
      return;
    }

    const tabMap: Record<string, string> = {
      "post-ivt-hemorrhage": "post-ivt",
      "cvt-management": "cvt",
      "stroke-meds": "meds",
      "antiplatelet-switching": "meds",
      "thrombolytics-anticoagulants": "ischemic",
    };
    const targetTab = tabMap[sectionId] || "ischemic";
    const tabTrigger = document.querySelector(
      `[data-state][role="tab"][value="${targetTab}"]`
    ) as HTMLElement;
    if (tabTrigger && tabTrigger.getAttribute("data-state") !== "active") tabTrigger.click();

    window.dispatchEvent(new CustomEvent("force-mount-section", { detail: sectionId }));
    const scrollTo = (b: ScrollBehavior = "smooth") => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: b, block: "start" });
    };
    setTimeout(() => scrollTo("instant"), 100);
    setTimeout(() => scrollTo("smooth"), 700);
    setTimeout(() => scrollTo("smooth"), 1600);
  };

  return (
    <Sidebar collapsible="icon" className="border-r glass-subtle">
      <SidebarHeader className="border-b p-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-sunset flex items-center justify-center shadow-glow shrink-0">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-bold text-sm text-gradient-sunset truncate">Stroke Complete 2026</span>
              <span className="text-[10px] text-muted-foreground">Clinical Companion</span>
            </div>
          )}
        </Link>

        {!collapsed && (
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections…"
              className="h-9 pl-8 pr-8 text-xs bg-background/50"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
                aria-label="Clear search"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-200px)]">
          {filteredGroups.length === 0 && q && (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              No matches for "{query}"
            </div>
          )}
          {filteredGroups.map((group) => {
            const isOpen = group.forceOpen || groupOpen[group.title] !== false;
            return (
              <Collapsible
                key={group.title}
                open={isOpen}
                onOpenChange={(o) => !group.forceOpen && setGroupOpen(s => ({ ...s, [group.title]: o }))}
                className="group/collapsible"
              >
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className={cn(
                      "cursor-pointer hover:bg-accent/30 rounded-md transition-colors flex items-center justify-between pr-2 text-[11px] uppercase tracking-wider font-semibold",
                      group.color
                    )}>
                      <span>{group.title}</span>
                      <ChevronDown className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        isOpen && "rotate-180"
                      )} />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <SidebarMenuItem key={item.id}>
                              <SidebarMenuButton
                                onClick={() => handleClick(item.id)}
                                isActive={activeSection === item.id}
                                tooltip={item.label}
                                className={cn(
                                  "transition-all min-h-[40px] rounded-lg",
                                  activeSection === item.id && "bg-gradient-sunset/15 text-primary font-medium shadow-sm border border-primary/20"
                                )}
                              >
                                <Icon className={cn("h-4 w-4 shrink-0", item.color)} />
                                <span className="truncate text-sm">
                                  {highlight(item.label, q)}
                                </span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t p-2 space-y-1">
        {!collapsed && (
          <div className="grid grid-cols-4 gap-1">
            <Link to="/" className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-accent/30 text-[10px]">
              <Home className="h-3.5 w-3.5 text-coral" style={{ color: "hsl(var(--accent-coral))" }} />Home
            </Link>
            <Link to="/calculators" className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-accent/30 text-[10px]">
              <Calculator className="h-3.5 w-3.5" style={{ color: "hsl(var(--accent-amber))" }} />Calcs
            </Link>
            <Link to="/history" className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-accent/30 text-[10px]">
              <History className="h-3.5 w-3.5" style={{ color: "hsl(var(--accent-magenta))" }} />History
            </Link>
            <Link to="/settings" className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-accent/30 text-[10px]">
              <Settings className="h-3.5 w-3.5" style={{ color: "hsl(var(--accent-violet))" }} />Settings
            </Link>
          </div>
        )}
        {!collapsed && (
          <div className="text-[10px] text-muted-foreground text-center">
            <span className="text-gradient-sunset font-semibold">AHA 2026</span> Guidelines
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

