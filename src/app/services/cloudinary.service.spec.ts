import { TestBed } from '@angular/core/testing';
import { CloudinaryService } from './cloudinary.service';

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CloudinaryService],
    });
    service = TestBed.inject(CloudinaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should inject optimization parameters into Cloudinary URLs', () => {
    const input = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const result = service.getOptimizedUrl(input, 300);
    expect(result).toContain('f_auto,q_auto,w_300');
  });

  it('should format remote URLs via Cloudinary fetch adapter', () => {
    const input = 'https://example.com/images/latte.jpg';
    const result = service.getOptimizedUrl(input, 500);
    expect(result).toContain('res.cloudinary.com');
    expect(result).toContain('f_auto,q_auto,w_500');
  });

  it('should leave local assets and base64 strings safe and untouched', () => {
    expect(service.getOptimizedUrl('assets/images/espresso.jpg')).toBe('assets/images/espresso.jpg');
    expect(service.getOptimizedUrl('data:image/png;base64,ABC')).toBe('data:image/png;base64,ABC');
    expect(service.getOptimizedUrl('')).toBe('assets/shapes.svg');
  });
});
