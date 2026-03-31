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
    const MPESA_CONSUMER_KEY = Deno.env.get("MPESA_CONSUMER_KEY");
    const MPESA_CONSUMER_SECRET = Deno.env.get("MPESA_CONSUMER_SECRET");
    const MPESA_PASSKEY = Deno.env.get("MPESA_PASSKEY");
    const MPESA_SHORTCODE = Deno.env.get("MPESA_SHORTCODE");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_PASSKEY || !MPESA_SHORTCODE) {
      return new Response(
        JSON.stringify({ error: "M-Pesa credentials not configured. Please add MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, and MPESA_SHORTCODE secrets." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { phone_number, amount, booking_id, account_reference } = await req.json();

    if (!phone_number || !amount || !booking_id) {
      return new Response(
        JSON.stringify({ error: "phone_number, amount, and booking_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Get OAuth token from Safaricom
    const authString = btoa(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);
    const tokenRes = await fetch(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${authString}` } }
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Failed to get M-Pesa access token");
    }

    // Step 2: Initiate STK Push
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);

    // Format phone: ensure 254 prefix
    const formattedPhone = phone_number.replace(/^0/, "254").replace(/^\+/, "");

    const callbackUrl = `${SUPABASE_URL}/functions/v1/mpesa-callback`;

    const stkRes = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(amount),
          PartyA: formattedPhone,
          PartyB: MPESA_SHORTCODE,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: account_reference || "Greymoor",
          TransactionDesc: `Payment for booking ${booking_id}`,
        }),
      }
    );

    const stkData = await stkRes.json();

    if (stkData.ResponseCode === "0") {
      // Log the pending payment
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from("payments").insert({
        booking_id,
        amount,
        payment_method: "mpesa",
        status: "pending",
        transaction_ref: stkData.CheckoutRequestID,
      });
    }

    return new Response(JSON.stringify(stkData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("M-Pesa STK Push error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
