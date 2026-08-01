import { AArrowDown, AArrowUp, RotateCcw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { MAX_SCALE, MIN_SCALE, useFontScale } from "@/hooks/useFontScale";

export function FontSizeControl() {
  const { scale, setScale, increase, decrease, reset } = useFontScale();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-2 border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 shadow-lg"
          aria-label="Adjust text size"
        >
          <Type className="h-5 w-5 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3 bg-card/95 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Text size</p>
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={decrease}
            disabled={scale <= MIN_SCALE}
            aria-label="Decrease text size"
          >
            <AArrowDown className="h-4 w-4" />
          </Button>
          <Slider
            value={[scale]}
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.05}
            onValueChange={([v]) => setScale(v)}
            aria-label="Text size"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={increase}
            disabled={scale >= MAX_SCALE}
            aria-label="Increase text size"
          >
            <AArrowUp className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="w-full gap-2" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to 100%
        </Button>

        <p className="text-xs text-muted-foreground leading-snug">
          Scales all typography and spacing proportionally, so layouts stay intact.
        </p>
      </PopoverContent>
    </Popover>
  );
}
