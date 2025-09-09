import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'complaint',
    loadComponent: () => import('./features//complaint/complaint.component').then(m => m.ComplaintComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'products',
        loadComponent: () => import('./features/admin/manage-product/manage-product.component').then(m => m.ManageProductsComponent)
      },
      {
        path: 'products/add',
        loadComponent: () => import('./features/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./features/admin/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/manage-categories/manage-categories.component').then(m => m.ManageCategoriesComponent)
      },
      {
        path: 'enquiries',
        loadComponent: () => import('./features/admin/view-enquires/view-enquires.component').then(m => m.ViewEnquiriesComponent)
      },
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'products'
      }
    ],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
