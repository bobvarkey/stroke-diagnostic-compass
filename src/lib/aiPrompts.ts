/**
 * Prompt + parsing helpers shared by the in-browser BYOK path.
 *
 * These mirror `supabase/functions/analyze-document` and `supabase/functions/extract-lab-values`
 * exactly. The edge functions keep their own copies so they stay deployable on their own; if you
 * change a prompt there, change it here too, or the default and BYOK paths will drift.
 */

export type AiContentPart =
  | { type: "text"; text: string }
  | { type: "image"; dataUrl: string };

export interface Demographics {
  age?: string;
  sex?: string;
  race?: string;
}

export interface AnalyzeDocumentInput {
  documentText: string;
  additionalNotes?: string;
  checkedTests: string[];
  demographics?: Demographics;
  calculatedScores?: Record<string, number | string>;
  imageDataUrl?: string;
}

export function getRaceSpecificGuidance(race?: string): string {
  if (!race) return "";

  const raceGuidance: Record<string, string> = {
    african: `RACE-SPECIFIC CONSIDERATIONS FOR AFRICAN/BLACK PATIENTS:
- Higher prevalence of intracranial atherosclerosis
- Higher rates of hypertensive small vessel disease
- Consider sickle cell disease screening (Hb electrophoresis, sickling test)
- Higher prevalence of hypertension-mediated organ damage
- Moyamoya-like vasculopathy more common
- Higher stroke recurrence rates
- Consider APOL1 genetic variants if renal disease present`,

    "south-asian": `RACE-SPECIFIC CONSIDERATIONS FOR SOUTH ASIAN PATIENTS:
- Higher prevalence of metabolic syndrome and insulin resistance
- Earlier onset of atherosclerotic disease
- Higher Lipoprotein(a) levels - recommend checking Lp(a)
- 30-50% of Indians carry CYP2C19 loss-of-function alleles (clopidogrel resistance)
- Recommend CYP2C19 genotyping or PRU testing for antiplatelet selection
- Higher rates of intracranial atherosclerosis
- Consider MTHFR mutation testing
- Higher prevalence of diabetes and premature CAD`,

    "east-asian": `RACE-SPECIFIC CONSIDERATIONS FOR EAST ASIAN PATIENTS:
- Higher prevalence of intracranial atherosclerosis vs. extracranial
- Moyamoya disease more prevalent
- Consider vessel wall imaging for intracranial stenosis
- Lower alcohol dehydrogenase activity - consider alcohol history carefully
- CADASIL variants may differ from Western populations`,

    hispanic: `RACE-SPECIFIC CONSIDERATIONS FOR HISPANIC/LATINO PATIENTS:
- Higher diabetes prevalence
- Earlier stroke onset
- Consider metabolic syndrome screening
- Higher rates of small vessel disease
- Familial patterns may be more pronounced`,

    "middle-eastern": `RACE-SPECIFIC CONSIDERATIONS FOR MIDDLE EASTERN PATIENTS:
- Higher consanguinity rates - consider genetic etiologies
- Familial hyperlipidemia patterns
- Behçet's disease more prevalent
- Consider genetic testing for hereditary stroke syndromes`,

    caucasian: `RACE-SPECIFIC CONSIDERATIONS FOR CAUCASIAN PATIENTS:
- Higher prevalence of extracranial carotid disease
- AF-related stroke more common in older patients
- Standard workup generally applies
- Consider PFO workup in younger patients with ESUS`,
  };

  return raceGuidance[race.toLowerCase()] || "";
}

