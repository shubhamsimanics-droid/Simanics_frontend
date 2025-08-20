import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    const r = new Router(); // Angular will inject real instance when used
    r.navigateByUrl('/admin/login');
    return false;
  }
  return true;
};
