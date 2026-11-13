import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClinicalSlideProps = {
  src: string;
  /** Short label shown under the card and as the enlarge dialog title. */
  caption: string;
  /** Description of what is visible on the slide. */
  alt: string;
};

/**
 * Reference-slide card. Tap or click opens a dialog that closes with Escape,
 * the backdrop, or the Close button. The thumbnail stays within the page width;
 * the dialog body scrolls if the slide is taller or wider than the viewport.
 */
export default function ClinicalSlide({ src, caption, alt }: ClinicalSlideProps) {
  const [open, setOpen] = useState(false);

  return (
    <figure className="min-w-0 max-w-full">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-white p-2 text-left shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <img
          src={src}
          alt={alt}
          className="mx-auto block h-auto w-full max-w-full"
          loading="lazy"
        />
      </button>
      <figcaption className="mt-2 text-center text-xs leading-snug text-muted-foreground">
        {caption}
      </figcaption>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] min-w-0 max-w-[calc(100vw-1.5rem)] flex-col gap-3 overflow-hidden p-3 sm:max-w-5xl sm:p-4">
          <DialogHeader className="min-w-0 shrink-0 space-y-0 pr-8 text-left">
            <DialogTitle className="min-w-0 text-sm font-medium leading-snug">{caption}</DialogTitle>
            <DialogDescription className="sr-only">{caption}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
            <img
              src={src}
              alt={alt}
              className="h-auto w-[920px] max-w-none sm:w-full sm:max-w-full"
            />
          </div>
          <DialogFooter className="shrink-0 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </figure>
  );
}
