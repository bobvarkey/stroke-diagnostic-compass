import { Badge } from "@/components/ui/badge";
import CollapsibleModule from "@/components/CollapsibleModule";
import SectionNavigator from "@/components/SectionNavigator";
import CarotidRevascularisation from "@/components/CarotidRevascularisation";
import CarotidRevascularisationDecisionTree from "@/components/CarotidRevascularisationDecisionTree";
import { NAVIGATE_SECTION_EVENT } from "@/lib/sectionTabs";
import { Activity, FileText, GitBranch, HeartPulse, ShieldAlert } from "lucide-react";
import carotidAlgorithmPoster from "@/assets/carotid-revascularisation-algorithm.jpg";
import carotidLandmarkTrials from "@/assets/carotid-landmark-trials.png";

type CarotidTabContentProps = {
  /**
   * Embedded inside the ischemic modules: section links scroll within the
   * current tab instead of switching to the top-level Carotid tab.
   */
  embedded?: boolean;
};

const CarotidTabContent = ({ embedded = false }: CarotidTabContentProps) => {
  return (
    <>
      <SectionNavigator
        title="Carotid Revascularisation Modules"
        sections={[
          { id: "carotid-decision-tree", label: "Decision tree", icon: <GitBranch className="h-3.5 w-3.5 text-teal-500" /> },
          { id: "carotid-algorithm-poster", label: "Algorithm poster", icon: <FileText className="h-3.5 w-3.5 text-teal-500" /> },
          { id: "carotid-symptomatic", label: "Symptomatic disease", icon: <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> },
          { id: "carotid-asymptomatic", label: "Asymptomatic disease", icon: <ShieldAlert className="h-3.5 w-3.5 text-sky-500" /> },
          { id: "carotid-cea-vs-cas", label: "CEA vs CAS / medical therapy", icon: <Activity className="h-3.5 w-3.5 text-violet-500" /> },
          { id: "carotid-landmark-trials", label: "Landmark trials slide", icon: <FileText className="h-3.5 w-3.5 text-teal-500" /> },
        ]}
        onNavigateToSection={(id) => {
          if (!embedded) {
            window.dispatchEvent(new CustomEvent(NAVIGATE_SECTION_EVENT, { detail: id }));
          }
        }}
        dispatchNavigation={!embedded}
      />

      <div id="carotid-decision-tree" className="scroll-mt-24">
        <CarotidRevascularisationDecisionTree />
      </div>

      <div id="carotid-algorithm-poster" className="scroll-mt-24">
        <CollapsibleModule
          title="Carotid revascularization algorithm"
          subtitle="Full decision pathway — symptomatic and asymptomatic disease"
          icon={<FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />}
          badge={<Badge className="border-0 bg-teal-600 text-white hover:bg-teal-600">Reference</Badge>}
          defaultOpen
          className="border-teal-300 dark:border-teal-700"
          headerClassName="bg-teal-50 dark:bg-teal-950/30"
        >
          <div className="space-y-2 pt-4">
            <a
              href={carotidAlgorithmPoster}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border bg-white"
            >
              <img
                src={carotidAlgorithmPoster}
                alt="Carotid revascularization decision algorithm covering symptomatic and asymptomatic disease, stenosis grading, contralateral disease, timing, procedural risk and revascularization options"
                className="h-auto w-full"
                loading="lazy"
              />
            </a>
            <p className="text-xs text-muted-foreground">
              Tap or click the image to open it full size.
            </p>
          </div>
        </CollapsibleModule>
      </div>

      <div id="carotid-revascularisation" className="scroll-mt-24">
        <CarotidRevascularisation />
      </div>

      <div id="carotid-landmark-trials" className="scroll-mt-24">
        <CollapsibleModule
          title="Landmark trials in carotid stenosis"
          subtitle="Symptomatic, asymptomatic and modern era — visual summary"
          icon={<FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />}
          badge={<Badge className="border-0 bg-teal-600 text-white hover:bg-teal-600">Slide</Badge>}
          defaultOpen
          className="border-teal-300 dark:border-teal-700"
          headerClassName="bg-teal-50 dark:bg-teal-950/30"
        >
          <div className="space-y-2 pt-4">
            <a
              href={carotidLandmarkTrials}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border"
            >
              <img
                src={carotidLandmarkTrials}
                alt="Landmark trials in carotid stenosis: symptomatic CEA trials NASCET and ECST, asymptomatic ACAS and ACST-1, and modern-era CREST, CREST-2 and CREST-H"
                className="h-auto w-full"
                loading="lazy"
              />
            </a>
            <p className="text-xs text-muted-foreground">
              Tap or click the slide to open it full size.
            </p>
          </div>
        </CollapsibleModule>
      </div>

      <div className="text-center text-sm text-muted-foreground border-t pt-4">
        <p>Carotid revascularisation evidence summary — Always correlate with current guidelines and local outcomes</p>
      </div>
    </>
  );
};

export default CarotidTabContent;
