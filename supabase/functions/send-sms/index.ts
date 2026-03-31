import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AT_API_KEY = Deno.env.get("AT_API_KEY");
    const AT_USERNAME = Deno.env.get("AT_USERNAME");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!AT_API_KEY || !AT_USERNAME) {
      return new Response(
        JSON.stringify({ error: "Africa's Talking credentials not configured. Please add AT_API_KEY and AT_USERNAME secrets." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { phone_number, message, user_id, booking_id, event_type } = await req.json();

    if (!phone_number || !message) {
      return new Response(
        JSON.stringify({ error: "phone_number and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone for Africa's Talking (needs +254 format)
    const formattedPhone = phone_number.startsWith("+") ? phone_number : `+${phone_number.replace(/^0/, "254")}`;

    // Send SMS via Africa's Talking
    const atRes = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey: AT_API_KEY,
      },
      body: new URLSearchParams({
        username: AT_USERNAME,
        to: formattedPhone,
        message: message,
        from: "GREYMOOR",
      }),
    });

    const atData = await atRes.json();
    const smsResult = atData?.SMSMessageData?.Recipients?.[0];
    const success = smsResult?.status === "Success";

    // Log notification
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    if (user_id) {
      await supabase.from("notification_log").insert({
        user_id,
        booking_id: booking_id || null,
        channel: "sms",
        event_type: event_type || "general",
        status: success ? "sent" : "failed",
        message_preview: message.substring(0, 100),
        external_id: smsResult?.messageId || null,
        error_message: success ? null : smsResult?.status || "Unknown error",
      });
    }

    return new Response(JSON.stringify({ success, data: atData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("SMS sending error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
