import { Injectable } from '@angular/core';
import { Product, ProductCategory } from '../models/product.model';
import { DatabaseService } from './database.service';

export type ProductInput = Omit<Product, 'id'> & { id?: number };

@Injectable({ providedIn: 'root' })
export class ProductService {
  private cachedProducts: Product[] | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute cache
  private inFlightPromise: Promise<Product[]> | null = null;
  private cacheGeneration = 0;

  constructor(private readonly database: DatabaseService) {}

  clearCache(): void {
    this.cacheGeneration += 1;
    this.cachedProducts = null;
    this.lastFetchTime = 0;
    this.inFlightPromise = null;
  }

  async loadProducts(forceRefresh = false): Promise<Product[]> {
    const now = Date.now();
    if (!forceRefresh && this.cachedProducts && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedProducts;
    }

    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    const generation = this.cacheGeneration;
    const request = this.database
      .loadProducts()
      .then((products) => {
        if (generation === this.cacheGeneration) {
          this.cachedProducts = products;
          this.lastFetchTime = Date.now();
        }
        if (this.inFlightPromise === request) this.inFlightPromise = null;
        return products;
      })
      .catch((err) => {
        if (this.inFlightPromise === request) this.inFlightPromise = null;
        throw err;
      });

    this.inFlightPromise = request;
    return request;
  }

  async loadManageableProducts(): Promise<Product[]> {
    return this.database.loadManageableProducts();
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = await this.loadProducts();
    return products.filter((product) => product.category === category);
  }

  getCachedProductById(id: number): Product | undefined {
    if (!this.cachedProducts || Date.now() - this.lastFetchTime >= this.CACHE_TTL_MS) return undefined;
    return this.cachedProducts.find((p) => p.id === id);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    // 1. Instant return if present in cached products
    if (this.cachedProducts && Date.now() - this.lastFetchTime < this.CACHE_TTL_MS) {
      const match = this.cachedProducts.find((p) => p.id === id);
      if (match) return match;
    }

    return this.database.getProductById(id);
  }

  async saveProduct(product: ProductInput): Promise<void> {
    await this.database.saveProduct(product);
    this.clearCache();
  }

  uploadProductImage(file: File): Promise<string> {
    return this.database.uploadProductImage(file);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.database.deleteProduct(id);
    this.clearCache();
  }

  async setProductAvailability(id: number, available: boolean): Promise<void> {
    await this.database.setProductAvailability(id, available);
    this.clearCache();
  }
}

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Coffee', 'Iced Coffee', 'Frappes', 'Pastries', 'Shakes', 'Non-Coffee'];
