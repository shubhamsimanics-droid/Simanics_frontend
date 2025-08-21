// shared/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<nav class="navbar navbar-expand-lg navbar-dark bg-midnight border-bottom">
  <div class="container-xxl">
    <a class="navbar-brand fw-semibold text-decoration-none" routerLink="/">Simanics</a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain"
            aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div id="navMain" class="collapse navbar-collapse">
      <ul class="navbar-nav ms-auto align-items-lg-center">
        <li class="nav-item">
          <a class="nav-link px-3" routerLink="/products" routerLinkActive="active">
           <i class="fa-solid fa-list mt-2"></i>
            Products
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link px-3" routerLink="/contact" routerLinkActive="active">
            <i class="fa-solid fa-address-card mt-2"></i>
            Contact
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>



  `
})
export class NavbarComponent {}
