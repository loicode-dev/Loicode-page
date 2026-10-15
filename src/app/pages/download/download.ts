import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DownloadInfo } from '../../core/models/content.model';
import { CheckoutService } from '../../core/services/checkout.service';
import { AsyncData } from '../../shared/async-data';
import { PageHero } from '../../shared/components/page-hero/page-hero';
import { EmptyState } from '../../shared/components/states/states';

@Component({
  selector: 'app-download',
  imports: [RouterLink, PageHero, EmptyState],
  templateUrl: './download.html',
  styleUrl: './download.scss',
})
export class Download {
  readonly orderId = input.required<string>();

  private readonly route = inject(ActivatedRoute);
  private readonly checkoutSvc = inject(CheckoutService);

  protected readonly data = new AsyncData<DownloadInfo | null>();
  protected readonly paymentId = signal<string | null>(null);

  constructor() {
    this.route.queryParams.subscribe((p) => {
      this.paymentId.set(p['payment_id'] || p['collection_id'] || null);
    });

    effect(() => {
      const id = this.orderId();
      untracked(() => {
        this.data.run(() => this.checkoutSvc.getDownload(id, this.paymentId()));
      });
    });
  }

  protected windowReload() {
    window.location.reload();
  }
}
