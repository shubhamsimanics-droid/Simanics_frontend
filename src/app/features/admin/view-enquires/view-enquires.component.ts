import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { Enquiry } from '../../../core/models';

@Component({
  selector: 'app-view-enquiries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .thead-sticky { position: sticky; top: 0; z-index: 1; }
    .nowrap { white-space: nowrap; }
    .truncate-2 {
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .row-unread { background: var(--bs-warning-bg-subtle); }
    .w-140 { width: 140px; } .w-160 { width: 160px; } .w-120 { width: 120px; }
  `],
  template: `
<h4 class="mb-3">User Enquiries</h4>

<!-- Filters -->
<div class="d-flex flex-wrap gap-2 align-items-center mb-3">
  <div class="d-flex gap-2">
    <select class="form-select form-select-sm w-auto" [(ngModel)]="filter.status" (ngModelChange)="applyFilters()">
      <option value="">All statuses</option>
      <option value="new">New</option>
      <option value="in_progress">In progress</option>
      <option value="closed">Closed</option>
    </select>
  </div>
  <div class="ms-auto d-flex align-items-center gap-2">
    <input type="search" class="form-control form-control-sm" placeholder="Search name, email, message…"
           [(ngModel)]="filter.q" (ngModelChange)="applyFilters()" style="min-width:260px">
    <button class="btn btn-sm btn-outline-secondary" (click)="resetFilters()">Reset</button>
  </div>
</div>

<div class="table-responsive">
  <table class="table table-sm table-bordered align-middle mb-0">
    <thead class="table-light thead-sticky">
      <tr>
        <th class="w-160">When</th>
        <th>Who</th>
        <th>Product</th>
        <th>Message</th>
        <th class="w-140">Status</th>
      </tr>
    </thead>

    <tbody *ngIf="!loading && paged.length; else stateTpl">
      <tr *ngFor="let e of paged; trackBy: trackById" [class.row-unread]="!e.isRead">
        <!-- When -->
        <td class="small nowrap">
          <div>{{ toDate(e.createdAt) | date:'mediumDate' }}</div>
          <div class="text-muted">{{ toDate(e.createdAt) | date:'shortTime' }}</div>
        </td>

        <!-- Who -->
        <td>
          <div class="fw-semibold">{{ e.name || '—' }}</div>
          <div class="small text-muted">
            <a [href]="'mailto:' + e.email" class="text-decoration-none">{{ e.email }}</a>
            <span *ngIf="e.phone"> · <a [href]="'tel:' + e.phone" class="text-decoration-none">{{ e.phone }}</a></span>
          </div>
        </td>

        <!-- Product -->
        <td class="small">
          <span *ngIf="e.product as p; else noProd">
            {{ displayProductName(p) }}
          </span>
          <ng-template #noProd><span class="text-muted">N/A</span></ng-template>
        </td>

        <!-- Message -->
        <td class="small">
          <div class="truncate-2" [title]="e.message">{{ e.message }}</div>
        </td>

        <!-- Status -->
        <td>
          <select class="form-select form-select-sm"
                  [ngModel]="e.status"
                  (ngModelChange)="updateStatus(e, $event)">
            <option value="new">new</option>
            <option value="in_progress">in_progress</option>
            <option value="closed">closed</option>
          </select>
        </td>

        <!-- Actions: only Delete -->
        <td class="small">
          <button class="btn btn-sm btn-outline-danger"
                  [disabled]="deleting.has(e._id)"
                  (click)="confirmAndDelete(e)">
            <span *ngIf="!deleting.has(e._id); else delSpin">Delete</span>
            <ng-template #delSpin>
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Deleting…
            </ng-template>
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <ng-template #stateTpl>
    <div class="p-3" *ngIf="loading"><span class="text-muted">Loading enquiries…</span></div>
    <div class="alert alert-secondary m-0" *ngIf="!loading && !paged.length">No enquiries found.</div>
  </ng-template>
</div>

<!-- Pagination bar -->
<div class="d-flex flex-wrap align-items-center gap-2 mt-3" *ngIf="!loading && filtered.length">
  <div class="text-muted small me-auto">
    Showing <strong>{{ startIndex + 1 }}</strong>–<strong>{{ endIndex }}</strong> of <strong>{{ filtered.length }}</strong>
  </div>

  <div class="d-flex align-items-center gap-2">
    <label class="small text-muted">Rows per page</label>
    <select class="form-select form-select-sm w-auto"
            [(ngModel)]="pageSize"
            (ngModelChange)="onPageSizeChange($event)">
      <option *ngFor="let s of pageSizes" [value]="s">{{ s }}</option>
    </select>

    <nav aria-label="Enquiries pagination">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" [class.disabled]="page === 1">
          <button class="page-link" (click)="prevPage()" [disabled]="page === 1">«</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link">{{ page }} / {{ totalPages }}</span>
        </li>
        <li class="page-item" [class.disabled]="page === totalPages">
          <button class="page-link" (click)="nextPage()" [disabled]="page === totalPages">»</button>
        </li>
      </ul>
    </nav>
  </div>
</div>
  `
})
export class ViewEnquiriesComponent implements OnInit {
  private api = inject(EnquiryService);
  private toast = inject(ToasterService);

  enquiries: Enquiry[] = [];
  filtered: Enquiry[] = [];
  paged: Enquiry[] = [];
  loading = true;

  // filters
  filter = { status: '', read: '', q: '' };

  // pagination
  page = 1;
  pageSize = 10;
  pageSizes = [10, 25, 50];
  totalPages = 1;
  startIndex = 0;
  endIndex = 0;

  // deletion in-flight
  deleting = new Set<string>();

  ngOnInit() {
    this.api.getEnquiries().subscribe(
      (res: Enquiry[]) => {
        // sort newest first for initial display
        this.enquiries = (res || []).slice().sort((a, b) =>
          this.toDate(b.createdAt).getTime() - this.toDate(a.createdAt).getTime()
        );
        this.applyFilters();
        this.loading = false;
      },
      () => { this.toast.loadFailed('enquiries'); this.loading = false; }
    );
  }

  trackById = (_: number, x: Enquiry) => x?._id;

  // ---- filters ----
  resetFilters() {
    this.filter = { status: '', read: '', q: '' };
    this.applyFilters();
  }

  applyFilters() {
    const q = this.filter.q.trim().toLowerCase();
    this.filtered = this.enquiries.filter(e => {
      if (this.filter.status && e.status !== (this.filter.status as any)) return false;
      if (this.filter.read === 'read' && !e.isRead) return false;
      if (this.filter.read === 'unread' && e.isRead) return false;
      if (q) {
        const hay = [e.name, e.email, e.phone, e.message]
          .filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    // reset to first page whenever filter changes
    this.page = 1;
    this.repaginate();
  }

  // ---- pagination ----
  onPageSizeChange(_: number) {
    this.page = 1;
    this.repaginate();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.repaginate();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.repaginate();
    }
  }

  private repaginate() {
    const total = this.filtered.length;
    this.totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    // clamp page within range
    if (this.page > this.totalPages) this.page = this.totalPages;

    this.startIndex = (this.page - 1) * this.pageSize;
    this.endIndex = Math.min(this.startIndex + this.pageSize, total);

    this.paged = this.filtered.slice(this.startIndex, this.endIndex);
  }

  // ---- inline updates ----
  updateStatus(e: Enquiry, next: Enquiry['status']) {
    const prev = e.status;
    e.status = next; // optimistic
    this.api.updateEnquiry?.(e._id, { status: next }).subscribe({
      next: () => this.toast.success('Status updated.'),
      error: () => { e.status = prev; this.toast.error?.('Could not update status.'); }
    });
  }

  toggleRead(e: Enquiry, val: boolean) {
    const prev = e.isRead;
    e.isRead = val; // optimistic
    this.api.updateEnquiry?.(e._id, { isRead: val }).subscribe({
      next: () => this.toast.success(val ? 'Marked as read.' : 'Marked as unread.'),
      error: () => { e.isRead = prev; this.toast.error?.('Could not update.'); }
    });
  }

  // ---- delete ----
  confirmAndDelete(e: Enquiry) {
    const ok = confirm(`Delete enquiry from "${e.name}"? This cannot be undone.`);
    if (!ok) return;

    this.deleting.add(e._id);
    this.api.deleteEnquiry?.(e._id).subscribe({
      next: () => {
        // remove from source
        this.enquiries = this.enquiries.filter(x => x._id !== e._id);
        // re-apply filters & pagination
        this.applyFilters();
        this.toast.success('Enquiry deleted.');
        this.deleting.delete(e._id);
      },
      error: () => {
        this.toast.error?.('Could not delete enquiry.');
        this.deleting.delete(e._id);
      }
    });
  }

  // ---- helpers ----
  toDate(d?: string): Date {
    return d ? new Date(d) : new Date(0);
  }

  displayProductName(p: Enquiry['product']): string {
    if (!p) return 'N/A';
    if (typeof p === 'string') return p;
    return (p as any)?.name ?? 'N/A';
  }
}
