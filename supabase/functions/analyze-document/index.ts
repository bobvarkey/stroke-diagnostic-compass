import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText, imageBase64, checkedTests, demographics, calculatedScores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const raceSpecificGuidance = getRaceSpecificGuidance(demographics?.race);

    const systemPrompt = `You are an expert stroke neurologist assistant analyzing patient documentation for a comprehensive stroke workup. Your role is to:

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

    const userPrompt = `Please analyze this patient documentation for stroke workup completeness:

DOCUMENT CONTENT:
${documentText}

ALREADY CHECKED TESTS IN APP:
${checkedTests.length > 0 ? checkedTests.join(", ") : "None marked as completed"}

PATIENT DEMOGRAPHICS:
${demographics ? `Age: ${demographics.age || "Not specified"}, Sex: ${demographics.sex || "Not specified"}, Race/Ethnicity: ${demographics.race || "Not specified"}` : "Not provided"}

CALCULATED SCORES:
${calculatedScores ? JSON.stringify(calculatedScores, null, 2) : "No scores calculated yet"}

Please provide a comprehensive analysis of what investigations are missing and whether the stated diagnosis is appropriate.`;

    // Build the user content - if image is provided, use multimodal message
    let userContent: any;
    if (imageBase64) {
      userContent = [
        { type: "text", text: userPrompt },
        {
          type: "image_url",
          image_url: {
            url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ];
    } else {
      userContent = userPrompt;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Try to parse as JSON, otherwise return raw content
    let analysisResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonStr);
    } catch {
      analysisResult = { rawAnalysis: content };
    }

    return new Response(JSON.stringify({ analysis: analysisResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getRaceSpecificGuidance(race?: string): string {
  if (!race) return "";

  const raceGuidance: Record<string, string> = {
    "african": `RACE-SPECIFIC CONSIDERATIONS FOR AFRICAN/BLACK PATIENTS:
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

    "hispanic": `RACE-SPECIFIC CONSIDERATIONS FOR HISPANIC/LATINO PATIENTS:
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

    "caucasian": `RACE-SPECIFIC CONSIDERATIONS FOR CAUCASIAN PATIENTS:
- Higher prevalence of extracranial carotid disease
- AF-related stroke more common in older patients
- Standard workup generally applies
- Consider PFO workup in younger patients with ESUS`
  };

  return raceGuidance[race.toLowerCase()] || "";
}
