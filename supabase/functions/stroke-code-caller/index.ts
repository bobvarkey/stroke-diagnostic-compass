import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CallRequest {
  activationId: string;
  codeLevel: 'code_1' | 'code_2';
  facilityId: string;
  nsaEnabled: boolean;
  nsaPhone: string | null;
  voiceMessage: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
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
    
    // Create client with user's auth token for verification
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data, error: authError } = await authClient.auth.getClaims(token);
    if (authError || !data?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { activationId, codeLevel, facilityId, nsaEnabled, nsaPhone, voiceMessage } = await req.json() as CallRequest;

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    // Fetch call logs for this activation
    const { data: callLogs, error: logsError } = await supabase
      .from('stroke_call_logs')
      .select('*')
      .eq('activation_id', activationId)
      .order('created_at');

    if (logsError) {
      console.error('Error fetching call logs:', logsError);
      throw logsError;
    }

    // Check if Twilio is configured
    const twilioConfigured = twilioAccountSid && twilioAuthToken && twilioPhoneNumber;

    if (!twilioConfigured) {
      console.log('Twilio not configured - updating logs with pending status');
      
      // Update all call logs to indicate manual calling is required
      for (const log of callLogs || []) {
        await supabase
          .from('stroke_call_logs')
          .update({
            call_status: 'pending',
            error_message: 'Twilio not configured - manual calling required'
          })
          .eq('id', log.id);
      }

      // Update activation with NSA status
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

    // Twilio is configured - proceed with automated calling
    const twilioBaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
    const authHeaderTwilio = 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const callResults: { contactId: string; success: boolean; error?: string }[] = [];

    // Make calls sequentially to each contact
    for (const log of callLogs || []) {
      try {
        // Update status to calling
        await supabase
          .from('stroke_call_logs')
          .update({
            call_status: 'calling',
            call_started_at: new Date().toISOString()
          })
          .eq('id', log.id);

        // Create TwiML for the voice message
        const twiml = `<Response><Say voice="alice">${voiceMessage}. This is a ${codeLevel === 'code_1' ? 'Code 1 emergency' : 'Code 2'} stroke alert for patient at ${facilityId}. Please respond immediately.</Say><Pause length="1"/><Say voice="alice">Repeat: ${voiceMessage}</Say></Response>`;

        // Make the call via Twilio
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
          // Update status to success
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

      // Small delay between calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Handle NSA notification
    let nsaNotified = false;
    let nsaStatus = '';

    if (nsaEnabled && nsaPhone) {
      try {
        const nsaTwiml = `<Response><Say voice="alice">This is an automated stroke code notification from ${facilityId}. A ${codeLevel === 'code_1' ? 'Code 1' : 'Code 2'} stroke alert has been activated. Timestamp: ${new Date().toISOString()}. This message is for National Stroke Association records.</Say></Response>`;

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

      // Update activation with NSA status
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
