import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { xmlEscape } from "./_utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CallRequest {
  activationId: string;
  codeLevel: 'code_1' | 'code_2';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Require admin role — only admins can trigger real outbound calls
    const { data: adminCheck, error: roleErr } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });
    if (roleErr || adminCheck !== true) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json() as Partial<CallRequest>;
    const activationId = typeof body.activationId === 'string' ? body.activationId : '';
    const codeLevel = body.codeLevel === 'code_1' || body.codeLevel === 'code_2' ? body.codeLevel : null;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(activationId) || !codeLevel) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid activationId or codeLevel' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate activation exists and is recent (within last 24h)
    const { data: activation, error: actErr } = await supabase
      .from('stroke_activations')
      .select('id, created_at')
      .eq('id', activationId)
      .maybeSingle();
    if (actErr || !activation) {
      return new Response(
        JSON.stringify({ success: false, error: 'Activation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const activationAgeMs = Date.now() - new Date(activation.created_at).getTime();
    if (activationAgeMs > 24 * 60 * 60 * 1000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Activation expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch settings server-side — never trust client for phone numbers/message
    const { data: settings, error: settingsErr } = await supabase
      .from('stroke_settings')
      .select('facility_id, nsa_phone_number, nsa_enabled, voice_message_code_1, voice_message_code_2')
      .limit(1)
      .maybeSingle();
    if (settingsErr || !settings) {
      return new Response(
        JSON.stringify({ success: false, error: 'Stroke settings not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const facilityId = String(settings.facility_id ?? '');
    const nsaEnabled = !!settings.nsa_enabled;
    const nsaPhone = settings.nsa_phone_number ?? null;
    const voiceMessage = codeLevel === 'code_1'
      ? String(settings.voice_message_code_1 ?? '')
      : String(settings.voice_message_code_2 ?? '');

    if (voiceMessage.length > 500 || facilityId.length > 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configured settings exceed length limits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (nsaEnabled && nsaPhone && !phoneRegex.test(String(nsaPhone).replace(/[\s\-()]/g, ''))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid NSA phone number in settings' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    const { data: callLogs, error: logsError } = await supabase
      .from('stroke_call_logs')
      .select('*')
      .eq('activation_id', activationId)
      .order('created_at');

    if (logsError) {
      console.error('Error fetching call logs:', logsError);
      throw logsError;
    }

    const twilioConfigured = twilioAccountSid && twilioAuthToken && twilioPhoneNumber;

    if (!twilioConfigured) {
      for (const log of callLogs || []) {
        await supabase
          .from('stroke_call_logs')
          .update({
            call_status: 'pending',
            error_message: 'Twilio not configured - manual calling required'
          })
          .eq('id', log.id);
      }

      if (nsaEnabled && nsaPhone) {
        await supabase
          .from('stroke_activations')
          .update({
            nsa_notified: false,
            nsa_notification_status: 'Twilio not configured - manual NSA notification required'
          })
          .eq('id', activationId);
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: 'Twilio not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER secrets.',
          manualCallingRequired: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const twilioBaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
    const authHeaderTwilio = 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const callResults: { contactId: string; success: boolean; error?: string }[] = [];

    // Pre-escape safe values for TwiML
    const safeVoice = xmlEscape(voiceMessage);
    const safeFacility = xmlEscape(facilityId);
    const safeCodeLabel = codeLevel === 'code_1' ? 'Code 1 emergency' : 'Code 2';

    for (const log of callLogs || []) {
      try {
        await supabase
          .from('stroke_call_logs')
          .update({
            call_status: 'calling',
            call_started_at: new Date().toISOString()
          })
          .eq('id', log.id);

        const twiml = `<Response><Say voice="alice">${safeVoice}. This is a ${safeCodeLabel} stroke alert for patient at ${safeFacility}. Please respond immediately.</Say><Pause length="1"/><Say voice="alice">Repeat: ${safeVoice}</Say></Response>`;

        const formData = new URLSearchParams();
        formData.append('To', log.phone_number);
        formData.append('From', twilioPhoneNumber!);
        formData.append('Twiml', twiml);
        formData.append('Timeout', '30');

        const callResponse = await fetch(twilioBaseUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeaderTwilio,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        const callData = await callResponse.json();

        if (callResponse.ok) {
          await supabase
            .from('stroke_call_logs')
            .update({
              call_status: 'success',
              call_ended_at: new Date().toISOString()
            })
            .eq('id', log.id);

          callResults.push({ contactId: log.contact_id, success: true });
        } else {
          throw new Error(callData.message || 'Twilio call failed');
        }
      } catch (callError) {
        const errorMessage = callError instanceof Error ? callError.message : 'Unknown error';

        await supabase
          .from('stroke_call_logs')
          .update({
            call_status: 'failed',
            call_ended_at: new Date().toISOString(),
            error_message: errorMessage
          })
          .eq('id', log.id);

        callResults.push({ contactId: log.contact_id, success: false, error: errorMessage });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    let nsaNotified = false;
    let nsaStatus = '';

    if (nsaEnabled && nsaPhone) {
      try {
        const nsaTwiml = `<Response><Say voice="alice">This is an automated stroke code notification from ${safeFacility}. A ${safeCodeLabel} stroke alert has been activated. Timestamp: ${xmlEscape(new Date().toISOString())}. This message is for National Stroke Association records.</Say></Response>`;

        const nsaFormData = new URLSearchParams();
        nsaFormData.append('To', nsaPhone);
        nsaFormData.append('From', twilioPhoneNumber!);
        nsaFormData.append('Twiml', nsaTwiml);
        nsaFormData.append('Timeout', '30');

        const nsaResponse = await fetch(twilioBaseUrl, {
          method: 'POST',
          headers: {
            'Authorization': authHeaderTwilio,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: nsaFormData,
        });

        if (nsaResponse.ok) {
          nsaNotified = true;
          nsaStatus = 'NSA notification sent successfully';
        } else {
          const nsaError = await nsaResponse.json();
          nsaStatus = `NSA notification failed: ${nsaError.message}`;
        }
      } catch (nsaError) {
        nsaStatus = `NSA notification error: ${nsaError instanceof Error ? nsaError.message : 'Unknown error'}`;
      }

      await supabase
        .from('stroke_activations')
        .update({
          nsa_notified: nsaNotified,
          nsa_notification_status: nsaStatus
        })
        .eq('id', activationId);
    }

    const successCount = callResults.filter(r => r.success).length;
    const failCount = callResults.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Called ${successCount} contacts successfully, ${failCount} failed`,
        callResults,
        nsaNotified,
        nsaStatus
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Stroke code caller error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
