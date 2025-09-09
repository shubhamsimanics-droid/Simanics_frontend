import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/products.service';

type Category = { _id: string; name: string };
type Product  = { _id: string; name: string };

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<nav class="navbar navbar-expand-lg navbar-dark bg-midnight border-bottom">
  <div class="container-xxl">
    <a class="navbar-brand d-flex align-items-center" routerLink="/">
      <img src="SimanicsBrandLogo.png" alt="Simanics" height="40">
    </a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false"
            aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div id="navMain" class="collapse navbar-collapse">
      <ul class="navbar-nav ms-auto align-items-lg-center">

        <!-- Static items -->
        <li class="nav-item d-lg-none"><a class="nav-link" routerLink="/products">
          <i class="fa-solid fa-list me-1"></i>All Products</a></li>


        <!-- Categories as top-level navbar items -->
        <li class="nav-item dropdown position-static"
            *ngFor="let c of categories; trackBy: trackById"
            (mouseenter)="open(c._id)" (mouseleave)="close()">

          <!-- Desktop hover, Mobile tap -->
          <a class="nav-link dropdown-toggle text-uppercase"
             href="javascript:void(0)"
             [class.show]="openCategoryId===c._id"
             (click)="toggle(c._id)">
            {{ c.name }}
          </a>

          <!-- Mega dropdown for this category -->
          <div class="dropdown-menu mega-menu p-3 p-lg-4"
               [class.show]="openCategoryId===c._id">

            <ng-container *ngIf="openCategoryId as catId; else none">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <h6 class="mb-0 text-uppercase fw-semibold">{{ categoryName(catId) }}</h6>
                <a class="small text-decoration-none"
                   [routerLink]="['/products']" [queryParams]="{ category: catId }"
                   (click)="close()">View all →</a>
              </div>

              <div *ngIf="loadingProducts.has(catId)" class="text-muted small">Loading…</div>

              <div *ngIf="!loadingProducts.has(catId)">
                <div class="row g-2 row-cols-1 row-cols-sm-2 row-cols-lg-3">
                  <div class="col"
                       *ngFor="let p of (productsByCat[catId] ?? []).slice(0, 12); trackBy: trackById">
                    <a class="mega-pill d-block text-decoration-none"
                       [routerLink]="['/product', p._id]"
                       (click)="close()">{{ p.name }}</a>
                  </div>
                </div>

                <div *ngIf="(productsByCat[catId] ?? []).length === 0"
                     class="text-muted small mt-2">No products yet.</div>
              </div>
            </ng-container>

            <ng-template #none>
              <div class="text-muted small">Select a category.</div>
            </ng-template>
          </div>
        </li>
         <li class="nav-item"><a class="nav-link" routerLink="/contact">
          <i class="fa-solid fa-address-card me-1"></i>Contact</a></li>
      </ul>
    </div>
  </div>
</nav>
  `,
  styles: [`
/* Make dropdown stretch under the nav item */
.navbar .dropdown-menu { margin-top:0; border-top-left-radius:0; border-top-right-radius:0; }

/* Full-width panel aligned under the bar */
.mega-menu { left:0; right:0; top:100%; border-top:1px solid rgba(255,255,255,.08); }
@media (max-width: 991.98px) { .position-static > .mega-menu { position: static; } }

/* Pills */
.mega-pill { padding:.9rem 1rem; border:1px solid #e9edf4; border-radius:.5rem; background:#fff;
  color:#0b1324; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  transition:box-shadow .15s ease, transform .15s ease, border-color .15s ease; }
.mega-pill:hover { border-color:#dbe3f0; transform:translateY(-1px);
  box-shadow:0 .5rem 1rem rgba(0,0,0,.06); }
  `]
})
export class NavbarComponent implements OnInit {
  private categoriesApi = inject(CategoryService);
  private productsApi = inject(ProductService);

  categories: Category[] = [];
  productsByCat: Record<string, Product[]> = {};
  loadingProducts = new Set<string>();
  openCategoryId: string | null = null;

  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe({
      next: cs => this.categories = cs ?? [],
      error: () => this.categories = []
    });
  }

  trackById = (_: number, x: { _id: string }) => x._id;

  open(id: string) { this.openCategoryId = id; this.ensureLoaded(id); }
  close()         { this.openCategoryId = null; }
  toggle(id: string) {
    // mobile tap toggle inside collapsed navbar
    this.openCategoryId = this.openCategoryId === id ? null : id;
    if (this.openCategoryId) this.ensureLoaded(this.openCategoryId);
  }

  ensureLoaded(id: string) {
    if (this.productsByCat[id] || this.loadingProducts.has(id)) return;
    this.loadingProducts.add(id);
    this.productsApi.getProducts({ category: id }).subscribe({
      next: ps => {
        // de-dup by name (optional)
        const list = (ps ?? [])
          .map(p => ({ _id: p._id, name: (p.name ?? '').trim() }))
          .filter((p, i, arr) =>
            p.name && arr.findIndex(x => x.name.toLowerCase() === p.name.toLowerCase()) === i);
        this.productsByCat[id] = list;
        this.loadingProducts.delete(id);
      },
      error: () => { this.productsByCat[id] = []; this.loadingProducts.delete(id); }
    });
  }

  categoryName(id: string): string {
    return this.categories.find(x => x._id === id)?.name ?? 'Category';
  }
}
