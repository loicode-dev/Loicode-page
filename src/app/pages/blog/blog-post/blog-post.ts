import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, untracked } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Post } from '../../../core/models/content.model';
import { BlogService } from '../../../core/services/blog.service';
import { AsyncData } from '../../../shared/async-data';
import { PageHero } from '../../../shared/components/page-hero/page-hero';
import { EmptyState } from '../../../shared/components/states/states';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-blog-post',
  imports: [RouterLink, DatePipe, PageHero, EmptyState, MarkdownPipe],
  template: `
    @if (data.loading()) {
      <div class="container section">
        <div class="skeleton mb-4" style="height: 350px"></div>
        <div class="skeleton mb-3" style="height: 40px; width: 60%"></div>
        <div class="skeleton mb-2" style="height: 18px"></div>
        <div class="skeleton" style="height: 18px; width: 80%"></div>
      </div>
    } @else if (data.value(); as post) {
      <app-page-hero
        [title]="post.title"
        eyebrow="Blog"
        [subtitle]="post.excerpt"
        [crumbs]="[{ label: 'Blog', link: '/blog' }, { label: post.title }]"
      />

      <article class="section">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-9">
              <!-- Meta info -->
              <div class="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-4 border-bottom text-muted-brand small">
                <div>
                  <i class="bi bi-person-circle me-1"></i> Por <strong>{{ post.author }}</strong>
                  <span class="mx-2">•</span>
                  <i class="bi bi-calendar3 me-1"></i> {{ post.published_at | date: 'longDate' }}
                </div>
                <div class="d-flex gap-2">
                  @for (t of post.tags; track t) {
                    <span class="badge rounded-pill text-bg-light">#{{ t }}</span>
                  }
                </div>
              </div>

              <!-- Cover Image -->
              @if (post.cover_url) {
                <div class="card card-soft overflow-hidden mb-5">
                  <img [src]="post.cover_url" [alt]="post.title" class="w-100" style="max-height: 480px; object-fit: cover;" />
                </div>
              }

              <!-- Content Markdown -->
              <div class="card card-soft p-4 p-md-5 mb-5">
                <div class="prose" [innerHTML]="post.content | markdown"></div>
              </div>

              <!-- Footer CTA -->
              <div class="p-4 rounded-4 bg-navy text-white d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div>
                  <h4 class="text-white mb-1">¿Necesitas ayuda con tu proyecto?</h4>
                  <p class="text-white-50 mb-0 small">En LOI CODE desarrollamos tu web, app o invitación digital.</p>
                </div>
                <a routerLink="/cotizar" class="btn btn-accent text-nowrap">Solicitar Cotización</a>
              </div>
            </div>
          </div>
        </div>
      </article>
    } @else {
      <app-empty-state icon="bi-journal-x" title="Artículo no encontrado" [message]="data.error() ?? 'El post solicitado no existe o ya no está disponible.'">
        <a routerLink="/blog" class="btn btn-brand">Regresar al Blog</a>
      </app-empty-state>
    }
  `,
})
export class BlogPost {
  readonly slug = input.required<string>();

  private readonly blogSvc = inject(BlogService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly data = new AsyncData<Post | null>();

  constructor() {
    effect(() => {
      const s = this.slug();
      untracked(async () => {
        const post = await this.data.run(() => this.blogSvc.getBySlug(s));
        if (post) {
          this.title.setTitle(`${post.title} | LOI CODE Blog`);
          this.meta.updateTag({ name: 'description', content: post.excerpt });
        }
      });
    });
  }
}

