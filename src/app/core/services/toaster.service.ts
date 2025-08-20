import { Injectable } from '@angular/core';
import { ToastrService, ActiveToast, IndividualConfig } from 'ngx-toastr';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({ providedIn: 'root' })
export class ToasterService {

  constructor(private toastr: ToastrService) {}

  /** Generic show (rarely needed; prefer typed helpers) */
  show(message: string, title = '', type: ToastType = 'info', cfg?: Partial<IndividualConfig>): ActiveToast<any> {
    switch (type) {
      case 'success': return this.toastr.success(message, title);
      case 'error':   return this.toastr.error(message, title);
      case 'warning': return this.toastr.warning(message, title);
      default:        return this.toastr.info(message, title);
    }
  }

  success(message: string, title = '', cfg?: Partial<IndividualConfig>) {
    return this.toastr.success(message, title, {  ...(cfg || {}) });
  }

  error(message: string, title = '', cfg?: Partial<IndividualConfig>) {
    return this.toastr.error(message, title, {  ...(cfg || {}) });
  }

  info(message: string, title = '', cfg?: Partial<IndividualConfig>) {
    return this.toastr.info(message, title, {  ...(cfg || {}) });
  }

  warning(message: string, title = '', cfg?: Partial<IndividualConfig>) {
    return this.toastr.warning(message, title, {  ...(cfg || {}) });
  }

  /** Common patterns */
  saved(entity = 'Item')  { return this.success(`${entity} saved`); }
  updated(entity = 'Item'){ return this.success(`${entity} updated`); }
  deleted(entity = 'Item'){ return this.success(`${entity} deleted`); }
  loadFailed(entity = 'Data'){ return this.error(`Failed to load ${entity}`); }
  actionFailed(action = 'Action'){ return this.error(`${action} failed`); }
}
