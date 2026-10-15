import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ACTION_LABEL, CATEGORY_INFO, isFree, Product, productAction } from '../../core/models/product.model';
import { ProductActionsService } from '../../core/services/product-actions.service';
import { ProductsService } from '../../core/services/products.service';
import { AsyncData } from '../../shared/async-data';
import { Crumb, PageHero } from '../../shared/components/page-hero/page-hero';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { EmptyState } from '../../shared/components/states/states';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { PricePipe } from '../../shared/pipes/price.pipe';

/** Detalle de producto: /servicios/:category/:slug  y  /recursos/:slug */
@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, PageHero, ProductCard, EmptyState, MarkdownPipe, PricePipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  readonly slug = input.required<string>();

  private readonly productsSvc = inject(ProductsService);
  protected readonly actions = inject(ProductActionsService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly data = new AsyncData<Product | null>();
  protected readonly related = new AsyncData<Product[]>();
  protected readonly activeImage = signal<string | null>(null);

  protected readonly product = computed(() => this.data.value());
  protected readonly free = computed(() => !!this.product() && isFree(this.product()!));
  protected readonly action = computed(() => (this.product() ? productAction(this.product()!) : null));
  protected readonly actionLabel = computed(() => (this.action() ? ACTION_LABEL[this.action()!] : null));
  protected readonly category = computed(() => (this.product() ? CATEGORY_INFO[this.product()!.category] : null));
  protected readonly images = computed(() => {
    const p = this.product();
    return p ? [p.cover_url, ...(p.gallery ?? [])].filter((x): x is string => !!x) : [];
  });
  protected readonly crumbs = computed<Crumb[]>(() => {
    const p = this.product();
    if (!p) return [];
    return this.free()
      ? [{ label: 'Recursos gratuitos', link: '/recursos' }, { label: p.title }]
      : [
          { label: 'Servicios', link: '/servicios' },
          { label: this.category()!.label, link: this.category()!.route },
          { label: p.title },
        ];
  });

  /** Texto que explica qué pasará al pulsar el botón principal */
  protected readonly nextStep = computed(() => {
    switch (this.action()) {
      case 'quote':
        return 'Servicio a la medida: llena el formulario y te contactaremos con una propuesta personalizada.';
      case 'buy':
        return this.product()?.kind === 'webapp'
          ? 'Pago seguro con Mercado Pago. Al confirmarse tu pago recibirás tu enlace de acceso.'
          : 'Pago seguro con Mercado Pago (tarjeta, OXXO, SPEI). Al confirmarse tu pago pasarás a la página de descarga.';
      case 'download':
        return 'Recurso gratuito: la descarga comienza de inmediato, sin registro.';
      case 'open':
        return 'App web gratuita: te llevaremos directo a la aplicación.';
      default:
        return '';
    }
  });

  constructor() {
    effect(() => {
      const slug = this.slug();
      untracked(async () => {
        this.activeImage.set(null);
        const p = await this.data.run(() => this.productsSvc.getBySlug(slug));
        if (!p) return;
        this.title.setTitle(`${p.title} | LOI CODE`);
        this.meta.updateTag({ name: 'description', content: p.short_description });
        this.related.run(() =>
          this.productsSvc
            .list({ category: p.category, free: isFree(p) })
            .then((r) => r.filter((x) => x.id !== p.id).slice(0, 3)),
        );
      });
    });
  }
}

