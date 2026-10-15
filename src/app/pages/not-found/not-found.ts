import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="container py-5 my-5 text-center">
      <div class="display-1 fw-bold text-navy mb-2">404</div>
      <h1 class="h3 mb-3">Página No Encontrada</h1>
      <p class="text-muted-brand mb-4">La página que estás buscando no existe o ha sido movida.</p>
      <a routerLink="/" class="btn btn-brand">Regresar al Inicio</a>
    </div>
  `,
})
export class NotFound {}

