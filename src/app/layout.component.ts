// layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { FloatingActionsComponent } from './floating-actions.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, FloatingActionsComponent],
  template: `
<div class="d-flex flex-column min-vh-100">
  <app-navbar></app-navbar>

  <main class="py-4 flex-grow-1"><router-outlet></router-outlet></main>

  <app-footer></app-footer>

  <!-- Floating actions -->
  <app-floating-actions
    [phone]="'919426467608'"
    [message]="'Hello, I am interested in Simanics products.'">
  </app-floating-actions>
</div>
  `
})
export class LayoutComponent {}
