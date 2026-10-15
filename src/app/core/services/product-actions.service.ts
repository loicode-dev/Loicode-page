import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CATEGORY_INFO, isFree, Product, productAction } from '../models/product.model';

/** URL de detalle de un producto: los gratuitos viven en /recursos, el resto en /servicios/:categoria */
export function productLink(p: Pick<Product, 'slug' | 'category' | 'price' | 'kind'>): string {
  return isFree(p) ? `/recursos/${p.slug}` : `${CATEGORY_INFO[p.category].route}/${p.slug}`;
}

/**
 * Ejecuta la acción principal de un producto según su tipo:
 *  - a la medida      → formulario de cotización
 *  - de pago          → checkout (Mercado Pago)
 *  - gratis/descarga  → descarga directa
 *  - gratis/app web   → redirección a la app
 */
@Injectable({ providedIn: 'root' })
export class ProductActionsService {
  private readonly router = inject(Router);

  run(p: Product): void {
    switch (productAction(p)) {
      case 'quote':
        this.router.navigate(['/cotizar'], { queryParams: { producto: p.slug, servicio: p.category } });
        break;
      case 'buy':
        this.router.navigate(['/checkout', p.slug]);
        break;
      case 'download':
        if (p.file_url) downloadFile(p.file_url, p.slug);
        break;
      case 'open':
        if (p.external_url) window.open(p.external_url, '_blank', 'noopener');
        break;
    }
  }
}

/** Fuerza la descarga de un archivo (si es de otro dominio, lo abre en otra pestaña). */
export function downloadFile(url: string, filename?: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

