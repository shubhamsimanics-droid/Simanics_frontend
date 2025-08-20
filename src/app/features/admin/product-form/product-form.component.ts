import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ProductService } from '../../../core/services/products.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToasterService } from '../../../core/services/toaster.service';
import { UploadService } from '../../../core/services/upload.service';

type Spec = { key: string; value: string };
type ImageRef = { url: string; publicId?: string | null };

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-form.component.html'
})
export class ProductFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public  router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private toast = inject(ToasterService);
  private uploader = inject(UploadService);

  categories: any[] = [];
  isEdit = false;
  loading = true;
  saving = false;

  /**
   * NOTE:
   * - We keep `images: string[]` in the *form* for simplicity (manual URLs + legacy display).
   * - On submit we convert to [{url, publicId}] and merge with staged uploads.
   */
  form = {
    name: '',
    category: '',
    shortDesc: '',
    description: '',
    specs: [] as Spec[],
    images: [] as string[]   // display-only strings; converted on submit
  };

  /** Files chosen but NOT uploaded yet */
  stagedFiles: File[] = [];
  /** Local preview URLs for staged files */
  stagedPreviews: string[] = [];

  ngOnInit(): void {
    this.loadCategories();

    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEdit = true;
      this.productService.getProductById(productId).subscribe({
        next: (res: any) => {
          // Normalize incoming product (handles legacy strings or new objects)
          const incomingImages: string[] = Array.isArray(res?.images)
            ? res.images
                .map((x: any) => {
                  if (!x) return null;
                  if (typeof x === 'string') return x;
                  if (typeof x === 'object' && x.url) return x.url as string;
                  return null;
                })
                .filter(Boolean) as string[]
            : [];

          this.form = {
            name: res?.name ?? '',
            category: res?.category?._id ?? res?.category ?? '',
            shortDesc: res?.shortDesc ?? '',
            description: res?.description ?? '',
            specs: Array.isArray(res?.specs) ? res.specs : [],
            images: incomingImages
          };
          this.loading = false;
        },
        error: _ => { this.toast.loadFailed('product'); this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res: any[]) => this.categories = res || [],
      error: _ => this.toast.loadFailed('categories')
    });
  }

  addSpec()              { this.form.specs.push({ key: '', value: '' }); }
  removeSpec(i: number)  { this.form.specs.splice(i, 1); }
  addImage()             { this.form.images.push(''); }
  removeImage(i: number) { this.form.images.splice(i, 1); }

  /** Stage a file; upload will happen on submit */
  onPickImage(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    this.stagedFiles.push(file);
    this.stagedPreviews.push(URL.createObjectURL(file));
    this.toast.info('Image staged. It will upload when you save.');

    if (input) input.value = '';
  }

  removeStaged(i: number): void {
    const url = this.stagedPreviews[i];
    if (url) URL.revokeObjectURL(url);
    this.stagedPreviews.splice(i, 1);
    this.stagedFiles.splice(i, 1);
  }

  async submitForm(): Promise<void> {
    if (this.saving) return;

    const name = (this.form.name || '').trim();
    const category = (typeof this.form.category === 'object' && (this.form.category as any)?._id)
      ? (this.form.category as any)._id
      : (this.form.category || '').trim();

    if (!name)     { this.toast.warning('Name is required'); return; }
    if (!category) { this.toast.warning('Category is required'); return; }

    this.saving = true;

    try {
      // 1) Upload all staged files now
      let uploaded: ImageRef[] = [];
      if (this.stagedFiles.length) {
        this.toast.info('Uploading images…');
        const results = await Promise.all(this.stagedFiles.map(async f => {
          // Your UploadService currently returns { url, public_id }
          const r: any = await this.uploader.uploadFile(f);
          const publicId = r.publicId ?? r.public_id ?? null; // be tolerant
          return { url: r.url, publicId } as ImageRef;
        }));
        uploaded = results;
      }

      // 2) Convert manual/legacy URLs (strings) into ImageRef objects
      const manual: ImageRef[] = (this.form.images || [])
        .map(u => (u || '').trim())
        .filter(Boolean)
        .map(u => ({ url: u, publicId: null }));

      // 3) Clean specs
      const cleanSpecs = (this.form.specs || [])
        .filter(s => (s.key || '').trim() && (s.value || '').trim())
        .map(s => ({ key: s.key.trim(), value: s.value.trim() }));

      // 4) Build payload with ImageRef[]
      const payload: any = {
        name,
        category,
        shortDesc: (this.form.shortDesc || '').trim(),
        description: (this.form.description || '').trim(),
        specs: cleanSpecs,
        images: [...uploaded, ...manual]   // << important: objects, not strings
      };

      // 5) Create or update
      const id = this.route.snapshot.paramMap.get('id');
      const req$ = this.isEdit
        ? this.productService.updateProduct(id as string, payload)
        : this.productService.createProduct(payload);

      await new Promise<void>((resolve, reject) =>
        req$.subscribe({ next: () => resolve(), error: err => reject(err) })
      );

      // 6) Cleanup + navigate
      this.stagedPreviews.forEach(u => URL.revokeObjectURL(u));
      this.stagedPreviews = [];
      this.stagedFiles = [];
      this.toast.saved('Product');
      this.router.navigate(['/admin/dashboard/products']);
    } catch (e) {
      console.error(e);
      this.toast.actionFailed('Save product');
    } finally {
      this.saving = false;
    }
  }
}
