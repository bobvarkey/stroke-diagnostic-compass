import { useCallback, useEffect, useRef, useState } from "react";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Camera,
  Check,
  ChevronDown,
  ClipboardPaste,
  Copy,
  Download,
  Eraser,
  FileText,
  FileUp,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AI_PROVIDERS, callAiProvider, describeAiError, getAiSettings } from "@/lib/aiProviders";
import { parseJsonFromModel, type AiContentPart } from "@/lib/aiPrompts";

export interface ImportedClinicalData {
  demographics?: {
    name?: string;
    age?: string;
    sex?: string;
    race?: string;
  };
  labs?: Array<{
    name: string;
    value: string;
    unit?: string;
    reference_range?: string;
    flag?: string;
  }>;
  investigations?: string[];
  notes?: string;
  summary?: string;
}

interface Props {
  onPopulate?: (data: ImportedClinicalData) => void;
}

type BusyKind = "ocr" | "pdf" | "ai" | null;

const MAX_IMAGE_MB = 10;
const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/webp"];

let pdfModulePromise: Promise<typeof import("pdfjs-dist")> | null = null;
function loadPdf() {
  if (!pdfModulePromise) {
    pdfModulePromise = import("pdfjs-dist").then((pdf) => {
      pdf.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      return pdf;
    });
  }
  return pdfModulePromise;
}

async function ocrImage(
  source: string | HTMLCanvasElement,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", undefined, {
    logger: (message: { status?: string; progress?: number }) => {
      if (message.status === "recognizing text" && typeof message.progress === "number") {
        onProgress?.(message.progress);
      }
    },
  });
  try {
    const { data } = await worker.recognize(source);
    return data.text.trim();
  } finally {
    await worker.terminate();
  }
}

const STRUCTURING_SYSTEM_PROMPT = `You convert clinical documents into structured data for a stroke workup app.

Return ONLY a valid JSON object with exactly this shape:
{
  "demographics": { "name": "", "age": "", "sex": "", "race": "" },
  "labs": [{ "name": "", "value": "", "unit": "", "reference_range": "", "flag": "" }],
  "investigations": [""],
  "notes": "",
  "summary": ""
}

Rules:
- Use the empty string or empty array when the document does not state a value. Never invent data.
- "sex" must be "male", "female", "other", or "".
- "flag" must be "high", "low", "normal", "critical", or "".
- Standardise investigation names (for example "CBC", "CRP", "INR", "aPTT", "HbA1c", "MRI Brain", "Carotid Duplex").
- Put narrative findings that do not fit the fields into "notes"; put a one-sentence overview into "summary".
- Return JSON only: no markdown fence, no commentary.`;

