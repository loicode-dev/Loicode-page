import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ACTION_LABEL, CATEGORY_INFO, isFree, Product, productAction } from '../../../core/models/product.model';
import { ProductActionsService, productLink } from '../../../core/services/product-actions.service';
import { PricePipe } from '../../pipes/price.pipe';

/** Tarjeta de producto para los catálogos (servicios y recursos). */
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, PricePipe],
  template: `
    @let p = product();
    <article class="card card-soft hover-lift h-100 overflow-hidden fade-in">
      <a [routerLink]="link()" class="cover-wrap">
        @if (p.cover_url) {
          <img [src]="p.cover_url" [alt]="p.title" class="ratio-cover" loading="lazy" />
        } @else {
          <div class="ratio-cover cover-placeholder"><i class="bi {{ category().icon }}"></i></div>
        }
        <div class="badges">
          @if (free()) {
            <span class="badge badge-free"><i class="bi bi-gift me-1"></i>Gratis</span>
          } @else if (p.kind === 'custom') {
            <span class="badge bg-white text-navy"><i class="bi bi-rulers me-1"></i>A la medida</span>
          } @else {
            <span class="badge bg-white text-navy"><i class="bi bi-box-seam me-1"></i>{{ p.kind === 'webapp' ? 'App web' : 'Descargable' }}</span>
          }
          @if (p.is_featured) {
            <span class="badge badge-accent"><i class="bi bi-star-fill me-1"></i>Destacado</span>
          }
        </div>
      </a>
      <div class="card-body d-flex flex-column p-4">
        <small class="text-muted-brand mb-1"><i class="bi {{ category().icon }} me-1"></i>{{ category().label }}</small>
        <h3 class="h5 mb-2">
          <a [routerLink]="link()" class="stretched-title text-decoration-none text-navy">{{ p.title }}</a>
        </h3>
        <p class="text-muted-brand small line-clamp-3 mb-3">{{ p.short_description }}</p>
        <div class="mt-auto d-flex align-items-center justify-content-between gap-2">
          <span class="price" [class.text-success]="free()">{{ p | price }}</span>
          <div class="d-flex gap-2">
            <a [routerLink]="link()" class="btn btn-sm btn-outline-brand">Ver más</a>
            <button type="button" class="btn btn-sm btn-brand" (click)="actions.run(p)" [title]="action().label">
              <i class="bi {{ action().icon }}"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: `
    .cover-wrap { position: relative; display: block; overflow: hidden; }
    .cover-wrap img, .cover-wrap .cover-placeholder { transition: transform .5s ease; }
    article:hover .cover-wrap img, article:hover .cover-placeholder { transform: scale(1.05); }
    .badges { position: absolute; top: .75rem; left: .75rem; display: flex; gap: .4rem; flex-wrap: wrap; }
    .badge { font-weight: 600; padding: .45em .75em; border-radius: 999px; }
    .price { font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--brand-navy); font-size: 1.05rem; }
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();
  protected readonly actions = inject(ProductActionsService);
  protected readonly free = computed(() => isFree(this.product()));
  protected readonly link = computed(() => productLink(this.product()));
  protected readonly category = computed(() => CATEGORY_INFO[this.product().category]);
  protected readonly action = computed(() => ACTION_LABEL[productAction(this.product())]);
}

