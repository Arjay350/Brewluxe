import { TestBed } from '@angular/core/testing';
import { AddressService } from './address.service';

describe('AddressService', () => {
  let service: AddressService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddressService],
    });
    service = TestBed.inject(AddressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate distance-based delivery fee correctly', () => {
    // Distance close to café (e.g. Quezon City 14.65, 121.05)
    const localFee = service.calculateDeliveryFee(14.65, 121.05);
    expect(localFee).toBe(40);

    // Distance ~12km away (e.g. Makati 14.55, 121.02)
    const midFee = service.calculateDeliveryFee(14.55, 121.02);
    expect(midFee).toBe(65);

    // Distance > 20km away (e.g. Alabang 14.42, 121.04)
    const farFee = service.calculateDeliveryFee(14.42, 121.04);
    expect(farFee).toBe(80);
  });

  it('should return parsed address suggestions from Nominatim response', async () => {
    const mockOsmResponse = [
      {
        display_name: 'Aurora Boulevard, Cubao, Quezon City, Metro Manila',
        lat: '14.615',
        lon: '121.038',
      },
    ];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => ({
      ok: true,
      json: async () => mockOsmResponse,
    })) as unknown as typeof fetch;

    try {
      const results = await service.searchAddress('Aurora Blvd');
      expect(results.length).toBe(1);
      expect(results[0].shortName).toContain('Aurora Boulevard');
      expect(results[0].lat).toBe(14.615);
      expect(results[0].lon).toBe(121.038);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should return empty array for queries shorter than 3 characters', async () => {
    const results = await service.searchAddress('ab');
    expect(results).toEqual([]);
  });
});
