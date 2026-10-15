import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { isFree, Product } from '../../core/models/product.model';
import { CheckoutService } from '../../core/services/checkout.service';
import { ProductsService } from '../../core/services/products.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { AsyncData } from '../../shared/async-data';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { EmptyState } from '../../shared/components/states/states';
import { PricePipe } from '../../shared/pipes/price.pipe';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, PageHero, EmptyState, PricePipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  readonly slug = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly productsSvc = inject(ProductsService);
  private readonly checkoutSvc = inject(CheckoutService);
  protected readonly isDemo = inject(SupabaseService).isDemo;

  protected readonly data = new AsyncData<Product | null>();
  protected readonly isProcessing = signal(false);
  protected readonly errorMsg = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    terms: [true, [Validators.requiredTrue]],
  });

  constructor() {
    effect(() => {
      const s = this.slug();
      untracked(async () => {
        const prod = await this.data.run(() => this.productsSvc.getBySlug(s));
        if (prod && isFree(prod)) {
          // Si por alguna razón entra a checkout y es gratis, redirigir a recursos o descarga directa
          this.router.navigate(['/recursos', prod.slug]);
        }
      });
    });
  }

  async onPay() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const prod = this.data.value();
    if (!prod) return;

    this.isProcessing.set(true);
    this.errorMsg.set(null);

    try {
      const buyer = {
        name: this.form.value.name!,
        email: this.form.value.email!,
      };
      const redirectUrl = await this.checkoutSvc.startCheckout(prod, buyer);

      // Si es url interna (modo demo o descarga directa), navegar con router
      if (redirectUrl.startsWith('/')) {
        this.router.navigateByUrl(redirectUrl);
      } else {
        // Redirigir a Mercado Pago (init_point)
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Error al iniciar el pago.');
      this.isProcessing.set(false);
    }
  }
}

