import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Upload, FileText, Loader2, ChevronDown, AlertTriangle, CheckCircle, AlertCircle, Brain, Camera, Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentAnalysisResult {
  completedInvestigations?: string[];
  missingInvestigations?: {
    critical: string[];
    important: string[];
    optional: string[];
  };
  diagnosisAssessment?: {
    statedDiagnosis: string;
    isSupported: boolean;
    confidence: string;
    reasoning: string;
    alternativeDiagnoses: string[];
  };
  raceSpecificConsiderations?: string[];
  recommendations?: string[];
  summary?: string;
  rawAnalysis?: string;
}

interface Demographics {
  age?: string;
  sex?: string;
  race?: string;
}

interface Props {
  checkedTests: string[];
  calculatedScores: Record<string, number | string>;
  demographics: Demographics;
}

export default function DocumentAnalyzer({ checkedTests, calculatedScores, demographics }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [documentText, setDocumentText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysisResult | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{ file: File; preview: string }[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.type === "text/plain") {
        const text = await file.text();
        setDocumentText(prev => prev + (prev ? "\n\n" : "") + text);
        toast.success("Text document loaded");
      } else if (file.type.startsWith("image/")) {
        // Handle image files (jpeg, png, etc.)
        const preview = URL.createObjectURL(file);
        setUploadedImages(prev => [...prev, { file, preview }]);
        toast.success("Image added - will be analyzed with AI");
      } else if (file.type === "application/pdf") {
        toast.info("PDF detected. Please paste the text content directly for now.");
      } else {
        toast.error("Unsupported file type. Please upload images or text files.");
      }
    }
    
    // Reset input
    if (e.target) e.target.value = "";
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeDocument = async () => {
    if (!documentText.trim() && uploadedImages.length === 0) {
      toast.error("Please enter text, upload a document, or add images first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // If we have images, convert the first one to base64 for analysis
      let imageBase64: string | undefined;
      if (uploadedImages.length > 0) {
        imageBase64 = await convertImageToBase64(uploadedImages[0].file);
      }

      const { data, error } = await supabase.functions.invoke("analyze-document", {
        body: {
          documentText: documentText || "Please analyze the uploaded image for clinical documentation.",
          imageBase64,
          checkedTests,
          demographics,
          calculatedScores,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (data.error.includes("credits")) {
          toast.error("AI credits exhausted. Please add credits to continue.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      setAnalysis(data.analysis);
      toast.success("Document analysis complete");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze document. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-indigo-400 dark:border-indigo-600 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-indigo-100/50 dark:bg-indigo-900/30">
            <CardTitle className="flex items-center justify-between text-indigo-800 dark:text-indigo-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Document Analyzer
                <Badge variant="outline" className="ml-2 text-xs border-indigo-400">Beta</Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            {/* Upload Section */}
            <div className="space-y-4">
              {/* Upload Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,image/*"
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
                >
                  <Upload className="h-4 w-4" />
                  Upload Files
                </Button>

                {/* Photo Library (mobile-friendly) */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    // For photo library, we need a separate input without capture
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.onchange = (e) => handleFileUpload(e as any);
                    input.click();
                  }}
                  className="flex items-center gap-2 border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
                >
                  <Image className="h-4 w-4" />
                  Photo Library
                </Button>

                {/* Camera Capture */}
                <Button
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2 border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40"
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                    Uploaded Images ({uploadedImages.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Uploaded ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-lg border-2 border-indigo-300 dark:border-indigo-600"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drop zone for additional context */}
              <div className="p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg text-center">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-indigo-500" />
                  <span className="text-sm text-indigo-600 dark:text-indigo-400">
                    Drop files here or use the buttons above
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Supports: Images (JPEG, PNG), Text files • Use camera for bedside documentation
                  </span>
                </div>
              </div>

              <Textarea
                placeholder="Paste patient documentation here (clinical notes, discharge summary, investigation reports, etc.) or upload images above..."
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                className="min-h-[150px] text-sm"
              />

              <Button
                onClick={analyzeDocument}
                disabled={isAnalyzing || (!documentText.trim() && uploadedImages.length === 0)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing {uploadedImages.length > 0 ? "Images & Text" : "Document"}...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Analyze for Missing Investigations
                  </>
                )}
              </Button>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-4 animate-in fade-in-50">
                {/* Summary */}
                {analysis.summary && (
                  <div className="p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Summary</h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-400">{analysis.summary}</p>
                  </div>
                )}

                {/* Diagnosis Assessment */}
                {analysis.diagnosisAssessment && (
                  <div className={`p-4 rounded-lg ${
                    analysis.diagnosisAssessment.isSupported 
                      ? 'bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700' 
                      : 'bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700'
                  }`}>
                    <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                      analysis.diagnosisAssessment.isSupported 
                        ? 'text-green-800 dark:text-green-300' 
                        : 'text-amber-800 dark:text-amber-300'
                    }`}>
                      {analysis.diagnosisAssessment.isSupported 
                        ? <CheckCircle className="h-4 w-4" /> 
                        : <AlertCircle className="h-4 w-4" />
                      }
                      Diagnosis Assessment
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Stated Diagnosis:</strong> {analysis.diagnosisAssessment.statedDiagnosis}</p>
                      <p><strong>Supported:</strong> {analysis.diagnosisAssessment.isSupported ? "Yes" : "Needs review"} 
                        <Badge className="ml-2" variant="outline">{analysis.diagnosisAssessment.confidence} confidence</Badge>
                      </p>
                      <p><strong>Reasoning:</strong> {analysis.diagnosisAssessment.reasoning}</p>
                      {analysis.diagnosisAssessment.alternativeDiagnoses?.length > 0 && (
                        <div>
                          <strong>Consider:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysis.diagnosisAssessment.alternativeDiagnoses.map((dx, i) => (
                              <Badge key={i} variant="secondary">{dx}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Missing Investigations */}
                {analysis.missingInvestigations && (
                  <div className="space-y-3">
                    {/* Critical */}
                    {analysis.missingInvestigations.critical?.length > 0 && (
                      <div className="p-4 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-300 dark:border-red-700">
                        <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Critical - Urgent Investigations Needed
                        </h5>
                        <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                          {analysis.missingInvestigations.critical.map((inv, i) => (
                            <li key={i}>• {inv}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Important */}
                    {analysis.missingInvestigations.important?.length > 0 && (
                      <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-lg border border-amber-300 dark:border-amber-700">
                        <h5 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                          Important - Recommended Investigations
                        </h5>
                        <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
                          {analysis.missingInvestigations.important.map((inv, i) => (
                            <li key={i}>• {inv}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Optional */}
                    {analysis.missingInvestigations.optional?.length > 0 && (
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-300 dark:border-blue-700">
                        <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                          Optional - Consider Based on Clinical Context
                        </h5>
                        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                          {analysis.missingInvestigations.optional.map((inv, i) => (
                            <li key={i}>• {inv}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Race-Specific Considerations */}
                {analysis.raceSpecificConsiderations?.length > 0 && (
                  <div className="p-4 bg-purple-100 dark:bg-purple-900/40 rounded-lg border border-purple-300 dark:border-purple-700">
                    <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                      Race-Specific Considerations
                    </h5>
                    <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-400">
                      {analysis.raceSpecificConsiderations.map((consideration, i) => (
                        <li key={i}>• {consideration}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {analysis.recommendations?.length > 0 && (
                  <div className="p-4 bg-green-100 dark:bg-green-900/40 rounded-lg border border-green-300 dark:border-green-700">
                    <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      Actionable Recommendations
                    </h5>
                    <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Raw Analysis Fallback */}
                {analysis.rawAnalysis && !analysis.summary && (
                  <div className="p-4 bg-gray-100 dark:bg-gray-900/40 rounded-lg">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">Analysis Result</h5>
                    <p className="text-sm text-gray-700 dark:text-gray-400 whitespace-pre-wrap">{analysis.rawAnalysis}</p>
                  </div>
                )}

                {/* Completed Investigations */}
                {analysis.completedInvestigations?.length > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-2">
                      Investigations Found in Document
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {analysis.completedInvestigations.map((inv, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{inv}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                <strong>⚠️ Disclaimer:</strong> This AI analysis is for decision support only and should not replace clinical judgment. 
                Always verify recommendations against current guidelines and patient-specific factors.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
