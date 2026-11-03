import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ScanEye, ExternalLink } from "lucide-react";
import pcnsvImage from "@/assets/pcnsv-cerebellar-tonsil.jpeg.asset.json";

export default function PCNSVImagingSection() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border-fuchsia-500/30 bg-card/80 backdrop-blur">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer min-h-[44px]">
            <CardTitle className="flex items-center gap-2 text-base">
              <ScanEye className="h-5 w-5 text-fuchsia-500" />
              PCNSV — Imaging Marker (Primary CNS Vasculitis)
              <Badge variant="outline" className="ml-auto">Front Immunol 2026</Badge>
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 p-3">
              <p className="font-semibold">Key finding</p>
              <p>
                <strong>Cerebellar tonsillar haemorrhages</strong>, particularly when accompanied by{" "}
                <strong>punctate/linear enhancement</strong>, are suggestive of primary CNS vasculitis
                (PCNSV / PACNS).
              </p>
            </div>

            <figure className="space-y-2">
              <a href={pcnsvImage.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={pcnsvImage.url}
                  alt="Axial MRI of the posterior fossa showing cerebellar tonsillar haemorrhages and punctate/linear enhancement in PCNSV"
                  className="w-full rounded-md border border-border"
                  loading="lazy"
                />
              </a>
              <figcaption className="text-xs text-muted-foreground space-y-1">
                <p><strong>a</strong> — Cerebellar tonsillar signal change (arrows).</p>
                <p><strong>b</strong> — Susceptibility-weighted imaging: multiple microhaemorrhages in the cerebellar tonsils/vermis (arrows).</p>
                <p><strong>c</strong> — Post-contrast T1: punctate/linear enhancement in the tonsils (arrows).</p>
                <p>Tap the image to open it full size.</p>
              </figcaption>
            </figure>

            <div>
              <p className="font-semibold mb-1">How to use it in an ischaemic stroke workup</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Suspect PCNSV with recurrent/multi-territory infarcts of different ages, young patient, headache, cognitive change, or no conventional cause.</li>
                <li>Request SWI and post-contrast (ideally vessel-wall) MRI; review the cerebellar tonsils specifically.</li>
                <li>Tonsillar haemorrhage + punctate/linear enhancement raises suspicion — it supports, but does not replace, CSF analysis, angiography (DSA) and brain/leptomeningeal biopsy.</li>
                <li>Exclude mimics: RCVS, infection (VZV, TB, syphilis), systemic vasculitis, CAA-related inflammation, lymphoma, and intracranial atherosclerosis.</li>
              </ul>
            </div>

            <a
              href="https://doi.org/10.3389/fimmu.2026.1961925"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary underline min-h-[44px]"
            >
              Frontiers in Immunology — doi 10.3389/fimmu.2026.1961925 <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
