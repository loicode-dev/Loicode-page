import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Post, PostInput } from '../../../core/models/content.model';
import { BlogService } from '../../../core/services/blog.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { slugify, splitList } from '../../../shared/utils';

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './post-form.html',
})
export class PostForm {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly blogSvc = inject(BlogService);
  private readonly sb = inject(SupabaseService);

  protected readonly isSaving = signal(false);
  protected readonly isUploading = signal(false);
  protected readonly errorMsg = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    excerpt: ['', [Validators.required]],
    content: ['', [Validators.required]],
    cover_url: [''],
    tagsText: [''],
    author: ['LOI CODE', [Validators.required]],
    is_published: [true],
  });

  constructor() {
    effect(() => {
      const postId = this.id();
      untracked(async () => {
        if (!postId) return;
        const post = await this.blogSvc.adminGet(postId);
        if (post) {
          this.form.patchValue({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            cover_url: post.cover_url || '',
            tagsText: (post.tags || []).join(', '),
            author: post.author,
            is_published: post.is_published,
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
      const res = await this.sb.upload('media', file, 'blog');
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
    const inputData: PostInput = {
      title: val.title!,
      slug: slugify(val.slug || val.title!),
      excerpt: val.excerpt!,
      content: val.content!,
      cover_url: val.cover_url || null,
      tags: splitList(val.tagsText || '', /[,\n]/),
      author: val.author || 'LOI CODE',
      is_published: !!val.is_published,
      published_at: null,
    };

    try {
      await this.blogSvc.save(inputData, this.id());
      this.router.navigate(['/admin/blog']);
    } catch (err: any) {
      this.errorMsg.set(err.message || 'Error al guardar el post.');
    } finally {
      this.isSaving.set(false);
    }
  }
}

