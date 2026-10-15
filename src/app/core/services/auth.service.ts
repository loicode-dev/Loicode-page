import { computed, inject, Injectable, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

const DEMO_KEY = 'loicode.demo-admin';
export const DEMO_CREDENTIALS = { email: 'admin@demo.com', password: 'demo1234' };

/** Autenticación del panel de administración (Supabase Auth + tabla admin_users). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sb = inject(SupabaseService);

  private readonly _session = signal<Session | null>(null);
  private readonly _demoEmail = signal<string | null>(sessionStorage.getItem(DEMO_KEY));
  private adminCache: { userId: string; value: boolean } | null = null;
  private readonly ready: Promise<void>;

  readonly email = computed(() => this._session()?.user.email ?? this._demoEmail());
  readonly isLoggedIn = computed(() => !!this.email());

  constructor() {
    const client = this.sb.client;
    if (!client) {
      this.ready = Promise.resolve();
      return;
    }
    this.ready = client.auth.getSession().then(({ data }) => this._session.set(data.session));
    client.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      if (!session) this.adminCache = null;
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!this.sb.client) {
      if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
        throw new Error(`Modo demo: usa ${DEMO_CREDENTIALS.email} / ${DEMO_CREDENTIALS.password}`);
      }
      sessionStorage.setItem(DEMO_KEY, email);
      this._demoEmail.set(email);
      return;
    }
    const { data, error } = await this.sb.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : error.message);
    this._session.set(data.session);
    if (!(await this.isAdmin())) {
      await this.signOut();
      throw new Error('Tu usuario no tiene permisos de administrador.');
    }
  }

  async signOut(): Promise<void> {
    sessionStorage.removeItem(DEMO_KEY);
    this._demoEmail.set(null);
    this.adminCache = null;
    await this.sb.client?.auth.signOut();
    this._session.set(null);
  }

  /** ¿El usuario actual es administrador? (función SQL `is_admin()`) */
  async isAdmin(): Promise<boolean> {
    await this.ready;
    if (!this.sb.client) return !!this._demoEmail();
    const user = this._session()?.user;
    if (!user) return false;
    if (this.adminCache?.userId === user.id) return this.adminCache.value;
    const { data, error } = await this.sb.client.rpc('is_admin');
    const value = !error && data === true;
    this.adminCache = { userId: user.id, value };
    return value;
  }
}

