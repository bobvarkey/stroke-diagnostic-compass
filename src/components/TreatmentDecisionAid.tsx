import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scale, Clock, ArrowRightLeft, AlertTriangle, Printer, FileText, X } from "lucide-react";

import tpaVsMedical from "@/assets/tpa-vs-medical-management.png";
import tpa3hVs4h from "@/assets/tpa-3h-vs-4-5h.png";
import lvoMedicalVsEvt from "@/assets/lvo-medical-vs-evt.png";
import tpaVsTpaMtLvo from "@/assets/tpa-vs-tpa-mt-lvo.png";
import lateThrombectomyLvo from "@/assets/late-thrombectomy-lvo.png";

interface DecisionScenario {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  keyStats: string;
  clinicalContext: string;
  evidenceSource: string;
  patientFriendlyExplanation: string;
  whatThisMeans: string;
  questionsToAsk: string[];
}

const decisionScenarios: DecisionScenario[] = [
  {
    id: "no-tpa-vs-tpa",
    title: "No tPA vs IV tPA",
    subtitle: "Acute Ischemic Stroke within 4.5 hours",
    image: tpaVsMedical,
    description: "Comparison of outcomes between supportive care (no IV tPA) versus IV tPA (clot-busting medication) in acute ischemic stroke.",
    keyStats: "18 vs 31 patients living independently per 100 treated",
    clinicalContext: "For eligible patients within the treatment window, IV tPA significantly improves functional outcomes. More patients achieve independent living with treatment.",
    evidenceSource: "Based on clinical trials of IV tPA for acute ischemic stroke (NINDS, ECASS)",
    patientFriendlyExplanation: "IV tPA is a 'clot-busting' medication given through an IV. It works by dissolving the blood clot that is blocking blood flow to your brain. This treatment must be given within 4.5 hours of stroke symptoms starting.",
    whatThisMeans: "Out of every 100 people who have a stroke:\n• With supportive care only: About 18 will live independently\n• With IV tPA treatment: About 31 will live independently\n\nThis means 13 more people out of 100 can live independently if they receive this treatment.",
    questionsToAsk: [
      "Am I eligible for this treatment?",
      "What are the risks of bleeding?",
      "How much time do we have to decide?",
      "What happens if I choose not to have this treatment?"
    ]
  },
  {
    id: "early-vs-late-tpa",
    title: "Early tPA vs Late tPA",
    subtitle: "Time-dependent efficacy: <3 hours vs 3-4.5 hours",
    image: tpa3hVs4h,
    description: "Comparison of functional outcomes when IV tPA is administered within 3 hours (NINDS trial) versus 3-4.5 hours (ECASS III trial).",
    keyStats: "32 vs 16 patients with improved outcomes per 100 treated",
    clinicalContext: "Earlier treatment yields substantially better outcomes. 'Time is brain' - every minute counts in acute stroke treatment.",
    evidenceSource: "NINDS trial (<3h) and ECASS III trial (3-4.5h)",
    patientFriendlyExplanation: "The sooner the clot-busting medication is given, the better it works. Think of it like putting out a fire - the faster you act, the less damage occurs.",
    whatThisMeans: "Out of every 100 people treated:\n• Treatment within 3 hours: About 32 have improved outcomes\n• Treatment between 3-4.5 hours: About 16 have improved outcomes\n\n'Time is Brain' - every minute that passes, more brain cells are lost. Getting treatment faster doubles your chance of a better outcome.",
    questionsToAsk: [
      "When did my symptoms start?",
      "Can we start treatment right away?",
      "Is there anything delaying my treatment?",
      "What can family members do to help speed things up?"
    ]
  },
  {
    id: "lvo-medical-vs-evt",
    title: "LVO: Medical Management vs EVT",
    subtitle: "Large Vessel Occlusion Treatment Comparison",
    image: lvoMedicalVsEvt,
    description: "In patients with large vessel occlusion (LVO), comparison between best medical management alone versus endovascular thrombectomy (EVT).",
    keyStats: "26 vs 46 patients achieving functional independence (mRS 0-2) per 100 treated",
    clinicalContext: "EVT has revolutionized LVO stroke treatment. Landmark trials (MR CLEAN, ESCAPE, SWIFT PRIME, EXTEND-IA, REVASCAT) demonstrated that mechanical clot removal dramatically improves outcomes compared to medical therapy alone.",
    evidenceSource: "Meta-analysis of HERMES collaborators (MR CLEAN, ESCAPE, SWIFT PRIME, EXTEND-IA, REVASCAT trials)",
    patientFriendlyExplanation: "When a large blood vessel in the brain is blocked (Large Vessel Occlusion or LVO), doctors can use a procedure called Endovascular Thrombectomy (EVT) to physically remove the clot. A specialist threads a thin catheter through blood vessels to reach the clot and pull it out.",
    whatThisMeans: "Out of every 100 people with a large vessel stroke:\n• With medical management only: About 26 will regain independence\n• With EVT treatment: About 46 will regain independence\n\nThis means 20 more people out of 100 can return to independent living with EVT - a nearly 2x improvement!",
    questionsToAsk: [
      "Do I have a large vessel occlusion (LVO)?",
      "Is EVT available at this hospital or do I need transfer?",
      "What is the expected time to treatment?",
      "What are the procedural risks for my specific case?"
    ]
  },
  {
    id: "ivt-alone-vs-ivt-evt",
    title: "LVO: IVT Alone vs IVT + EVT",
    subtitle: "Bridging Therapy for Large Vessel Occlusion",
    image: tpaVsTpaMtLvo,
    description: "In patients with large vessel occlusion, comparison between IV tPA alone versus combined IV tPA and mechanical thrombectomy (bridging therapy).",
    keyStats: "Significantly more patients achieve functional independence with combined therapy",
    clinicalContext: "For LVO patients eligible for both treatments, bridging therapy (IVT followed by EVT) is superior to IVT alone. Don't delay EVT for IVT effect - proceed to angio suite while tPA infuses.",
    evidenceSource: "Based on MR CLEAN, EXTEND-IA, SWIFT PRIME, ESCAPE, REVASCAT trials",
    patientFriendlyExplanation: "When a large blood vessel in the brain is blocked, doctors may recommend two treatments together:\n1. IV tPA: Clot-busting medication through an IV\n2. Mechanical Thrombectomy: A procedure where a specialist removes the clot using a thin tube (catheter) inserted through a blood vessel",
    whatThisMeans: "For strokes caused by a blockage in a major brain artery:\n• IV tPA alone helps, but the clot may be too large to dissolve completely\n• Adding mechanical thrombectomy (physically removing the clot) significantly increases the chance of recovery\n\nMany more patients can return to independent living with combined treatment.",
    questionsToAsk: [
      "Do I have a large vessel occlusion (LVO)?",
      "Is mechanical thrombectomy available at this hospital?",
      "What are the risks of the procedure?",
      "How long will the procedure take?"
    ]
  },
  {
    id: "late-lvo-medical-vs-evt",
    title: "Late LVO: Medical vs Late EVT",
    subtitle: "Extended Window (6-24 hours) Thrombectomy",
    image: lateThrombectomyLvo,
    description: "For patients with LVO presenting in extended window (6-24 hours), comparison between medical management alone versus late mechanical thrombectomy in selected patients with favorable imaging.",
    keyStats: "32 vs 43 patients living independently per 100 treated",
    clinicalContext: "DAWN and DEFUSE-3 trials established that selected LVO patients with favorable perfusion imaging can benefit from EVT even 6-24 hours after symptom onset. Patient selection based on clinical-imaging mismatch is critical.",
    evidenceSource: "Based on DAWN (6-24h) and DEFUSE-3 (6-16h) trials for late thrombectomy in LVO",
    patientFriendlyExplanation: "Some patients arrive at the hospital after the time window for IV tPA (clot-busting medication) has passed, OR they may not be eligible for IV tPA. For these patients, if they have a large vessel blockage and brain imaging shows there is still brain tissue that can be saved, mechanical thrombectomy may still help even 6-24 hours after symptoms began.",
    whatThisMeans: "Out of every 100 people with a large vessel stroke who arrive late or can't receive IV tPA:\n• Without thrombectomy: About 32 will live independently\n• With late thrombectomy: About 43 will live independently\n\nThis means 11 more people out of 100 can live independently even when treated in this extended time window.",
    questionsToAsk: [
      "Is there still brain tissue that can be saved?",
      "Am I a candidate for late thrombectomy?",
      "What does my brain imaging show?",
      "What are the risks vs benefits for me specifically?"
    ]
  }
];

