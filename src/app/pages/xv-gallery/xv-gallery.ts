import { Component, inject } from '@angular/core';
import { XvInvitation } from '../../core/models/content.model';
import { XvService } from '../../core/services/xv.service';
import { AsyncData } from '../../shared/async-data';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { EmptyState, SkeletonGrid } from '../../shared/components/states/states';

@Component({
  selector: 'app-xv-gallery',
  imports: [PageHero, SkeletonGrid, EmptyState],
  template: `
    <app-page-hero
      title="Mis XV · Galería de Invitaciones"
      eyebrow="Portafolio Exclusivo"
      subtitle="Explora nuestras invitaciones interactivas para XV Años: música, cuenta regresiva, mapas y confirmación por WhatsApp."
      [crumbs]="[{ label: 'Servicios', link: '/servicios' }, { label: 'Invitaciones', link: '/servicios/invitaciones' }, { label: 'Mis XV' }]"
    />

    <section class="section">
      <div class="container">
        @if (data.loading()) {
          <app-skeleton-grid [count]="3" />
        } @else if (data.error()) {
          <app-empty-state icon="bi-exclamation-triangle" title="No se pudo cargar la galería" [message]="data.error()!" />
        } @else {
          <div class="row g-4">
            @for (inv of data.value(); track inv.slug) {
              <div class="col-md-6 col-lg-4">
                <div class="card card-soft overflow-hidden hover-lift h-100">
                  <div class="position-relative">
                    <img [src]="xvSvc.cover(inv)" [alt]="inv.name" class="w-100 object-cover" style="aspect-ratio: 16/10;" />
                    <span class="badge badge-accent position-absolute top-0 start-0 m-3">XV AÑOS</span>
                  </div>
                  <div class="card-body p-4 d-flex flex-column">
                    <small class="text-muted-brand mb-1">{{ inv.theme }}</small>
                    <h3 class="h4 text-navy mb-2">XV {{ inv.name }}</h3>
                    <p class="text-muted-brand small mb-4 flex-grow-1">{{ inv.description }}</p>
                    <div class="d-flex gap-2">
                      <a [href]="xvSvc.url(inv)" target="_blank" rel="noopener" class="btn btn-brand btn-sm flex-grow-1">
                        <i class="bi bi-eye me-1"></i> Ver Invitación en Vivo
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <app-empty-state icon="bi-stars" title="Sin invitaciones en la galería" message="Pronto agregaremos nuevas invitaciones a la carpeta misXV." />
            }
          </div>
        }
      </div>
    </section>

    <section class="section-sm bg-white">
      <div class="container text-center">
        <h2 class="h3">¿Quieres una invitación personalizada para tus XV Años?</h2>
        <p class="text-muted-brand">Creamos una experiencia interactiva para sorprender a todos tus invitados.</p>
        <a href="/cotizar?servicio=invitaciones" class="btn btn-accent btn-lg">Cotizar mi invitación</a>
      </div>
    </section>
  `,
})
export class XvGallery {
  protected readonly xvSvc = inject(XvService);
  protected readonly data = new AsyncData<XvInvitation[]>();

  constructor() {
    this.data.run(() => this.xvSvc.list());
  }
}

