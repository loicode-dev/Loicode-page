import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { XvInvitation } from '../models/content.model';

/** Ruta pública (carpeta public/invitaciones/misXV) donde viven las invitaciones de XV */
export const XV_BASE = 'invitaciones/misXV';

/**
 * Lee el índice `public/invitaciones/misXV/invitaciones.json`.
 * Para publicar una nueva invitación: copia la carpeta `_plantilla`, edítala
 * y agrega su entrada al JSON (ver public/invitaciones/misXV/LEEME.md).
 */
@Injectable({ providedIn: 'root' })
export class XvService {
  private readonly http = inject(HttpClient);

  async list(): Promise<XvInvitation[]> {
    const items = await firstValueFrom(this.http.get<XvInvitation[]>(`${XV_BASE}/invitaciones.json`));
    return items.filter((i) => !i.slug.startsWith('_'));
  }

  url(inv: XvInvitation): string {
    return `/${XV_BASE}/${inv.slug}/index.html`;
  }

  cover(inv: XvInvitation): string {
    return inv.cover?.startsWith('http') ? inv.cover : `${XV_BASE}/${inv.slug}/${inv.cover}`;
  }
}

