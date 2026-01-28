import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Brain, AlertTriangle, CheckCircle2, Info, FileText, Heart, Activity } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ISPS25Findings {
  // Imaging Evidence
  lvoIdentified: boolean;
  atheroscleroticPlaque: boolean;
  intracranialStenosis: boolean;
  extracranialStenosis: boolean;
  dissection: boolean;
  vasculitis: boolean;
  moyamoya: boolean;
  
  // Cardiac Evidence
  afibDetected: boolean;
  cardiacThrombus: boolean;
  valveDisease: boolean;
  pfoWithDVT: boolean;
  recentMI: boolean;
  lowEF: boolean;
  
  // Small Vessel Disease Features
  lacunarInfarct: boolean;
  deepLocation: boolean;
  wmhPresent: boolean;
  microbleeds: boolean;
  
  // Hematological
  thrombophiliaPositive: boolean;
  cancerAssociated: boolean;
  sickleCell: boolean;
  
  // Other
  drugRelated: boolean;
  iatrogenic: boolean;
  geneticVasculopathy: boolean;
}

type StrokePhenotype = 
  | 'large_artery_atherosclerosis'
  | 'cardioembolism'
  | 'small_vessel_disease'
  | 'other_determined'
  | 'esus'
  | 'multiple_causes'
  | 'undetermined_incomplete';

