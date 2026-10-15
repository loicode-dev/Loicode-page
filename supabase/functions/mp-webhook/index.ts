import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const id = url.searchParams.get("id") || url.searchParams.get("data.id");

    if (topic === "payment" && id) {
      const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });

      if (mpResponse.ok) {
        const payment = await mpResponse.json();
        const orderId = payment.external_reference;

        if (orderId) {
          const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
          );

          await supabase
            .from("orders")
            .update({
              status: payment.status, // 'approved', 'rejected', etc.
              mp_payment_id: String(payment.id),
              paid_at: payment.status === "approved" ? new Date().toISOString() : null,
            })
            .eq("id", orderId);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Error", { status: 500 });
  }
});

