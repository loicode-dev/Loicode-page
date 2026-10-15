import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Envoltura del cliente de Supabase.
 * Si no hay credenciales en `environment.ts` el sitio entra en MODO DEMO (`isDemo = true`).
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient | null;
  readonly isDemo: boolean;

  constructor() {
    const { supabaseUrl, supabaseAnonKey } = environment;
    this.isDemo = !supabaseUrl || !supabaseAnonKey;
    this.client = this.isDemo
      ? null
      : createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // Evita el error "NavigatorLockAcquireTimeoutError" que aparece en algunos navegadores con SPAs.
            lock: async (_name, _timeout, fn) => fn(),
          },
        });

    if (this.isDemo) {
      console.info(
        '%cLOI CODE · MODO DEMO%c Configura Supabase en src/environments/environment.ts',
        'background:#ffd60a;color:#0a1440;padding:2px 6px;border-radius:4px;font-weight:bold',
        '',
      );
    }
  }

  /** Cliente garantizado (lanza error si se usa en modo demo). */
  get db(): SupabaseClient {
    if (!this.client) throw new Error('Supabase no está configurado (modo demo).');
    return this.client;
  }

  /**
   * Sube un archivo a Storage y devuelve su ruta (y la URL pública si el bucket es público).
   * En modo demo devuelve un Data URL para poder previsualizar imágenes.
   */
  async upload(bucket: string, file: File, folder = ''): Promise<{ path: string; publicUrl: string }> {
    const safeName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .toLowerCase();
    const path = `${folder ? folder + '/' : ''}${Date.now()}-${safeName}`;

    if (!this.client) {
      const publicUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      return { path, publicUrl };
    }

    const { error } = await this.client.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  }
}

