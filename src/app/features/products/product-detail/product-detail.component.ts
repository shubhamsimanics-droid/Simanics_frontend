import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductService } from '../../../core/services/products.service';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
<section class="section" *ngIf="product">
  <h2 class="mb-3">{{ product.name }}</h2>

  <!-- Gallery -->
  <div class="mb-3 d-flex gap-2 flex-wrap" *ngIf="product.images?.length">
    <img *ngFor="let img of product.images"
         [src]="imgUrl(img) || 'assets/placeholder-4x3.png'"
         class="rounded border img-cover-140x100"
         [alt]="product.name + ' image'">
  </div>

  <!-- Description & Specs -->
  <div class="row g-4">
    <div class="col-md-7">
      <p class="mb-2" *ngIf="product.shortDesc">{{ product.shortDesc }}</p>
      <p class="text-muted" *ngIf="product.description">{{ product.description }}</p>

      <div *ngIf="product.specs?.length" class="mt-3">
        <h5 class="mb-2">Specifications</h5>
        <table class="table table-sm">
          <tbody>
            <tr *ngFor="let s of product.specs">
              <th class="fw-normal text-muted w-30">{{ s.key }}</th>
              <td>{{ s.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enquiry -->
    <div class="col-md-5">
      <div class="card p-3 bg-white">
        <h5 class="mb-3">Submit an Enquiry</h5>
        <form #f="ngForm" (ngSubmit)="submitEnquiry(f)">
          <div class="mb-3">
            <label class="form-label">Name</label>
            <input class="form-control" [(ngModel)]="enquiry.name" name="name" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input class="form-control" [(ngModel)]="enquiry.email" name="email" type="email" required>
          </div>
          <div class="mb-3">
            <label class="form-label">Message</label>
            <textarea class="form-control" rows="4" [(ngModel)]="enquiry.message" name="message" required></textarea>
          </div>
          <button class="btn btn-primary w-100" type="submit" [disabled]="f.invalid || submitting">
            <span *ngIf="!submitting">Submit</span>
            <span *ngIf="submitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          </button>
        </form>
      </div>
    </div>
  </div>
</section>


  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private enquiryService = inject(EnquiryService);
  private toast = inject(ToasterService);

  product: any = null;
  submitting = false;
  enquiry = { name: '', email: '', message: '' };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: res => this.product = res,
        error: _ => this.toast.loadFailed('product')
      });
    }
  }

  submitEnquiry(form: NgForm) {
    if (!this.product?._id || form.invalid) return;

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
        this.toast.actionFailed('Submit enquiry');
        this.submitting = false;
      }
    });
  }

  // add in your ProductDetailComponent class
  imgUrl(i: string | {url?: string}): string | null {
    return typeof i === 'string' ? i : (i?.url || null);
  }
}
