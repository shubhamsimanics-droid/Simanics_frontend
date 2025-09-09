import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="d-flex min-vh-100 admin-shell">
  <!-- Sidebar (sticky on lg+, stacks on mobile via .admin-shell) -->
  <aside class="bg-white border-end p-3 w-240 sticky-lg-top" style="top:72px" role="navigation" aria-label="Admin sidebar">
    <h5 class="mb-4">Admin Panel</h5>

    <ul class="nav nav-pills flex-column gap-1 admin-nav">
      <li class="nav-item">
        <a class="nav-link text-reset"
           routerLink="products"
           routerLinkActive="active"
           #rlaProd="routerLinkActive"
           [attr.aria-current]="rlaProd.isActive ? 'page' : null"
           [routerLinkActiveOptions]="{ exact: true }">Manage Products</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-reset"
           routerLink="categories"
           routerLinkActive="active"
           #rlaCat="routerLinkActive"
           [attr.aria-current]="rlaCat.isActive ? 'page' : null"
           [routerLinkActiveOptions]="{ exact: true }">Manage Categories</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-reset"
           routerLink="enquiries"
           routerLinkActive="active"
           #rlaEnq="routerLinkActive"
           [attr.aria-current]="rlaEnq.isActive ? 'page' : null"
           [routerLinkActiveOptions]="{ exact: true }">View Enquiries</a>
      </li>
    </ul>

    <button class="btn btn-outline-primary btn-sm w-100 mt-4" (click)="logout()">Logout</button>
  </aside>

  <!-- Main -->
  <section class="flex-grow-1 p-4">
    <!-- Mobile quick-nav -->
    <div class="d-lg-none mb-3">
      <label for="admin-nav-mobile" class="form-label mb-1">Go to</label>
      <select id="admin-nav-mobile" class="form-select"
              (change)="onMobileNav($any($event.target).value)">
        <option [selected]="isActive('products')" value="products">Manage Products</option>
        <option [selected]="isActive('categories')" value="categories">Manage Categories</option>
        <option [selected]="isActive('enquiries')" value="enquiries">View Enquiries</option>
      </select>
    </div>

    <!-- Constrain width for better readability on wide screens -->
    <div class="container-xxl">
      <router-outlet></router-outlet>
    </div>
  </section>
</div>
  `
})
export class AdminDashboardComponent {
  constructor(private router: Router, private toast: ToasterService) {}

  logout() {
    localStorage.removeItem('token');
    this.toast.info('You have been logged out.', 'Signed out');
    this.router.navigate(['/admin/login']);
  }

  onMobileNav(value: string) {
    this.router.navigate(['/admin/dashboard', value]);
  }

  isActive(child: 'products' | 'categories' | 'enquiries'): boolean {
    return this.router.isActive(`/admin/dashboard/${child}`, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}
