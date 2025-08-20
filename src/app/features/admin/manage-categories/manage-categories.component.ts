import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CategoryService } from '../../../core/services/category.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { UploadService } from '../../../core/services/upload.service';

// Align with your models: Category.image is { url, publicId } | null going forward.
type ImageRef = { url: string; publicId?: string | null };
type CategoryVM = {
  _id?: string;
  name: string;
  description?: string;
  image: ImageRef | null;     // normalized for UI
  // UI-only helpers (manual URL input & staged preview per row)
  imageInput?: string;
};

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="mb-4">
  <h4 class="mb-3">Manage Categories</h4>

  <!-- Add new -->
  <form class="row g-2 align-items-center mb-3" (ngSubmit)="createCategory()">
    <div class="col-md-3">
      <input class="form-control form-control-sm" placeholder="Name"
             [(ngModel)]="newCat.name" name="name">
    </div>

    <div class="col-md-4">
      <input class="form-control form-control-sm" placeholder="Description (optional)"
             [(ngModel)]="newCat.description" name="desc">
    </div>

    <!-- Manual URL (optional) -->
    <div class="col-md-3">
      <input class="form-control form-control-sm" placeholder="Image URL (optional)"
             [(ngModel)]="newCat.imageInput" name="img">
    </div>

    <!-- File picker (staged; upload on Add) -->
    <div class="col-md-1">
      <input class="form-control form-control-sm input-file-sm" type="file" accept="image/*"
             (change)="onPickNewCatImage($event)">
    </div>

    <div class="col-md-1 d-grid">
      <button class="btn btn-sm btn-primary" type="submit"
              [disabled]="creating || !newCat.name?.trim()">
        <span *ngIf="!creating">Add</span>
        <span *ngIf="creating" class="spinner-border spinner-border-sm"></span>
      </button>
    </div>

    <!-- Staged preview for new category -->
    <div class="col-12" *ngIf="newCatPreview">
      <div class="d-inline-block position-relative mt-2">
        <img [src]="newCatPreview" class="rounded border img-120x90" alt="staged">
        <button type="button" class="btn btn-sm btn-outline-danger position-absolute top-0 end-0"
                (click)="removeNewCatStaged()">×</button>
      </div>
      <small class="text-muted d-block">Image uploads when you click Add.</small>
    </div>
  </form>
</div>

<div class="table-responsive">
  <table class="table table-sm table-bordered align-middle mb-0">
    <thead class="table-light thead-sticky">
      <tr>
        <th class="w-80px">Image</th>
        <th class="w-22pct">Name</th>
        <th>Description & Image</th>
        <th class="w-160px">Actions</th>
      </tr>
    </thead>

    <tbody *ngIf="!loading && categories?.length; else stateTpl">
      <tr *ngFor="let cat of categories; trackBy: trackById">
        <td>
          <img *ngIf="cat.image?.url" [src]="cat.image?.url" alt="cat"
               class="rounded border img-64x48">
        </td>

        <td>
          <input class="form-control form-control-sm"
                 [(ngModel)]="cat.name" name="n{{cat._id}}">
        </td>

        <td>
          <div class="row g-2">
            <div class="col-12">
              <input class="form-control form-control-sm" placeholder="Description"
                     [(ngModel)]="cat.description" name="d{{cat._id}}">
            </div>

            <!-- Manual URL replacement (optional) -->
            <div class="col-12">
              <input class="form-control form-control-sm" placeholder="Image URL (manual)"
                     [(ngModel)]="cat.imageInput" name="i{{cat._id}}">
            </div>

            <!-- Per-row staged file picker -->
            <div class="col-12 d-flex align-items-center gap-2">
              <input class="form-control form-control-sm input-file-sm" type="file" accept="image/*"
                     (change)="onPickRowImage($event, cat._id!)">

              <ng-container *ngIf="rowPreviewMap.get(cat._id!) as rowPrev">
                <div class="position-relative">
                  <img [src]="rowPrev" class="rounded border img-96x72" alt="staged row">
                  <button type="button" class="btn btn-sm btn-outline-danger position-absolute top-0 end-0"
                          (click)="removeRowStaged(cat._id!)">×</button>
                </div>
                <small class="text-muted">Uploads on Save.</small>
              </ng-container>
            </div>
          </div>
        </td>

        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1"
                  (click)="updateCategory(cat)" [disabled]="savingId===cat._id">
            <span *ngIf="savingId!==cat._id">Save</span>
            <span *ngIf="savingId===cat._id" class="spinner-border spinner-border-sm"></span>
          </button>

          <button class="btn btn-sm btn-outline-danger"
                  (click)="deleteCategory(cat._id!)" [disabled]="deletingId===cat._id">
            <span *ngIf="deletingId!==cat._id">Delete</span>
            <span *ngIf="deletingId===cat._id" class="spinner-border spinner-border-sm"></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <ng-template #stateTpl>
    <div class="p-3" *ngIf="loading">
      <span class="text-muted">Loading categories…</span>
    </div>
    <div class="alert alert-secondary m-0" *ngIf="!loading && !categories?.length">
      No categories found.
    </div>
  </ng-template>
