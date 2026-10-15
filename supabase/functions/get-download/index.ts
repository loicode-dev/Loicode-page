import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id, payment_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obtener la orden
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      throw new Error("Orden no encontrada.");
    }

    // Si viene payment_id y aún no está approved, verificar directamente con Mercado Pago
    if (order.status !== "approved" && payment_id) {
      const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
        headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
      });

      if (mpResponse.ok) {
        const payment = await mpResponse.json();
        if (payment.status === "approved") {
          order.status = "approved";
          await supabase
            .from("orders")
            .update({
              status: "approved",
              mp_payment_id: String(payment.id),
              paid_at: new Date().toISOString(),
            })
            .eq("id", order.id);
        }
      }
    }

    // Si no está aprobado, no entregamos el archivo
    if (order.status !== "approved") {
      return new Response(
        JSON.stringify({
          status: order.status,
          product_title: order.product_title,
          kind: "download",
          url: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Obtener detalles del producto para la entrega
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", order.product_id)
      .single();

    let deliveryUrl: string | null = null;
    const kind = product?.kind === "webapp" ? "webapp" : "download";

    if (kind === "webapp") {
      deliveryUrl = product?.external_url ?? null;
    } else if (product?.file_path) {
      // Generar URL firmada temporal (expira en 1 hora = 3600 seg) del bucket privado 'downloads'
      const { data: signedData, error: signErr } = await supabase.storage
        .from("downloads")
        .createSignedUrl(product.file_path, 3600);

      if (!signErr && signedData) {
        deliveryUrl = signedData.signedUrl;
      }
    }

    // Incrementar contador de descargas
    await supabase
      .from("orders")
      .update({ download_count: order.download_count + 1 })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        status: "approved",
        product_title: order.product_title,
        kind,
        url: deliveryUrl,
        expires_in: 3600,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

