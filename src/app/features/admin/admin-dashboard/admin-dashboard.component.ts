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
  <!-- Sidebar -->
  <aside class="bg-white border-end p-3 w-240" role="navigation" aria-label="Admin sidebar">
    <h5 class="mb-4">Admin Panel</h5>

    <ul class="nav nav-pills flex-column gap-1 admin-nav">
      <li class="nav-item">
        <a class="nav-link text-reset"
           routerLink="products"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }">Manage Products</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-reset"
           routerLink="categories"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }">Manage Categories</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-reset"
           routerLink="enquiries"
           routerLinkActive="active"
           [routerLinkActiveOptions]="{ exact: true }">View Enquiries</a>
      </li>
    </ul>

    <button class="btn btn-outline-primary btn-sm w-100 mt-4" (click)="logout()">Logout</button>
  </aside>

  <!-- Main -->
  <section class="flex-grow-1 p-4">
    <router-outlet></router-outlet>
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
}
