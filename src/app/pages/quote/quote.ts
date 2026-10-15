import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CATEGORY_INFO, ProductCategory } from '../../core/models/product.model';
import { LeadsService } from '../../core/services/leads.service';
import { ProductsService } from '../../core/services/products.service';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { whatsappLink } from '../../shared/utils';

@Component({
  selector: 'app-quote',
  imports: [ReactiveFormsModule, RouterLink, PageHero],
  templateUrl: './quote.html',
  styleUrl: './quote.scss',
})
export class Quote {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly leadsSvc = inject(LeadsService);
  private readonly productsSvc = inject(ProductsService);

  protected readonly categories = Object.entries(CATEGORY_INFO).map(([key, v]) => ({ key: key as ProductCategory, ...v }));
  protected readonly selectedProductName = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly isSubmitted = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s-]{8,20}$/)]],
    service: ['web', [Validators.required]],
    budget: [''],
    deadline: [''],
    message: ['', [Validators.required, Validators.minLength(10)]],
    eventDate: [''],
    celebrantName: [''],
  });

  constructor() {
    this.route.queryParams.subscribe(async (params) => {
      const servicio = params['servicio'] as ProductCategory;
      if (servicio && CATEGORY_INFO[servicio]) {
        this.form.patchValue({ service: servicio });
      }

      const prodSlug = params['producto'];
      if (prodSlug) {
        const prod = await this.productsSvc.getBySlug(prodSlug);
        if (prod) {
          this.selectedProductName.set(prod.title);
          this.form.patchValue({
            service: prod.category,
            message: `Hola, me interesa cotizar el servicio: "${prod.title}".`,
          });
        }
      }
    });
  }

  get isInvitaciones(): boolean {
    return this.form.get('service')?.value === 'invitaciones';
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const val = this.form.value;
    const extra: Record<string, string> = {};
    if (val.eventDate) extra['Fecha del evento'] = val.eventDate;
    if (val.celebrantName) extra['Festejada/o'] = val.celebrantName;

    try {
      await this.leadsSvc.create({
        product_id: null,
        product_title: this.selectedProductName() || null,
        service: val.service || 'web',
        name: val.name!,
        email: val.email || 'contacto@loicode.com',
        phone: val.phone || null,
        budget: val.budget || null,
        deadline: val.deadline || null,
        message: val.message!,
        extra,
      });
      this.isSubmitted.set(true);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'No se pudo enviar la solicitud. Intenta nuevamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected get whatsappDirectUrl(): string {
    const val = this.form.value;
    const text = `¡Hola LOI CODE! Soy ${val.name || 'un cliente'}. Me interesa cotizar un proyecto de ${val.service}: "${val.message || 'Información de servicios'}".`;
    return whatsappLink(environment.site.whatsapp, text);
  }
}

