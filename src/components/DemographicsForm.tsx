import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, User, Clock } from "lucide-react";
import { useState } from "react";

interface Demographics {
  patientId: string;
  name?: string;
  age?: string;
  sex?: string;
  race?: string;
  lastKnownWell?: string; // ISO datetime string
}

interface Props {
  demographics: Demographics;
  onDemographicsChange: (demographics: Demographics) => void;
}

const raceOptions = [
  { value: "african", label: "African / Black", description: "Sub-Saharan African, African American, Afro-Caribbean" },
  { value: "south-asian", label: "South Asian", description: "Indian, Pakistani, Bangladeshi, Sri Lankan, Nepali" },
  { value: "east-asian", label: "East Asian", description: "Chinese, Japanese, Korean, Vietnamese, Thai" },
  { value: "southeast-asian", label: "Southeast Asian", description: "Filipino, Indonesian, Malaysian, Cambodian" },
  { value: "hispanic", label: "Hispanic / Latino", description: "Mexican, Central/South American, Caribbean Hispanic" },
  { value: "middle-eastern", label: "Middle Eastern / North African", description: "Arab, Persian, Turkish, North African" },
  { value: "caucasian", label: "Caucasian / White", description: "European, North American, Australian European" },
  { value: "pacific-islander", label: "Pacific Islander", description: "Hawaiian, Samoan, Tongan, Fijian" },
  { value: "mixed", label: "Mixed / Multiple Ethnicities", description: "Multiple racial/ethnic backgrounds" },
  { value: "other", label: "Other", description: "Not listed above" },
];

