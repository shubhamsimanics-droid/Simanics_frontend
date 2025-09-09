import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToasterService } from '../../core/services/toaster.service';
import { ComplaintService } from '../../core/services/complaint.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/products.service';

type IdLike = { _id?: string; id?: string };
const getId = (o: IdLike | null | undefined) => (o && (o._id || o.id)) ?? '';

@Component({
  selector: 'app-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="py-4">
    <div class="container">
      <header class="mb-4">
        <h2 class="mb-1">Register a Complaint</h2>
        <p class="text-muted mb-0">We acknowledge within one business day.</p>
      </header>

      <div class="row g-4">
        <!-- Info card -->
        <div class="col-md-5">
          <div class="card border-0 shadow-sm lift">
            <div class="card-body">
              <div class="d-flex align-items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" class="text-primary">
                  <path fill="currentColor" d="M12 2l8 4v6c0 5-3.5 9-8 10C7.5 21 4 17 4 12V6l8-4zm0 2.2L6 6.7v5.3c0 3.8 2.6 7.1 6 8 3.4-.9 6-4.2 6-8V6.7l-6-2.5z"/>
                </svg>
                <strong>Simanics Solutions — Support</strong>
              </div>
              <div class="text-muted small mb-3">Mon–Sat, 10:00–18:00 IST</div>

              <ul class="small mb-0 ps-3">
                <li>Quote your order/invoice (if any).</li>
                <li>Attach clear details of the issue.</li>
                <li>We’ll assign a ticket and keep you updated.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="col-md-7">
          <form #form="ngForm" (ngSubmit)="submit(form)" class="card border-0 shadow-sm" [attr.aria-busy]="submitting" novalidate>
            <div class="card-body p-4">
              <div class="row g-3">

                <!-- Contact -->
                <div class="col-md-6">
                  <label class="form-label">Your Name</label>
                  <div class="input-icon">
                    <input type="text" class="form-control"
                           [(ngModel)]="data.name" name="name"
                           required minlength="2">
                    <span class="icon">👤</span>
                  </div>
                  <div class="invalid small text-danger" *ngIf="form.submitted && form.controls['name']?.invalid">
                    Enter your name (min 2 chars).
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <div class="input-icon">
                    <input type="email" class="form-control"
                           [(ngModel)]="data.email" name="email"
                           required email>
                    <span class="icon">✉️</span>
                  </div>
                  <div class="invalid small text-danger" *ngIf="form.submitted && form.controls['email']?.errors?.['required']">
                    Email is required.
                  </div>
                  <div class="invalid small text-danger" *ngIf="form.submitted && form.controls['email']?.errors?.['email']">
                    Enter a valid email address.
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Phone</label>
                  <div class="input-icon">
                    <input type="tel" class="form-control"
                           [(ngModel)]="data.phone" name="phone"
                           required inputmode="numeric"
                           pattern="^[0-9]{10}$"
                           maxlength="10" minlength="10"
                           (input)="enforcePhoneDigits($event)">
                    <span class="icon">📞</span>
                  </div>
                  <div class="invalid small text-danger" *ngIf="form.submitted && form.controls['phone']?.errors?.['required']">
                    Phone is required.
                  </div>
                  <div class="invalid small text-danger" *ngIf="form.submitted && (form.controls['phone']?.errors?.['pattern'] || form.controls['phone']?.errors?.['minlength'] || form.controls['phone']?.errors?.['maxlength'])">
                    Enter a 10-digit phone number (digits only).
                  </div>
                </div>

                <!-- Complaint meta -->
                <div class="col-md-6">
                  <label class="form-label">Complaint Type</label>
                  <select class="form-select" name="type" [(ngModel)]="data.type" required>
                    <option value="" disabled selected>Select type…</option>
                    <option value="product_defect">Product defect</option>
                    <option value="delivery_issue">Delivery issue</option>
                    <option value="billing">Billing</option>
                    <option value="service_support">Service/Support</option>
                    <option value="other">Other</option>
                  </select>
                  <div class="invalid small text-danger" *ngIf="form.submitted && form.controls['type']?.invalid">
                    Select a complaint type.
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label">Order/Invoice (optional)</label>
                  <input class="form-control" type="text"
                         [(ngModel)]="data.orderRef" name="orderRef"
                         placeholder="e.g., INV-2025-00123">
                </div>

                <!-- Category/Product link (optional) -->
                <div class="col-md-6">
                  <label class="form-label">Category (optional)</label>
                  <select class="form-select" name="categoryId"
                          [(ngModel)]="data.categoryId"
                          (ngModelChange)="onCategoryChange($event)"
                          [disabled]="loading.products">
                    <option value="" selected>—</option>
                    <option *ngFor="let c of categories" [value]="getId(c)">{{ c.name }}</option>
                  </select>
                </div>

                <div class="col-12" *ngIf="data.categoryId">
                  <label class="form-label">Related Products (optional)</label>
                  <select class="form-select" multiple name="productIds"
                          [(ngModel)]="data.productIds"
                          [disabled]="loading.products" size="5">
                    <option *ngFor="let p of products" [value]="getId(p)">{{ p.name }}</option>
                  </select>
                  <div class="small text-muted mt-1">Hold Ctrl/⌘ for multi-select.</div>
                </div>

                <!-- Details -->
                <div class="col-12">
                  <label class="form-label">Issue Details</label>
                  <textarea rows="6" class="form-control"
                            [(ngModel)]="data.description" name="description"
                            required minlength="10"
                            placeholder="Describe the problem, when it occurs, and any steps to reproduce."></textarea>
                  <div class="invalid small text-danger" *ngIf="form.submitted && form.controls['description']?.invalid">
                    Add details (min 10 chars).
                  </div>
                </div>

                <!-- Attach image (optional) -->
                <div class="col-12">
                  <label class="form-label">Attach Image (optional)</label>
                  <input type="file" class="form-control" accept="image/*" (change)="onFile($event)">
                  <div class="small text-muted mt-1">PNG, JPG, WebP, GIF up to 5 MB.</div>
                </div>

                <!-- Consent + Honeypot -->
                <div class="col-12">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" [(ngModel)]="data.consent" name="consent" required>
                    <label class="form-check-label">You may contact me about this complaint.</label>
                  </div>
                  <div class="invalid small text-danger" *ngIf="form.submitted && form.controls['consent']?.invalid">
                    Please provide consent so we can reply.
                  </div>
                </div>

                <input type="text" name="website" [(ngModel)]="data.website" class="visually-hidden" tabindex="-1" autocomplete="off">
              </div>
            </div>

            <div class="card-footer bg-white border-0 p-4 pt-0">
              <button class="btn btn-primary w-100" type="submit" [disabled]="submitting">
                <ng-container *ngIf="!submitting; else busyTpl">Submit Complaint</ng-container>
              </button>
              <ng-template #busyTpl>
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting…
              </ng-template>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
  `,
  styles: [`
    .lift { transition: transform .18s ease, box-shadow .18s ease; }
    .lift:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.08) !important; }
    .input-icon { position: relative; }
    .input-icon .icon { position: absolute; right: .75rem; top: 50%; transform: translateY(-50%); pointer-events: none; opacity: .55; }
    .invalid { display: none; }
    :host ::ng-deep form.ng-submitted .ng-invalid ~ .invalid { display: block; }
    .visually-hidden { position: absolute !important; height: 1px; width: 1px; overflow: hidden; clip: rect(1px,1px,1px,1px); white-space: nowrap; }
  `]
})
export class ComplaintComponent implements OnInit {
  constructor(
    private toast: ToasterService,
    private complaints: ComplaintService,
    private categoriesApi: CategoryService,
    private productsApi: ProductService
  ) {}

  loading = { products: false };
  categories: any[] = [];
  products: any[] = [];

  submitting = false;
  private imageFile: File | null = null;

  data: {
    name: string; email: string; phone?: string;
    type: 'product_defect'|'delivery_issue'|'billing'|'service_support'|'other'|'';
    orderRef?: string;
    description: string;
    consent?: boolean; website?: string;
    categoryId?: string; productIds: string[];
  } = {
    name: '', email: '', phone: '',
    type: '',
    orderRef: '', description: '',
    consent: false, website: '',
    categoryId: '', productIds: []
  };

  ngOnInit() { this.fetchCategories(); }

  getId = getId;

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.imageFile = (input.files && input.files[0]) ? input.files[0] : null;
  }

  // Enforce digits-only and max 10 as the user types
  enforcePhoneDigits(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '').slice(0, 10);
    input.value = digits;
    this.data.phone = digits;
  }

  fetchCategories() {
    this.categoriesApi.getCategories().subscribe({
      next: (list: any[]) => this.categories = list || [],
      error: () => this.toast.error?.('Could not load categories.', 'Error')
    });
  }

  onCategoryChange(categoryId: string) {
    this.data.productIds = [];
    if (!categoryId) { this.products = []; return; }
    this.loading.products = true;
    this.productsApi.getProducts({ category: categoryId }).subscribe({
      next: (list: any[]) => this.products = list || [],
      error: () => this.toast.error?.('Could not load products for this category.', 'Error'),
      complete: () => this.loading.products = false
    });
  }

  submit(form: NgForm) {
    if (form.invalid) return;

    // Honeypot
    if (this.data.website) {
      this.toast.info('Thanks, we’ve recorded your complaint.', 'Received');
      form.resetForm();
      this.imageFile = null;
      return;
    }

    this.submitting = true;

    const fd = new FormData();
    fd.append('name', (this.data.name || '').trim());
    fd.append('email', (this.data.email || '').trim());
    fd.append('phone', (this.data.phone || '').trim());
    fd.append('type', this.data.type);
    fd.append('orderRef', (this.data.orderRef || '').trim()); // optional
    fd.append('description', (this.data.description || '').trim());
    if (this.data.categoryId) fd.append('categoryId', this.data.categoryId); // optional
    if (this.data.productIds?.length) fd.append('productIds', JSON.stringify(this.data.productIds)); // optional
    if (this.imageFile) fd.append('image', this.imageFile); // optional

    this.complaints.createComplaint(fd).subscribe({
      next: () => {
        this.toast.success('Complaint submitted. We’ll contact you shortly.', 'Sent');
        this.submitting = false;
        form.resetForm();
        this.imageFile = null;
      },
      error: (err: any) => {
        console.error('Complaint submit failed:', err);
        this.toast.error?.('Could not submit your complaint. Try again.', 'Error');
        this.submitting = false;
      }
    });
  }
}
