// main.ts (or wherever you call bootstrapApplication)
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router'; // ← add this
import { routes } from './app/app.routes';
import { LayoutComponent } from './app/layout.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptors';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

bootstrapApplication(LayoutComponent, {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        // always go to top on forward navigations and on back/forward too
        scrollPositionRestoration: 'top',
        // allow #fragment links to scroll to anchors when present
        anchorScrolling: 'enabled',
        // optional: compensate a fixed header if you have one (e.g., 64px)
        // scrollOffset: [0, 64],
      })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      closeButton: true,
      timeOut: 3000,
      maxOpened: 3,
      autoDismiss: true
    })
  ]
});
