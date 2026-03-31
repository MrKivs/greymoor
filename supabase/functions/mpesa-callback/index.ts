import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(body));

    const callback = body?.Body?.stkCallback;
    if (!callback) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;

    if (resultCode === 0) {
      // Payment successful
      const items = callback.CallbackMetadata?.Item || [];
      const mpesaReceiptNumber = items.find((i: { Name: string }) => i.Name === "MpesaReceiptNumber")?.Value;

      await supabase
        .from("payments")
        .update({
          status: "completed",
          transaction_ref: mpesaReceiptNumber || checkoutRequestId,
        })
        .eq("transaction_ref", checkoutRequestId);

      // Also update the booking status to confirmed
      const { data: payment } = await supabase
        .from("payments")
        .select("booking_id")
        .eq("transaction_ref", mpesaReceiptNumber || checkoutRequestId)
        .single();

      if (payment?.booking_id) {
        await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", payment.booking_id);

        // Log notification
        const { data: booking } = await supabase
          .from("bookings")
          .select("customer_id")
          .eq("id", payment.booking_id)
          .single();

        if (booking?.customer_id) {
          await supabase.from("notification_log").insert({
            user_id: booking.customer_id,
            booking_id: payment.booking_id,
            channel: "sms",
            event_type: "payment_receipt",
            status: "pending",
            message_preview: `M-Pesa payment confirmed: ${mpesaReceiptNumber}`,
          });
        }
      }
    } else {
      // Payment failed
      await supabase
        .from("payments")
        .update({ status: "pending" })
        .eq("transaction_ref", checkoutRequestId);
    }

    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("M-Pesa callback error:", error);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
});
