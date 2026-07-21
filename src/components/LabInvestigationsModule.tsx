import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TestTube, Check, Trash2, ChevronDown } from 'lucide-react';

interface LabValue {
  id: string;
  name: string;
  value: string;
  unit: string;
  reference_range?: string;
  flag?: 'high' | 'low' | 'normal' | 'critical';
}

interface LabCategory {
  name: string;
  labs: { name: string; unit: string; reference?: string }[];
}

const labCategories: LabCategory[] = [
  {
    name: 'Complete Blood Count',
    labs: [
      { name: 'Hemoglobin', unit: 'g/dL', reference: '12.0-17.5' },
      { name: 'Hematocrit', unit: '%', reference: '36-50' },
      { name: 'WBC', unit: 'x10³/µL', reference: '4.5-11.0' },
      { name: 'Platelet Count', unit: 'x10³/µL', reference: '150-400' },
      { name: 'RBC', unit: 'x10⁶/µL', reference: '4.0-5.5' },
    ]
  },
  {
    name: 'Coagulation',
    labs: [
      { name: 'PT', unit: 'seconds', reference: '11-13.5' },
      { name: 'INR', unit: '', reference: '0.8-1.2' },
      { name: 'aPTT', unit: 'seconds', reference: '25-35' },
      { name: 'Fibrinogen', unit: 'mg/dL', reference: '200-400' },
      { name: 'D-dimer', unit: 'ng/mL', reference: '<500' },
    ]
  },
  {
    name: 'Basic Metabolic Panel',
    labs: [
      { name: 'Glucose', unit: 'mg/dL', reference: '70-100' },
      { name: 'Creatinine', unit: 'mg/dL', reference: '0.7-1.3' },
      { name: 'BUN', unit: 'mg/dL', reference: '7-20' },
      { name: 'Sodium', unit: 'mEq/L', reference: '136-145' },
      { name: 'Potassium', unit: 'mEq/L', reference: '3.5-5.0' },
    ]
  },
  {
    name: 'Lipid Panel',
    labs: [
      { name: 'Total Cholesterol', unit: 'mg/dL', reference: '<200' },
      { name: 'LDL', unit: 'mg/dL', reference: '<100' },
      { name: 'HDL', unit: 'mg/dL', reference: '>40' },
      { name: 'Triglycerides', unit: 'mg/dL', reference: '<150' },
      { name: 'ApoB', unit: 'mg/dL', reference: '<90' },
    ]
  },
  {
    name: 'Cardiac Markers',
    labs: [
      { name: 'Troponin I', unit: 'ng/mL', reference: '<0.04' },
      { name: 'BNP', unit: 'pg/mL', reference: '<100' },
      { name: 'NT-proBNP', unit: 'pg/mL', reference: '<125' },
    ]
  },
];

interface LabInvestigationsModuleProps {
  onLabsChange?: (labs: LabValue[]) => void;
}

export default function LabInvestigationsModule({ onLabsChange }: LabInvestigationsModuleProps) {
  const [labs, setLabs] = useState<LabValue[]>([]);
  const [activeCategory, setActiveCategory] = useState(labCategories[0].name);

  const determineFlag = (value: string, reference?: string): LabValue['flag'] => {
    if (!value || !reference) return undefined;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return undefined;
    const rangeMatch = reference.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (rangeMatch) {
      const low = parseFloat(rangeMatch[1]);
      const high = parseFloat(rangeMatch[2]);
      if (numValue < low) return 'low';
      if (numValue > high) return 'high';
      return 'normal';
    }
    if (reference.startsWith('<')) {
      const threshold = parseFloat(reference.slice(1));
      return numValue >= threshold ? 'high' : 'normal';
    }
    if (reference.startsWith('>')) {
      const threshold = parseFloat(reference.slice(1));
      return numValue <= threshold ? 'low' : 'normal';
    }
    return undefined;
  };

  const handleLabChange = useCallback((labName: string, value: string, unit: string, reference?: string) => {
    setLabs(prev => {
      const existingIndex = prev.findIndex(l => l.name === labName);
      const flag = determineFlag(value, reference);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], value, flag };
        onLabsChange?.(updated);
        return updated;
      } else if (value) {
        const newLabs = [...prev, { id: crypto.randomUUID(), name: labName, value, unit, reference_range: reference, flag }];
        onLabsChange?.(newLabs);
        return newLabs;
      }
      return prev;
    });
  }, [onLabsChange]);

  const removeLab = (id: string) => {
    setLabs(prev => {
      const updated = prev.filter(l => l.id !== id);
      onLabsChange?.(updated);
      return updated;
    });
  };

  const getFlagColor = (flag?: string) => {
    switch (flag) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'critical': return 'bg-red-600/30 text-red-300 border-red-600';
      case 'normal': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-purple-400/50 dark:border-purple-600/50">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-gradient-to-r from-purple-100/50 to-indigo-100/50 dark:from-purple-900/30 dark:to-indigo-900/30 cursor-pointer">
            <CardTitle className="flex items-center justify-between text-purple-800 dark:text-purple-300">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Lab Investigations
                {labs.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {labs.length} recorded
                  </Badge>
                )}
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {labCategories.map(cat => (
                <Button
                  key={cat.name}
                  variant={activeCategory === cat.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.name)}
                  className="text-xs"
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Lab Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {labCategories
                .find(c => c.name === activeCategory)
                ?.labs.map(lab => {
                  const existingLab = labs.find(l => l.name === lab.name);
                  return (
                    <div key={lab.name} className="space-y-1">
                      <Label className="text-xs flex items-center justify-between">
                        <span>{lab.name}</span>
                        {lab.reference && (
                          <span className="text-muted-foreground">({lab.reference})</span>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Value"
                          value={existingLab?.value || ''}
                          onChange={(e) => handleLabChange(lab.name, e.target.value, lab.unit, lab.reference)}
                          className={`flex-1 ${existingLab?.flag ? getFlagColor(existingLab.flag) : ''}`}
                        />
                        <span className="text-xs text-muted-foreground self-center min-w-[50px]">
                          {lab.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Recorded Labs Summary */}
            {labs.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Recorded Lab Values
                </h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {labs.map(lab => (
                      <div
                        key={lab.id}
                        className={`flex items-center justify-between p-2 rounded-lg border ${getFlagColor(lab.flag)}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{lab.name}</span>
                          <span className="text-lg font-bold">{lab.value}</span>
                          <span className="text-sm text-muted-foreground">{lab.unit}</span>
                          {lab.flag && lab.flag !== 'normal' && (
                            <Badge variant="outline" className={getFlagColor(lab.flag)}>
                              {lab.flag.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLab(lab.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
