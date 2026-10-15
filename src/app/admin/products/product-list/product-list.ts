import { Component, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { isFree, Product } from '../../../core/models/product.model';
import { ProductsService } from '../../../core/services/products.service';
import { PricePipe } from '../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-admin-product-list',
  imports: [RouterLink, PricePipe],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h3 font-outfit text-navy mb-1">{{ isFreeList() ? 'Recursos Gratuitos' : 'Productos & Servicios' }}</h1>
        <p class="text-muted-brand mb-0">
          {{ isFreeList() ? 'Gestiona los productos sin precio (recursos y plantillas gratis).' : 'Gestiona los servicios a la medida y productos prefabricados de pago.' }}
        </p>
      </div>
      <a routerLink="/admin/productos/nuevo" [queryParams]="isFreeList() ? { gratis: '1' } : {}" class="btn btn-brand">
        <i class="bi bi-plus-lg me-1"></i> {{ isFreeList() ? 'Nuevo Recurso Gratuito' : 'Nuevo Producto / Servicio' }}
      </a>
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
                <th>Producto / Título</th>
                <th>Categoría</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (p of items(); track p.id) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      @if (p.cover_url) {
                        <img [src]="p.cover_url" class="rounded-2" style="width: 44px; height: 44px; object-fit: cover;" />
                      } @else {
                        <div class="rounded-2 cover-placeholder" style="width: 44px; height: 44px; font-size: 1.2rem;">
                          <i class="bi bi-box-seam"></i>
                        </div>
                      }
                      <div>
                        <strong>{{ p.title }}</strong>
                        <div class="small text-muted-brand">{{ p.slug }}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge text-bg-light text-uppercase">{{ p.category }}</span></td>
                  <td>
                    @if (p.kind === 'custom') {
                      <span class="badge bg-secondary">A la medida</span>
                    } @else if (p.kind === 'webapp') {
                      <span class="badge bg-info text-dark">App Web</span>
                    } @else {
                      <span class="badge bg-primary">Descargable</span>
                    }
                  </td>
                  <td><strong>{{ p | price }}</strong></td>
                  <td>
                    @if (p.is_published) {
                      <span class="badge bg-success-subtle text-success">Publicado</span>
                    } @else {
                      <span class="badge bg-secondary-subtle text-secondary">Borrador</span>
                    }
                  </td>
                  <td class="text-end">
                    <a [routerLink]="['/admin/productos', p.id]" class="btn btn-sm btn-outline-brand me-2" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-danger" (click)="onDelete(p)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-4 text-muted-brand">No hay elementos registrados en esta sección.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class ProductList {
  private readonly route = inject(ActivatedRoute);
  private readonly productsSvc = inject(ProductsService);

  protected readonly isFreeList = signal(false);
  protected readonly items = signal<Product[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.route.data.subscribe((d) => {
      this.isFreeList.set(!!d['free']);
      this.load();
    });
  }

  async load() {
    this.loading.set(true);
    try {
      const all = await this.productsSvc.adminList();
      const filtered = all.filter((p) => (this.isFreeList() ? isFree(p) : !isFree(p)));
      this.items.set(filtered);
    } finally {
      this.loading.set(false);
    }
  }

  async onDelete(p: Product) {
    if (!confirm(`¿Estás seguro de eliminar "${p.title}"?`)) return;
    try {
      await this.productsSvc.remove(p.id);
      await this.load();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  }
}