export function buildAnalyzeDocumentMessages(input: AnalyzeDocumentInput): {
  system: string;
  user: AiContentPart[];
} {
  const {
    documentText,
    additionalNotes,
    checkedTests,
    demographics,
    calculatedScores,
    imageDataUrl,
  } = input;

  const raceSpecificGuidance = getRaceSpecificGuidance(demographics?.race);

  const system = `You are an expert stroke neurologist assistant analyzing patient documentation for a comprehensive stroke workup. Your role is to:

1. Identify what investigations have been completed vs. what is still needed
2. Evaluate if the stated diagnosis is supported by the evidence
3. Suggest additional investigations that may be warranted
4. Consider race-specific stroke etiologies and risk factors

${raceSpecificGuidance}

IMPORTANT INVESTIGATION CATEGORIES TO CHECK:
- Basic Laboratory: CBC, ESR, CRP, RFT, LFT, TFT
- Chemistry: Fasting Glucose, HbA1c
- Coagulation: PT, aPTT, Thrombin Time, Platelets, Fibrinogen, D-dimer
- Infectious Disease: VDRL, HIV, HBsAg, HCV, Blood Cultures
- Specialized Blood: Toxicology, Lipid Profile, Homocysteine, Lipoprotein(a), ApoB
- Hypercoagulable Screen: APLA, Protein C/S, Antithrombin III, Factor V Leiden, Prothrombin mutation
- Autoimmune: ANA, Complement, ANCA
- Brain Imaging: CT Brain, CTA, MRI Brain, MRA, MRV
- Vascular Imaging: Carotid Duplex, TCD with Bubble Study, DSA
- Cardiac Studies: ECG, TTE, TEE, Holter Monitor

Respond in JSON format with the following structure:
{
  "completedInvestigations": ["list of investigations found in the document"],
  "missingInvestigations": {
    "critical": ["urgent investigations needed"],
    "important": ["recommended investigations"],
    "optional": ["may consider based on clinical context"]
  },
  "diagnosisAssessment": {
    "statedDiagnosis": "the diagnosis mentioned in document",
    "isSupported": true/false,
    "confidence": "high/medium/low",
    "reasoning": "explanation of why diagnosis is or isn't supported",
    "alternativeDiagnoses": ["other diagnoses to consider"]
  },
  "raceSpecificConsiderations": ["relevant race-specific factors if demographics provided"],
  "recommendations": ["specific actionable recommendations"],
  "summary": "brief overall assessment"
}`;

  const tests = checkedTests ?? [];
  const userText = `Please analyze this patient documentation for stroke workup completeness:

DOCUMENT CONTENT:
${documentText}

${additionalNotes ? `ADDITIONAL CLINICAL NOTES/CONTEXT FROM USER:
${additionalNotes}

` : ""}ALREADY CHECKED TESTS IN APP:
${tests.length > 0 ? tests.join(", ") : "None marked as completed"}

PATIENT DEMOGRAPHICS:
${demographics ? `Age: ${demographics.age || "Not specified"}, Sex: ${demographics.sex || "Not specified"}, Race/Ethnicity: ${demographics.race || "Not specified"}` : "Not provided"}

CALCULATED SCORES:
${calculatedScores ? JSON.stringify(calculatedScores, null, 2) : "No scores calculated yet"}

Please provide a comprehensive analysis of what investigations are missing and whether the stated diagnosis is appropriate.${additionalNotes ? " Pay special attention to the additional notes/context provided by the clinician." : ""}`;

  const user: AiContentPart[] = [{ type: "text", text: userText }];
  if (imageDataUrl) user.push({ type: "image", dataUrl: imageDataUrl });

  return { system, user };
}

export const LAB_EXTRACTION_PROMPT = `You are a medical lab report OCR assistant. Extract all laboratory values from this image and return them as a JSON object.

For each lab value found, include:
- name: The test name (standardized, e.g., "Hemoglobin", "Platelet Count", "INR", "PT", "aPTT", "Glucose", "Creatinine", etc.)
- value: The numeric value
- unit: The unit of measurement
- reference_range: The reference range if shown
- flag: "high", "low", "normal", or "critical" based on the value

Return ONLY a valid JSON object with this structure:
{
  "labs": [
    {"name": "Hemoglobin", "value": "12.5", "unit": "g/dL", "reference_range": "12.0-16.0", "flag": "normal"},
    ...
  ],
  "collection_date": "date if visible or null",
  "patient_id": "patient ID if visible or null"
}

If you cannot extract any lab values, return {"labs": [], "error": "Could not extract lab values from image"}.`;

export function buildLabExtractionMessages(imageDataUrl: string): {
  user: AiContentPart[];
} {
  return {
    user: [
      { type: "text", text: LAB_EXTRACTION_PROMPT },
      { type: "image", dataUrl: imageDataUrl },
    ],
  };
}

/** Pull a JSON object out of a model reply, tolerating markdown fences or surrounding prose. */
export function parseJsonFromModel<T>(content: string): T {
  const fenced = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
  const candidate = fenced ? fenced[1] : content;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const objectMatch = candidate.match(/\{[\s\S]*\}/);
    if (objectMatch) return JSON.parse(objectMatch[0]) as T;
    throw new Error("The AI reply was not valid JSON");
  }
}
