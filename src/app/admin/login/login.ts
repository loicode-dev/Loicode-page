import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, DEMO_CREDENTIALS } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <div class="card card-soft p-4 p-md-5 login-card">
        <div class="text-center mb-4">
          <h1 class="h3 font-outfit text-navy mb-1">LOI <span class="text-accent">CODE</span></h1>
          <p class="text-muted-brand small">Panel de Administración</p>
        </div>

        @if (isDemo) {
          <div class="alert alert-info small mb-4">
            <i class="bi bi-info-circle-fill me-1"></i> <strong>Modo Demo Activo</strong><br />
            Credenciales de prueba:<br />
            <strong>Usuario:</strong> {{ demoCreds.email }}<br />
            <strong>Contraseña:</strong> {{ demoCreds.password }}
          </div>
        }

        @if (errorMessage()) {
          <div class="alert alert-danger small mb-4">
            <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="form-label" for="adminEmail">Correo Electrónico</label>
            <input id="adminEmail" type="email" class="form-control" formControlName="email" placeholder="admin@loicode.com" />
          </div>

          <div class="mb-4">
            <label class="form-label" for="adminPass">Contraseña</label>
            <input id="adminPass" type="password" class="form-control" formControlName="password" />
          </div>

          <button type="submit" class="btn btn-brand w-100 py-2" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm me-2"></span> Ingresando...
            } @else {
              <i class="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
            }
          </button>
        </form>

        <div class="text-center mt-4">
          <a href="/" class="small text-muted-brand text-decoration-none">← Volver al sitio principal</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background:
        radial-gradient(circle at 10% 10%, rgba(255, 214, 10, 0.15), transparent 40%),
        var(--brand-deep);
      padding: 1.5rem;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
    }
  `,
})
export class AdminLogin {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly isDemo = inject(SupabaseService).isDemo;
  protected readonly demoCreds = DEMO_CREDENTIALS;

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group({
    email: [this.isDemo ? DEMO_CREDENTIALS.email : '', [Validators.required, Validators.email]],
    password: [this.isDemo ? DEMO_CREDENTIALS.password : '', [Validators.required]],
  });

  async onSubmit() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const { email, password } = this.form.value;
      await this.auth.signIn(email!, password!);
      const redirect = this.route.snapshot.queryParams['redirect'] || '/admin';
      this.router.navigateByUrl(redirect);
    } catch (err: any) {
      this.errorMessage.set(err.message || 'Error al iniciar sesión.');
    } finally {
      this.loading.set(false);
    }
  }
}

