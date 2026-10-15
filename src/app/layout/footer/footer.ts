import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CATEGORY_INFO } from '../../core/models/product.model';
import { SupabaseService } from '../../core/services/supabase.service';
import { whatsappLink } from '../../shared/utils';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer mt-auto">
      <div class="container py-5">
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="footer-brand mb-3">LOI <span class="text-accent">CODE</span></div>
            <p class="text-white-50">{{ site.tagline }}. Convertimos tus ideas en experiencias digitales.</p>
            <div class="d-flex gap-2">
              <a [href]="site.social.facebook" target="_blank" rel="noopener" class="social" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              <a [href]="site.social.instagram" target="_blank" rel="noopener" class="social" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              <a [href]="site.social.tiktok" target="_blank" rel="noopener" class="social" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
              <a [href]="site.social.github" target="_blank" rel="noopener" class="social" aria-label="GitHub"><i class="bi bi-github"></i></a>
            </div>
          </div>
          <div class="col-6 col-lg-2">
            <h6>Sitio</h6>
            <ul class="list-unstyled">
              <li><a routerLink="/">Inicio</a></li>
              <li><a routerLink="/nosotros">Nosotros</a></li>
              <li><a routerLink="/blog">Blog</a></li>
              <li><a routerLink="/recursos">Recursos gratuitos</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-3">
            <h6>Servicios</h6>
            <ul class="list-unstyled">
              @for (cat of categories; track cat.route) {
                <li><a [routerLink]="cat.route">{{ cat.label }}</a></li>
              }
              <li><a routerLink="/mis-xv">Mis XV</a></li>
              <li><a routerLink="/cotizar">Cotizar proyecto</a></li>
            </ul>
          </div>
          <div class="col-lg-3">
            <h6>Contacto</h6>
            <ul class="list-unstyled">
              <li><a [href]="'mailto:' + site.email"><i class="bi bi-envelope me-2"></i>{{ site.email }}</a></li>
              <li><a [href]="wa" target="_blank" rel="noopener"><i class="bi bi-whatsapp me-2"></i>WhatsApp</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container d-flex flex-column flex-md-row justify-content-between gap-2 py-3 small">
          <span>© {{ year }} {{ site.name }}. Todos los derechos reservados.</span>
          <span>
            @if (isDemo) { <span class="badge badge-accent me-2">MODO DEMO</span> }
            <a routerLink="/admin" class="text-white-50">Admin</a>
          </span>
        </div>
      </div>
    </footer>

    <a class="wa-float" [href]="wa" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">
      <i class="bi bi-whatsapp"></i>
    </a>
  `,
  styles: `
    .footer { background: var(--brand-deep); color: #fff; }
    .footer-brand { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.8rem; letter-spacing: .04em; }
    h6 { color: var(--brand-yellow); text-transform: uppercase; letter-spacing: .1em; font-size: .8rem; margin-bottom: 1rem; }
    li { margin-bottom: .5rem; }
    a { color: rgba(255,255,255,.75); text-decoration: none; transition: color .2s; }
    a:hover { color: var(--brand-yellow); }
    .social { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.08); }
    .social:hover { background: var(--brand-yellow); color: var(--brand-navy); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.5); }
    .wa-float {
      position: fixed; right: 1.25rem; bottom: 1.25rem; z-index: 1030;
      width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center;
      background: #25d366; color: #fff; font-size: 1.8rem; box-shadow: 0 8px 24px rgba(37,211,102,.45);
      transition: transform .2s;
    }
    .wa-float:hover { transform: scale(1.08); color: #fff; }
  `,
})
export class Footer {
  protected readonly site = environment.site;
  protected readonly categories = Object.values(CATEGORY_INFO);
  protected readonly year = new Date().getFullYear();
  protected readonly isDemo = inject(SupabaseService).isDemo;
  protected readonly wa = whatsappLink(this.site.whatsapp, '¡Hola LOI CODE! Me gustaría información sobre sus servicios.');
}

