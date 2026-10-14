import { Injectable } from '@angular/core';
import { Product, ProductCategory } from '../models/product.model';
import { DatabaseService } from './database.service';

export type ProductInput = Omit<Product, 'id'> & { id?: number };

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private readonly database: DatabaseService) {}

  loadProducts(): Promise<Product[]> { return this.database.loadProducts(); }
  loadManageableProducts(): Promise<Product[]> { return this.database.loadManageableProducts(); }
  getProductsByCategory(category: string): Promise<Product[]> {
    return this.loadProducts().then((products) => products.filter((product) => product.category === category));
  }
  getProductById(id: number): Promise<Product | undefined> {
    return this.loadManageableProducts().then((products) => products.find((product) => product.id === id));
  }
  saveProduct(product: ProductInput): Promise<void> { return this.database.saveProduct(product); }
  uploadProductImage(file: File): Promise<string> { return this.database.uploadProductImage(file); }
  deleteProduct(id: number): Promise<void> { return this.database.deleteProduct(id); }
  setProductAvailability(id: number, available: boolean): Promise<void> {
    return this.database.setProductAvailability(id, available);
  }
}

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Coffee', 'Iced Coffee', 'Frappes', 'Pastries', 'Shakes', 'Non-Coffee'];
