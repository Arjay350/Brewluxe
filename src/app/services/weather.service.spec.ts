import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WeatherService],
    });
    service = TestBed.inject(WeatherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a valid recommendation object with temperature and headline', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 32,
          weather_code: 0,
          is_day: 1,
        },
      }),
    };
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => mockResponse as unknown as Response) as typeof fetch;

    try {
      const recommendation = await service.getWeatherRecommendation();
      expect(recommendation).toBeDefined();
      expect(recommendation.temperature).toBe(32);
      expect(recommendation.tag).toBe('Beat The Heat');
      expect(recommendation.recommendedCategory).toBe('Frappes');
      expect(recommendation.icon).toBe('☀️');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should handle fetch errors gracefully and return fallback recommendation', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new Error('Network offline');
    }) as typeof fetch;

    try {
      const offlineService = new WeatherService();
      const fallback = await offlineService.getWeatherRecommendation();
      expect(fallback).toBeDefined();
      expect(fallback.temperature).toBe(30);
      expect(fallback.recommendedCategory).toBe('Frappes');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
