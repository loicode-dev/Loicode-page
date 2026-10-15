import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../../core/models/content.model';

@Component({
  selector: 'app-post-card',
  imports: [RouterLink, DatePipe],
  template: `
    @let p = post();
    <article class="card card-soft hover-lift h-100 overflow-hidden fade-in">
      <a [routerLink]="['/blog', p.slug]">
        @if (p.cover_url) {
          <img [src]="p.cover_url" [alt]="p.title" class="ratio-cover" loading="lazy" />
        } @else {
          <div class="ratio-cover cover-placeholder"><i class="bi bi-journal-richtext"></i></div>
        }
      </a>
      <div class="card-body p-4 d-flex flex-column">
        <div class="d-flex flex-wrap gap-2 mb-2">
          @for (t of p.tags.slice(0, 3); track t) {
            <span class="badge rounded-pill text-bg-light">#{{ t }}</span>
          }
        </div>
        <h3 class="h5"><a [routerLink]="['/blog', p.slug]" class="text-decoration-none text-navy">{{ p.title }}</a></h3>
        <p class="text-muted-brand small line-clamp-3">{{ p.excerpt }}</p>
        <div class="mt-auto d-flex justify-content-between align-items-center small text-muted-brand">
          <span><i class="bi bi-calendar3 me-1"></i>{{ p.published_at | date: 'longDate' }}</span>
          <a [routerLink]="['/blog', p.slug]" class="fw-semibold text-decoration-none">Leer <i class="bi bi-arrow-right"></i></a>
        </div>
      </div>
    </article>
  `,
})
export class PostCard {
  readonly post = input.required<Post>();
}

