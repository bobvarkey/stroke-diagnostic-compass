import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoomableImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onClick"> {
  src: string;
  alt: string;
  thumbnailClassName?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  thumbnailClassName,
  className,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number; sx: number; sy: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(6, Math.max(1, s - e.deltaY * 0.002)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, sx: pos.x, sy: pos.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: dragRef.current.sx + (e.clientX - dragRef.current.x),
      y: dragRef.current.sy + (e.clientY - dragRef.current.y),
    });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block overflow-hidden rounded-lg border border-border/50 hover:border-primary/60 transition",
          thumbnailClassName
        )}
        aria-label={`Zoom ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          className={cn("w-full h-auto object-contain", className)}
          {...rest}
        />
        <span className="absolute top-2 right-2 rounded-md bg-background/80 backdrop-blur px-1.5 py-1 opacity-0 group-hover:opacity-100 transition">
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[100vw] w-screen h-screen p-0 border-0 bg-background/95 backdrop-blur-xl">
          <div className="absolute top-3 right-3 z-20 flex gap-2">
            <Button size="icon" variant="secondary" onClick={() => setScale((s) => Math.min(6, s + 0.5))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={() => setScale((s) => Math.max(1, s - 0.5))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div
            ref={wrapRef}
            className="w-full h-full overflow-hidden flex items-center justify-center touch-none select-none"
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
            onDoubleClick={() => setScale((s) => (s > 1 ? 1 : 2.5))}
          >
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="max-w-none transition-transform duration-100 will-change-transform"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                maxHeight: scale === 1 ? "95vh" : undefined,
                maxWidth: scale === 1 ? "95vw" : undefined,
              }}
            />
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-card/80 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
            {Math.round(scale * 100)}% — scroll to zoom, drag to pan, double-click to toggle
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

