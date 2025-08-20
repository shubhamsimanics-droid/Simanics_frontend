import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from '../models';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/api/products`;

  getProducts(params?: { q?: string; category?: string }) {
    let httpParams = new HttpParams();
    if (params?.q) httpParams = httpParams.set('q', params.q);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    return this.http.get<any[]>(this.baseUrl, { params: httpParams }).pipe(
    map(list => list.map(p => ({
      ...p,
      images: (p.images || []).map((i: any) =>
        typeof i === 'string' ? { url: i, publicId: null } : i
      )
    })))
  );
  }

  getProductById(id: string) {
  return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
    map(p => ({
      ...p,
      images: (p.images || []).map((i: any) =>
        typeof i === 'string' ? { url: i, publicId: null } : i
      )
    }))
  );
}
  createProduct(payload: Partial<Product>) {
    return this.http.post<Product>(this.baseUrl, payload);
  }

  updateProduct(id: string, payload: Partial<Product>) {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, payload);
  }

  deleteProduct(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
