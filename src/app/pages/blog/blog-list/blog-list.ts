import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../../core/models/content.model';
import { BlogService } from '../../../core/services/blog.service';
import { AsyncData } from '../../../shared/async-data';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { PostCard } from '../../../shared/components/post-card/post-card';
import { EmptyState, SkeletonGrid } from '../../../shared/components/states/states';

@Component({
  selector: 'app-blog-list',
  imports: [PageHero, PostCard, SkeletonGrid, EmptyState],
  template: `
    <app-page-hero
      title="Blog & Artículos"
      eyebrow="Supabase Connected"
      subtitle="Artículos, tutoriales y consejos sobre desarrollo web, invitaciones interactivas y tecnología."
      [crumbs]="[{ label: 'Blog' }]"
    />

    <section class="section">
      <div class="container">
        <!-- Filtro por etiquetas si existen -->
        @if (tags().length > 0) {
          <div class="d-flex flex-wrap gap-2 justify-content-center mb-5">
            <button class="btn btn-sm" [class.btn-brand]="!selectedTag()" [class.btn-outline-brand]="selectedTag()" (click)="selectTag(null)">
              Todos
            </button>
            @for (t of tags(); track t) {
              <button class="btn btn-sm" [class.btn-brand]="selectedTag() === t" [class.btn-outline-brand]="selectedTag() !== t" (click)="selectTag(t)">
                #{{ t }}
              </button>
            }
          </div>
        }

        @if (data.loading()) {
          <app-skeleton-grid [count]="3" />
        } @else if (data.error()) {
          <app-empty-state icon="bi-exclamation-triangle" title="Error al cargar el blog" [message]="data.error()!" />
        } @else {
          <div class="row g-4">
            @for (p of data.value(); track p.id) {
              <div class="col-md-6 col-lg-4"><app-post-card [post]="p" /></div>
            } @empty {
              <app-empty-state icon="bi-journal-x" title="Aún no hay artículos publicados" message="Pronto compartiremos novedades aquí." />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class BlogList {
  private readonly blogSvc = inject(BlogService);
  protected readonly selectedTag = signal<string | null>(null);
  protected readonly data = new AsyncData<Post[]>();
  protected readonly allPosts = signal<Post[]>([]);

  protected readonly tags = computed(() => {
    const set = new Set<string>();
    for (const post of this.allPosts()) {
      for (const t of post.tags) set.add(t);
    }
    return Array.from(set);
  });

  constructor() {
    this.loadPosts();
  }

  async loadPosts(tag?: string | null) {
    const posts = await this.data.run(() => this.blogSvc.list(tag ?? undefined));
    if (posts && !tag) {
      this.allPosts.set(posts);
    }
  }

  selectTag(tag: string | null) {
    this.selectedTag.set(tag);
    this.loadPosts(tag);
  }
}
