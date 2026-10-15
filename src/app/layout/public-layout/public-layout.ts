import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { Navbar } from '../navbar/navbar';

/** Layout del sitio público: navbar + contenido + footer */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Navbar, Footer],
  template: `
    <app-navbar />
    <main class="flex-grow-1">
      <router-outlet />
    </main>
    <app-footer />
  `,
  host: { class: 'd-flex flex-column min-vh-100' },
})
export class PublicLayout {}

