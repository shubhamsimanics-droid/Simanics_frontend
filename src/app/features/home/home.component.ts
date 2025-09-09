// pages/home/home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';

type Img = string | { url?: string; publicId?: string };
type Category = { _id: string; name: string; description?: string; image?: Img | null };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `


<!-- HERO SLIDER WITH FIXED HEIGHT -->
<section class="hero-slider">
  <div id="heroCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="5000" data-bs-touch="true">
    <div class="carousel-indicators">
      <button *ngFor="let _ of heroImages; index as i"
              type="button"
              [attr.data-bs-target]="'#heroCarousel'"
              [attr.data-bs-slide-to]="i"
              [class.active]="i===0"
              [attr.aria-current]="i===0 ? 'true' : null"></button>
    </div>

    <div class="carousel-inner">
      <div class="carousel-item" *ngFor="let img of heroImages; index as i" [class.active]="i===0">
        <div class="hero-image-container">
          <img [src]="img" class="hero-image" [alt]="'Slide ' + (i+1)">
          <div class="hero-overlay"></div>
        </div>
      </div>
    </div>

    <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev" aria-label="Previous">
      <span class="carousel-control-prev-icon"></span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next" aria-label="Next">
      <span class="carousel-control-next-icon"></span>
    </button>
  </div>
</section>


    <!-- BROWSE BY CATEGORY -->
    <section class="py-5 border-top bg-light-gray">
      <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-3">
          <h2 class="h3 mb-0">Browse by Category</h2>
          <a class="small text-primary text-decoration-none" routerLink="/products">View all products →</a>
        </div>

        <!-- Loading skeleton -->
        <ng-container *ngIf="loading; else categoriesTpl">
          <div class="row g-3">
            <div class="col-12 col-sm-6 col-lg-3" *ngFor="let _ of skeleton; index as i">
              <div class="card h-100 shadow-sm">
                <div class="skeleton skeleton-img rounded-top"></div>
                <div class="card-body">
                  <div class="skeleton skeleton-text w-75 mb-2"></div>
                  <div class="skeleton skeleton-text w-100"></div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Categories grid -->
        <ng-template #categoriesTpl>
          <ng-container *ngIf="categories?.length; else emptyTpl">
            <div class="row g-3">
              <div class="col-12 col-sm-6 col-lg-3" *ngFor="let c of categories.slice(0, 8); trackBy: trackById">
                <a class="card h-100 text-decoration-none text-reset shadow-sm lift"
                   [routerLink]="['/products']"
                   [queryParams]="{ category: c._id }">
                  <div class="overflow-hidden bg-body-tertiary card-img-top category-img">
                  <img
                    class="w-100 h-100 object-fit-cover"
                    [src]="catImg(c) || placeholder"
                    [alt]="c.name"
                    loading="lazy"
                    referrerpolicy="no-referrer" />
                </div>


                  <div class="card-body">
                    <h3 class="h6 mb-1">{{ c.name }}</h3>
                    <p class="small text-muted mb-0">
                      {{ (c.description || '') | slice:0:80 }}{{ (c.description || '').length > 80 ? '…' : '' }}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </ng-container>

          <ng-template #emptyTpl>
            <div class="alert alert-secondary d-flex align-items-center gap-2 mb-0">
              <span class="rounded-circle bg-secondary-subtle d-inline-block" style="width:8px;height:8px;"></span>
              No categories yet. <a class="ms-1 text-decoration-none" routerLink="/contact">Contact us</a> for a curated catalogue.
            </div>
          </ng-template>
        </ng-template>
      </div>
    </section>

    <!-- WHY SIMANICS -->
    <section class="py-5 border-top bg-white">
      <div class="container">
        <h2 class="h4 mb-4 text-center text-md-start">Why choose Simanics</h2>
        <div class="row g-3">
          <div class="col-12 col-md-4">
            <div class="p-3 border rounded-3 h-100 d-flex gap-3 align-items-start bg-white">
              <svg width="24" height="24" viewBox="0 0 24 24" class="text-primary flex-shrink-0"><path fill="currentColor" d="M12 2l3 7h7l-5.5 4.5L18 21l-6-3.5L6 21l1.5-7.5L2 9h7z"/></svg>
              <div>
                <div class="fw-semibold">Quality you can trust</div>
                <div class="text-muted small">Reliable, tested SKUs with consistent supply.</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="p-3 border rounded-3 h-100 d-flex gap-3 align-items-start bg-white">
              <svg width="24" height="24" viewBox="0 0 24 24" class="text-primary flex-shrink-0"><path fill="currentColor" d="M3 13h18v2H3zm0-4h18v2H3zm0 8h18v2H3z"/></svg>
              <div>
                <div class="fw-semibold">Enterprise support</div>
                <div class="text-muted small">Clear SLAs and responsive service teams.</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="p-3 border rounded-3 h-100 d-flex gap-3 align-items-start bg-white">
              <svg width="24" height="24" viewBox="0 0 24 24" class="text-primary flex-shrink-0"><path fill="currentColor" d="M12 4a8 8 0 100 16 8 8 0 000-16zm1 4v4l3 3-1.5 1.5L11 13V8h2z"/></svg>
              <div>
                <div class="fw-semibold">Fast turnaround</div>
                <div class="text-muted small">Same-day quotes and swift fulfilment.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; background: var(--surface-0, #FAFAFA); }

    /* HERO */
    .hero { position: relative; }
    .hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(1200px 600px at 90% -10%, rgba(13,110,253,.12), transparent 60%),
              radial-gradient(900px 500px at -10% 110%, rgba(255,193,7,.12), transparent 60%),
              linear-gradient(180deg, #fff, #f7f7f7);
  z-index: 0; /* push behind */
}

.hero .container,
.hero .row {
  position: relative;
  z-index: 1; /* bring text/cards above */
}

    .hero-cards { display: grid; gap: 1rem; grid-template-columns: 1fr 1fr; }
    .hero-card:nth-child(3) { grid-column: 1 / -1; }

    /* LIFT ON HOVER */
    .lift { transition: transform .18s ease, box-shadow .18s ease; }
    .lift:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.08) !important; }

    /* SKELETONS */
    .skeleton { position: relative; overflow: hidden; background: #eee; }
    .skeleton::after {
      content: ""; position: absolute; inset: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent);
      animation: shimmer 1.2s infinite;
    }
    .skeleton-img { aspect-ratio: 4 / 3; }
    .skeleton-text { height: 10px; border-radius: 6px; }
    @keyframes shimmer { 100% { transform: translateX(100%); } }

    /* UTIL */
    .badge-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--color-primary, #0d6efd); display: inline-block;
    }

    /* Optional light gray token */
    .bg-light-gray { background: #f8f9fb; }

.hero-slider {
  height: auto;
}

.hero-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}



  `]
})
export class HomeComponent implements OnInit {
  private categoriesApi = inject(CategoryService);

  categories: Category[] = [];
  loading = true;
  placeholder = 'assets/placeholder-4x3.png';
  skeleton = Array.from({ length: 8 });

  heroImages: string[] = [
  'banner1.jpg', // the “hand-dryer” style banner
  'banner2.jpg',
  'banner3.jpg',
  'banner4.jpg'
];


  ngOnInit(): void {
    this.categoriesApi.getCategories().subscribe({
      next: (res) => { this.categories = (res || []) as Category[]; this.loading = false; },
      error: () => { this.loading = false; this.categories = []; }
    });
  }

  trackById = (_: number, c: Category) => c._id;

  catImg(c: Category): string | null {
    const img = c?.image as any;
    if (!img) return null;
    return typeof img === 'string' ? img : (img.url || null);
  }
}
