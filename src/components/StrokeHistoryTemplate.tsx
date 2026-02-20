import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronDown, 
  ClipboardList, 
  Heart, 
  Brain, 
  Pill, 
  Activity,
  Users,
  AlertTriangle,
  Info,
  Copy,
  FileText
} from "lucide-react";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  label: string;
  category: string;
  checked: boolean;
  details: string;
  options?: string[];
  selectedOption?: string;
  info?: string;
}

const initialHistoryItems: HistoryItem[] = [
  // Baseline Status
  { id: "baseline_mrs", label: "Baseline functional status (mRS/ADLs)", category: "baseline", checked: false, details: "", options: ["mRS 0", "mRS 1", "mRS 2", "mRS 3", "mRS 4", "mRS 5"] },
  { id: "occupation", label: "Occupation and work status", category: "baseline", checked: false, details: "" },
  { id: "cognitive_status", label: "Baseline cognitive status", category: "baseline", checked: false, details: "", options: ["Normal", "MCI", "Mild dementia", "Moderate dementia", "Severe dementia"] },
  { id: "goals_care", label: "Goals of care/DNR status", category: "baseline", checked: false, details: "", options: ["Full code", "DNR", "DNR/DNI", "Comfort measures only"] },
  
  // Women's Health
  { id: "gestational_dm", label: "History of Gestational diabetes", category: "womens_health", checked: false, details: "" },
  { id: "gestational_htn", label: "History of Gestational hypertension", category: "womens_health", checked: false, details: "" },
  { id: "early_menopause", label: "History of early menopause", category: "womens_health", checked: false, details: "", info: "Early menopause: <45 years; Premature menopause: <40 years" },
  { id: "ocp_use", label: "Oral contraceptive use", category: "womens_health", checked: false, details: "", info: "Especially high risk when combined with smoking" },
  { id: "hrt", label: "Post-menopausal hormone therapy", category: "womens_health", checked: false, details: "" },
  { id: "menopause_status", label: "Menopause status", category: "womens_health", checked: false, details: "", options: ["Pre-menopausal", "Peri-menopausal", "Post-menopausal", "Surgical menopause"], info: "Menopause: 12 consecutive months without a period" },
  
  // Lifestyle Factors
  { id: "smoking", label: "Smoking history (cigarettes)", category: "lifestyle", checked: false, details: "", options: ["Never", "Former", "Current"] },
  { id: "passive_smoking", label: "History of passive smoking", category: "lifestyle", checked: false, details: "" },
  { id: "chewing_tobacco", label: "Chewing tobacco use", category: "lifestyle", checked: false, details: "", options: ["Never", "Former", "Current"] },
  { id: "alcohol", label: "Alcohol use history", category: "lifestyle", checked: false, details: "", options: ["None", "Light (<1/day)", "Moderate (1-2/day)", "Heavy (>2/day)"] },
  { id: "snoring", label: "History of snoring", category: "lifestyle", checked: false, details: "", info: "Screen for OSA if positive" },
  { id: "illicit_drugs", label: "Illicit drug use history", category: "lifestyle", checked: false, details: "" },
  { id: "high_risk_sexual", label: "High risk sexual behaviour", category: "lifestyle", checked: false, details: "", info: "Consider HIV testing" },
  
  // Family History
  { id: "family_stroke", label: "Family history of stroke", category: "family", checked: false, details: "" },
  
  // Cerebrovascular
  { id: "previous_stroke", label: "Previous stroke or TIA", category: "cerebrovascular", checked: false, details: "" },
  
  // Cardiovascular Risk Factors
  { id: "hypertension", label: "History of hypertension", category: "cv_risk", checked: false, details: "" },
  { id: "diabetes", label: "History of diabetes mellitus", category: "cv_risk", checked: false, details: "", options: ["Type 1", "Type 2"] },
  { id: "hyperlipidemia", label: "History of hypercholesterolaemia", category: "cv_risk", checked: false, details: "" },
  { id: "ihd", label: "Ischaemic heart disease history", category: "cv_risk", checked: false, details: "" },
  { id: "afib", label: "History of atrial fibrillation", category: "cv_risk", checked: false, details: "", options: ["Paroxysmal", "Persistent", "Permanent"] },
  { id: "prosthetic_valves", label: "Prosthetic heart valves", category: "cv_risk", checked: false, details: "", options: ["Mechanical", "Bioprosthetic"] },
  { id: "chf", label: "Poor ventricular function/CHF", category: "cv_risk", checked: false, details: "" },
  { id: "carotid_stenosis", label: "History of carotid stenosis", category: "cv_risk", checked: false, details: "" },
  
  // Hematological
  { id: "sickle_cell", label: "Sickle cell disease (SCD)", category: "hematological", checked: false, details: "" },
  { id: "hypercoagulable", label: "Hypercoagulable disease", category: "hematological", checked: false, details: "", info: "E.g., polycythemia vera, thrombocytosis" },
  { id: "migraine_aura", label: "History of migraine with aura", category: "hematological", checked: false, details: "" },
  { id: "aps", label: "Antiphospholipid antibody syndrome", category: "hematological", checked: false, details: "" },
  
  // Other Medical
  { id: "infection", label: "Recent or chronic infection history", category: "other", checked: false, details: "" },
  { id: "cancer", label: "History of cancer/malignancy", category: "other", checked: false, details: "" },
  { id: "cadasil", label: "CADASIL", category: "other", checked: false, details: "", info: "Genetic screening/family history" },
  { id: "fabry", label: "Fabry disease", category: "other", checked: false, details: "", info: "Genetic screening/family history" },
  { id: "autoimmune", label: "Autoimmune disease history", category: "other", checked: false, details: "" },
];

