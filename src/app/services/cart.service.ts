import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'brewluxe-cart';
  private cartItems: CartItem[] = this.readCart();
  private cartSubject = new BehaviorSubject<CartItem[]>([...this.cartItems]);

  cart$ = this.cartSubject.asObservable();

  addToCart(product: Product, size = 'Regular', addons: string[] = [], sugarLevel = '100%', iceLevel = 'Regular Ice'): void {
    if (product.category === 'Pastries') {
      size = 'Standard';
      sugarLevel = '';
      iceLevel = '';
      addons = [];
    }
    const existing = this.cartItems.find(
      (item) =>
        item.product.id === product.id &&
        item.size === size &&
        item.sugarLevel === sugarLevel &&
        item.iceLevel === iceLevel &&
        JSON.stringify(item.addons) === JSON.stringify(addons),
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cartItems.push({ product, quantity: 1, size, addons, sugarLevel, iceLevel });
    }

    this.publish();
  }

  addCustomItem(item: CartItem): void {
    const existing = this.cartItems.find(
      (existingItem) =>
        existingItem.product.id === item.product.id &&
        existingItem.size === item.size &&
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
        size: item.size,
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
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity + this.getAddonsPrice(item), 0);
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
    };
    this.publish();
  }

  clearCart(): void {
    this.cartItems = [];
    this.publish();
  }

  getAddonsPrice(item: CartItem): number {
    const addonPrices: Record<string, number> = {
      'Espresso Shot': 20,
      'Extra Whip': 15,
      'Pearls': 15,
      'Caramel Drizzle': 15,
    };

    return item.addons.reduce((sum, addon) => sum + (addonPrices[addon] ?? 0), 0) * item.quantity;
  }

  private publish(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cartItems));
    this.cartSubject.next([...this.cartItems]);
  }

  private readCart(): CartItem[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) as CartItem[] : [];
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }
}
