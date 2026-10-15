import { Component, computed, inject, signal } from '@angular/core';
import { CATEGORY_INFO, Product, ProductCategory } from '../../core/models/product.model';
import { ProductsService } from '../../core/services/products.service';
import { AsyncData } from '../../shared/async-data';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { EmptyState, SkeletonGrid } from '../../shared/components/states/states';

/**
 * /recursos → Catálogo de Recursos Gratuitos
 * Regla: "cuando un producto no tiene precio (precio null o 0 y no es a la medida), es un recurso gratuito".
 */
@Component({
  selector: 'app-resources',
  imports: [PageHero, ProductCard, SkeletonGrid, EmptyState],
  template: `
    <app-page-hero
      title="Recursos Gratuitos"
      eyebrow="Descargas & Apps Libres"
      subtitle="Plantillas, herramientas, guías y utilidades digitales sin costo para impulsar tus proyectos y eventos."
      [crumbs]="[{ label: 'Recursos Gratuitos' }]"
    />

    <section class="section">
      <div class="container">
        <!-- Filtro por categoría original del recurso -->
        <div class="d-flex flex-wrap gap-2 justify-content-center mb-5">
          <button class="btn" [class.btn-brand]="!categoryFilter()" [class.btn-outline-brand]="categoryFilter()" (click)="categoryFilter.set(null)">
            Todos
          </button>
          @for (c of categories; track c.key) {
            <button class="btn" [class.btn-brand]="categoryFilter() === c.key" [class.btn-outline-brand]="categoryFilter() !== c.key" (click)="categoryFilter.set(c.key)">
              <i class="bi {{ c.icon }} me-1"></i>{{ c.label }}
            </button>
          }
        </div>

        @if (data.loading()) {
          <app-skeleton-grid [count]="3" />
        } @else if (data.error()) {
          <app-empty-state icon="bi-exclamation-triangle" title="No se pudieron cargar los recursos" [message]="data.error()!" />
        } @else {
          <div class="row g-4">
            @for (p of visible(); track p.id) {
              <div class="col-md-6 col-lg-4"><app-product-card [product]="p" /></div>
            } @empty {
              <app-empty-state icon="bi-gift" title="Pronto añadiremos más recursos gratuitos" message="Estamos preparando nuevas herramientas y plantillas." />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class Resources {
  private readonly productsSvc = inject(ProductsService);

  protected readonly categories = Object.entries(CATEGORY_INFO).map(([key, v]) => ({ key: key as ProductCategory, ...v }));
  protected readonly categoryFilter = signal<ProductCategory | null>(null);
  protected readonly data = new AsyncData<Product[]>();

  protected readonly visible = computed(() => {
    const list = this.data.value() ?? [];
    const cat = this.categoryFilter();
    return cat ? list.filter((p) => p.category === cat) : list;
  });

  constructor() {
    // Solicitamos únicamente productos gratuitos (free: true)
    this.data.run(() => this.productsSvc.list({ free: true }));
  }
}

