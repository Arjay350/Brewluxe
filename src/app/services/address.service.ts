import { Injectable } from '@angular/core';

export interface AddressSuggestion {
  displayName: string;
  shortName: string;
  lat: number;
  lon: number;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  // Brewluxe Café Coordinates: Quezon City, Metro Manila
  readonly cafeLat = 14.65;
  readonly cafeLon = 121.05;

  private cache = new Map<string, AddressSuggestion[]>();

  async searchAddress(query: string): Promise<AddressSuggestion[]> {
    const q = query.trim();
    if (q.length < 3) return [];

    if (this.cache.has(q)) {
      return this.cache.get(q)!;
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ph&q=${encodeURIComponent(q)}&limit=5`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BrewluxeApp/1.0',
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      const results: AddressSuggestion[] = data.map((item: Record<string, unknown>) => {
        const full = String(item['display_name'] ?? '');
        const parts = full.split(', ');
        const short = parts.slice(0, 3).join(', ');
        return {
          displayName: full,
          shortName: short || full,
          lat: parseFloat(String(item['lat'] ?? 0)),
          lon: parseFloat(String(item['lon'] ?? 0)),
        };
      });

      this.cache.set(q, results);
      return results;
    } catch {
      return [];
    }
  }

  /**
   * Calculates delivery fee based on real driving/air distance from the café (in km)
   */
  calculateDeliveryFee(destLat: number, destLon: number): number {
    const distanceKm = this.getDistanceFromLatLonInKm(this.cafeLat, this.cafeLon, destLat, destLon);
    if (distanceKm <= 3) return 40;
    if (distanceKm <= 8) return 50;
    if (distanceKm <= 15) return 65;
    return 80;
  }

  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
