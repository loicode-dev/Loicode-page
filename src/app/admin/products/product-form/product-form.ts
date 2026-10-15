import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CATEGORY_INFO, emptyProduct, Product, ProductCategory, ProductInput, ProductKind } from '../../../core/models/product.model';
import { ProductsService } from '../../../core/services/products.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { slugify, splitList } from '../../../shared/utils';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
})
export class ProductForm {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productsSvc = inject(ProductsService);
  private readonly sb = inject(SupabaseService);

  protected readonly isSaving = signal(false);
  protected readonly isUploading = signal(false);
  protected readonly errorMsg = signal<string | null>(null);

  protected readonly categories = Object.entries(CATEGORY_INFO).map(([k, v]) => ({ key: k as ProductCategory, label: v.label }));

  protected readonly form = this.fb.group({
    title: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    category: ['web' as ProductCategory, [Validators.required]],
    kind: ['custom' as ProductKind, [Validators.required]],
    price: [null as number | null],
    short_description: ['', [Validators.required]],
    description: ['', [Validators.required]],
    cover_url: [''],
    demo_url: [''],
    external_url: [''],
    file_url: [''],
    file_path: [''],
    featuresText: [''],
    tagsText: [''],
    is_published: [true],
    is_featured: [false],
    sort_order: [0],
  });

  constructor() {
    this.route.queryParams.subscribe((p) => {
      if (p['gratis'] === '1' && !this.id()) {
        this.form.patchValue({
          kind: 'download',
          price: null,
        });
      }
    });

    effect(() => {
      const prodId = this.id();
      untracked(async () => {
        if (!prodId) return;
        const prod = await this.productsSvc.adminGet(prodId);
        if (prod) {
          this.form.patchValue({
            title: prod.title,
            slug: prod.slug,
            category: prod.category,
            kind: prod.kind,
            price: prod.price,
            short_description: prod.short_description,
            description: prod.description,
            cover_url: prod.cover_url || '',
            demo_url: prod.demo_url || '',
            external_url: prod.external_url || '',
            file_url: prod.file_url || '',
            file_path: prod.file_path || '',
            featuresText: (prod.features || []).join('\n'),
            tagsText: (prod.tags || []).join(', '),
            is_published: prod.is_published,
            is_featured: prod.is_featured,
            sort_order: prod.sort_order,
          });
        }
      });
    });
  }

  onTitleChange() {
    if (!this.id() && this.form.get('title')?.value) {
      this.form.patchValue({ slug: slugify(this.form.get('title')!.value!) });
    }
  }

  async onUploadCover(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.isUploading.set(true);
    try {
      const res = await this.sb.upload('media', file, 'products');
      this.form.patchValue({ cover_url: res.publicUrl });
    } catch (err: any) {
      alert('Error al subir imagen: ' + (err.message || 'Desconocido'));
    } finally {
      this.isUploading.set(false);
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMsg.set(null);

    const val = this.form.value;
    const inputData: ProductInput = {
      title: val.title!,
      slug: slugify(val.slug || val.title!),
      category: val.category!,
      kind: val.kind!,
      price: val.price ? Number(val.price) : null,
      short_description: val.short_description!,
      description: val.description!,
      cover_url: val.cover_url || null,
      gallery: [],
      demo_url: val.demo_url || null,
      external_url: val.external_url || null,
      file_url: val.file_url || null,
      file_path: val.file_path || null,
      features: splitList(val.featuresText || '', /\n/),
      tags: splitList(val.tagsText || '', /[,\n]/),
      is_published: !!val.is_published,
      is_featured: !!val.is_featured,
      sort_order: Number(val.sort_order) || 0,
      currency: 'MXN',
    };

    try {
      await this.productsSvc.save(inputData, this.id());
      this.router.navigate(['/admin/productos']);
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Error al guardar el producto.');
    } finally {
      this.isSaving.set(false);
    }
  }
}

