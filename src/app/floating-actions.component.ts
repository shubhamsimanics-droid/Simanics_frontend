import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-actions',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      position: fixed;
      right: 0;                          /* stick to edge */
      top: 50%;
      transform: translateY(-50%);
      z-index: 1055;
      pointer-events: none;              /* only child clickable */
    }
    .wrap { pointer-events: auto; }

    /* Slider button */
    .wa-slider {
      height: 56px;
      width: 56px;                       /* collapsed: only logo visible */
      background: #25D366;
      color: #fff;
      border-radius: 16px 0 0 16px;      /* rounded only on the left side */
      box-shadow: -8px 12px 22px rgba(0,0,0,.18), -2px 4px 8px rgba(0,0,0,.12);
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px 0 16px;            /* room for icon + label when expanded */
      text-decoration: none;
      outline: none;
      overflow: hidden;                  /* hide label in collapsed state */
      transition: width .2s ease, transform .15s ease, box-shadow .15s ease;
      position: relative;
    }
    .wa-slider:hover       { width: 220px; transform: translateX(-2px); }
    .wa-slider:active      { transform: translateX(0); }
    .wa-slider:focus-visible { outline: 3px solid rgba(255,255,255,.55); outline-offset: -3px; }

    /* Icon (your actual logo image) */
    .wa-logo {
      width: 28px; height: 28px; display: block; flex: 0 0 auto;
      user-select: none; pointer-events: none;
      /* keep icon visually centered when collapsed */
      margin-left: calc((56px - 28px)/2 - 16px); /* center in 56px minus left padding */
      transition: margin-left .2s ease;
    }
    .wa-slider:hover .wa-logo { margin-left: 0; }  /* align left when expanded */

    /* Text label */
    .wa-label {
      white-space: nowrap;
      font-size: 16px;
      font-weight: 600;
      opacity: 0; transform: translateX(6px);
      transition: opacity .15s ease, transform .15s ease;
    }
    .wa-slider:hover .wa-label,
    .wa-slider:focus-visible .wa-label {
      opacity: 1; transform: translateX(0);
    }

    /* prevent global link styles from affecting this button */
.wa-slider,
.wa-slider:link,
.wa-slider:visited,
.wa-slider:hover,
.wa-slider:active,
.wa-slider:focus {
  color: #fff !important;      /* force white text */
  text-decoration: none !important;
}

  `],
  template: `
    <div class="wrap" aria-label="Quick actions">
      <a class="wa-slider"
         [href]="waLink"
         target="_blank"
         rel="noopener"
         aria-label="Chat on WhatsApp">
        <img class="wa-logo"
             src="whatsapp-logo.png"
             alt="WhatsApp"
             draggable="false" />
        <span class="wa-label">Chat with Us!</span>
      </a>
    </div>
  `
})
export class FloatingActionsComponent {
  /** E.164 without '+' or spaces. Ex: 919876543210 */
  @Input() phone!: string;
  @Input() message = 'Hello, I came from the website and need assistance.';

  get waLink(): string {
    const num = (this.phone || '').replace(/[^\d]/g, '');
    const txt = encodeURIComponent(this.message || '');
    return `https://wa.me/${num}${txt ? `?text=${txt}` : ''}`;
  }
}