const ISPS25StrokePhenotyping: React.FC = () => {
  const [findings, setFindings] = useState<ISPS25Findings>({
    lvoIdentified: false,
    atheroscleroticPlaque: false,
    intracranialStenosis: false,
    extracranialStenosis: false,
    dissection: false,
    vasculitis: false,
    moyamoya: false,
    afibDetected: false,
    cardiacThrombus: false,
    valveDisease: false,
    pfoWithDVT: false,
    recentMI: false,
    lowEF: false,
    lacunarInfarct: false,
    deepLocation: false,
    wmhPresent: false,
    microbleeds: false,
    thrombophiliaPositive: false,
    cancerAssociated: false,
    sickleCell: false,
    drugRelated: false,
    iatrogenic: false,
    geneticVasculopathy: false
  });

  const [workupComplete, setWorkupComplete] = useState({
    brainImaging: false,
    vesselImaging: false,
    cardiacEcho: false,
    cardiacRhythm: false,
    basicLabs: false
  });

  // Phenotype determination logic based on ISPS25/TOAST criteria
  const phenotypeAssessment = useMemo(() => {
    const {
      atheroscleroticPlaque, intracranialStenosis, extracranialStenosis,
      afibDetected, cardiacThrombus, valveDisease, pfoWithDVT, recentMI, lowEF,
      lacunarInfarct, deepLocation, wmhPresent,
      dissection, vasculitis, moyamoya, thrombophiliaPositive, cancerAssociated,
      sickleCell, drugRelated, iatrogenic, geneticVasculopathy
    } = findings;

    // Count evidence categories
    const largeArteryEvidence = atheroscleroticPlaque || intracranialStenosis || extracranialStenosis;
    const cardioembolicEvidence = afibDetected || cardiacThrombus || valveDisease || recentMI || lowEF || pfoWithDVT;
    const svdEvidence = lacunarInfarct && deepLocation;
    const otherDeterminedEvidence = dissection || vasculitis || moyamoya || thrombophiliaPositive || 
      cancerAssociated || sickleCell || drugRelated || iatrogenic || geneticVasculopathy;

    const evidenceCount = [largeArteryEvidence, cardioembolicEvidence, svdEvidence, otherDeterminedEvidence].filter(Boolean).length;

    // Check workup completeness
    const workupIsComplete = Object.values(workupComplete).every(Boolean);

    // Determine phenotype
    let phenotype: StrokePhenotype;
    let confidence: 'definite' | 'probable' | 'possible' | 'undetermined';
    let reasoning: string;

    if (evidenceCount > 1) {
      phenotype = 'multiple_causes';
      confidence = 'probable';
      reasoning = "Multiple competing etiologies identified - requires clinical judgment";
    } else if (largeArteryEvidence) {
      phenotype = 'large_artery_atherosclerosis';
      confidence = (intracranialStenosis || extracranialStenosis) && atheroscleroticPlaque ? 'definite' : 'probable';
      reasoning = "Large artery atherosclerosis with stenosis ≥50% or high-risk plaque features";
    } else if (cardioembolicEvidence) {
      phenotype = 'cardioembolism';
      confidence = afibDetected || cardiacThrombus ? 'definite' : 'probable';
      reasoning = "High-risk cardiac source identified";
    } else if (svdEvidence) {
      phenotype = 'small_vessel_disease';
      confidence = lacunarInfarct && deepLocation && !largeArteryEvidence ? 'definite' : 'probable';
      reasoning = "Classic lacunar syndrome with small deep infarct (<15mm)";
    } else if (otherDeterminedEvidence) {
      phenotype = 'other_determined';
      confidence = 'definite';
      reasoning = "Specific alternative etiology identified";
    } else if (!workupIsComplete) {
      phenotype = 'undetermined_incomplete';
      confidence = 'undetermined';
      reasoning = "Workup incomplete - unable to classify";
    } else {
      phenotype = 'esus';
      confidence = 'probable';
      reasoning = "Embolic stroke of undetermined source - no high-risk source identified despite complete workup";
    }

    return { phenotype, confidence, reasoning };
  }, [findings, workupComplete]);

  const getPhenotypeDisplay = (phenotype: StrokePhenotype) => {
    const displays: Record<StrokePhenotype, { label: string; color: string; icon: React.ReactNode }> = {
      large_artery_atherosclerosis: { label: "Large Artery Atherosclerosis", color: "bg-orange-500", icon: <Activity className="h-4 w-4" /> },
      cardioembolism: { label: "Cardioembolism", color: "bg-red-500", icon: <Heart className="h-4 w-4" /> },
      small_vessel_disease: { label: "Small Vessel Disease", color: "bg-blue-500", icon: <Brain className="h-4 w-4" /> },
      other_determined: { label: "Other Determined Etiology", color: "bg-purple-500", icon: <FileText className="h-4 w-4" /> },
      esus: { label: "ESUS", color: "bg-yellow-500", icon: <AlertTriangle className="h-4 w-4" /> },
      multiple_causes: { label: "Multiple Competing Causes", color: "bg-pink-500", icon: <AlertTriangle className="h-4 w-4" /> },
      undetermined_incomplete: { label: "Undetermined (Incomplete Workup)", color: "bg-gray-500", icon: <Info className="h-4 w-4" /> }
    };
    return displays[phenotype];
  };

  const CheckboxField = ({ id, label, checked, category }: { id: keyof ISPS25Findings; label: string; checked: boolean; category?: string }) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => setFindings({ ...findings, [id]: c as boolean })}
      />
      <Label htmlFor={id} className="text-sm font-normal cursor-pointer">{label}</Label>
    </div>
  );

  const phenotypeDisplay = getPhenotypeDisplay(phenotypeAssessment.phenotype);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          ISPS25 Stroke Phenotyping System
          <Badge variant="outline" className="ml-2">2025 Classification</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ischemic Stroke Phenotyping System 2025 - Evidence-based etiological classification
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workup Completion Checklist */}
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Workup Completion Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries({
                brainImaging: "Brain MRI/CT",
                vesselImaging: "CTA/MRA",
                cardiacEcho: "TTE/TEE",
                cardiacRhythm: "ECG/Holter",
                basicLabs: "Labs Complete"
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`workup-${key}`}
                    checked={workupComplete[key as keyof typeof workupComplete]}
                    onCheckedChange={(c) => setWorkupComplete({ ...workupComplete, [key]: c as boolean })}
                  />
                  <Label htmlFor={`workup-${key}`} className="text-xs cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Large Artery Atherosclerosis */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2 bg-orange-50 dark:bg-orange-950/30">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-600" />
                Large Artery Atherosclerosis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              <CheckboxField id="atheroscleroticPlaque" label="Atherosclerotic plaque (any degree)" checked={findings.atheroscleroticPlaque} />
              <CheckboxField id="extracranialStenosis" label="Extracranial stenosis ≥50%" checked={findings.extracranialStenosis} />
              <CheckboxField id="intracranialStenosis" label="Intracranial stenosis ≥50%" checked={findings.intracranialStenosis} />
            </CardContent>
          </Card>

          {/* Cardioembolism */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2 bg-red-50 dark:bg-red-950/30">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                Cardioembolism
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              <CheckboxField id="afibDetected" label="Atrial fibrillation / flutter" checked={findings.afibDetected} />
              <CheckboxField id="cardiacThrombus" label="Intracardiac thrombus" checked={findings.cardiacThrombus} />
              <CheckboxField id="valveDisease" label="Significant valve disease" checked={findings.valveDisease} />
              <CheckboxField id="recentMI" label="Recent MI (<4 weeks)" checked={findings.recentMI} />
              <CheckboxField id="lowEF" label="EF <30%" checked={findings.lowEF} />
              <CheckboxField id="pfoWithDVT" label="PFO with DVT/PE" checked={findings.pfoWithDVT} />
            </CardContent>
          </Card>

          {/* Small Vessel Disease */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950/30">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                Small Vessel Disease
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              <CheckboxField id="lacunarInfarct" label="Lacunar infarct (<15mm)" checked={findings.lacunarInfarct} />
              <CheckboxField id="deepLocation" label="Deep location (BG, thalamus, pons)" checked={findings.deepLocation} />
              <CheckboxField id="wmhPresent" label="WMH (Fazekas ≥2)" checked={findings.wmhPresent} />
              <CheckboxField id="microbleeds" label="Cerebral microbleeds" checked={findings.microbleeds} />
            </CardContent>
          </Card>

          {/* Other Determined Causes */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-2 bg-purple-50 dark:bg-purple-950/30">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                Other Determined Causes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              <CheckboxField id="dissection" label="Arterial dissection" checked={findings.dissection} />
              <CheckboxField id="vasculitis" label="CNS vasculitis" checked={findings.vasculitis} />
              <CheckboxField id="moyamoya" label="Moyamoya disease/syndrome" checked={findings.moyamoya} />
              <CheckboxField id="thrombophiliaPositive" label="Thrombophilia positive" checked={findings.thrombophiliaPositive} />
              <CheckboxField id="cancerAssociated" label="Cancer-associated" checked={findings.cancerAssociated} />
              <CheckboxField id="sickleCell" label="Sickle cell disease" checked={findings.sickleCell} />
              <CheckboxField id="drugRelated" label="Drug-related (cocaine, etc.)" checked={findings.drugRelated} />
              <CheckboxField id="iatrogenic" label="Iatrogenic / procedural" checked={findings.iatrogenic} />
              <CheckboxField id="geneticVasculopathy" label="Genetic vasculopathy (CADASIL, Fabry)" checked={findings.geneticVasculopathy} />
            </CardContent>
          </Card>
        </div>

        {/* Classification Result */}
        <Card className={`border-2 ${phenotypeDisplay.color.replace('bg-', 'border-')}`}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${phenotypeDisplay.color} text-white`}>
                  {phenotypeDisplay.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{phenotypeDisplay.label}</h3>
                  <p className="text-sm text-muted-foreground">{phenotypeAssessment.reasoning}</p>
                </div>
              </div>
              <Badge variant={phenotypeAssessment.confidence === 'definite' ? 'default' : 
                phenotypeAssessment.confidence === 'probable' ? 'secondary' : 'outline'}>
                {phenotypeAssessment.confidence.charAt(0).toUpperCase() + phenotypeAssessment.confidence.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Implications */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
            <Info className="h-4 w-4" />
            Treatment Implications by Phenotype
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phenotype</TableHead>
                  <TableHead>Primary Prevention</TableHead>
                  <TableHead>Antithrombotic</TableHead>
                  <TableHead>Additional</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Large Artery</TableCell>
                  <TableCell>High-intensity statin, BP control</TableCell>
                  <TableCell>Antiplatelet (DAPT if recent)</TableCell>
                  <TableCell>Consider revascularization</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cardioembolism</TableCell>
                  <TableCell>Rhythm control, rate control</TableCell>
                  <TableCell>Anticoagulation (DOAC preferred)</TableCell>
                  <TableCell>LAA closure if AC contraindicated</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Small Vessel</TableCell>
                  <TableCell>Intensive BP control, DM management</TableCell>
                  <TableCell>Single antiplatelet</TableCell>
                  <TableCell>Avoid DAPT long-term</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ESUS</TableCell>
                  <TableCell>Risk factor modification</TableCell>
                  <TableCell>Antiplatelet (not anticoagulation)</TableCell>
                  <TableCell>Extended cardiac monitoring</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Other</TableCell>
                  <TableCell>Etiology-specific</TableCell>
                  <TableCell>Varies by cause</TableCell>
                  <TableCell>Specialist referral</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>

        {/* ESUS Subtyping */}
        {phenotypeAssessment.phenotype === 'esus' && (
          <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                ESUS Further Workup Considerations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Extended cardiac monitoring (≥14 days, consider ILR)</li>
                <li>TEE for PFO evaluation and left atrial appendage</li>
                <li>CT/PET for occult malignancy if risk factors present</li>
                <li>High-resolution vessel wall imaging</li>
                <li>Consider atrial cardiopathy markers (NT-proBNP, LA size)</li>
                <li>Thrombophilia screen if age &lt;50 or recurrent events</li>
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <strong>Reference:</strong> Based on the Ischemic Stroke Phenotyping System 2025 (ISPS25) proposal, 
          which builds upon TOAST/CCS classification with updated evidence-based criteria and emphasis on 
          actionable phenotyping for treatment decisions.
        </div>
      </CardContent>
    </Card>
  );
};

export default ISPS25StrokePhenotyping;
