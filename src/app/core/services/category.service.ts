import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/api/categories`;

  getCategories() { return this.http.get<Category[]>(this.baseUrl); }
  createCategory(payload: Partial<Category>) { return this.http.post<Category>(this.baseUrl, payload); }
  updateCategory(id: string, payload: Partial<Category>) { return this.http.put<Category>(`${this.baseUrl}/${id}`, payload); }
  deleteCategory(id: string) { return this.http.delete(`${this.baseUrl}/${id}`); }
}
