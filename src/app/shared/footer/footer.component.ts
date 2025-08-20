// shared/footer/footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
<footer class="border-top py-3 mt-auto bg-white">
  <div class="container-xxl d-flex flex-column flex-sm-row justify-content-between small text-muted">
    <div>© {{ year }} Simanics Solutions. All rights reserved.</div>
    <div class="d-flex gap-3">
      <a routerLink="/products" class="text-primary text-decoration-none">Products</a>
      <a routerLink="/contact" class="text-primary text-decoration-none">Contact</a>
    </div>
  </div>
</footer>


  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}
