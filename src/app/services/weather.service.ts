import { Injectable } from '@angular/core';

export interface WeatherRecommendation {
  temperature: number;
  conditionText: string;
  icon: string;
  headline: string;
  recommendedCategory: 'Coffee' | 'Iced Coffee' | 'Frappes' | 'Shakes';
  tag: string;
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private cachedRecommendation: WeatherRecommendation | null = null;
  private lastFetchTime = 0;
  private readonly cacheDurationMs = 15 * 60 * 1000; // 15 minute cache

  // Default coordinates: Metro Manila / Quezon City
  private readonly defaultLat = 14.65;
  private readonly defaultLon = 121.05;

  async getWeatherRecommendation(lat = this.defaultLat, lon = this.defaultLon): Promise<WeatherRecommendation> {
    const now = Date.now();
    if (this.cachedRecommendation && now - this.lastFetchTime < this.cacheDurationMs) {
      return this.cachedRecommendation;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather API request failed');

      const data = await response.json();
      const temp = Math.round(data?.current?.temperature_2m ?? 30);
      const code = data?.current?.weather_code ?? 0;

      const recommendation = this.buildRecommendation(temp, code);
      this.cachedRecommendation = recommendation;
      this.lastFetchTime = now;
      return recommendation;
    } catch {
      // Fallback recommendation if offline
      return this.fallbackRecommendation();
    }
  }

  private buildRecommendation(temp: number, code: number): WeatherRecommendation {
    const isRainy = (code >= 51 && code <= 67) || (code >= 80 && code <= 99);
    const isHot = temp >= 29;

    if (isRainy) {
      return {
        temperature: temp,
        conditionText: 'Rainy & Cozy',
        icon: '🌧️',
        tag: "Rainy Day Pick",
        headline: `It's ${temp}°C and rainy. Warm up with a freshly brewed hot Cappuccino or Mocha!`,
        recommendedCategory: 'Coffee',
      };
    }

    if (isHot) {
      return {
        temperature: temp,
        conditionText: 'Sunny & Warm',
        icon: '☀️',
        tag: 'Beat The Heat',
        headline: `It's ${temp}°C in Metro Manila! Cool down with an Iced Spanish Latte or Caramel Frappe.`,
        recommendedCategory: 'Frappes',
      };
    }

    return {
      temperature: temp,
      conditionText: 'Pleasant & Cool',
      icon: '☕',
      tag: 'Barista Special',
      headline: `A pleasant ${temp}°C today. Perfect time for your signature coffee break!`,
      recommendedCategory: 'Coffee',
    };
  }

  private fallbackRecommendation(): WeatherRecommendation {
    return {
      temperature: 30,
      conditionText: 'Metro Manila Warmth',
      icon: '☀️',
      tag: 'Beat The Heat',
      headline: "It's a sunny day! Refresh yourself with our chilled signature drinks and frappes.",
      recommendedCategory: 'Frappes',
    };
  }
}
