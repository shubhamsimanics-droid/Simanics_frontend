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
      <input class="form-control" type="password" [(ngModel)]="password" name="password" required autocomplete="current-password">
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
