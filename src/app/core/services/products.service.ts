import { inject, Injectable } from '@angular/core';
import { MOCK_PRODUCTS } from '../data/mock-data';
import { isFree, Product, ProductCategory, ProductInput } from '../models/product.model';
import { LocalCollection, nowIso } from './local-collection';
import { SupabaseService } from './supabase.service';

export interface ProductFilter {
  category?: ProductCategory;
  /** true = solo recursos gratuitos · false = solo servicios (de pago o a la medida) */
  free?: boolean;
  featured?: boolean;
}

/** Productos / servicios / recursos gratuitos (tabla `products`). */
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly sb = inject(SupabaseService);
  private readonly local = new LocalCollection<Product>('loicode.products', () => structuredClone(MOCK_PRODUCTS));

  /** Catálogo público (solo publicados). */
  async list(filter: ProductFilter = {}): Promise<Product[]> {
    let items: Product[];
    if (this.sb.client) {
      const { data, error } = await this.sb.client
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      items = (data ?? []) as Product[];
    } else {
      items = this.local
        .all()
        .filter((p) => p.is_published)
        .sort((a, b) => a.sort_order - b.sort_order);
    }
    return applyFilter(items, filter);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    if (this.sb.client) {
      const { data, error } = await this.sb.client
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return (data as Product) ?? null;
    }
    return this.local.find((p) => p.slug === slug && p.is_published) ?? null;
  }

  // ───────────────────────── ADMIN ─────────────────────────

  async adminList(filter: ProductFilter = {}): Promise<Product[]> {
    let items: Product[];
    if (this.sb.client) {
      const { data, error } = await this.sb.client
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      items = (data ?? []) as Product[];
    } else {
      items = this.local.all().sort((a, b) => a.sort_order - b.sort_order);
    }
    return applyFilter(items, filter);
  }

  async adminGet(id: string): Promise<Product | null> {
    if (this.sb.client) {
      const { data, error } = await this.sb.client.from('products').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return (data as Product) ?? null;
    }
    return this.local.find((p) => p.id === id) ?? null;
  }

  async save(input: ProductInput, id?: string): Promise<Product> {
    const payload = normalize(input);
    if (this.sb.client) {
      const query = id
        ? this.sb.client.from('products').update(payload).eq('id', id)
        : this.sb.client.from('products').insert(payload);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Product;
    }
    if (this.local.find((p) => p.slug === payload.slug && p.id !== id)) {
      throw new Error('Ya existe un producto con ese slug.');
    }
    return id
      ? this.local.update(id, { ...payload, updated_at: nowIso() })
      : this.local.insert({ ...payload, created_at: nowIso(), updated_at: nowIso() });
  }

  async remove(id: string): Promise<void> {
    if (this.sb.client) {
      const { error } = await this.sb.client.from('products').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    this.local.remove(id);
  }
}

function applyFilter(items: Product[], f: ProductFilter): Product[] {
  return items.filter(
    (p) =>
      (f.category === undefined || p.category === f.category) &&
      (f.free === undefined || isFree(p) === f.free) &&
      (f.featured === undefined || p.is_featured === f.featured),
  );
}

function normalize(input: ProductInput): ProductInput {
  const price = input.price === null || (input.price as unknown) === '' ? null : Number(input.price);
  return {
    ...input,
    price: input.kind === 'custom' || (price !== null && price > 0) ? price : null,
    sort_order: Number(input.sort_order) || 0,
    demo_url: input.demo_url || null,
    external_url: input.external_url || null,
    file_url: input.file_url || null,
    file_path: input.file_path || null,
    cover_url: input.cover_url || null,
  };
}

