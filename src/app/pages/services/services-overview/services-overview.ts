import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORY_INFO, Product, ProductCategory } from '../../../core/models/product.model';
import { ProductsService } from '../../../core/services/products.service';
import { AsyncData } from '../../../shared/async-data';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { EmptyState, SkeletonGrid } from '../../../shared/components/states/states';

/** /servicios → catálogo completo con filtro por categoría */
@Component({
  selector: 'app-services-overview',
  imports: [RouterLink, PageHero, ProductCard, SkeletonGrid, EmptyState],
  template: `
    <app-page-hero
      title="Servicios"
      eyebrow="Tienda"
      subtitle="Servicios a la medida, plantillas y apps listas para usar. Elige, cotiza o compra en minutos."
      [crumbs]="[{ label: 'Servicios' }]"
    />

    <section class="section">
      <div class="container">
        <div class="d-flex flex-wrap gap-2 justify-content-center mb-5">
          <button class="btn" [class.btn-brand]="!filter()" [class.btn-outline-brand]="filter()" (click)="filter.set(null)">Todos</button>
          @for (c of categories; track c.key) {
            <button class="btn" [class.btn-brand]="filter() === c.key" [class.btn-outline-brand]="filter() !== c.key" (click)="filter.set(c.key)">
              <i class="bi {{ c.icon }} me-1"></i>{{ c.label }}
            </button>
          }
        </div>

        @if (data.loading()) {
          <app-skeleton-grid [count]="6" />
        } @else if (data.error()) {
          <app-empty-state icon="bi-exclamation-triangle" title="No pudimos cargar el catálogo" [message]="data.error()!" />
        } @else {
          <div class="row g-4">
            @for (p of visible(); track p.id) {
              <div class="col-md-6 col-lg-4"><app-product-card [product]="p" /></div>
            } @empty {
              <app-empty-state title="Aún no hay productos en esta categoría" />
            }
          </div>
        }

        @if (filter(); as f) {
          <div class="text-center mt-5">
            <a [routerLink]="info[f].route" class="btn btn-outline-brand">Ir a la página de {{ info[f].label }}</a>
          </div>
        }
      </div>
    </section>
  `,
})
export class ServicesOverview {
  protected readonly info = CATEGORY_INFO;
  protected readonly categories = Object.entries(CATEGORY_INFO).map(([key, v]) => ({ key: key as ProductCategory, ...v }));
  protected readonly filter = signal<ProductCategory | null>(null);
  protected readonly data = new AsyncData<Product[]>();
  protected readonly visible = computed(() =>
    (this.data.value() ?? []).filter((p) => !this.filter() || p.category === this.filter()),
  );

  constructor() {
    this.data.run(() => inject(ProductsService).list({ free: false }));
  }
}

