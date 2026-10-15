import { inject, Injectable } from '@angular/core';
import { MOCK_POSTS } from '../data/mock-data';
import { Post, PostInput } from '../models/content.model';
import { LocalCollection, nowIso } from './local-collection';
import { SupabaseService } from './supabase.service';

/** Blog (tabla `posts` en Supabase). */
@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly sb = inject(SupabaseService);
  private readonly local = new LocalCollection<Post>('loicode.posts', () => structuredClone(MOCK_POSTS));

  async list(tag?: string): Promise<Post[]> {
    let items: Post[];
    if (this.sb.client) {
      let q = this.sb.client
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (tag) q = q.contains('tags', [tag]);
      const { data, error } = await q;
      if (error) throw error;
      items = (data ?? []) as Post[];
    } else {
      items = this.local
        .all()
        .filter((p) => p.is_published && (!tag || p.tags.includes(tag)))
        .sort(byDateDesc);
    }
    return items;
  }

  async getBySlug(slug: string): Promise<Post | null> {
    if (this.sb.client) {
      const { data, error } = await this.sb.client
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return (data as Post) ?? null;
    }
    return this.local.find((p) => p.slug === slug && p.is_published) ?? null;
  }

  // ───────────────────────── ADMIN ─────────────────────────

  async adminList(): Promise<Post[]> {
    if (this.sb.client) {
      const { data, error } = await this.sb.client.from('posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Post[];
    }
    return this.local.all().sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async adminGet(id: string): Promise<Post | null> {
    if (this.sb.client) {
      const { data, error } = await this.sb.client.from('posts').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return (data as Post) ?? null;
    }
    return this.local.find((p) => p.id === id) ?? null;
  }

  async save(input: PostInput, id?: string): Promise<Post> {
    const payload: PostInput = {
      ...input,
      cover_url: input.cover_url || null,
      // Si se publica por primera vez, fija la fecha de publicación
      published_at: input.is_published ? input.published_at || nowIso() : input.published_at,
    };
    if (this.sb.client) {
      const query = id
        ? this.sb.client.from('posts').update(payload).eq('id', id)
        : this.sb.client.from('posts').insert(payload);
      const { data, error } = await query.select().single();
      if (error) throw error;
      return data as Post;
    }
    if (this.local.find((p) => p.slug === payload.slug && p.id !== id)) {
      throw new Error('Ya existe un post con ese slug.');
    }
    return id
      ? this.local.update(id, { ...payload, updated_at: nowIso() })
      : this.local.insert({ ...payload, created_at: nowIso(), updated_at: nowIso() });
  }

  async remove(id: string): Promise<void> {
    if (this.sb.client) {
      const { error } = await this.sb.client.from('posts').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    this.local.remove(id);
  }
}

function byDateDesc(a: Post, b: Post) {
  return (b.published_at ?? b.created_at).localeCompare(a.published_at ?? a.created_at);
}

