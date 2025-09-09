import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Complaint {
  _id: string;
  ticket: string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  priority: string;
  orderRef?: string;
  description: string;
  status: 'new'|'in_progress'|'resolved'|'closed';
  categoryId?: string | null;
  productIds?: string[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/api/complaints`;

  // List/update/delete are irrelevant for email-only, keep if admin UI uses them.
  getComplaints() { return this.http.get<any[]>(this.baseUrl); }

  // CHANGED: payload is FormData; response is { sent: boolean }
  createComplaint(payload: FormData) {
    return this.http.post<{ sent: boolean }>(this.baseUrl, payload);
  }

  updateComplaint(id: string, payload: Partial<any>) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  deleteComplaint(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