export default function AiTextImport({ onPopulate }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [busy, setBusy] = useState<BusyKind>(null);
  const [progress, setProgress] = useState("");

  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLTextAreaElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const setImageFile = (file: File) => {
    if (!ALLOWED_IMAGES.includes(file.type)) {
      toast.error("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_IMAGE_MB} MB.`);
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;
    setImage({ file, preview });
  };

  const onImageChosen = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImageFile(file);
    if (event.target) event.target.value = "";
  };

  const runImageOcr = async () => {
    if (!image) return;
    setBusy("ocr");
    setProgress("Preparing OCR…");
    try {
      const text = await ocrImage(image.preview, (fraction) => {
        setProgress(`Reading image… ${Math.round(fraction * 100)}%`);
      });
      if (!text) {
        toast.error("No readable text was found in this image.");
        return;
      }
      setExtractedText(text);
      toast.success("Text extracted from image");
    } catch (error) {
      console.error("Image OCR failed:", error);
      toast.error("Could not extract text from this image.");
    } finally {
      setBusy(null);
      setProgress("");
    }
  };

  const onPdfChosen = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (event.target) event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please choose a PDF file.");
      return;
    }
    setBusy("pdf");
    setProgress("Opening PDF…");
    try {
      const pdf = await loadPdf();
      const bytes = await file.arrayBuffer();
      const task = pdf.getDocument({ data: bytes });
      const doc = await task.promise;
      const pages = doc.numPages;
      setPdfFile(file);
      setPageCount(pages);
      setSelectedPages(new Set(Array.from({ length: pages }, (_, index) => index + 1)));

      // Small first-page preview, so the user can confirm the right document.
      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 0.6 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, viewport }).promise;
      setPdfPreview(canvas.toDataURL("image/jpeg", 0.7));
      await task.destroy();
      toast.success(`PDF loaded — ${pages} page${pages === 1 ? "" : "s"}`);
    } catch (error) {
      console.error("PDF open failed:", error);
      toast.error("Could not open this PDF.");
      setPdfFile(null);
      setPdfPreview("");
      setPageCount(0);
      setSelectedPages(new Set());
    } finally {
      setBusy(null);
      setProgress("");
    }
  };

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const runPdfExtraction = async () => {
    if (!pdfFile || selectedPages.size === 0) {
      toast.error("Choose a PDF and at least one page.");
      return;
    }
    setBusy("pdf");
    setProgress("Opening PDF…");
    try {
      const pdf = await loadPdf();
      const bytes = await pdfFile.arrayBuffer();
      const task = pdf.getDocument({ data: bytes });
      const doc = await task.promise;
      const pages = [...selectedPages].sort((a, b) => a - b);
      const sections: string[] = [];

      for (let index = 0; index < pages.length; index += 1) {
        const pageNumber = pages[index];
        setProgress(`Reading page ${pageNumber} of ${pages.length}…`);
        const page = await doc.getPage(pageNumber);
        const content = await page.getTextContent();
        let text = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        // Scanned page: no text layer, so rasterise it and OCR the canvas.
        if (text.length < 20) {
          setProgress(`Page ${pageNumber} is scanned — running OCR…`);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvas, viewport }).promise;
          text = await ocrImage(canvas, (fraction) => {
            setProgress(`OCR page ${pageNumber}… ${Math.round(fraction * 100)}%`);
          });
        }

        sections.push(`--- Page ${pageNumber} ---\n${text || "(no text)"}`);
      }

      await task.destroy();
      setExtractedText(sections.join("\n\n"));
      toast.success(`Extracted text from ${pages.length} page${pages.length === 1 ? "" : "s"}`);
    } catch (error) {
      console.error("PDF extraction failed:", error);
      toast.error("Could not extract text from this PDF.");
    } finally {
      setBusy(null);
      setProgress("");
    }
  };

  const analyzeWithAi = async () => {
    if (!extractedText.trim()) {
      toast.error("Extract or paste some text first.");
      return;
    }
    const settings = getAiSettings();
    if (!settings) {
      toast.error("Add your own API key in Account → AI settings to use AI analysis.");
      return;
    }
    setBusy("ai");
    setProgress(`Asking ${AI_PROVIDERS[settings.provider].label}…`);
    try {
      const user: AiContentPart[] = [{ type: "text", text: extractedText }];
      const reply = await callAiProvider({
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        system: STRUCTURING_SYSTEM_PROMPT,
        user,
        maxTokens: 4000,
      });
      if (!reply) throw new Error("The AI provider returned an empty reply");
      const parsed = parseJsonFromModel<ImportedClinicalData>(reply);
      setJsonText(JSON.stringify(parsed, null, 2));
      toast.success("Structured data ready — review it, then populate the form.");
    } catch (error) {
      console.error("Structuring failed:", error);
      toast.error(describeAiError(error));
    } finally {
      setBusy(null);
      setProgress("");
    }
  };

  const populateForm = () => {
    if (!onPopulate) {
      toast.error("This page cannot accept imported data.");
      return;
    }
    try {
      const parsed = JSON.parse(jsonText) as ImportedClinicalData;
      onPopulate(parsed);
      toast.success("Form populated — review every field before saving.");
    } catch {
      toast.error("The JSON is not valid. Fix it or run Analyze with AI again.");
    }
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      toast.success("JSON copied");
    } catch {
      toast.error("Could not access the clipboard.");
    }
  };

  const downloadJson = () => {
    try {
      const blob = new Blob([jsonText], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clinical-import-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("JSON downloaded");
    } catch {
      toast.error("Could not create the download.");
    }
  };

  const clearSession = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setTextInput("");
    setExtractedText("");
    setJsonText("");
    setImage(null);
    setPdfFile(null);
    setPdfPreview("");
    setPageCount(0);
    setSelectedPages(new Set());
    setProgress("");
    setBusy(null);
    toast.success("Import session cleared");
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("The clipboard is empty.");
        return;
      }
      setTextInput((prev) => (prev ? `${prev}\n${text}` : text));
    } catch {
      toast.error("The browser blocked clipboard access. Paste with the keyboard instead.");
    }
  };

  const isBusy = busy !== null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/30 to-background">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="bg-emerald-100/50 dark:bg-emerald-900/30">
            <CardTitle className="flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                AI Text &amp; Document Import
                <Badge variant="outline" className="ml-2 text-xs border-emerald-400">BYOK</Badge>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-6 space-y-6">
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="text" className="min-h-11 text-xs sm:text-sm">
                  <FileText className="h-4 w-4 mr-1" /> Text
                </TabsTrigger>
                <TabsTrigger value="image" className="min-h-11 text-xs sm:text-sm">
                  <ImageIcon className="h-4 w-4 mr-1" /> Image OCR
                </TabsTrigger>
                <TabsTrigger value="pdf" className="min-h-11 text-xs sm:text-sm">
                  <FileUp className="h-4 w-4 mr-1" /> PDF
                </TabsTrigger>
              </TabsList>

              {/* Text input */}
              <TabsContent value="text" className="space-y-3 mt-4">
                <Textarea
                  value={textInput}
                  onChange={(event) => setTextInput(event.target.value)}
                  placeholder="Paste or type clinical text here…"
                  className="min-h-[180px] text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="min-h-11" onClick={pasteFromClipboard}>
                    <ClipboardPaste className="h-4 w-4 mr-1" /> Paste
                  </Button>
                  <Button type="button" variant="outline" className="min-h-11" onClick={() => setTextInput("")}>
                    <Eraser className="h-4 w-4 mr-1" /> Clear
                  </Button>
                  <Button
                    type="button"
                    className="min-h-11"
                    disabled={!textInput.trim()}
                    onClick={() => {
                      setExtractedText(textInput.trim());
                      toast.success("Text ready for analysis");
                    }}
                  >
                    <FileText className="h-4 w-4 mr-1" /> Process text
                  </Button>
                </div>
              </TabsContent>

              {/* Image OCR */}
              <TabsContent value="image" className="space-y-3 mt-4">
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onImageChosen} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onImageChosen} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="min-h-11" onClick={() => imageInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" /> Upload image
                  </Button>
                  <Button type="button" variant="outline" className="min-h-11" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="h-4 w-4 mr-1" /> Take photo
                  </Button>
                </div>

                {image && (
                  <div className="relative inline-block">
                    <img src={image.preview} alt="Selected document" className="max-h-56 rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => {
                        if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
                        previewUrlRef.current = null;
                        setImage(null);
                      }}
                      className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <Button type="button" className="min-h-11" disabled={!image || isBusy} onClick={runImageOcr}>
                  {busy === "ocr" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  {busy === "ocr" ? "Extracting…" : "Extract text (OCR)"}
                </Button>
              </TabsContent>

              {/* PDF import */}
              <TabsContent value="pdf" className="space-y-3 mt-4">
                <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onPdfChosen} />
                <Button type="button" variant="outline" className="min-h-11" onClick={() => pdfInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-1" /> Choose PDF
                </Button>

                {pdfFile && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {pdfPreview && <img src={pdfPreview} alt="First page preview" className="max-h-40 rounded-lg border" />}
                      <div className="space-y-1 text-sm">
                        <p className="font-medium break-all">{pdfFile.name}</p>
                        <p className="text-muted-foreground">{pageCount} page{pageCount === 1 ? "" : "s"}</p>
                        <p className="text-xs text-muted-foreground">{selectedPages.size} selected</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">Pages</span>
                        <div className="flex gap-1">
                          <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)))}>
                            All
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedPages(new Set())}>
                            None
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto rounded-lg border p-2">
                        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => togglePage(page)}
                            className={`h-9 w-9 rounded-md border text-xs font-medium ${
                              selectedPages.has(page)
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-background text-muted-foreground"
                            }`}
                            aria-pressed={selectedPages.has(page)}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button type="button" className="min-h-11" disabled={selectedPages.size === 0 || isBusy} onClick={runPdfExtraction}>
                      {busy === "pdf" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileText className="h-4 w-4 mr-1" />}
                      {busy === "pdf" ? "Extracting…" : "Extract text"}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {progress && (
              <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <Loader2 className="h-4 w-4 animate-spin" /> {progress}
              </p>
            )}

            {/* Result panel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">Extraction result</h3>
                <Badge variant="outline" className="text-xs">{extractedText.length.toLocaleString()} chars</Badge>
              </div>
              <Textarea
                ref={resultRef}
                value={extractedText}
                onChange={(event) => setExtractedText(event.target.value)}
                placeholder="Extracted text appears here and stays editable before you analyse or populate."
                className="min-h-[160px] text-sm font-mono"
              />

              <div className="flex flex-wrap gap-2">
                <Button type="button" className="min-h-11" disabled={!extractedText.trim() || isBusy} onClick={analyzeWithAi}>
                  {busy === "ai" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}
                  {busy === "ai" ? "Analysing…" : "Analyze with AI"}
                </Button>
                <Button type="button" variant="outline" className="min-h-11" onClick={() => resultRef.current?.focus()}>
                  <Pencil className="h-4 w-4 mr-1" /> Edit text
                </Button>
                <Button type="button" variant="outline" className="min-h-11" disabled={!jsonText.trim()} onClick={populateForm}>
                  <Check className="h-4 w-4 mr-1" /> Populate form
                </Button>
                <Button type="button" variant="outline" className="min-h-11" disabled={!jsonText.trim()} onClick={copyJson}>
                  <Copy className="h-4 w-4 mr-1" /> Copy JSON
                </Button>
                <Button type="button" variant="outline" className="min-h-11" disabled={!jsonText.trim()} onClick={downloadJson}>
                  <Download className="h-4 w-4 mr-1" /> Export JSON
                </Button>
                <Button type="button" variant="ghost" className="min-h-11" onClick={clearSession}>
                  <Eraser className="h-4 w-4 mr-1" /> Clear session
                </Button>
              </div>
            </div>

            {jsonText && (
              <div className="space-y-2">
                <h3 className="font-semibold">Structured JSON</h3>
                <Textarea
                  value={jsonText}
                  onChange={(event) => setJsonText(event.target.value)}
                  spellCheck={false}
                  className="min-h-[200px] text-xs font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Review and correct every value before populating the form. Nothing is written to the record automatically.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/20">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Privacy:</strong> paste or scan only what you need. Text is sent to the AI provider only when you
                press <em>Analyze with AI</em>, and only to the provider whose key you configured in
                Account → AI settings.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
