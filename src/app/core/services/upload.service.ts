import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImageRef } from '../models';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private http = inject(HttpClient);

  getSignature() {
    return this.http.get<any>(`${environment.apiBase}/api/uploads/signature`);
  }

  async uploadFile(file: File): Promise<ImageRef> {
    const sig = await firstValueFrom(this.getSignature());

    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sig.apiKey);
    form.append('timestamp', String(sig.timestamp));
    form.append('signature', sig.signature);
    form.append('folder', sig.folder);
    form.append('upload_preset', sig.uploadPreset);

    const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`;
    const resp = await fetch(endpoint, { method: 'POST', body: form });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Cloudinary upload failed: ${text}`);
    }
    const json = await resp.json();
    if (!json?.secure_url) throw new Error('No secure_url returned from Cloudinary');

    // IMPORTANT: return both url and publicId
    return { url: json.secure_url, publicId: json.public_id || null };
  }
}
