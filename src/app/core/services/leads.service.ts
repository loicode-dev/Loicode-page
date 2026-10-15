import { inject, Injectable } from '@angular/core';
import { MOCK_LEADS } from '../data/mock-data';
import { Lead, LeadInput, LeadStatus } from '../models/content.model';
import { LocalCollection, nowIso } from './local-collection';
import { SupabaseService } from './supabase.service';

/** Solicitudes de cotización para servicios "a la medida" (tabla `leads`). */
@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly sb = inject(SupabaseService);
  private readonly local = new LocalCollection<Lead>('loicode.leads', () => structuredClone(MOCK_LEADS));

  /** Público: cualquiera puede enviar una solicitud (RLS: insert para anon). */
  async create(input: LeadInput): Promise<void> {
    if (this.sb.client) {
      // Sin .select(): el visitante no tiene permiso de leer la tabla.
      const { error } = await this.sb.client.from('leads').insert(input);
      if (error) throw error;
      return;
    }
    this.local.insert({ ...input, status: 'nuevo', created_at: nowIso() });
  }

  async adminList(): Promise<Lead[]> {
    if (this.sb.client) {
      const { data, error } = await this.sb.client.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Lead[];
    }
    return this.local.all().sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async setStatus(id: string, status: LeadStatus): Promise<void> {
    if (this.sb.client) {
      const { error } = await this.sb.client.from('leads').update({ status }).eq('id', id);
      if (error) throw error;
      return;
    }
    this.local.update(id, { status });
  }

  async remove(id: string): Promise<void> {
    if (this.sb.client) {
      const { error } = await this.sb.client.from('leads').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    this.local.remove(id);
  }
}

