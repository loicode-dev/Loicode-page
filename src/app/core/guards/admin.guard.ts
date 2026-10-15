import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protege las rutas /admin: requiere sesión y rol de administrador. */
export const adminGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (await auth.isAdmin()) return true;
  return router.createUrlTree(['/admin/login'], { queryParams: { redirect: state.url } });
};

