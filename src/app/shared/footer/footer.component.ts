// shared/footer/footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<footer class="footer border-top mt-auto">
  <div class="container-xxl py-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">

    <!-- Left: Branding -->
    <div class="text-muted small text-center text-md-start">
      <strong style="color: var(--color-primary);">Simanics Solutions</strong><br>
      <span>© {{ year }} All rights reserved.</span>
    </div>

    <!-- Middle: Quick Links -->
    <div class="d-flex flex-wrap justify-content-center gap-4 small">
      <a routerLink="/products" class="text-decoration-none text-muted gap-1">
        <i class="fa-solid fa-list mt-2"></i>
        Products
      </a>
      <a routerLink="/contact" class="text-decoration-none text-muted gap-1">
        <i class="fa-solid fa-address-card mt-2"></i>
        Contact
      </a>
    </div>

    <!-- Right: Admin -->
    <div>
      <a class="btn btn-sm btn-primary px-3 gap-1" routerLink="/admin/login">
        <i class="fa-solid fa-user-tie"></i>
        Admin
      </a>
    </div>

  </div>
</footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(180deg, #ffffff, #f9f9f9);
    }
    .footer a:hover {
      color: var(--color-primary);
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
