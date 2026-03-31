import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates
const templates: Record<string, (data: Record<string, string>) => { subject: string; html: string }> = {
  booking_confirmation: (data) => ({
    subject: `Booking Confirmed — ${data.booking_ref}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1a18;color:#f5efe6;padding:40px;">
        <h1 style="color:#c9883a;margin-bottom:8px;">Greymoor Safaris</h1>
        <h2>Booking Confirmed ✓</h2>
        <p>Dear ${data.guest_name},</p>
        <p>Your booking <strong>${data.booking_ref}</strong> has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:8px 0;color:#a8977a;">Check-in</td><td>${data.check_in}</td></tr>
          <tr><td style="padding:8px 0;color:#a8977a;">Check-out</td><td>${data.check_out}</td></tr>
          <tr><td style="padding:8px 0;color:#a8977a;">Room</td><td>${data.room_number}</td></tr>
          <tr><td style="padding:8px 0;color:#a8977a;">Total</td><td style="color:#c9883a;font-weight:bold;">$${data.total}</td></tr>
        </table>
        <p>We look forward to welcoming you!</p>
        <p style="color:#a8977a;font-size:12px;margin-top:30px;">Greymoor Safaris Lodge</p>
      </div>
    `,
  }),
  checkin_reminder: (data) => ({
    subject: `Check-in Tomorrow — ${data.booking_ref}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1a18;color:#f5efe6;padding:40px;">
        <h1 style="color:#c9883a;">Greymoor Safaris</h1>
        <h2>See You Tomorrow! 🌅</h2>
        <p>Dear ${data.guest_name},</p>
        <p>This is a reminder that your check-in for booking <strong>${data.booking_ref}</strong> is tomorrow, <strong>${data.check_in}</strong>.</p>
        <p>Check-in time starts at <strong>2:00 PM</strong>. If you need airport transfer, please reply to this email.</p>
        <p style="color:#a8977a;font-size:12px;margin-top:30px;">Greymoor Safaris Lodge</p>
      </div>
    `,
  }),
  checkout_reminder: (data) => ({
    subject: `Check-out Today — ${data.booking_ref}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1a18;color:#f5efe6;padding:40px;">
        <h1 style="color:#c9883a;">Greymoor Safaris</h1>
        <h2>Check-out Reminder</h2>
        <p>Dear ${data.guest_name},</p>
        <p>Your check-out is today. Check-out time is <strong>11:00 AM</strong>.</p>
        <p>We hope you enjoyed your stay! A satisfaction survey will be sent to your email shortly.</p>
        <p style="color:#a8977a;font-size:12px;margin-top:30px;">Greymoor Safaris Lodge</p>
      </div>
    `,
  }),
  payment_receipt: (data) => ({
    subject: `Payment Receipt — ${data.receipt_number}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1a18;color:#f5efe6;padding:40px;">
        <h1 style="color:#c9883a;">Greymoor Safaris</h1>
        <h2>Payment Receipt</h2>
        <p>Dear ${data.guest_name},</p>
        <p>We have received your payment of <strong style="color:#c9883a;">$${data.amount}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:8px 0;color:#a8977a;">Receipt No.</td><td>${data.receipt_number}</td></tr>
          <tr><td style="padding:8px 0;color:#a8977a;">Method</td><td>${data.payment_method}</td></tr>
          <tr><td style="padding:8px 0;color:#a8977a;">Booking</td><td>${data.booking_ref}</td></tr>
          <tr><td style="padding:8px 0;color:#a8977a;">Date</td><td>${data.date}</td></tr>
        </table>
        <p style="color:#a8977a;font-size:12px;margin-top:30px;">Greymoor Safaris Lodge</p>
      </div>
    `,
  }),
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured. Please add it to secrets." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, template, data, user_id, booking_id } = await req.json();

    if (!to || !template || !data) {
      return new Response(
        JSON.stringify({ error: "to, template, and data are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templateFn = templates[template];
    if (!templateFn) {
      return new Response(
        JSON.stringify({ error: `Unknown template: ${template}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = templateFn(data);

    // Send via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Greymoor Safaris <notifications@greymoor.com>",
        to: [to],
        subject,
        html,
      }),
    });

    const emailData = await emailRes.json();
    const success = emailRes.ok;

    // Log notification
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    if (user_id) {
      await supabase.from("notification_log").insert({
        user_id,
        booking_id: booking_id || null,
        channel: "email",
        event_type: template,
        status: success ? "sent" : "failed",
        message_preview: subject,
        external_id: emailData?.id || null,
        error_message: success ? null : JSON.stringify(emailData),
      });
    }

    return new Response(JSON.stringify({ success, data: emailData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Email sending error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
