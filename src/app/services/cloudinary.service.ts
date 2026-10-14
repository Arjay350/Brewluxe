import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  private readonly cloudName = (environment as Record<string, unknown>)['cloudinaryCloudName'] as string || 'jdkqnztn';

  /**
   * Transforms an image URL to deliver optimized WebP/AVIF format and responsive sizing
   */
  getOptimizedUrl(imageUrl: string, width = 450): string {
    if (!imageUrl) return 'assets/shapes.svg';
    const trimmed = imageUrl.trim();

    // If already a Cloudinary image, inject optimization parameters
    if (trimmed.includes('res.cloudinary.com')) {
      return trimmed.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_fill/`);
    }

    // If it is a generic HTTP remote image, Cloudinary can optimize it via fetch delivery URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return `https://res.cloudinary.com/${this.cloudName}/image/fetch/f_auto,q_auto,w_${width}/${encodeURIComponent(trimmed)}`;
    }

    // Local assets and base64 strings remain untouched for local offline safety
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('assets/')) {
      return trimmed;
    }

    return `assets/images/${trimmed}`;
  }
}
