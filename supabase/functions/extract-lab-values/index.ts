import "https://deno.land/std@0.168.0/dotenv/load.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    // Use Gemini multimodal to extract lab values from image
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a medical lab report OCR assistant. Extract all laboratory values from this image and return them as a JSON object.

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

If you cannot extract any lab values, return {"labs": [], "error": "Could not extract lab values from image"}.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API call failed [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to parse the JSON from the response
    let extractedData;
    try {
      // Find JSON in the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = { labs: [], error: 'Could not parse response' };
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      extractedData = { labs: [], error: 'Failed to parse extracted data', raw: content };
    }

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('OCR extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, labs: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
