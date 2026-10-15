import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ORDER_STATUS_LABEL, Order } from '../../core/models/content.model';
import { CheckoutService } from '../../core/services/checkout.service';

@Component({
  selector: 'app-admin-orders',
  imports: [DatePipe],
  template: `
    <div class="mb-4">
      <h1 class="h3 font-outfit text-navy mb-1">Pedidos de Mercado Pago</h1>
      <p class="text-muted-brand mb-0">Órdenes de compra de software prefabricado, plantillas y acceso a apps web.</p>
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
                <th>ID Pedido</th>
                <th>Producto</th>
                <th>Comprador</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Descargas</th>
                <th>Fecha de Pago</th>
              </tr>
            </thead>
            <tbody>
              @for (o of orders(); track o.id) {
                <tr>
                  <td><code class="small">{{ o.id }}</code></td>
                  <td><strong>{{ o.product_title }}</strong></td>
                  <td>
                    <div>{{ o.name || 'Cliente' }}</div>
                    <div class="small text-muted-brand">{{ o.email }}</div>
                  </td>
                  <td><strong>$ {{ o.amount }} {{ o.currency }}</strong></td>
                  <td>
                    @if (o.status === 'approved') {
                      <span class="badge bg-success-subtle text-success">Aprobado</span>
                    } @else if (o.status === 'pending') {
                      <span class="badge bg-warning-subtle text-warning">Pendiente</span>
                    } @else {
                      <span class="badge bg-danger-subtle text-danger">{{ o.status }}</span>
                    }
                  </td>
                  <td><span class="badge rounded-pill text-bg-light">{{ o.download_count }} descargas</span></td>
                  <td class="small text-muted-brand">{{ (o.paid_at || o.created_at) | date: 'short' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-4 text-muted-brand">No hay pedidos registrados todavía.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class Orders {
  private readonly checkoutSvc = inject(CheckoutService);
  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);
  protected readonly statusLabels = ORDER_STATUS_LABEL;

  constructor() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const data = await this.checkoutSvc.adminList();
      this.orders.set(data);
    } finally {
      this.loading.set(false);
    }
  }
}
