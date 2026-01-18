import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Network, 
  ChevronDown, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Info,
  ArrowRight,
  Zap
} from "lucide-react";

interface GradingSystem {
  id: string;
  name: string;
  description: string;
  grades: Grade[];
}

interface Grade {
  value: string;
  label: string;
  description: string;
  prognosis: "good" | "intermediate" | "poor";
}

const gradingSystems: GradingSystem[] = [
  {
    id: "tan",
    name: "Tan Score (Modified)",
    description: "Single-phase CTA assessment of collateral filling in the MCA territory",
    grades: [
      {
        value: "0",
        label: "Grade 0 - Absent",
        description: "No collateral supply to the ischemic territory",
        prognosis: "poor"
      },
      {
        value: "1",
        label: "Grade 1 - Poor (<50%)",
        description: "Collateral supply filling ≤50% of ischemic territory",
        prognosis: "poor"
      },
      {
        value: "2",
        label: "Grade 2 - Moderate (>50%)",
        description: "Collateral supply filling >50% but <100% of ischemic territory",
        prognosis: "intermediate"
      },
      {
        value: "3",
        label: "Grade 3 - Good (100%)",
        description: "100% collateral supply to ischemic territory",
        prognosis: "good"
      }
    ]
  },
  {
    id: "maas",
    name: "Maas Score",
    description: "Assessment comparing collateral vessels in ischemic vs. contralateral hemisphere",
    grades: [
      {
        value: "0",
        label: "Grade 0 - Absent",
        description: "Absent collateral vessels in the ischemic hemisphere",
        prognosis: "poor"
      },
      {
        value: "1",
        label: "Grade 1 - Worse",
        description: "Diminished collateral vessels in the ischemic hemisphere compared to contralateral",
        prognosis: "poor"
      },
      {
        value: "2",
        label: "Grade 2 - Equal",
        description: "Equal collateral supply in ischemic and contralateral hemispheres",
        prognosis: "intermediate"
      },
      {
        value: "3",
        label: "Grade 3 - Increased",
        description: "Increased collateral vessels in the ischemic hemisphere",
        prognosis: "good"
      }
    ]
  },
  {
    id: "asitn",
    name: "ASITN/SIR Score",
    description: "DSA-based grading from American Society of Interventional and Therapeutic Neuroradiology",
    grades: [
      {
        value: "0",
        label: "Grade 0",
        description: "No collaterals visible to the ischemic site",
        prognosis: "poor"
      },
      {
        value: "1",
        label: "Grade 1",
        description: "Slow collaterals to periphery of ischemic site with persistence of some defect",
        prognosis: "poor"
      },
      {
        value: "2",
        label: "Grade 2",
        description: "Rapid collaterals to periphery of ischemic site with persistence of some defect",
        prognosis: "intermediate"
      },
      {
        value: "3",
        label: "Grade 3",
        description: "Collaterals with slow but complete filling of ischemic territory by late venous phase",
        prognosis: "intermediate"
      },
      {
        value: "4",
        label: "Grade 4",
        description: "Complete and rapid collateral filling in the entire ischemic territory",
        prognosis: "good"
      }
    ]
  },
  {
    id: "multiphase",
    name: "Multiphase CTA Score",
    description: "Calgary protocol using 3-phase CTA (peak arterial, equilibrium, late venous)",
    grades: [
      {
        value: "0",
        label: "Score 0",
        description: "No vessels visible in any phase within the affected MCA territory",
        prognosis: "poor"
      },
      {
        value: "1",
        label: "Score 1",
        description: "Only a few vessels visible in any phase within affected MCA territory",
        prognosis: "poor"
      },
      {
        value: "2",
        label: "Score 2",
        description: "Some vessels visible in some phases within affected MCA territory (≤50%)",
        prognosis: "poor"
      },
      {
        value: "3",
        label: "Score 3",
        description: "Delayed filling of peripheral vessels in affected MCA territory in all phases",
        prognosis: "intermediate"
      },
      {
        value: "4",
        label: "Score 4",
        description: "Similar number of vessels in affected vs. contralateral with 1-phase delay",
        prognosis: "intermediate"
      },
      {
        value: "5",
        label: "Score 5",
        description: "Normal/increased prominent vessels in affected MCA territory in all phases",
        prognosis: "good"
      }
    ]
  }
];