// Printable Patient Education Handout Component
const PrintableHandout: React.FC<{ 
  scenario: DecisionScenario; 
  onClose: () => void;
  patientName?: string;
  date?: string;
}> = ({ scenario, onClose, patientName, date }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Stroke Treatment Options - Patient Education</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              text-align: center;
              border-bottom: 3px solid #7c3aed;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 { 
              color: #7c3aed;
              font-size: 24px;
              margin-bottom: 5px;
            }
            .header .subtitle { 
              color: #6b7280;
              font-size: 14px;
            }
            .patient-info {
              background: #f3f4f6;
              padding: 10px 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              font-size: 14px;
            }
            .section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .section-title {
              background: #7c3aed;
              color: white;
              padding: 8px 12px;
              border-radius: 6px 6px 0 0;
              font-size: 16px;
              font-weight: 600;
            }
            .section-content {
              border: 1px solid #e5e7eb;
              border-top: none;
              padding: 15px;
              border-radius: 0 0 6px 6px;
              background: #fafafa;
            }
            .image-container {
              text-align: center;
              margin: 15px 0;
              page-break-inside: avoid;
            }
            .image-container img {
              max-width: 100%;
              height: auto;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }
            .stats-box {
              background: #ede9fe;
              border-left: 4px solid #7c3aed;
              padding: 12px 15px;
              margin: 15px 0;
              border-radius: 0 6px 6px 0;
            }
            .stats-box strong {
              color: #7c3aed;
            }
            .what-means {
              white-space: pre-line;
              font-size: 14px;
            }
            .questions-list {
              list-style: none;
              padding: 0;
            }
            .questions-list li {
              padding: 8px 0 8px 30px;
              position: relative;
              border-bottom: 1px dashed #e5e7eb;
            }
            .questions-list li:before {
              content: "?";
              position: absolute;
              left: 0;
              width: 20px;
              height: 20px;
              background: #7c3aed;
              color: white;
              border-radius: 50%;
              text-align: center;
              line-height: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .questions-list li:last-child {
              border-bottom: none;
            }
            .legend {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
              margin-top: 10px;
            }
            .legend-item {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 12px;
            }
            .legend-color {
              width: 16px;
              height: 16px;
              border-radius: 3px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #e5e7eb;
              font-size: 11px;
              color: #6b7280;
              text-align: center;
            }
            .notes-section {
              border: 2px dashed #d1d5db;
              padding: 15px;
              border-radius: 8px;
              min-height: 100px;
              margin-top: 15px;
            }
            .notes-section h4 {
              color: #6b7280;
              margin-bottom: 10px;
            }
            @media print {
              body { padding: 15px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const currentDate = date || new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Preview Header */}
        <div className="sticky top-0 bg-purple-600 text-white p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Patient Education Handout Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handlePrint} 
              variant="secondary" 
              size="sm"
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Handout
            </Button>
            <Button 
              onClick={onClose} 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-purple-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="p-6 bg-white text-gray-900">
          {/* Header */}
          <div className="header">
            <h1>Understanding Your Stroke Treatment Options</h1>
            <div className="subtitle">{scenario.title} - {scenario.subtitle}</div>
          </div>

          {/* Patient Info */}
          <div className="patient-info">
            <strong>Patient:</strong> {patientName || '_________________________'} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Date:</strong> {currentDate}
          </div>

          {/* What is this treatment? */}
          <div className="section">
            <div className="section-title">What is this treatment?</div>
            <div className="section-content">
              <p style={{ whiteSpace: 'pre-line' }}>{scenario.patientFriendlyExplanation}</p>
            </div>
          </div>

          {/* Visual Comparison */}
          <div className="section">
            <div className="section-title">Visual Comparison of Outcomes</div>
            <div className="section-content">
              <div className="image-container">
                <img src={scenario.image} alt={scenario.title} />
              </div>
              <div className="stats-box">
                <strong>Key Finding:</strong> {scenario.keyStats}
              </div>
              {/* Legend */}
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#059669' }}></div>
                  <span>Living independently</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#84cc16' }}></div>
                  <span>Needs some help</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#eab308' }}></div>
                  <span>Needs significant care</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#9ca3af' }}></div>
                  <span>Unchanged</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#dc2626' }}></div>
                  <span>Worse / Died</span>
                </div>
              </div>
            </div>
          </div>

          {/* What does this mean for me? */}
          <div className="section">
            <div className="section-title">What does this mean for me?</div>
            <div className="section-content">
              <p className="what-means">{scenario.whatThisMeans}</p>
            </div>
          </div>

          {/* Questions to ask */}
          <div className="section">
            <div className="section-title">Questions to Ask Your Care Team</div>
            <div className="section-content">
              <ul className="questions-list">
                {scenario.questionsToAsk.map((question, idx) => (
                  <li key={idx}>{question}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notes Section */}
          <div className="section">
            <div className="section-title">Notes from Discussion</div>
            <div className="section-content">
              <div className="notes-section">
                <h4>Write any important information discussed with your care team:</h4>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p><strong>Evidence Source:</strong> {scenario.evidenceSource}</p>
            <p style={{ marginTop: '8px' }}>
              This information is provided to help you understand your treatment options. 
              Every person is different, and your care team will discuss what is best for your specific situation.
              Always ask questions if something is unclear.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TreatmentDecisionAid: React.FC = () => {
  const [activeTab, setActiveTab] = useState("no-tpa-vs-tpa");
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const activeScenario = decisionScenarios.find(s => s.id === activeTab) || decisionScenarios[0];

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
            <Scale className="h-5 w-5" />
            Treatment Choice Consequence Matrix
            <Badge variant="outline" className="ml-2 text-xs border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400">
              Visual Decision Aid
            </Badge>
          </CardTitle>
          <Button 
            onClick={() => setShowPrintPreview(true)}
            variant="outline"
            size="sm"
            className="gap-2 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <Printer className="h-4 w-4" />
            Print Patient Handout
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Evidence-based visual comparisons of stroke treatment outcomes to aid clinical decision-making
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-auto gap-1 bg-purple-100 dark:bg-purple-900/30 p-1">
            <TabsTrigger 
              value="no-tpa-vs-tpa" 
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span className="hidden sm:inline">No tPA vs tPA</span>
              <span className="sm:hidden">1</span>
            </TabsTrigger>
            <TabsTrigger 
              value="early-vs-late-tpa"
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">Early vs Late tPA</span>
              <span className="sm:hidden">2</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lvo-medical-vs-evt"
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <Scale className="h-3 w-3" />
              <span className="hidden sm:inline">LVO: Med vs EVT</span>
              <span className="sm:hidden">3</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ivt-alone-vs-ivt-evt"
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <Scale className="h-3 w-3" />
              <span className="hidden sm:inline">IVT vs IVT+EVT</span>
              <span className="sm:hidden">4</span>
            </TabsTrigger>
            <TabsTrigger 
              value="late-lvo-medical-vs-evt"
              className="text-xs px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-purple-800 flex flex-col items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden sm:inline">Late LVO EVT</span>
              <span className="sm:hidden">5</span>
            </TabsTrigger>
          </TabsList>

          {decisionScenarios.map((scenario) => (
            <TabsContent key={scenario.id} value={scenario.id} className="mt-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="text-center border-b border-purple-200 dark:border-purple-800 pb-3">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    {scenario.subtitle}
                  </p>
                </div>

                {/* Image */}
                <div className="relative rounded-lg overflow-hidden border border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-900">
                  <img 
                    src={scenario.image} 
                    alt={scenario.title}
                    className="w-full h-auto object-contain max-h-[500px]"
                  />
                </div>

                {/* Key Stats */}
                <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-800 dark:text-purple-300">Key Statistics</span>
                  </div>
                  <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                    {scenario.keyStats}
                  </p>
                </div>

                {/* Clinical Context */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 text-sm">Clinical Context</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      {scenario.clinicalContext}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-2 text-sm">Evidence Source</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scenario.evidenceSource}
                    </p>
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-300 mb-3 text-sm">Outcome Legend</h4>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-emerald-600"></div>
                      <span className="text-gray-700 dark:text-gray-300">Living independently</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-lime-500"></div>
                      <span className="text-gray-700 dark:text-gray-300">Needs some help (moderate disability)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500"></div>
                      <span className="text-gray-700 dark:text-gray-300">Needs significant care (severe disability)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-400"></div>
                      <span className="text-gray-700 dark:text-gray-300">Unchanged outcome</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-600"></div>
                      <span className="text-gray-700 dark:text-gray-300">Worse outcome / Died</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer Note */}
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-600 dark:text-purple-400 text-center">
            <strong>Note:</strong> These visual aids are based on clinical trial data and should be used to support shared decision-making with patients and families. 
            Individual patient factors and clinical judgment should guide treatment decisions.
          </p>
        </div>
      </CardContent>

      {/* Printable Handout Modal */}
      {showPrintPreview && (
        <PrintableHandout 
          scenario={activeScenario}
          onClose={() => setShowPrintPreview(false)}
        />
      )}
    </Card>
  );
};

export default TreatmentDecisionAid;
