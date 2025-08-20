import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';

type Img = string | { url?: string; publicId?: string };
type Category = { _id: string; name: string; description?: string; image?: Img | null };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- HERO -->
    <section class="py-5 py-lg-6 text-center bg-light-gray">
      <div class="container">
        <h1 class="display-5 fw-semibold mb-3">Simanics Solutions</h1>
        <p class="lead text-muted mb-4">
          Specialists in hygiene healthcare products — built on quality, trust, and dependable service.
        </p>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <a class="btn btn-primary btn-lg px-4" routerLink="/products">Explore Products</a>
          <a class="btn btn-outline-gold btn-lg px-4" routerLink="/contact">Contact Us</a>
        </div>
      </div>
    </section>

    <!-- BROWSE BY CATEGORY -->
    <section class="py-5 border-top bg-light-gray">
      <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-3">
          <h2 class="h3 mb-0">Browse by Category</h2>
          <a class="small text-primary text-decoration-none" routerLink="/products">View all products →</a>
        </div>

        <ng-container *ngIf="!loading; else loadingTpl">
          <div *ngIf="categories?.length; else emptyTpl" class="row g-3">
            <div class="col-12 col-sm-6 col-lg-3" *ngFor="let c of categories.slice(0, 8); trackBy: trackById">
              <a class="card h-100 text-decoration-none text-reset shadow-sm"
                 [routerLink]="['/products']"
                 [queryParams]="{ category: c._id }">
                <img
                  class="card-img-top img-120x90"
                  [src]="catImg(c) || placeholder"
                  [alt]="c.name"
                />
                <div class="card-body">
                  <h3 class="h6 mb-1">{{ c.name }}</h3>
                  <p class="small text-muted mb-0">
                    {{ (c.description || '') | slice:0:80 }}{{ c.description!.length > 80 ? '…' : '' }}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </ng-container>

        <ng-template #loadingTpl>
          <div class="text-muted">Loading categories…</div>
        </ng-template>
        <ng-template #emptyTpl>
          <div class="alert alert-secondary mb-0">No categories yet.</div>
        </ng-template>
      </div>
    </section>

    <!-- QUICK STATS -->
    <section class="py-4 border-top bg-light-gray">
      <div class="container">
        <div class="row g-3 text-center">
          <div class="col-6 col-md-3">
            <div class="p-3 border rounded-3 bg-white">
              <div class="h4 mb-0 fw-semibold">500+</div>
              <div class="text-muted small">Installations</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 border rounded-3 bg-white">
              <div class="h4 mb-0 fw-semibold">50+</div>
              <div class="text-muted small">Product SKUs</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 border rounded-3 bg-white">
              <div class="h4 mb-0 fw-semibold">Pan-India</div>
              <div class="text-muted small">Fulfilment</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="p-3 border rounded-3 bg-white">
              <div class="h4 mb-0 fw-semibold">Same-day</div>
              <div class="text-muted small">Quotes</div>
            </div>
          </div>
        </div>
      </div>
    </section>

  `
})
export class HomeComponent implements OnInit {
  private categoriesApi = inject(CategoryService);

  categories: Category[] = [];
  loading = true;
  placeholder = 'assets/placeholder-4x3.png';

  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe({
      next: (res) => { this.categories = res as Category[]; this.loading = false; },
      error: () => { this.loading = false; this.categories = []; }
    });
  }

  trackById = (_: number, c: Category) => c._id;

  catImg(c: Category): string | null {
    const img = c?.image as any;
    if (!img) return null;
    return typeof img === 'string' ? img : (img.url || null);
  }
}
