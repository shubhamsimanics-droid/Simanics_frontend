// src/app/features/products/product-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/products.service';

import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

type Img = string | { url?: string; publicId?: string };

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="container py-4">
  <h2 class="mb-4">Our Products</h2>

  <ng-container *ngIf="products?.length; else loading">
    <div class="row g-4">
      <div class="col-md-4" *ngFor="let p of products; trackBy: trackById">
        <a class="card h-100 shadow-sm text-decoration-none text-reset"
           [routerLink]="['/product', p._id]">
          <img
            class="card-img-top img-cover-180"
            [src]="primaryImage(p) || placeholder"
            [alt]="p.name + ' image'">
          <div class="card-body">
            <h5 class="card-title mb-1">{{ p.name }}</h5>
            <p class="card-text text-muted mb-0">
              {{ p.shortDesc || (p.description?.slice(0,120) + (p.description?.length > 120 ? '…' : '')) }}
            </p>
          </div>
        </a>
      </div>
    </div>
  </ng-container>

  <ng-template #loading>
    <p class="text-muted">Loading products…</p>
  </ng-template>
</div>


  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  products: any[] = [];
  placeholder = 'assets/placeholder-4x3.png'; // add a small local placeholder image

  private route = inject(ActivatedRoute);

  ngOnInit() {
    // reload when query param changes
    this.route.queryParamMap
    .pipe(map(q => q.get('category') || ''))
    .subscribe(categoryId => {
      this.productService.getProducts({ category: categoryId || undefined })
        .subscribe(data => this.products = data as any[]);
    });
  }

  trackById = (_: number, x: any) => x?._id;

  primaryImage(p: any): string | null {
    const first: Img | undefined = p?.images?.[0];
    if (!first) return null;
    return typeof first === 'string' ? first : (first.url || null);
  }
}
