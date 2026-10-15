import { Pipe, PipeTransform } from '@angular/core';
import { isFree, Product } from '../../core/models/product.model';

/** Muestra el precio de un producto: "Gratis", "Cotizar", "Desde $3,500 MXN" o "$349 MXN". */
@Pipe({ name: 'price' })
export class PricePipe implements PipeTransform {
  transform(p: Pick<Product, 'price' | 'kind' | 'currency'>): string {
    if (isFree(p)) return 'Gratis';
    if (p.price === null || p.price === undefined) return 'Cotizar';
    const amount = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: p.currency || 'MXN',
      maximumFractionDigits: 0,
    }).format(Number(p.price));
    return p.kind === 'custom' ? `Desde ${amount} ${p.currency}` : `${amount} ${p.currency}`;
  }
}

