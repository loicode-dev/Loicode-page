import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  protected readonly isDemo = inject(SupabaseService).isDemo;
  private readonly router = inject(Router);

  async onLogout() {
    await this.auth.signOut();
    this.router.navigate(['/admin/login']);
  }
}

