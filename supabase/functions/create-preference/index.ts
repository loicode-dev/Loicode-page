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
    const { product_id, email, name } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obtener información del producto
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (prodErr || !product) {
      throw new Error("Producto no encontrado.");
    }

    if (!product.price || Number(product.price) <= 0) {
      throw new Error("El producto es gratuito o a la medida.");
    }

    // Crear orden pendiente
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        product_id: product.id,
        product_title: product.title,
        email: email,
        name: name,
        amount: Number(product.price),
        currency: product.currency || "MXN",
        status: "pending",
      })
      .select()
      .single();

    if (orderErr || !order) {
      throw new Error("No se pudo registrar la orden.");
    }

    const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://loicode.com";

    // Crear preferencia en Mercado Pago
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: product.id,
            title: product.title,
            description: product.short_description,
            unit_price: Number(product.price),
            currency_id: product.currency || "MXN",
            quantity: 1,
          },
        ],
        payer: {
          name: name,
          email: email,
        },
        external_reference: order.id,
        back_urls: {
          success: `${SITE_URL}/descarga/${order.id}`,
          pending: `${SITE_URL}/descarga/${order.id}`,
          failure: `${SITE_URL}/descarga/${order.id}`,
        },
        auto_return: "approved",
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mp-webhook`,
      }),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      throw new Error(mpData.message || "Error al crear preferencia con Mercado Pago");
    }

    // Actualizar orden con preference_id
    await supabase
      .from("orders")
      .update({ mp_preference_id: mpData.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        init_point: mpData.init_point,
        order_id: order.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

