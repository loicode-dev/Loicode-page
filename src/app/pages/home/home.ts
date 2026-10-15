import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post, XvInvitation } from '../../core/models/content.model';
import { CATEGORY_INFO, Product } from '../../core/models/product.model';
import { BlogService } from '../../core/services/blog.service';
import { ProductsService } from '../../core/services/products.service';
import { XvService } from '../../core/services/xv.service';
import { AsyncData } from '../../shared/async-data';
import { PostCard } from '../../shared/components/post-card/post-card';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { SkeletonGrid } from '../../shared/components/states/states';

interface Slide {
  image: string;
  alt: string;
  link: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, PostCard, SkeletonGrid],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly productsSvc = inject(ProductsService);
  private readonly blogSvc = inject(BlogService);
  protected readonly xvSvc = inject(XvService);

  protected readonly categories = Object.entries(CATEGORY_INFO).map(([key, v]) => ({ key, ...v }));
  protected readonly featured = new AsyncData<Product[]>();
  protected readonly freebies = new AsyncData<Product[]>();
  protected readonly posts = new AsyncData<Post[]>();
  protected readonly xv = new AsyncData<XvInvitation[]>();

  /** Banners del carrusel (public/assets/img/index/banner) */
  protected readonly slides: Slide[] = [
    { image: 'assets/img/index/banner/CODE_sitios_web.jpg', alt: 'Sitios web profesionales', link: '/servicios/desarrollo-web' },
    { image: 'assets/img/index/banner/CODE_invitaciones.jpg', alt: 'Invitaciones digitales desde $400 MXN', link: '/servicios/invitaciones' },
  ];
  protected readonly current = signal(0);

  protected readonly steps = [
    { icon: 'bi-search', title: 'Explora', text: 'Revisa nuestro catálogo de servicios, plantillas, apps y recursos.' },
    { icon: 'bi-ui-checks', title: 'Elige', text: '¿A la medida? Cotiza. ¿Prefabricado? Cómpralo. ¿Gratis? Descárgalo.' },
    { icon: 'bi-rocket-takeoff', title: 'Lanza', text: 'Recibe tu proyecto o tu descarga y empieza a crecer en digital.' },
  ];

  constructor() {
    this.featured.run(() => this.productsSvc.list({ featured: true, free: false }).then((r) => r.slice(0, 6)));
    this.freebies.run(() => this.productsSvc.list({ free: true }).then((r) => r.slice(0, 3)));
    this.posts.run(() => this.blogSvc.list().then((r) => r.slice(0, 3)));
    this.xv.run(() => this.xvSvc.list().then((r) => r.slice(0, 3)));

    const timer = setInterval(() => this.next(), 6000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected next() {
    this.current.update((i) => (i + 1) % this.slides.length);
  }
  protected prev() {
    this.current.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }
}

