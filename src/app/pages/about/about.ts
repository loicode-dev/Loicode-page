import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHero } from '../../shared/components/page-hero/page-hero';

@Component({
  selector: 'app-about',
  imports: [RouterLink, PageHero],
  template: `
    <app-page-hero
      title="Nosotros"
      eyebrow="Conócenos"
      subtitle="Somos LOI CODE: un estudio creativo que transforma ideas en productos digitales."
      [crumbs]="[{ label: 'Nosotros' }]"
    />

    <section class="section">
      <div class="container">
        <div class="row g-5 align-items-center">
          <div class="col-lg-6">
            <img src="assets/img/logos/loicode_logo.png" alt="LOI CODE" class="img-fluid card-soft p-4 bg-white" />
          </div>
          <div class="col-lg-6">
            <span class="eyebrow">Nuestra historia</span>
            <h2 class="section-title">La idea es el inicio, el código la hace realidad</h2>
            <p class="text-muted-brand">
              Nacimos con la misión de que cualquier persona o negocio pueda tener presencia digital de calidad.
              Diseñamos y desarrollamos sitios web, invitaciones digitales y aplicaciones que se ven increíbles y
              funcionan perfecto en cualquier dispositivo.
            </p>
            <p class="text-muted-brand">
              Además, compartimos plantillas, programas y recursos gratuitos para que también puedas crear por tu cuenta.
            </p>
            <a routerLink="/cotizar" class="btn btn-brand mt-2">Trabajemos juntos</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section bg-white">
      <div class="container">
        <div class="row g-4 text-center">
          @for (v of values; track v.title) {
            <div class="col-md-6 col-lg-3">
              <div class="card card-soft h-100 p-4 hover-lift">
                <div class="icon mx-auto mb-3"><i class="bi {{ v.icon }}"></i></div>
                <h3 class="h5">{{ v.title }}</h3>
                <p class="text-muted-brand small mb-0">{{ v.text }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card card-soft h-100 p-4 p-lg-5 bg-navy text-white">
              <i class="bi bi-bullseye fs-1 text-accent"></i>
              <h3 class="text-white mt-3">Misión</h3>
              <p class="text-white-50 mb-0">
                Impulsar a personas y negocios con soluciones digitales accesibles, modernas y hechas a su medida.
              </p>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card card-soft h-100 p-4 p-lg-5">
              <i class="bi bi-eye fs-1 text-navy"></i>
              <h3 class="mt-3">Visión</h3>
              <p class="text-muted-brand mb-0">
                Ser el estudio digital de referencia para emprendedores y eventos en Latinoamérica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .icon { width: 64px; height: 64px; border-radius: 1rem; display: grid; place-items: center; font-size: 1.6rem;
      background: rgba(255,214,10,.3); color: var(--brand-navy); }
  `,
})
export class About {
  protected readonly values = [
    { icon: 'bi-lightbulb', title: 'Creatividad', text: 'Cada proyecto es único y lo diseñamos pensando en tu marca.' },
    { icon: 'bi-speedometer2', title: 'Rendimiento', text: 'Sitios rápidos, optimizados y listos para Google.' },
    { icon: 'bi-shield-check', title: 'Confianza', text: 'Pagos seguros, tiempos claros y comunicación constante.' },
    { icon: 'bi-headset', title: 'Acompañamiento', text: 'Te asesoramos antes, durante y después del lanzamiento.' },
  ];
}

