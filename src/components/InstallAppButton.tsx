import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BIPEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

/** Shows an "Install app" button when the browser offers installation. */
export default function InstallAppButton() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", h);
    const done = () => setEvt(null);
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("beforeinstallprompt", h); window.removeEventListener("appinstalled", done); };
  }, []);
  if (!evt) return null;
  return (
    <Button variant="outline" size="sm" className="min-h-9" onClick={async () => { await evt.prompt(); await evt.userChoice; setEvt(null); }} aria-label="Install app">
      <Download className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Install</span>
    </Button>
  );
}
