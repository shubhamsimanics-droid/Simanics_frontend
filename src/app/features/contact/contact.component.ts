import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
   <section class="section">
  <h2 class="mb-3">Contact Us</h2>

  <div class="row g-4">
    <div class="col-md-6">
      <p class="mb-1 fw-semibold">Simanics Solutions</p>
      <p class="text-muted mb-2">Plot No. X, Industrial Area,<br>City Name, State, India</p>
      <p class="mb-1"><span class="text-muted">Email:</span> contact&#64;simanics.in</p>
      <p class="mb-4"><span class="text-muted">Phone:</span> +91 98765 43210</p>

      <form #form="ngForm" (ngSubmit)="submitForm(form)" class="card p-4 bg-white">
        <div class="mb-3">
          <label class="form-label">Your Name</label>
          <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Your Email</label>
          <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" required>
          <div class="form-text text-muted">We’ll use this to reply to your enquiry.</div>
        </div>
        <div class="mb-4">
          <label class="form-label">Message</label>
          <textarea rows="4" class="form-control" [(ngModel)]="formData.message" name="message" required></textarea>
        </div>
        <button class="btn btn-primary w-100" type="submit" [disabled]="form.invalid || submitting">
          <span *ngIf="!submitting">Send</span>
          <span *ngIf="submitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </button>
      </form>
    </div>

    <div class="col-md-6">
      <div class="ratio ratio-4x3 rounded-2 border overflow-hidden bg-white">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!..."
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Simanics location">
        </iframe>
      </div>
    </div>
  </div>
</section>

  `
})
export class ContactComponent {
  constructor(private toast: ToasterService) {}
  submitting = false;
  formData = { name: '', email: '', message: '' };

  submitForm(form: NgForm) {
    if (form.invalid) { return; }
    this.submitting = true;

    // TODO: replace with real API call
    setTimeout(() => {
      this.toast.success('Thanks, we’ll get back to you shortly.', 'Message sent');
      this.formData = { name: '', email: '', message: '' };
      form.resetForm();
      this.submitting = false;
    }, 600);
  }
}
