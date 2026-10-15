import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CATEGORY_INFO } from '../../core/models/product.model';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private readonly router = inject(Router);
  protected readonly menuOpen = signal(false);
  protected readonly servicesOpen = signal(false);
  protected readonly servicesActive = signal(false);
  protected readonly scrolled = signal(false);
  protected readonly categories = Object.values(CATEGORY_INFO);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => {
        this.menuOpen.set(false);
        this.servicesOpen.set(false);
        this.servicesActive.set(/^\/(servicios|mis-xv)/.test(e.urlAfterRedirects));
      });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 10);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.servicesOpen.set(false);
  }
}