export default function DemographicsForm({ demographics, onDemographicsChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const updateDemographic = (key: keyof Demographics, value: string) => {
    onDemographicsChange({ ...demographics, [key]: value });
  };

  const selectedRace = raceOptions.find(r => r.value === demographics.race);

  // Calculate time since LKW for stroke timer
  const getStrokeTimerDisplay = () => {
    if (!demographics.lastKnownWell) return null;
    const lkw = new Date(demographics.lastKnownWell);
    const now = new Date();
    const diffMs = now.getTime() - lkw.getTime();
    if (diffMs < 0) return null;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, totalMinutes: Math.floor(diffMs / (1000 * 60)) };
  };

  const strokeTimer = getStrokeTimerDisplay();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-teal-400 dark:border-teal-600 bg-gradient-to-br from-teal-50 dark:from-teal-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-teal-100/50 dark:bg-teal-900/30">
            <CardTitle className="flex items-center justify-between text-teal-800 dark:text-teal-300">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Demographics
                {demographics.patientId && (
                  <span className="text-xs font-normal bg-teal-200 dark:bg-teal-800 px-2 py-0.5 rounded">
                    ID: {demographics.patientId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {strokeTimer && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono ${
                    strokeTimer.totalMinutes <= 270 ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                    strokeTimer.totalMinutes <= 360 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                    'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    {strokeTimer.hours}h {strokeTimer.minutes}m since LKW
                  </div>
                )}
                <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Patient ID and Name - Top Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Patient ID (Required) */}
              <div className="space-y-2">
                <Label htmlFor="patientId" className="text-teal-800 dark:text-teal-300">
                  Patient ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patientId"
                  type="text"
                  placeholder="Enter patient ID"
                  value={demographics.patientId || ""}
                  onChange={(e) => updateDemographic("patientId", e.target.value)}
                  className="border-teal-300 dark:border-teal-700"
                  required
                />
              </div>

              {/* Patient Name (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-teal-800 dark:text-teal-300">
                  Name <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Patient name"
                  value={demographics.name || ""}
                  onChange={(e) => updateDemographic("name", e.target.value)}
                  className="border-teal-300 dark:border-teal-700"
                />
              </div>

              {/* Last Known Well (LKW) */}
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="lastKnownWell" className="text-teal-800 dark:text-teal-300">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last Known Well (LKW)
                  </div>
                </Label>
                <Input
                  id="lastKnownWell"
                  type="datetime-local"
                  value={demographics.lastKnownWell || ""}
                  onChange={(e) => updateDemographic("lastKnownWell", e.target.value)}
                  className="border-teal-300 dark:border-teal-700"
                />
                {strokeTimer && (
                  <div className={`text-xs font-medium ${
                    strokeTimer.totalMinutes <= 270 ? 'text-green-600 dark:text-green-400' :
                    strokeTimer.totalMinutes <= 360 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    ⏱ Time elapsed: {strokeTimer.hours}h {strokeTimer.minutes}m
                    {strokeTimer.totalMinutes <= 270 && " — Within tPA window (4.5h)"}
                    {strokeTimer.totalMinutes > 270 && strokeTimer.totalMinutes <= 360 && " — Approaching late window"}
                    {strokeTimer.totalMinutes > 360 && strokeTimer.totalMinutes <= 1440 && " — Late window (EVT eligible if LVO)"}
                    {strokeTimer.totalMinutes > 1440 && " — Extended window evaluation needed"}
                  </div>
                )}
              </div>
            </div>

            {/* Age, Sex, Race - Second Row */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-teal-800 dark:text-teal-300">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g., 65"
                  value={demographics.age || ""}
                  onChange={(e) => updateDemographic("age", e.target.value)}
                  className="border-teal-300 dark:border-teal-700"
                />
              </div>

              {/* Sex */}
              <div className="space-y-2">
                <Label className="text-teal-800 dark:text-teal-300">Sex</Label>
                <Select value={demographics.sex} onValueChange={(v) => updateDemographic("sex", v)}>
                  <SelectTrigger className="border-teal-300 dark:border-teal-700">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other / Not specified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Race/Ethnicity */}
              <div className="space-y-2">
                <Label className="text-teal-800 dark:text-teal-300">Race / Ethnicity</Label>
                <Select value={demographics.race} onValueChange={(v) => updateDemographic("race", v)}>
                  <SelectTrigger className="border-teal-300 dark:border-teal-700">
                    <SelectValue placeholder="Select race/ethnicity" />
                  </SelectTrigger>
                  <SelectContent>
                    {raceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Race-Specific Information Panel */}
            {demographics.race && (
              <div className="p-4 bg-teal-100 dark:bg-teal-900/40 rounded-lg border border-teal-300 dark:border-teal-700">
                <h4 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">
                  Race-Specific Stroke Considerations: {selectedRace?.label}
                </h4>
                <div className="text-sm text-teal-700 dark:text-teal-400 space-y-1">
                  {demographics.race === "african" && (
                    <>
                      <p>• Higher prevalence of intracranial atherosclerosis and hypertensive small vessel disease</p>
                      <p>• Consider sickle cell screening (Hb electrophoresis, sickling test)</p>
                      <p>• Higher rates of hypertension-mediated organ damage</p>
                      <p>• Moyamoya-like vasculopathy more common</p>
                    </>
                  )}
                  {demographics.race === "south-asian" && (
                    <>
                      <p>• Higher prevalence of metabolic syndrome and insulin resistance</p>
                      <p>• 30-50% carry CYP2C19 loss-of-function alleles (clopidogrel resistance)</p>
                      <p>• Recommend CYP2C19 genotyping or PRU testing</p>
                      <p>• Higher Lipoprotein(a) levels - check Lp(a)</p>
                      <p>• Earlier onset of atherosclerotic disease</p>
                    </>
                  )}
                  {demographics.race === "east-asian" && (
                    <>
                      <p>• Higher prevalence of intracranial vs. extracranial atherosclerosis</p>
                      <p>• Moyamoya disease more prevalent</p>
                      <p>• Consider vessel wall imaging for intracranial stenosis</p>
                    </>
                  )}
                  {demographics.race === "hispanic" && (
                    <>
                      <p>• Higher diabetes prevalence and earlier stroke onset</p>
                      <p>• Higher rates of small vessel disease</p>
                      <p>• Consider thorough metabolic syndrome screening</p>
                    </>
                  )}
                  {demographics.race === "middle-eastern" && (
                    <>
                      <p>• Higher consanguinity rates - consider genetic etiologies</p>
                      <p>• Behçet's disease more prevalent</p>
                      <p>• Consider genetic testing for hereditary stroke syndromes</p>
                    </>
                  )}
                  {demographics.race === "caucasian" && (
                    <>
                      <p>• Higher prevalence of extracranial carotid disease</p>
                      <p>• AF-related stroke more common in older patients</p>
                      <p>• Consider PFO workup in younger patients with ESUS</p>
                    </>
                  )}
                  {(demographics.race === "southeast-asian" || demographics.race === "pacific-islander") && (
                    <>
                      <p>• Consider intracranial atherosclerosis evaluation</p>
                      <p>• Higher diabetes and metabolic syndrome prevalence</p>
                      <p>• Assess for genetic stroke syndromes</p>
                    </>
                  )}
                  {(demographics.race === "mixed" || demographics.race === "other") && (
                    <>
                      <p>• Consider comprehensive workup based on family history</p>
                      <p>• Assess for multiple race-specific risk factors</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Note */}
            <div className="p-3 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-700 rounded-lg">
              <p className="text-xs text-teal-600 dark:text-teal-400">
                <strong>Note:</strong> Race/ethnicity information is optional and used only to provide population-specific stroke etiology guidance. 
                This data is not stored and is only used for the current session's AI analysis.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
