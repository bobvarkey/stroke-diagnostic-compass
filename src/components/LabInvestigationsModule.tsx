import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  TestTube, Camera, Upload, Loader2, Check, AlertTriangle,
  Plus, Trash2, FileText, Sparkles, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeCategory, setActiveCategory] = useState(labCategories[0].name);
  const { toast } = useToast();

  const handleLabChange = useCallback((labName: string, value: string, unit: string, reference?: string) => {
    setLabs(prev => {
      const existingIndex = prev.findIndex(l => l.name === labName);
      const flag = determineFlag(labName, value, reference);
      
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

  const determineFlag = (name: string, value: string, reference?: string): 'high' | 'low' | 'normal' | 'critical' | undefined => {
    if (!value || !reference) return undefined;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return undefined;
    
    // Parse reference range
    const rangeMatch = reference.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (rangeMatch) {
      const low = parseFloat(rangeMatch[1]);
      const high = parseFloat(rangeMatch[2]);
      if (numValue < low) return 'low';
      if (numValue > high) return 'high';
      return 'normal';
    }
    
    // Handle < or > references
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

  const MAX_LAB_IMAGE_SIZE_MB = 10;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPEG, PNG, or WebP image', variant: 'destructive' });
      return;
    }

    if (file.size > MAX_LAB_IMAGE_SIZE_MB * 1024 * 1024) {
      toast({ title: 'File too large', description: `Image must be under ${MAX_LAB_IMAGE_SIZE_MB}MB`, variant: 'destructive' });
      return;
    }

    setIsExtracting(true);
    toast({ title: 'Processing...', description: 'Extracting lab values from image' });

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        try {
          const { data, error } = await supabase.functions.invoke('extract-lab-values', {
            body: { imageBase64: base64 }
          });

          if (error) throw error;

          if (data.labs && data.labs.length > 0) {
            // Merge extracted labs with existing
            const newLabs: LabValue[] = data.labs.map((lab: any) => ({
              id: crypto.randomUUID(),
              name: lab.name,
              value: lab.value,
              unit: lab.unit,
              reference_range: lab.reference_range,
              flag: lab.flag,
            }));

            setLabs(prev => {
              // Update existing or add new
              const updated = [...prev];
              newLabs.forEach(newLab => {
                const existingIndex = updated.findIndex(l => 
                  l.name.toLowerCase() === newLab.name.toLowerCase()
                );
                if (existingIndex >= 0) {
                  updated[existingIndex] = newLab;
                } else {
                  updated.push(newLab);
                }
              });
              onLabsChange?.(updated);
              return updated;
            });

            toast({ 
              title: 'Success!', 
              description: `Extracted ${newLabs.length} lab values from image` 
            });
          } else {
            toast({ 
              title: 'No labs found', 
              description: data.error || 'Could not extract lab values from this image',
              variant: 'destructive'
            });
          }
        } catch (err: any) {
          console.error('OCR error:', err);
          toast({ 
            title: 'Extraction failed', 
            description: err.message || 'Failed to extract lab values',
            variant: 'destructive'
          });
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsExtracting(false);
      toast({ title: 'Error', description: 'Failed to process image', variant: 'destructive' });
    }
  };

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

  const [isOpen, setIsOpen] = useState(true);

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
          <CardContent className="pt-6">
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Upload / OCR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="lab-image-upload"
                disabled={isExtracting}
              />
              <label
                htmlFor="lab-image-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                {isExtracting ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">
                        Extracting lab values...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Using AI to read your lab report
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <Upload className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-700 dark:text-purple-300">
                        Upload Lab Report Image
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Take a photo or upload an image of lab results
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      AI-powered OCR extraction
                    </div>
                  </>
                )}
              </label>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Supports JPEG, PNG. The AI will extract lab values and auto-populate the fields.
            </p>
          </TabsContent>
        </Tabs>

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
