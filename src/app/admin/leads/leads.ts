import { DatePipe, KeyValuePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LEAD_STATUS_LABEL, Lead, LeadStatus } from '../../core/models/content.model';
import { LeadsService } from '../../core/services/leads.service';

@Component({
  selector: 'app-admin-leads',
  imports: [DatePipe, KeyValuePipe],
  template: `
    <div class="mb-4">
      <h1 class="h3 font-outfit text-navy mb-1">Solicitudes de Cotización</h1>
      <p class="text-muted-brand mb-0">Clientes que llenaron el formulario para proyectos y servicios a la medida.</p>
    </div>

    @if (loading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-navy"></div>
      </div>
    } @else {
      <div class="card card-soft overflow-hidden">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Cliente</th>
                <th>Servicio / Producto</th>
                <th>Contacto</th>
                <th>Mensaje / Requerimientos</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (l of leads(); track l.id) {
                <tr>
                  <td>
                    <strong>{{ l.name }}</strong>
                    @if (l.budget) {
                      <div class="small text-muted-brand">Presupuesto: {{ l.budget }}</div>
                    }
                  </td>
                  <td>
                    <span class="badge text-bg-light text-uppercase mb-1">{{ l.service }}</span>
                    @if (l.product_title) {
                      <div class="small fw-semibold text-navy">{{ l.product_title }}</div>
                    }
                  </td>
                  <td>
                    @if (l.phone) {
                      <div><a [href]="'https://wa.me/' + l.phone" target="_blank" rel="noopener" class="text-success text-decoration-none"><i class="bi bi-whatsapp me-1"></i>{{ l.phone }}</a></div>
                    }
                    <div class="small text-muted-brand">{{ l.email }}</div>
                  </td>
                  <td style="max-width: 300px;">
                    <div class="small mb-1">{{ l.message }}</div>
                    @if (l.extra && (l.extra | keyvalue)?.length) {
                      <div class="badge text-bg-warning-subtle text-dark text-wrap text-start">
                        @for (e of (l.extra | keyvalue); track e.key) {
                          <div><strong>{{ e.key }}:</strong> {{ e.value }}</div>
                        }
                      </div>
                    }
                  </td>
                  <td>
                    <select class="form-select form-select-sm" [value]="l.status" (change)="onChangeStatus(l, $event)">
                      <option value="nuevo">Nuevo</option>
                      <option value="contactado">Contactado</option>
                      <option value="en_proceso">En proceso</option>
                      <option value="cerrado">Cerrado</option>
                      <option value="descartado">Descartado</option>
                    </select>
                  </td>
                  <td class="small text-muted-brand">{{ l.created_at | date: 'shortDate' }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" (click)="onDelete(l)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-4 text-muted-brand">No hay solicitudes registradas aún.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class Leads {
  private readonly leadsSvc = inject(LeadsService);
  protected readonly leads = signal<Lead[]>([]);
  protected readonly loading = signal(true);
  protected readonly statusLabels = LEAD_STATUS_LABEL;

  constructor() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const data = await this.leadsSvc.adminList();
      this.leads.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async onChangeStatus(l: Lead, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value as LeadStatus;
    try {
      await this.leadsSvc.setStatus(l.id, newStatus);
      l.status = newStatus;
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    }
  }

  async onDelete(l: Lead) {
    if (!confirm(`¿Eliminar solicitud de "${l.name}"?`)) return;
    try {
      await this.leadsSvc.remove(l.id);
      await this.load();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  }
}
