import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search, X, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GLOSSARY, GlossaryEntry } from "@/data/glossary";
import { cn } from "@/lib/utils";

function highlight(text: string, q: string) {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return text.split(re).map((part, i) =>
    re.test(part) ? (
      <mark key={i} className="bg-gradient-to-r from-primary/40 to-secondary/40 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function GlossaryDrawer() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);

  const entries = useMemo(() => Object.values(GLOSSARY), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.short.toLowerCase().includes(q) ||
        e.full.toLowerCase().includes(q) ||
        (e.category?.toLowerCase().includes(q) ?? false)
    );
  }, [entries, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, GlossaryEntry[]> = {};
    filtered.forEach((e) => {
      const key = e.category || "General";
      (groups[key] ||= []).push(e);
    });
    Object.values(groups).forEach((arr) => arr.sort((a, b) => a.term.localeCompare(b.term)));
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const allIds = useMemo(() => filtered.map((e) => e.term), [filtered]);

  // Auto-expand matches while searching
  useEffect(() => {
    if (query.trim()) setExpanded(allIds);
  }, [query, allIds]);

  // Keyboard shortcut: Shift+? to open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label="Open glossary"
          className={cn(
            "fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg",
            "bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground",
            "hover:shadow-xl hover:scale-105 transition-all"
          )}
        >
          <BookOpen className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Clinical Glossary
          </SheetTitle>
          <SheetDescription>
            {entries.length} terms · press <kbd className="px-1 py-0.5 rounded border text-xs">Shift + ?</kbd> to toggle
          </SheetDescription>
        </SheetHeader>

        <div className="p-3 border-b space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search acronyms, definitions, categories…"
              className="pl-9 pr-9"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {entries.length} match{filtered.length === 1 ? "" : "es"}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setExpanded(allIds)}>
                <ChevronsUpDown className="h-3.5 w-3.5 mr-1" /> Expand all
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setExpanded([])}>
                <ChevronsDownUp className="h-3.5 w-3.5 mr-1" /> Collapse all
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {grouped.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No matches for "{query}"</p>
            )}
            {grouped.map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">{category}</Badge>
                  <span className="text-xs text-muted-foreground">{items.length}</span>
                </div>
                <Accordion type="multiple" value={expanded} onValueChange={setExpanded} className="space-y-1">
                  {items.map((e) => (
                    <AccordionItem key={e.term} value={e.term} className="border rounded-md px-3 bg-card/60">
                      <AccordionTrigger className="py-2 hover:no-underline">
                        <div className="flex flex-col items-start text-left">
                          <span className="font-semibold text-sm">{highlight(e.term, query)}</span>
                          <span className="text-xs text-muted-foreground">{highlight(e.short, query)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-3 text-sm text-muted-foreground">
                        <p>{highlight(e.full, query)}</p>
                        {e.references && e.references.length > 0 && (
                          <ul className="mt-2 text-xs list-disc list-inside space-y-0.5">
                            {e.references.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
