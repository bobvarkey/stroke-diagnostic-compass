import { AArrowDown, AArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetErrorBoundary } from "./WidgetErrorBoundary";
import { FontSizeControl } from "./FontSizeControl";
import { applyFontScale, readFontScale, MAX_SCALE, MIN_SCALE } from "@/hooks/useFontScale";

/** Dependency-free A+/A- control used if the rich popover control fails to render. */
function MinimalFontSizeControl() {
  const step = (delta: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number((readFontScale() + delta).toFixed(2))));
    applyFontScale(next);
    try {
      window.localStorage.setItem("app-font-scale", String(next));
    } catch {
      /* storage unavailable — scale still applies for this session */
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" aria-label="Decrease text size" onClick={() => step(-0.1)}>
        <AArrowDown className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" className="h-10 w-10 rounded-full" aria-label="Increase text size" onClick={() => step(0.1)}>
        <AArrowUp className="h-4 w-4" />
      </Button>
    </div>
  );
}

/** Text-size control that can never crash its parent view. */
export function SafeFontSizeControl() {
  return (
    <WidgetErrorBoundary label="FontSizeControl" fallback={<MinimalFontSizeControl />}>
      <FontSizeControl />
    </WidgetErrorBoundary>
  );
}
