import { inject, Injectable } from '@angular/core';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { MOCK_ORDERS } from '../data/mock-data';
import { DownloadInfo, Order } from '../models/content.model';
import { isFree, Product } from '../models/product.model';
import { LocalCollection, nowIso } from './local-collection';
import { ProductsService } from './products.service';
import { SupabaseService } from './supabase.service';

/**
 * Flujo de compra con Mercado Pago:
 *
 *  1. `startCheckout()` → Edge Function `create-preference`
 *     - crea el pedido (orders.status = pending)
 *     - crea la preferencia en Mercado Pago y devuelve `init_point`
 *  2. El cliente paga en Mercado Pago (tarjeta, OXXO, SPEI…)
 *  3. Mercado Pago avisa a la Edge Function `mp-webhook` → orders.status = approved
 *  4. Mercado Pago regresa al cliente a /descarga/:orderId
 *  5. `getDownload()` → Edge Function `get-download` valida el pago y entrega
 *     una URL firmada temporal (bucket privado) o el enlace de la app web.
 */
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly sb = inject(SupabaseService);
  private readonly products = inject(ProductsService);
  private readonly local = new LocalCollection<Order>('loicode.orders', () => structuredClone(MOCK_ORDERS));

  /** Devuelve la URL a la que hay que mandar al cliente (Mercado Pago o, en demo, la página de descarga). */
  async startCheckout(product: Product, buyer: { email: string; name: string }): Promise<string> {
    if (isFree(product) || product.kind === 'custom') throw new Error('Este producto no requiere pago.');

    if (this.sb.client) {
      const { data, error } = await this.sb.client.functions.invoke<{ init_point: string; order_id: string }>(
        'create-preference',
        { body: { product_id: product.id, email: buyer.email, name: buyer.name } },
      );
      if (error) throw new Error(await functionErrorMessage(error));
      if (!data?.init_point) throw new Error('No se pudo iniciar el pago.');
      return data.init_point;
    }

    // MODO DEMO: simulamos un pago aprobado
    const order = this.local.insert({
      product_id: product.id,
      product_title: product.title,
      email: buyer.email,
      name: buyer.name,
      amount: Number(product.price),
      currency: product.currency,
      status: 'approved',
      mp_preference_id: 'demo',
      mp_payment_id: 'demo-' + Date.now(),
      download_count: 0,
      paid_at: nowIso(),
      created_at: nowIso(),
    });
    return `/descarga/${order.id}?status=approved&demo=1`;
  }

  /** Verifica el pedido y obtiene el enlace de descarga / acceso. */
  async getDownload(orderId: string, paymentId?: string | null): Promise<DownloadInfo> {
    if (this.sb.client) {
      const { data, error } = await this.sb.client.functions.invoke<DownloadInfo>('get-download', {
        body: { order_id: orderId, payment_id: paymentId ?? null },
      });
      if (error) throw new Error(await functionErrorMessage(error));
      return data as DownloadInfo;
    }

    const order = this.local.find((o) => o.id === orderId);
    if (!order) throw new Error('Pedido no encontrado.');
    const product = await this.products.adminGet(order.product_id);
    const kind = product?.kind === 'webapp' ? 'webapp' : 'download';
    if (order.status !== 'approved') {
      return { status: order.status, product_title: order.product_title, kind, url: null };
    }
    this.local.update(order.id, { download_count: order.download_count + 1 });
    return {
      status: 'approved',
      product_title: order.product_title,
      kind,
      url: kind === 'webapp' ? (product?.external_url ?? null) : 'assets/demo/compra-demo.txt',
      expires_in: 3600,
      message: 'Modo demo: este es un archivo de ejemplo.',
    };
  }

  // ───────────────────────── ADMIN ─────────────────────────

  async adminList(): Promise<Order[]> {
    if (this.sb.client) {
      const { data, error } = await this.sb.client.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    }
    return this.local.all().sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

async function functionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      return body?.error ?? body?.message ?? error.message;
    } catch {
      return error.message;
    }
  }
  return error instanceof Error ? error.message : 'Error inesperado';
}

