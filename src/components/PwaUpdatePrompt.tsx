import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/** A new service worker is waiting. Applying it reloads the app, so the clinician decides when —
 *  never mid-entry. registerType is "prompt", so nothing swaps until this button is pressed. */
export default function PwaUpdatePrompt() {
  const [ready, setReady] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    const onAvailable = () => setReady(true);
    const onOffline = () => setOfflineReady(true);
    window.addEventListener("pwa-update-available", onAvailable);
    window.addEventListener("pwa-offline-ready", onOffline);
    return () => {
      window.removeEventListener("pwa-update-available", onAvailable);
      window.removeEventListener("pwa-offline-ready", onOffline);
    };
  }, []);

  if (offlineReady && !ready) {
    return (
      <div role="status" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] glass-strong rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
        <span className="text-sm">Ready to work offline.</span>
        <Button size="sm" variant="ghost" className="min-h-9" onClick={() => setOfflineReady(false)}>Dismiss</Button>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] glass-strong rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg"
    >
      <span className="text-sm">An update is ready.</span>
      <Button
        size="sm"
        className="min-h-9"
        onClick={() => window.dispatchEvent(new CustomEvent("pwa-apply-update"))}
      >
        Update now
      </Button>
      <Button size="sm" variant="ghost" className="min-h-9" onClick={() => setReady(false)}>
        Later
      </Button>
    </div>
  );
}
