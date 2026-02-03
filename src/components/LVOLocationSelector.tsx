import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Check, X, RotateCcw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import vascularAnatomyImage from "@/assets/vascular-anatomy-lvo-selector.png";

export interface LVOLocation {
  vessel: string;
  segment: string;
  side: "left" | "right" | "midline";
  circulation: "anterior" | "posterior";
}

interface LVOLocationSelectorProps {
  value: LVOLocation | null;
  onChange: (location: LVOLocation | null) => void;
  onSave?: (location: LVOLocation) => void;
}

// Vessel segment data with clinical details
const ANTERIOR_SEGMENTS = [
  { id: "ICA-T", name: "ICA Terminus", vessel: "ICA", segment: "Terminus", description: "Internal Carotid Artery terminus/bifurcation" },
  { id: "ICA-C", name: "Cervical ICA", vessel: "ICA", segment: "Cervical", description: "Cervical segment of Internal Carotid Artery" },
  { id: "M1", name: "M1 (MCA)", vessel: "MCA", segment: "M1", description: "Horizontal segment of Middle Cerebral Artery" },
  { id: "M2", name: "M2 (MCA)", vessel: "MCA", segment: "M2", description: "Insular/Sylvian segment of MCA" },
  { id: "M3", name: "M3 (MCA)", vessel: "MCA", segment: "M3", description: "Opercular segment of MCA" },
  { id: "M4", name: "M4 (MCA)", vessel: "MCA", segment: "M4", description: "Cortical segment of MCA" },
  { id: "A1", name: "A1 (ACA)", vessel: "ACA", segment: "A1", description: "Horizontal segment of Anterior Cerebral Artery" },
  { id: "A2", name: "A2 (ACA)", vessel: "ACA", segment: "A2", description: "Vertical segment of ACA" },
  { id: "A3", name: "A3 (ACA)", vessel: "ACA", segment: "A3", description: "Distal ACA beyond corpus callosum" },
];

const POSTERIOR_SEGMENTS = [
  { id: "BA", name: "Basilar Artery", vessel: "BA", segment: "Main", description: "Main basilar artery trunk" },
  { id: "P1", name: "P1 (PCA)", vessel: "PCA", segment: "P1", description: "Pre-communicating segment of Posterior Cerebral Artery" },
  { id: "P2", name: "P2 (PCA)", vessel: "PCA", segment: "P2", description: "Ambient segment of PCA" },
  { id: "P3", name: "P3 (PCA)", vessel: "PCA", segment: "P3", description: "Quadrigeminal segment of PCA" },
  { id: "P4", name: "P4 (PCA)", vessel: "PCA", segment: "P4", description: "Calcarine segment of PCA" },
  { id: "P5", name: "P5 (PCA)", vessel: "PCA", segment: "P5", description: "Cortical branches of PCA" },
  { id: "VA", name: "Vertebral Artery", vessel: "VA", segment: "V4", description: "Intracranial vertebral artery (V4)" },
];