const categories = [
  { id: "baseline", label: "Baseline Status", icon: ClipboardList, color: "bg-blue-500" },
  { id: "womens_health", label: "Women's Health / Hormonal", icon: Heart, color: "bg-pink-500" },
  { id: "lifestyle", label: "Lifestyle & Behavioral", icon: Activity, color: "bg-orange-500" },
  { id: "family", label: "Family History", icon: Users, color: "bg-purple-500" },
  { id: "cerebrovascular", label: "Cerebrovascular", icon: Brain, color: "bg-red-500" },
  { id: "cv_risk", label: "Cardiovascular Risk Factors", icon: Heart, color: "bg-rose-500" },
  { id: "hematological", label: "Hematological / Coagulation", icon: Pill, color: "bg-amber-500" },
  { id: "other", label: "Other Medical History", icon: AlertTriangle, color: "bg-slate-500" },
];

interface StrokeHistoryTemplateProps {
  onHistoryChange?: (checkedItems: Record<string, boolean>) => void;
}

const StrokeHistoryTemplate: React.FC<StrokeHistoryTemplateProps> = ({ onHistoryChange }) => {
  const [items, setItems] = useState<HistoryItem[]>(initialHistoryItems);
  const [openCategories, setOpenCategories] = useState<string[]>(categories.map(c => c.id));

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const updateItem = (id: string, updates: Partial<HistoryItem>) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      // Notify parent of checked items
      if (onHistoryChange) {
        const checkedMap: Record<string, boolean> = {};
        updated.forEach(item => {
          if (item.checked) checkedMap[item.id] = true;
        });
        onHistoryChange(checkedMap);
      }
      return updated;
    });
  };

  const getCategoryItems = (categoryId: string) => {
    return items.filter(item => item.category === categoryId);
  };

  const getPositiveFindings = () => {
    return items.filter(item => item.checked);
  };

  const generateSummary = () => {
    const positives = getPositiveFindings();
    if (positives.length === 0) {
      return "No significant history documented.";
    }
    
    let summary = "STROKE HISTORY SUMMARY\n";
    summary += "=".repeat(40) + "\n\n";
    
    categories.forEach(cat => {
      const catItems = positives.filter(item => item.category === cat.id);
      if (catItems.length > 0) {
        summary += `${cat.label.toUpperCase()}\n`;
        summary += "-".repeat(30) + "\n";
        catItems.forEach(item => {
          summary += `• ${item.label}`;
          if (item.selectedOption) summary += `: ${item.selectedOption}`;
          if (item.details) summary += ` - ${item.details}`;
          summary += "\n";
        });
        summary += "\n";
      }
    });
    
    return summary;
  };

  const copySummary = () => {
    const summary = generateSummary();
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard");
  };

  const positiveCount = getPositiveFindings().length;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Stroke History Template</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {positiveCount > 0 && (
              <Badge variant="secondary">{positiveCount} documented</Badge>
            )}
            <Button variant="outline" size="sm" onClick={copySummary}>
              <Copy className="h-4 w-4 mr-1" />
              Copy Summary
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {categories.map(category => {
          const categoryItems = getCategoryItems(category.id);
          const checkedCount = categoryItems.filter(i => i.checked).length;
          const Icon = category.icon;
          
          return (
            <Collapsible 
              key={category.id} 
              open={openCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${category.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-sm">{category.label}</span>
                    {checkedCount > 0 && (
                      <Badge variant="outline" className="text-xs">{checkedCount}</Badge>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openCategories.includes(category.id) ? "rotate-180" : ""}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 pl-2">
                  {categoryItems.map(item => (
                    <div key={item.id} className="border rounded-lg p-3 bg-card">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(checked) => updateItem(item.id, { checked: !!checked })}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                              {item.label}
                            </Label>
                            {item.info && (
                              <div className="group relative">
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                <div className="absolute bottom-full left-0 mb-1 hidden group-hover:block z-50 w-48 p-2 text-xs bg-popover border rounded shadow-lg">
                                  {item.info}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {item.checked && (
                            <div className="space-y-2">
                              {item.options && (
                                <Select
                                  value={item.selectedOption}
                                  onValueChange={(value) => updateItem(item.id, { selectedOption: value })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {item.options.map(opt => (
                                      <SelectItem key={opt} value={opt} className="text-xs">
                                        {opt}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              <Input
                                placeholder="Additional details..."
                                value={item.details}
                                onChange={(e) => updateItem(item.id, { details: e.target.value })}
                                className="h-8 text-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {positiveCount > 0 && (
          <Card className="bg-muted/30 border-dashed">
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Summary Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <pre className="text-xs whitespace-pre-wrap font-mono bg-background p-3 rounded border max-h-48 overflow-auto">
                {generateSummary()}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default StrokeHistoryTemplate;
