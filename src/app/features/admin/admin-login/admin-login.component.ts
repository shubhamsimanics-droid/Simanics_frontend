import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="d-flex align-items-center justify-content-center min-vh-100">
  <form class="card p-4 bg-white min-w-360" #f="ngForm" (ngSubmit)="login(f)">
    <h4 class="mb-3 text-center">Admin Login</h4>

    <div class="mb-3">
      <label class="form-label">Username</label>
      <input class="form-control" type="text" [(ngModel)]="username" name="username" required autocomplete="username">
    </div>

    <div class="mb-3">
  <label class="form-label">Password</label>
  <div class="input-group">
    <input
      class="form-control"
      [type]="showPass ? 'text' : 'password'"
      [(ngModel)]="password"
      name="password"
      required
      autocomplete="current-password"
    />

    <button
      type="button"
      class="btn btn-outline-secondary"
      (click)="showPass = !showPass"
      [attr.aria-pressed]="showPass"
      [attr.aria-label]="showPass ? 'Hide password' : 'Show password'"
      title="{{ showPass ? 'Hide' : 'Show' }} password"
    >
      <!-- eye -->
      <svg *ngIf="!showPass" width="18" height="18" viewBox="0 0 24 24">
        <path fill="currentColor"
          d="M12 5c-5 0-9.27 3.11-10.73 7.5C2.73 16.89 7 20 12 20s9.27-3.11 10.73-7.5C21.27 8.11 17 5 12 5Zm0 12a4.5 4.5 0 1 1 0-9a4.5 4.5 0 0 1 0 9Zm0-2.5a2 2 0 1 0 0-4a2 2 0 0 0 0 4Z"/>
      </svg>
      <!-- eye-off -->
      <svg *ngIf="showPass" width="18" height="18" viewBox="0 0 24 24">
        <path fill="currentColor"
          d="M2.1 3.51L.69 4.93l3.07 3.07C2.32 9.2 1.2 10.55.54 12.5C2 16.89 6.27 20 11.27 20c2.1 0 4.06-.52 5.76-1.43l3.27 3.27l1.41-1.41L2.1 3.51ZM11.27 18C7.5 18 4.27 15.86 2.87 12.5c.5-1.24 1.3-2.32 2.3-3.18l2.1 2.1A4.5 4.5 0 0 0 11.27 16a4.46 4.46 0 0 0 2.9-1.07l1.53 1.53A9.6 9.6 0 0 1 11.27 18Zm8.9-5.5c-.61 1.6-1.65 2.97-2.99 4l-1.5-1.5a4.47 4.47 0 0 0 .41-5.53l1.7-1.7c1.2.93 2.18 2.12 2.78 3.73Z"/>
      </svg>
    </button>
  </div>
</div>


    <button class="btn btn-primary w-100" type="submit" [disabled]="f.invalid || loading">
      <span *ngIf="!loading">Login</span>
      <span *ngIf="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    </button>

    <div *ngIf="error" class="text-danger text-center small mt-3">{{ error }}</div>
  </form>
</div>

  `
})
export class AdminLoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;
  showPass = false;


  constructor(private http: HttpClient, private router: Router, private toast: ToasterService) {}

  login(f: NgForm) {
    if (f.invalid) return;
    this.loading = true;
    this.error = '';

    this.http.post<any>('http://localhost:5000/api/admin/login', {
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.toast.success('Welcome back.', 'Login successful');
        this.router.navigate(['/admin/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Login failed';
        this.error = msg;
        this.toast.error(msg);
      }
    });
  }
}
