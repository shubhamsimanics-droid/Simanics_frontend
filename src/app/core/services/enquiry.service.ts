import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Enquiry } from '../models';

@Injectable({ providedIn: 'root' })
export class EnquiryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/api/enquiries`;

  getEnquiries() { return this.http.get<Enquiry[]>(this.baseUrl); }
  createEnquiry(payload: Partial<Enquiry>) { return this.http.post<Enquiry>(this.baseUrl, payload); }

  // for status/read updates
  updateEnquiry(id: string, payload: Partial<Enquiry>) {
    return this.http.put<Enquiry>(`${this.baseUrl}/${id}`, payload);
  }

  // for delete
  deleteEnquiry(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
