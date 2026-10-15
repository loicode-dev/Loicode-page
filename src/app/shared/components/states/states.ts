import { Component, input } from '@angular/core';

/** Placeholders animados mientras cargan las tarjetas */
@Component({
  selector: 'app-skeleton-grid',
  template: `
    <div class="row g-4">
      @for (i of items(); track i) {
        <div class="col-md-6 col-lg-4">
          <div class="card card-soft overflow-hidden">
            <div class="skeleton ratio-cover" style="border-radius: 0"></div>
            <div class="p-4">
              <div class="skeleton mb-2" style="height: 14px; width: 40%"></div>
              <div class="skeleton mb-3" style="height: 22px; width: 80%"></div>
              <div class="skeleton mb-2" style="height: 12px"></div>
              <div class="skeleton" style="height: 12px; width: 70%"></div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SkeletonGrid {
  readonly count = input(3);
  protected items = () => Array.from({ length: this.count() }, (_, i) => i);
}

/** Mensaje cuando no hay resultados / error */
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="text-center py-5 fade-in">
      <div class="icon mb-3"><i class="bi {{ icon() }}"></i></div>
      <h3 class="h5">{{ title() }}</h3>
      @if (message()) {
        <p class="text-muted-brand">{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: `
    .icon { width: 80px; height: 80px; margin: 0 auto; border-radius: 50%; display: grid; place-items: center;
      font-size: 2rem; background: rgba(255,214,10,.25); color: var(--brand-navy); }
  `,
})
export class EmptyState {
  readonly icon = input('bi-inbox');
  readonly title = input('Sin resultados');
  readonly message = input('');
}

