import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnquiryService } from '../../../core/services/enquiry.service';
import { ToasterService } from '../../../core/services/toaster.service';

@Component({
  selector: 'app-view-enquiries',
  standalone: true,
  imports: [CommonModule],
  template: `
<h4 class="mb-3">User Enquiries</h4>

<div class="table-responsive">
  <table class="table table-sm table-bordered align-middle mb-0">
    <thead class="table-light thead-sticky">
      <tr>
        <th class="w-160px">When</th>
        <th>Name</th>
        <th>Email</th>
        <th>Product</th>
        <th>Message</th>
        <th class="w-110px">Status</th>
        <th class="w-80px">Read</th>
      </tr>
    </thead>

    <tbody *ngIf="!loading && enquiries.length; else stateTpl">
      <tr *ngFor="let e of enquiries; trackBy: trackById" [class.table-active]="!e.isRead">
        <td>{{ e.createdAt | date:'short' }}</td>
        <td>{{ e.name }}</td>
        <td>{{ e.email }}</td>
        <td>{{ e.product?.name || 'N/A' }}</td>
        <td class="small text-muted">{{ e.message }}</td>
        <td>
          <span class="badge bg-secondary" *ngIf="e.status === 'new'">new</span>
          <span class="badge bg-info" *ngIf="e.status === 'in_progress'">in_progress</span>
          <span class="badge bg-success" *ngIf="e.status === 'closed'">closed</span>
        </td>
        <td>
          <span class="badge" [class.bg-success]="e.isRead" [class.bg-secondary]="!e.isRead">
            {{ e.isRead ? 'Yes' : 'No' }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>

  <ng-template #stateTpl>
    <div class="p-3" *ngIf="loading"><span class="text-muted">Loading enquiries…</span></div>
    <div class="alert alert-secondary m-0" *ngIf="!loading && !enquiries.length">No enquiries submitted yet.</div>
  </ng-template>
</div>


  `
})
export class ViewEnquiriesComponent implements OnInit {
  private enquiryService = inject(EnquiryService);
  private toast = inject(ToasterService);

  enquiries: any[] = [];
  loading = true;

  ngOnInit() {
    this.enquiryService.getEnquiries().subscribe({
      next: (res: any[]) => { this.enquiries = res || []; this.loading = false; },
      error: () => { this.toast.loadFailed('enquiries'); this.loading = false; }
    });
  }

  trackById = (_: number, x: any) => x?._id;
}
