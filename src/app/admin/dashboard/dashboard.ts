import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { LeadsService } from '../../core/services/leads.service';
import { ProductsService } from '../../core/services/products.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  template: `
    <div class="mb-4">
      <h1 class="h3 font-outfit text-navy">Dashboard General</h1>
      <p class="text-muted-brand">Bienvenido al panel administrativo de LOI CODE.</p>
    </div>

    <!-- Stats Grid -->
    <div class="row g-4 mb-5">
      <div class="col-sm-6 col-xl-3">
        <div class="card card-soft p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted-brand small">Servicios & Prod.</span>
            <span class="p-2 rounded-3 bg-primary-subtle text-primary"><i class="bi bi-box-seam"></i></span>
          </div>
          <h3 class="h2 mb-0">{{ counts().products }}</h3>
          <a routerLink="/admin/productos" class="small text-decoration-none mt-3">Gestionar productos →</a>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card card-soft p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted-brand small">Recursos Gratis</span>
            <span class="p-2 rounded-3 bg-success-subtle text-success"><i class="bi bi-gift"></i></span>
          </div>
          <h3 class="h2 mb-0">{{ counts().freebies }}</h3>
          <a routerLink="/admin/recursos" class="small text-decoration-none mt-3">Gestionar recursos →</a>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card card-soft p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted-brand small">Artículos Blog</span>
            <span class="p-2 rounded-3 bg-info-subtle text-info"><i class="bi bi-journal-text"></i></span>
          </div>
          <h3 class="h2 mb-0">{{ counts().posts }}</h3>
          <a routerLink="/admin/blog" class="small text-decoration-none mt-3">Gestionar posts →</a>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card card-soft p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted-brand small">Cotizaciones</span>
            <span class="p-2 rounded-3 bg-warning-subtle text-warning"><i class="bi bi-inbox"></i></span>
          </div>
          <h3 class="h2 mb-0">{{ counts().leads }}</h3>
          <a routerLink="/admin/solicitudes" class="small text-decoration-none mt-3">Ver solicitudes →</a>
        </div>
      </div>
    </div>

    <!-- Quick Access Actions -->
    <div class="card card-soft p-4">
      <h4 class="h5 mb-3 text-navy">Acciones Rápidas</h4>
      <div class="d-flex flex-wrap gap-2">
        <a routerLink="/admin/productos/nuevo" class="btn btn-brand btn-sm">
          <i class="bi bi-plus-lg me-1"></i> Nuevo Producto / Servicio
        </a>
        <a routerLink="/admin/blog/nuevo" class="btn btn-outline-brand btn-sm">
          <i class="bi bi-plus-lg me-1"></i> Nuevo Post de Blog
        </a>
        <a routerLink="/mis-xv" target="_blank" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-stars me-1"></i> Ver Portafolio Mis XV
        </a>
      </div>
    </div>
  `,
})
export class Dashboard {
  private readonly productsSvc = inject(ProductsService);
  private readonly blogSvc = inject(BlogService);
  private readonly leadsSvc = inject(LeadsService);
  private readonly checkoutSvc = inject(CheckoutService);

  protected readonly counts = signal({ products: 0, freebies: 0, posts: 0, leads: 0, orders: 0 });

  constructor() {
    this.loadStats();
  }

  async loadStats() {
    try {
      const [allProds, posts, leads, orders] = await Promise.all([
        this.productsSvc.adminList(),
        this.blogSvc.adminList(),
        this.leadsSvc.adminList(),
        this.checkoutSvc.adminList(),
      ]);

      const products = allProds.filter((p) => p.kind === 'custom' || (p.price !== null && p.price > 0)).length;
      const freebies = allProds.filter((p) => p.kind !== 'custom' && (p.price === null || p.price === 0)).length;

      this.counts.set({
        products,
        freebies,
        posts: posts.length,
        leads: leads.length,
        orders: orders.length,
      });
    } catch (err) {
      console.error('Error cargando stats', err);
    }
  }
}

