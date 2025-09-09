import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/products.service';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="d-flex justify-content-between align-items-center mb-3">
  <h4 class="mb-0">Manage Products</h4>
  <a class="btn btn-primary btn-sm" [routerLink]="['/admin/dashboard/products/add']">+ Add New Product</a>
</div>

<!-- ===== Desktop/Tablet table (md and up) ===== -->
<div class="table-responsive d-none d-md-block">
  <table class="table table-sm table-bordered table-striped table-hover align-middle mb-0">
    <thead class="table-light thead-sticky">
      <tr>
        <th class="w-80px">Image</th>
        <th class="w-22pct">Name</th>
        <th class="w-18pct">Category</th>
        <th>Short Description</th>
        <th class="w-160px">Actions</th>
      </tr>
    </thead>

    <tbody *ngIf="!loading && products?.length; else stateTpl">
      <tr *ngFor="let p of products; trackBy: trackById">
        <td>
          <img *ngIf="firstImageUrl(p) as src" [src]="src" alt="thumb" class="rounded border img-64x48">
        </td>
        <td class="fw-medium">{{ p.name }}</td>
        <td>{{ p.category?.name || '—' }}</td>
        <td class="text-muted small">
          {{ p.shortDesc || (p.description?.slice(0, 80) + (p.description?.length > 80 ? '…' : '')) }}
        </td>
        <td class="text-nowrap">
          <a class="btn btn-sm btn-outline-primary me-1"
             [routerLink]="['/admin/dashboard/products/edit', p._id]">Edit</a>
          <button class="btn btn-sm btn-outline-danger"
                  (click)="deleteProduct(p._id)" [disabled]="deletingId===p._id">
            <span *ngIf="deletingId!==p._id">Delete</span>
            <span *ngIf="deletingId===p._id" class="spinner-border spinner-border-sm"></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ===== Mobile cards (under md) ===== -->
<div class="d-md-none">
  <ng-container *ngIf="!loading && products?.length; else stateTpl">
    <div class="card mb-2" *ngFor="let p of products; trackBy: trackById">
      <div class="card-body">
        <div class="d-flex align-items-start gap-2 mb-2">
          <img *ngIf="firstImageUrl(p) as src" [src]="src" alt="thumb" class="rounded border img-64x48">
          <div class="flex-grow-1">
            <div class="fw-semibold">{{ p.name }}</div>
            <div class="text-muted small">{{ p.category?.name || '—' }}</div>
          </div>
        </div>

        <p class="text-muted small mb-3">
          {{ p.shortDesc || (p.description?.slice(0, 120) + (p.description?.length > 120 ? '…' : '')) }}
        </p>

        <div class="d-flex justify-content-end gap-2">
          <a class="btn btn-sm btn-outline-primary"
             [routerLink]="['/admin/dashboard/products/edit', p._id]">Edit</a>
          <button class="btn btn-sm btn-outline-danger"
                  (click)="deleteProduct(p._id)" [disabled]="deletingId===p._id">
            <span *ngIf="deletingId!==p._id">Delete</span>
            <span *ngIf="deletingId===p._id" class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </div>
    </div>
  </ng-container>
</div>

<!-- Shared state -->
<ng-template #stateTpl>
  <div class="p-3" *ngIf="loading">
    <span class="text-muted">Loading products…</span>
  </div>
  <div class="alert alert-secondary m-0" *ngIf="!loading && !products?.length">
    No products found.
  </div>
</ng-template>
  `
})
export class ManageProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private toast = inject(ToasterService);

  products: any[] = [];
  loading = true;
  deletingId: string | null = null;

  ngOnInit(): void { this.loadProducts(); }

  trackById = (_: number, x: any) => x?._id;

  firstImageUrl = (p: any): string | null => {
    if (!p?.images?.length) return null;
    const first = p.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && first.url) return first.url as string;
    return null;
  };

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: res => { this.products = res as any[]; this.loading = false; },
      error: _ => { this.loading = false; this.toast.loadFailed('products'); }
    });
  }

  deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    this.deletingId = id;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
        this.toast.deleted('Product');
        this.deletingId = null;
      },
      error: () => { this.toast.actionFailed('Delete product'); this.deletingId = null; }
    });
  }
}
