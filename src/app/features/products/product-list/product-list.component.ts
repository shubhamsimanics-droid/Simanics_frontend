// src/app/features/products/product-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { ProductService } from '../../../core/services/products.service';
import { CategoryService } from '../../../core/services/category.service';

type Img = string | { url?: string; publicId?: string };
type Product = {
  _id: string;
  name: string;
  description?: string;
  shortDesc?: string;
  images?: Img[];
  category?: string;
};

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<section class="py-4">
  <div class="container">
    <div class="d-flex align-items-end justify-content-between mb-3">
      <div>
        <h2 class="mb-1">Our Products</h2>
        <div class="text-muted small" *ngIf="activeCategoryId">
  Filtered by category
  <span class="badge rounded-pill bg-primary-subtle text-primary align-middle ms-1">
    {{ activeCategoryName }}
  </span>
</div>

      </div>
      <a class="btn btn-outline-secondary btn-sm" [routerLink]="['/contact']">Request a quote</a>
    </div>

    <!-- Loading state (skeletons) -->
    <ng-container *ngIf="loading; else loadedTpl">
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-lg-4" *ngFor="let _ of skeleton">
          <div class="card h-100 shadow-sm">
            <div class="skeleton skeleton-img rounded-top"></div>
            <div class="card-body">
              <div class="skeleton skeleton-text w-75 mb-2"></div>
              <div class="skeleton skeleton-text w-100"></div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- Loaded -->
    <ng-template #loadedTpl>
      <ng-container *ngIf="products?.length; else emptyTpl">
        <div class="row g-3">
          <div class="col-12 col-sm-6 col-lg-4" *ngFor="let p of products; trackBy: trackById">
            <a class="card h-100 shadow-sm text-decoration-none text-reset lift"
               [routerLink]="['/product', p._id]">
              <div class="ratio ratio-4x3 bg-body-tertiary overflow-hidden">
                <img class="w-100 h-100 object-fit-cover"
                     [src]="primaryImage(p) || placeholder"
                     [alt]="p.name + ' image'"
                     loading="lazy" referrerpolicy="no-referrer">
              </div>
              <div class="card-body">
                <h3 class="h6 mb-1 text-truncate" [title]="p.name">{{ p.name }}</h3>
                <p class="small text-muted mb-0">
                  {{ summary(p) }}
                </p>
              </div>
            </a>
          </div>
        </div>
      </ng-container>

      <!-- Empty -->
      <ng-template #emptyTpl>
        <div class="alert alert-secondary d-flex align-items-center gap-2 mb-0">
          <span class="rounded-circle bg-secondary-subtle d-inline-block" style="width:8px;height:8px;"></span>
          No products found<span *ngIf="activeCategoryName"> for this category</span>.
          <a class="ms-1 text-decoration-none" [routerLink]="['/contact']">Contact us</a> for a curated list.
        </div>
      </ng-template>
    </ng-template>
  </div>
</section>
  `,
  styles: [`
    .lift { transition: transform .18s ease, box-shadow .18s ease; }
    .lift:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.08) !important; }

    /* Skeletons */
    .skeleton { position: relative; overflow: hidden; background: #eee; border-radius: .5rem; }
    .skeleton::after {
      content: ""; position: absolute; inset: 0; transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
      animation: shimmer 1.2s infinite;
    }
    .skeleton-img { aspect-ratio: 4 / 3; border-top-left-radius: .5rem; border-top-right-radius: .5rem; }
    .skeleton-text { height: 10px; border-radius: 6px; }
    @keyframes shimmer { 100% { transform: translateX(100%); } }
  `]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);


  products: Product[] = [];
  loading = true;
  activeCategoryId = '';
  activeCategoryName = '';
  placeholder = 'assets/placeholder-4x3.png';
  skeleton = Array.from({ length: 9 });

  ngOnInit() {
    // react to category filter changes
    this.route.queryParamMap
  .pipe(map(q => q.get('category') || ''))
  .subscribe(categoryId => {
    this.activeCategoryId = categoryId;
    this.activeCategoryName = '';

    if (categoryId) {
      this.categoryService.getCategories().subscribe({
        next: (cats: any[]) => {
          const match = cats.find(c => c._id === categoryId || c.id === categoryId);
          this.activeCategoryName = match?.name || '';
        }
      });
    }

    this.loading = true;
    this.productService.getProducts({ category: categoryId || undefined })
      .subscribe({
        next: (data) => { this.products = (data || []) as Product[]; this.loading = false; },
        error: () => { this.products = []; this.loading = false; }
      });
  });

  }

  trackById = (_: number, x: Product) => x?._id;

  primaryImage(p: Product): string | null {
    const first: Img | undefined = p?.images?.[0];
    if (!first) return null;
    return typeof first === 'string' ? first : (first.url || null);
  }

  summary(p: Product): string {
    const s = p.shortDesc?.trim();
    if (s && s.length) return s;
    const d = (p.description || '').trim();
    return d.length > 120 ? d.slice(0, 120) + '…' : d || 'Tap to view details';
  }
}