</div>


  `
})
export class ManageCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private toast = inject(ToasterService);
  private uploader = inject(UploadService);

  categories: CategoryVM[] = [];
  loading = true;
  creating = false;
  savingId: string | null = null;
  deletingId: string | null = null;

  // Add-new staged file + preview
  newCat: CategoryVM & { imageInput?: string } = { name: '', description: '', image: null, imageInput: '' };
  private newCatFile: File | null = null;
  newCatPreview: string | null = null;

  // Per-row staged file + preview
  private rowFileMap = new Map<string, File>();
  rowPreviewMap = new Map<string, string>();

  ngOnInit(): void { this.loadCategories(); }

  trackById = (_: number, x: any) => x?._id;

  private normalize(c: any): CategoryVM {
    // Accept legacy string image or new object
    const img: ImageRef | null =
      c?.image == null
        ? null
        : typeof c.image === 'string'
          ? { url: c.image, publicId: null }
          : (c.image?.url ? { url: c.image.url, publicId: c.image.publicId ?? null } : null);

    return {
      _id: c?._id,
      name: c?.name ?? '',
      description: c?.description ?? '',
      image: img,
      imageInput: '' // UI-only
    };
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: res => {
        this.categories = (res || []).map(x => this.normalize(x));
        this.loading = false;
      },
      error: _ => { this.loading = false; this.toast.loadFailed('categories'); }
    });
  }

  // ---------- Add new (deferred upload) ----------

  onPickNewCatImage(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.clearNewCatPreview();
    this.newCatFile = file;
    this.newCatPreview = URL.createObjectURL(file);
    this.toast.info('Image staged. It will upload when you click Add.');
    if (input) input.value = '';
  }

  removeNewCatStaged(): void {
    this.clearNewCatPreview();
    this.newCatFile = null;
  }

  private clearNewCatPreview(): void {
    if (this.newCatPreview) URL.revokeObjectURL(this.newCatPreview);
    this.newCatPreview = null;
  }

  async createCategory() {
    const name = (this.newCat.name || '').trim();
    if (!name) return;

    this.creating = true;

    try {
      let image: ImageRef | null = null;

      // If a file is staged, upload now
      if (this.newCatFile) {
        this.toast.info('Uploading category image…');
        const up = await this.uploader.uploadFile(this.newCatFile); // {url, publicId}
        image = { url: up.url, publicId: (up as any).publicId ?? (up as any).public_id ?? null };
      } else if (this.newCat.imageInput?.trim()) {
        image = { url: this.newCat.imageInput.trim(), publicId: null };
      }

      const payload: any = {
        name,
        description: (this.newCat.description || '').trim(),
        image: image || null
      };

      await new Promise<void>((resolve, reject) =>
        this.categoryService.createCategory(payload).subscribe({
          next: () => resolve(),
          error: (e) => reject(e)
        })
      );

      this.toast.saved('Category');
      // reset form + preview
      this.newCat = { name: '', description: '', image: null, imageInput: '' };
      this.removeNewCatStaged();
      this.loadCategories();

    } catch (_) {
      this.toast.actionFailed('Add category');
    } finally {
      this.creating = false;
    }
  }

  // ---------- Existing row (optional deferred upload) ----------

  onPickRowImage(evt: Event, id: string): void {
    const input = evt.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file || !id) return;

    const prev = this.rowPreviewMap.get(id);
    if (prev) URL.revokeObjectURL(prev);

    this.rowFileMap.set(id, file);
    const previewUrl = URL.createObjectURL(file);
    this.rowPreviewMap.set(id, previewUrl);
    this.toast.info('Image staged for this category. It will upload on Save.');

    if (input) input.value = '';
  }

  removeRowStaged(id: string): void {
    const prev = this.rowPreviewMap.get(id);
    if (prev) URL.revokeObjectURL(prev);
    this.rowPreviewMap.delete(id);
    this.rowFileMap.delete(id);
  }

  async updateCategory(cat: CategoryVM) {
    if (!cat?._id) return;
    this.savingId = cat._id;

    try {
      // If a file is staged for this row, upload now
      let image: ImageRef | null | undefined = undefined; // undefined => don't change field
      const staged = this.rowFileMap.get(cat._id);
      if (staged) {
        this.toast.info('Uploading category image…');
        const up = await this.uploader.uploadFile(staged);
        image = { url: up.url, publicId: (up as any).publicId ?? (up as any).public_id ?? null };
      } else if (typeof cat.imageInput === 'string') {
        const manual = (cat.imageInput || '').trim();
        image = manual ? { url: manual, publicId: null } : null;
      }

      const payload: any = {
        name: (cat.name || '').trim(),
        description: (cat.description || '').trim()
      };
      if (image !== undefined) payload.image = image;

      await new Promise<void>((resolve, reject) =>
        this.categoryService.updateCategory(cat._id!, payload).subscribe({
          next: () => resolve(),
          error: (e) => reject(e)
        })
      );

      this.toast.updated('Category');
      this.removeRowStaged(cat._id!);
      this.loadCategories();

    } catch (_) {
      this.toast.actionFailed('Update category');
    } finally {
      this.savingId = null;
    }
  }

  // ---------- Delete ----------

  deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    this.deletingId = id;

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c._id !== id);
        this.toast.deleted('Category');
        this.deletingId = null;
        this.removeRowStaged(id);
      },
      error: () => { this.toast.actionFailed('Delete category'); this.deletingId = null; }
    });
  }
}