const CTACollateralGrading: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<string>("tan");
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const currentSystem = gradingSystems.find(s => s.id === selectedSystem);
  const currentGrade = currentSystem?.grades.find(g => g.value === selectedGrade);

  const handleReset = () => {
    setSelectedGrade(null);
  };

  const getPrognosisColor = (prognosis: "good" | "intermediate" | "poor") => {
    switch (prognosis) {
      case "good":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "poor":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }
  };

  const getPrognosisIcon = (prognosis: "good" | "intermediate" | "poor") => {
    switch (prognosis) {
      case "good":
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case "intermediate":
        return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case "poor":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    }
  };

  const getInterpretation = () => {
    if (!currentGrade) return null;

    const interpretations = {
      good: {
        title: "Favorable Collateral Status",
        description: "Good collaterals indicate preserved penumbral tissue. Patient may benefit from mechanical thrombectomy even in extended time windows.",
        recommendation: "Proceed with thrombectomy evaluation. Good collaterals associated with better recanalization outcomes and reduced hemorrhagic transformation.",
        mtBenefit: "High",
        headsUpRelevance: "Less likely to show worsening on Heads Up test due to robust collateral support."
      },
      intermediate: {
        title: "Moderate Collateral Status",
        description: "Intermediate collaterals suggest partially preserved penumbra. Outcomes are variable.",
        recommendation: "Consider multiphase CTA or perfusion imaging for better characterization. Thrombectomy may still be beneficial.",
        mtBenefit: "Moderate",
        headsUpRelevance: "May show positional changes on Heads Up test. Close monitoring recommended."
      },
      poor: {
        title: "Poor Collateral Status",
        description: "Poor collaterals indicate limited penumbral tissue and higher risk of futile recanalization.",
        recommendation: "Weigh risks vs. benefits carefully. Consider perfusion imaging to assess core/penumbra mismatch. Higher risk of hemorrhagic transformation.",
        mtBenefit: "Lower (but may still benefit)",
        headsUpRelevance: "More likely to deteriorate on Heads Up test due to collateral failure."
      }
    };

    return interpretations[currentGrade.prognosis];
  };

  const interpretation = getInterpretation();

  return (
    <Card className="border-2 border-cyan-200 dark:border-cyan-800 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/20 dark:to-teal-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-cyan-100/50 dark:hover:bg-cyan-900/20 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
                  <Network className="h-6 w-6 text-cyan-700 dark:text-cyan-300" />
                </div>
                <div>
                  <span className="text-lg">CTA Collateral Grading</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    Assessment of leptomeningeal collateral circulation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentGrade && (
                  <Badge className={getPrognosisColor(currentGrade.prognosis)}>
                    {currentGrade.prognosis.charAt(0).toUpperCase() + currentGrade.prognosis.slice(1)} Collaterals
                  </Badge>
                )}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Grading System Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Grading System</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {gradingSystems.map((system) => (
                  <Button
                    key={system.id}
                    variant={selectedSystem === system.id ? "default" : "outline"}
                    className={`h-auto py-3 px-4 flex flex-col items-start text-left ${
                      selectedSystem === system.id 
                        ? "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600" 
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedSystem(system.id);
                      setSelectedGrade(null);
                    }}
                  >
                    <span className="font-semibold text-sm">{system.name}</span>
                    <span className="text-xs opacity-80 line-clamp-2">{system.description}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Grade Selection */}
            {currentSystem && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    {currentSystem.name} Assessment
                  </Label>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
                
                <RadioGroup
                  value={selectedGrade || ""}
                  onValueChange={setSelectedGrade}
                  className="space-y-2"
                >
                  {currentSystem.grades.map((grade) => (
                    <div
                      key={grade.value}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedGrade === grade.value
                          ? `border-cyan-500 ${getPrognosisColor(grade.prognosis)}`
                          : "border-border hover:border-cyan-300 dark:hover:border-cyan-700 bg-card"
                      }`}
                      onClick={() => setSelectedGrade(grade.value)}
                    >
                      <RadioGroupItem value={grade.value} id={`${currentSystem.id}-${grade.value}`} className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor={`${currentSystem.id}-${grade.value}`}
                          className="font-semibold cursor-pointer flex items-center gap-2"
                        >
                          {grade.label}
                          {getPrognosisIcon(grade.prognosis)}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">{grade.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Interpretation Panel */}
            {interpretation && currentGrade && (
              <Alert className={`border-2 ${
                currentGrade.prognosis === "good" 
                  ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30" 
                  : currentGrade.prognosis === "intermediate"
                  ? "border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/30"
                  : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30"
              }`}>
                {getPrognosisIcon(currentGrade.prognosis)}
                <AlertTitle className="text-lg font-bold">{interpretation.title}</AlertTitle>
                <AlertDescription className="mt-3 space-y-4">
                  <p>{interpretation.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-background/50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        <span className="font-semibold text-sm">Thrombectomy Benefit</span>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {interpretation.mtBenefit}
                      </Badge>
                    </div>
                    
                    <div className="p-3 bg-background/50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold text-sm">Heads Up Test Relevance</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{interpretation.headsUpRelevance}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-background/80 rounded-lg border mt-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-sm">Clinical Recommendation</span>
                        <p className="text-sm text-muted-foreground mt-1">{interpretation.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Clinical Pearls */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Clinical Pearls
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Collateral status is the strongest predictor of outcome independent of recanalization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Poor collaterals ≠ automatic exclusion from thrombectomy (DAWN/DEFUSE-3 criteria still apply)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Multiphase CTA provides better temporal resolution than single-phase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Consider CT perfusion (CTP) when collateral status is borderline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-600 dark:text-cyan-400">•</span>
                  <span>Integrate with Heads Up test for comprehensive decision-making in mild LVO strokes</span>
                </li>
              </ul>
            </div>

            {/* Reference */}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <span className="font-medium">References: </span>
              Tan et al. 2009 (Tan Score) | Maas et al. 2009 | ASITN/SIR Collateral Grading | 
              Menon et al. 2015 (Multiphase CTA - Calgary Protocol)
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CTACollateralGrading;
