// src/app/features/products/product-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductService } from '../../../core/services/products.service';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { ToasterService } from '../../../core/services/toaster.service';

type Img = string | { url?: string; publicId?: string };
type Spec = { key: string; value: string };

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<section class="py-4" *ngIf="!loading; else loadingTpl">
  <div class="container" *ngIf="product; else errorTpl">
    <!-- Header -->
    <header class="mb-3">
      <h2 class="mb-1">{{ product.name }}</h2>
      <p class="text-muted mb-0" *ngIf="product.shortDesc">{{ product.shortDesc }}</p>
    </header>

    <div class="row g-4">
      <!-- Gallery -->
      <div class="col-md-7">
        <div class="card border-0 shadow-sm">
          <div class="ratio ratio-4x3 bg-body-tertiary overflow-hidden rounded-top">
            <img
              class="w-100 h-100 object-fit-cover"
              [src]="activeImgUrl() || placeholder"
              [alt]="product.name + ' image'"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
          </div>
          <div class="p-2 d-flex flex-wrap gap-2">
            <button
              *ngFor="let img of (product.images || []); let i = index; trackBy: trackByIndex"
              type="button"
              class="thumb btn p-0 border-0"
              [class.active]="i === activeIdx"
              (click)="activeIdx = i"
              [attr.aria-label]="'Image ' + (i + 1)"
            >
              <div class="ratio ratio-4x3 rounded overflow-hidden bg-body-tertiary">
                <img class="w-100 h-100 object-fit-cover"
                     [src]="imgUrl(img) || placeholder"
                     [alt]="product.name + ' thumbnail ' + (i + 1)"
                     loading="lazy" referrerpolicy="no-referrer" />
              </div>
            </button>
          </div>
        </div>

        <!-- Description & Specs -->
        <div class="mt-3">
          <p class="text-muted" *ngIf="product.description">{{ product.description }}</p>

          <div *ngIf="product.specs?.length">
            <h5 class="mb-2">Specifications</h5>
            <table class="table table-sm align-middle">
              <tbody>
                <tr *ngFor="let s of product.specs as specs">
                  <th class="fw-normal text-muted spec-key">{{ s.key }}</th>
                  <td>{{ s.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Enquiry -->
      <div class="col-md-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="mb-3">Submit an enquiry</h5>

            <form #f="ngForm" (ngSubmit)="submitEnquiry(f)" novalidate>
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input class="form-control" [(ngModel)]="enquiry.name" name="name" required minlength="2">
                <div class="invalid small text-danger" *ngIf="f.submitted && f.controls['name']?.invalid">
                  Enter your name (min 2 chars).
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input class="form-control" [(ngModel)]="enquiry.email" name="email" type="email" required email>
                <div class="invalid small text-danger" *ngIf="f.submitted && f.controls['email']?.invalid">
                  Enter a valid email.
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Message</label>
                <textarea class="form-control" rows="4" [(ngModel)]="enquiry.message" name="message" required minlength="10"></textarea>
                <div class="invalid small text-danger" *ngIf="f.submitted && f.controls['message']?.invalid">
                  Add a short message (min 10 chars).
                </div>
              </div>

              <!-- Honeypot (spam trap) -->
              <input type="text" class="visually-hidden" name="website" [(ngModel)]="enquiry.website" tabindex="-1" autocomplete="off">

              <button class="btn btn-primary w-100" type="submit" [disabled]="f.invalid || submitting">
                <ng-container *ngIf="!submitting; else busyTpl">Submit</ng-container>
              </button>
              <ng-template #busyTpl>
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sending…
              </ng-template>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Loading -->
<ng-template #loadingTpl>
  <section class="py-4">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-7">
          <div class="card shadow-sm">
            <div class="skeleton skeleton-img rounded-top"></div>
            <div class="p-3">
              <div class="skeleton skeleton-text w-50 mb-2"></div>
              <div class="skeleton skeleton-text w-100 mb-2"></div>
              <div class="skeleton skeleton-text w-75"></div>
            </div>
          </div>
        </div>
        <div class="col-md-5">
          <div class="card shadow-sm">
            <div class="p-3">
              <div class="skeleton skeleton-text w-25 mb-3"></div>
              <div class="skeleton skeleton-text w-100 mb-2"></div>
              <div class="skeleton skeleton-text w-100 mb-2"></div>
              <div class="skeleton skeleton-text w-100 mb-3"></div>
              <div class="skeleton skeleton-text w-50 mb-2"></div>
              <div class="skeleton skeleton-text w-25"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</ng-template>

<!-- Error / Not found -->
<ng-template #errorTpl>
  <section class="py-4">
    <div class="container">
      <div class="alert alert-secondary d-flex align-items-center gap-2 mb-0">
        <span class="rounded-circle bg-secondary-subtle d-inline-block" style="width:8px;height:8px;"></span>
        Product not found or failed to load.
      </div>
    </div>
  </section>
</ng-template>
  `,
  styles: [`
    .thumb { width: 96px; }
    .thumb .ratio { border: 1px solid var(--bs-border-color); }
    .thumb.active .ratio { outline: 2px solid var(--color-primary, var(--bs-primary)); }

    .spec-key { width: 30%; min-width: 140px; }

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

    .visually-hidden { position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px, 1px, 1px, 1px); white-space: nowrap; }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private enquiryService = inject(EnquiryService);
  private toast = inject(ToasterService);

  product: {
    _id: string;
    name: string;
    shortDesc?: string;
    description?: string;
    images?: Img[];
    specs?: Spec[];
  } | null = null;

  loading = true;
  submitting = false;
  activeIdx = 0;

  enquiry: { name: string; email: string; message: string; website?: string } = {
    name: '', email: '', message: '', website: ''
  };

  placeholder = 'assets/placeholder-4x3.png';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading = false;
      this.product = null;
      return;
    }

    this.productService.getProductById(id).subscribe({
      next: (res: any) => {
        this.product = res || null;
        this.activeIdx = 0;
        this.loading = false;
      },
      error: _ => {
        this.toast.loadFailed?.('product');
        this.product = null;
        this.loading = false;
      }
    });
  }

  submitEnquiry(form: NgForm) {
    if (!this.product?._id || form.invalid) return;

    // Spam trap: if honeypot filled, silently accept
    if (this.enquiry.website) {
      this.toast.success?.('Thanks, we’ll get back to you shortly.', 'Message received');
      form.resetForm();
      return;
    }

    this.submitting = true;
    const payload = {
      name: (this.enquiry.name || '').trim(),
      email: (this.enquiry.email || '').trim(),
      message: (this.enquiry.message || '').trim(),
      product: this.product._id
    };

    this.enquiryService.createEnquiry(payload).subscribe({
      next: () => {
        this.toast.success('Your enquiry has been submitted.', 'Thank you');
        this.enquiry = { name: '', email: '', message: '' };
        form.resetForm();
        this.submitting = false;
      },
      error: () => {
        this.toast.actionFailed?.('Submit enquiry');
        this.submitting = false;
      }
    });
  }

  activeImgUrl(): string | null {
    const imgs = this.product?.images || [];
    if (!imgs.length) return null;
    const first: Img = imgs[this.activeIdx] ?? imgs[0];
    return this.imgUrl(first);
    }

  imgUrl(i: Img): string | null {
    return typeof i === 'string' ? i : (i?.url || null);
  }

  trackByIndex = (_: number, __: any) => _;
}