export default function LVOLocationSelector({ value, onChange, onSave }: LVOLocationSelectorProps) {
  const [circulation, setCirculation] = useState<"anterior" | "posterior">("anterior");
  const [selectedSegment, setSelectedSegment] = useState<string | null>(value?.segment || null);
  const [side, setSide] = useState<"left" | "right" | "midline">(value?.side || "left");
  const [isSaved, setIsSaved] = useState(false);

  const segments = circulation === "anterior" ? ANTERIOR_SEGMENTS : POSTERIOR_SEGMENTS;

  const handleSegmentSelect = (segmentId: string) => {
    setSelectedSegment(segmentId);
    setIsSaved(false);
    
    const segment = [...ANTERIOR_SEGMENTS, ...POSTERIOR_SEGMENTS].find(s => s.id === segmentId);
    if (segment) {
      const effectiveSide = segmentId === "BA" ? "midline" : side;
      onChange({
        vessel: segment.vessel,
        segment: segment.segment,
        side: effectiveSide,
        circulation
      });
    }
  };

  const handleSideChange = (newSide: "left" | "right" | "midline") => {
    setSide(newSide);
    setIsSaved(false);
    
    if (selectedSegment) {
      const segment = [...ANTERIOR_SEGMENTS, ...POSTERIOR_SEGMENTS].find(s => s.id === selectedSegment);
      if (segment) {
        onChange({
          vessel: segment.vessel,
          segment: segment.segment,
          side: newSide,
          circulation
        });
      }
    }
  };

  const handleSave = () => {
    if (value && onSave) {
      onSave(value);
      setIsSaved(true);
    }
  };

  const handleReset = () => {
    setSelectedSegment(null);
    setSide("left");
    setIsSaved(false);
    onChange(null);
  };

  const getSegmentColor = (segmentId: string) => {
    if (selectedSegment === segmentId) {
      return "bg-purple-600 text-white border-purple-700 shadow-md";
    }
    return "bg-background hover:bg-purple-100 dark:hover:bg-purple-900/30 border-border";
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          LVO Location (Imaging)
          {value && isSaved && (
            <Badge className="bg-green-600 text-white text-xs ml-auto">
              <Check className="h-3 w-3 mr-1" /> Saved
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vascular Anatomy Reference Image */}
        <div className="relative border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
          <img 
            src={vascularAnatomyImage} 
            alt="Vascular anatomy reference for LVO location" 
            className="w-full h-auto max-h-48 object-contain"
          />
          <div className="absolute bottom-2 right-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1 bg-black/60 text-white rounded text-xs flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Reference
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    <strong>Left:</strong> Anterior circulation (ICA, MCA M1-M4, ACA A1-A3)<br/>
                    <strong>Right:</strong> Posterior circulation (PCA P1-P5, Basilar, Vertebral)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Circulation Toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={circulation === "anterior" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => {
              setCirculation("anterior");
              setSelectedSegment(null);
              onChange(null);
            }}
          >
            Anterior Circulation
          </Button>
          <Button
            type="button"
            variant={circulation === "posterior" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => {
              setCirculation("posterior");
              setSelectedSegment(null);
              onChange(null);
            }}
          >
            Posterior Circulation
          </Button>
        </div>

        {/* Vessel Segment Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Occlusion Site</Label>
          <div className="grid grid-cols-3 gap-2">
            {segments.map((segment) => (
              <TooltipProvider key={segment.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`${getSegmentColor(segment.id)} transition-all text-xs font-medium`}
                      onClick={() => handleSegmentSelect(segment.id)}
                    >
                      {segment.id}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{segment.name}</p>
                    <p className="text-xs text-muted-foreground">{segment.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Laterality Selection */}
        {selectedSegment && selectedSegment !== "BA" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Laterality</Label>
            <RadioGroup
              value={side}
              onValueChange={(v) => handleSideChange(v as "left" | "right" | "midline")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="side-left" />
                <Label htmlFor="side-left" className="text-sm">Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="side-right" />
                <Label htmlFor="side-right" className="text-sm">Right</Label>
              </div>
              {circulation === "anterior" && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="midline" id="side-midline" />
                  <Label htmlFor="side-midline" className="text-sm">Midline</Label>
                </div>
              )}
            </RadioGroup>
          </div>
        )}

        {/* Selected Location Display */}
        {value && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Selected Location
                </p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {value.side !== "midline" && `${value.side.charAt(0).toUpperCase() + value.side.slice(1)} `}
                  {value.vessel} {value.segment}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {value.circulation === "anterior" ? "Anterior" : "Posterior"} circulation
                </p>
              </div>
              <div className="flex gap-2">
                {onSave && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSaved}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Note */}
        <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded-lg">
          <strong>TAL Coding:</strong> ICA-T, M1, M2 (proximal) are typical EVT targets. 
          Distal M2, M3, A2+ occlusions may require specialized techniques.
        </div>
      </CardContent>
    </Card>
  );
}
