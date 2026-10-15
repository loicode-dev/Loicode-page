import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  link?: string;
}

/** Encabezado de páginas internas con breadcrumb */
@Component({
  selector: 'app-page-hero',
  imports: [RouterLink],
  template: `
    <header class="page-hero">
      <div class="container position-relative" style="z-index: 1">
        @if (crumbs().length) {
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb small mb-3">
              <li class="breadcrumb-item"><a routerLink="/">Inicio</a></li>
              @for (c of crumbs(); track c.label; let last = $last) {
                @if (c.link && !last) {
                  <li class="breadcrumb-item"><a [routerLink]="c.link">{{ c.label }}</a></li>
                } @else {
                  <li class="breadcrumb-item active" aria-current="page">{{ c.label }}</li>
                }
              }
            </ol>
          </nav>
        }
        @if (eyebrow()) {
          <span class="eyebrow text-white" style="background: rgba(255,214,10,.2)">{{ eyebrow() }}</span>
        }
        <h1 class="mb-3">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="lead mb-0">{{ subtitle() }}</p>
        }
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHero {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly eyebrow = input<string>('');
  readonly crumbs = input<Crumb[]>([]);
}

