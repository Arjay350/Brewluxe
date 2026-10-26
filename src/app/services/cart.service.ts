import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models/product.model';

const ADDON_PRICES: Record<string, number> = {
  'Espresso Shot': 20,
  'Extra Whip': 15,
  'Pearls': 15,
  'Caramel Drizzle': 15,
};

export const LARGE_SIZE_SURCHARGE = 20;

export function normalizeCartSize(size?: string | null): string {
  const normalized = (size ?? 'Regular').trim();
  const key = normalized.toLowerCase();

  if (key === 'small' || key === 'regular' || key === 'standard') {
    return 'Regular';
  }

  if (key === 'medium') {
    return 'Medium';
  }

  if (key === 'large') {
    return 'Large';
  }

  return 'Regular';
}

export function getCartSizeSurcharge(size?: string | null): number {
  return normalizeCartSize(size) === 'Large' ? LARGE_SIZE_SURCHARGE : 0;
}

export function getCartItemUnitPrice(product: Product, size = 'Regular', addons: string[] = []): number {
  const addonTotal = addons.reduce((sum, addon) => sum + (ADDON_PRICES[addon] ?? 0), 0);
  return product.price + getCartSizeSurcharge(size) + addonTotal;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'brewluxe-cart';
  private cartItems: CartItem[] = this.readCart();
  private cartSubject = new BehaviorSubject<CartItem[]>([...this.cartItems]);

  cart$ = this.cartSubject.asObservable();

  addToCart(product: Product, size = 'Regular', addons: string[] = [], sugarLevel = '100%', iceLevel = 'Regular Ice'): void {
    if (product.category === 'Pastries') {
      size = 'Regular';
      sugarLevel = '';
      iceLevel = '';
      addons = [];
    }

    const normalizedSize = normalizeCartSize(size);
    const existing = this.cartItems.find(
      (item) =>
        item.product.id === product.id &&
        normalizeCartSize(item.size) === normalizedSize &&
        item.sugarLevel === sugarLevel &&
        item.iceLevel === iceLevel &&
        JSON.stringify(item.addons) === JSON.stringify(addons),
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cartItems.push({ product, quantity: 1, size: normalizedSize, addons: [...addons], sugarLevel, iceLevel });
    }

    this.publish();
  }

  addCustomItem(item: CartItem): void {
    const size = normalizeCartSize(item.size);
    const existing = this.cartItems.find(
      (existingItem) =>
        existingItem.product.id === item.product.id &&
        normalizeCartSize(existingItem.size) === size &&
        existingItem.sugarLevel === item.sugarLevel &&
        existingItem.iceLevel === item.iceLevel &&
        JSON.stringify(existingItem.addons) === JSON.stringify(item.addons),
    );

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.cartItems.push({
        product: item.product,
        quantity: item.quantity,
        size,
        addons: [...item.addons],
        sugarLevel: item.sugarLevel,
        iceLevel: item.iceLevel,
      });
    }

    this.publish();
  }

  getItems(): CartItem[] {
    return [...this.cartItems];
  }

  getItemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + this.getItemLinePrice(item), 0);
  }

  getItemUnitPrice(product: Product, size = 'Regular', addons: string[] = []): number {
    return getCartItemUnitPrice(product, size, addons);
  }

  getItemLinePrice(item: CartItem): number {
    return this.getItemUnitPrice(item.product, item.size, item.addons) * item.quantity;
  }

  updateQuantity(index: number, change: number): void {
    if (!this.cartItems[index]) {
      return;
    }

    const nextQuantity = this.cartItems[index].quantity + change;
    if (nextQuantity <= 0) {
      this.cartItems.splice(index, 1);
    } else {
      this.cartItems[index].quantity = nextQuantity;
    }

    this.publish();
  }

  removeItem(index: number): void {
    this.cartItems.splice(index, 1);
    this.publish();
  }

  updateItem(index: number, updatedItem: Partial<CartItem>): void {
    if (!this.cartItems[index]) {
      return;
    }

    this.cartItems[index] = {
      ...this.cartItems[index],
      ...updatedItem,
      size: normalizeCartSize(updatedItem.size ?? this.cartItems[index].size),
      addons: [...(updatedItem.addons ?? this.cartItems[index].addons)],
    };
    this.publish();
  }

  clearCart(): void {
    this.cartItems = [];
    this.publish();
  }

  getAddonsPrice(item: CartItem): number {
    return item.addons.reduce((sum, addon) => sum + (ADDON_PRICES[addon] ?? 0), 0) * item.quantity;
  }

  private publish(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
  }

  private readCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved) as CartItem[];
      return parsed.map((item) => ({
        ...item,
        size: normalizeCartSize(item.size),
        addons: Array.isArray(item.addons) ? [...item.addons] : [],
      }));
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }
}
