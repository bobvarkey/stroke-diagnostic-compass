import { Crosshair } from "lucide-react";
import CollapsibleModule from "./CollapsibleModule";
import ClinicalSlide from "./ClinicalSlide";
import trialsTimeline from "@/assets/thrombectomy-trials-timeline.png";
import anteriorEvt from "@/assets/anterior-circulation-evt.png";
import largeCore from "@/assets/large-core-guidelines.png";
import posteriorEvt from "@/assets/posterior-circulation-evt.png";

const SLIDES = [
  {
    src: trialsTimeline,
    caption: "Ten years of trials that widened thrombectomy",
    alt: "Timeline from 2015 to 2026 titled Ten years of trials that widened thrombectomy. Color key: early window, late window, basilar, large core, medium vessels, new in 2026, and ongoing. Trial names sit on the year of main publication, with a separate row of ongoing trials not yet reported.",
  },
  {
    src: anteriorEvt,
    caption: "Anterior circulation: who gets EVT?",
    alt: "Table titled Anterior circulation: who gets EVT? Rows are ICA/M1 ASPECTS 6–10, ICA/M1 ASPECTS 3–5, ICA/M1 ASPECTS 0–2, dominant M2, and other M2, M3, ACA. Columns are 0–6 h, 6–24 h, and >24 h. A side panel is labeled Applies when. Legend: Class 1, Class 2a, Uncertain, New trial no guideline yet, Class 3, No RCT data.",
  },
  {
    src: largeCore,
    caption: "Do the guidelines agree on large core?",
    alt: "Table titled Do the guidelines agree on large core? Columns are AHA/ASA 2026, SVIN 2025, SNIS 2024, CSA 2024, and CSBPR 2025. Rows are ASPECTS 3–5 at 0–6 h, ASPECTS 3–5 at 6–24 h, ASPECTS 0–2 at 0–6 h, ASPECTS 0–2 at 6–24 h, age, and pre-stroke mRS. A note lists where they differ on ASPECTS 0–2 and age.",
  },
  {
    src: posteriorEvt,
    caption: "Posterior circulation: who gets EVT?",
    alt: "Table titled Posterior circulation: who gets EVT? Rows are AHA/ASA 2026 NIHSS ≥10 PC-ASPECTS ≥6, AHA/ASA 2026 NIHSS 6–9 PC-ASPECTS ≥6, SNIS 2024, ESO–ESMINT 2024, and extensive infarct. Columns are 0–12 h, 12–24 h, and >24 h. A side panel is labeled Applies when. The take-away bar reads: At NIHSS ≥10 within 24 h, every society treats. Below 10, they disagree.",
  },
] as const;

export default function EvtGuidelineSlides() {
  return (
    <CollapsibleModule
      title="Endovascular thrombectomy"
      icon={<Crosshair className="h-5 w-5 text-primary" />}
      className="min-w-0"
    >
      <div className="space-y-6 min-w-0">
        {SLIDES.map((slide) => (
          <ClinicalSlide key={slide.caption} src={slide.src} caption={slide.caption} alt={slide.alt} />
        ))}
      </div>
    </CollapsibleModule>
  );
}
