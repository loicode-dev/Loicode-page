import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post } from '../../../core/models/content.model';
import { BlogService } from '../../../core/services/blog.service';

@Component({
  selector: 'app-admin-post-list',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1 class="h3 font-outfit text-navy mb-1">Artículos de Blog</h1>
        <p class="text-muted-brand mb-0">Gestiona las publicaciones conectadas a la tabla <code>posts</code> en Supabase.</p>
      </div>
      <a routerLink="/admin/blog/nuevo" class="btn btn-brand">
        <i class="bi bi-plus-lg me-1"></i> Nuevo Post
      </a>
    </div>

    @if (loading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-navy"></div>
      </div>
    } @else {
      <div class="card card-soft overflow-hidden">
        <div class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Estado</th>
                <th>Fecha de Publicación</th>
                <th class="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (p of posts(); track p.id) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      @if (p.cover_url) {
                        <img [src]="p.cover_url" class="rounded-2" style="width: 44px; height: 44px; object-fit: cover;" />
                      }
                      <div>
                        <strong>{{ p.title }}</strong>
                        <div class="small text-muted-brand">{{ p.slug }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ p.author }}</td>
                  <td>
                    @if (p.is_published) {
                      <span class="badge bg-success-subtle text-success">Publicado</span>
                    } @else {
                      <span class="badge bg-secondary-subtle text-secondary">Borrador</span>
                    }
                  </td>
                  <td>{{ (p.published_at || p.created_at) | date: 'mediumDate' }}</td>
                  <td class="text-end">
                    <a [routerLink]="['/admin/blog', p.id]" class="btn btn-sm btn-outline-brand me-2" title="Editar">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-outline-danger" (click)="onDelete(p)" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center py-4 text-muted-brand">No hay artículos publicados todavía.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
})
export class PostList {
  private readonly blogSvc = inject(BlogService);
  protected readonly posts = signal<Post[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.load();
  }

  async load() {
    this.loading.set(true);
    try {
      const data = await this.blogSvc.adminList();
      this.posts.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async onDelete(p: Post) {
    if (!confirm(`¿Eliminar el artículo "${p.title}"?`)) return;
    try {
      await this.blogSvc.remove(p.id);
      await this.load();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  }
}

