import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { XvInvitation } from '../../../core/models/content.model';
import { CATEGORY_BY_SLUG, CATEGORY_INFO, Product } from '../../../core/models/product.model';
import { ProductsService } from '../../../core/services/products.service';
import { XvService } from '../../../core/services/xv.service';
import { AsyncData } from '../../../shared/async-data';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { EmptyState, SkeletonGrid } from '../../../shared/components/states/states';

type KindFilter = 'all' | 'custom' | 'ready';

/** /servicios/:category → Desarrollo Web · Invitaciones · Apps */
@Component({
  selector: 'app-service-category',
  imports: [RouterLink, PageHero, ProductCard, SkeletonGrid, EmptyState],
  template: `
    @if (info(); as c) {
      <app-page-hero [title]="c.title" eyebrow="Servicios" [subtitle]="c.subtitle" [crumbs]="[{ label: 'Servicios', link: '/servicios' }, { label: c.label }]" />

      @if (c.banner) {
        <div class="container mt-n4 position-relative" style="z-index: 2; margin-top: -2rem">
          <img [src]="c.banner" [alt]="c.title" class="w-100 rounded-4 shadow" />
        </div>
      }

      <section class="section">
        <div class="container">
          <div class="d-flex flex-wrap gap-2 justify-content-center mb-5">
            @for (t of tabs; track t.key) {
              <button class="btn" [class.btn-brand]="kind() === t.key" [class.btn-outline-brand]="kind() !== t.key" (click)="kind.set(t.key)">
                <i class="bi {{ t.icon }} me-1"></i>{{ t.label }}
              </button>
            }
          </div>

          @if (data.loading()) {
            <app-skeleton-grid [count]="3" />
          } @else if (data.error()) {
            <app-empty-state icon="bi-exclamation-triangle" title="No pudimos cargar los servicios" [message]="data.error()!" />
          } @else {
            <div class="row g-4">
              @for (p of visible(); track p.id) {
                <div class="col-md-6 col-lg-4"><app-product-card [product]="p" /></div>
              } @empty {
                <app-empty-state title="Pronto agregaremos más opciones aquí" message="¿Buscas algo específico? Cuéntanos tu idea.">
                  <a routerLink="/cotizar" [queryParams]="{ servicio: categoryKey() }" class="btn btn-brand">Cotizar</a>
                </app-empty-state>
              }
            </div>
          }
        </div>
      </section>

      <!-- Portafolio de XV (solo en Invitaciones) -->
      @if (categoryKey() === 'invitaciones' && xv.value()?.length) {
        <section class="section bg-white">
          <div class="container">
            <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
              <div>
                <span class="eyebrow">Mis XV</span>
                <h2 class="section-title mb-0">Invitaciones que hemos creado</h2>
              </div>
              <a routerLink="/mis-xv" class="btn btn-outline-brand">Ver portafolio</a>
            </div>
            <div class="row g-3">
              @for (inv of xv.value(); track inv.slug) {
                <div class="col-6 col-md-3">
                  <a [href]="xvSvc.url(inv)" target="_blank" rel="noopener" class="d-block card card-soft overflow-hidden hover-lift text-decoration-none">
                    <img [src]="xvSvc.cover(inv)" [alt]="inv.name" class="w-100 object-cover" style="aspect-ratio: 3/4" loading="lazy" />
                    <div class="p-3"><strong class="text-navy">XV {{ inv.name }}</strong><br /><small class="text-muted-brand">{{ inv.theme }}</small></div>
                  </a>
                </div>
              }
            </div>
          </div>
        </section>
      }

      <section class="section-sm">
        <div class="container text-center">
          <h2 class="h3">¿No encuentras lo que buscas?</h2>
          <p class="text-muted-brand">Desarrollamos {{ c.label.toLowerCase() }} totalmente a la medida.</p>
          <a routerLink="/cotizar" [queryParams]="{ servicio: categoryKey() }" class="btn btn-accent btn-lg">Solicitar cotización</a>
        </div>
      </section>
    } @else {
      <app-empty-state icon="bi-signpost-split" title="Categoría no encontrada" message="La categoría que buscas no existe.">
        <a routerLink="/servicios" class="btn btn-brand">Ver servicios</a>
      </app-empty-state>
    }
  `,
})
export class ServiceCategory {
  /** Parámetro de ruta :category */
  readonly category = input.required<string>();

  private readonly productsSvc = inject(ProductsService);
  protected readonly xvSvc = inject(XvService);
  private readonly titleSvc = inject(Title);

  protected readonly categoryKey = computed(() => CATEGORY_BY_SLUG[this.category()]);
  protected readonly info = computed(() => (this.categoryKey() ? CATEGORY_INFO[this.categoryKey()] : null));
  protected readonly kind = signal<KindFilter>('all');
  protected readonly data = new AsyncData<Product[]>();
  protected readonly xv = new AsyncData<XvInvitation[]>();

  protected readonly tabs: { key: KindFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'Todos', icon: 'bi-grid' },
    { key: 'custom', label: 'A la medida', icon: 'bi-rulers' },
    { key: 'ready', label: 'Listos para usar', icon: 'bi-box-seam' },
  ];

  protected readonly visible = computed(() =>
    (this.data.value() ?? []).filter((p) =>
      this.kind() === 'all' ? true : this.kind() === 'custom' ? p.kind === 'custom' : p.kind !== 'custom',
    ),
  );

  constructor() {
    effect(() => {
      const key = this.categoryKey();
      untracked(() => {
        this.kind.set('all');
        if (!key) return;
        this.titleSvc.setTitle(`${CATEGORY_INFO[key].title} | LOI CODE`);
        this.data.run(() => this.productsSvc.list({ category: key, free: false }));
        if (key === 'invitaciones') this.xv.run(() => this.xvSvc.list().then((r) => r.slice(0, 4)));
      });
    });
  }
}

