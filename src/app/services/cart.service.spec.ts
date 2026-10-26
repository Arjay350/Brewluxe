import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models/product.model';

describe('CartService', () => {
  let service: CartService;

  const mockProduct: Product = {
    id: 1,
    name: 'Spanish Latte',
    category: 'Coffee',
    price: 150,
    description: 'Espresso with sweet milk',
    image: 'spanish-latte.jpg',
    featured: true,
    available: true,
  };

  const mockPastry: Product = {
    id: 2,
    name: 'Butter Croissant',
    category: 'Pastries',
    price: 85,
    description: 'Flaky baked pastry',
    image: 'croissant.jpg',
    featured: false,
    available: true,
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [CartService],
    });
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and start with empty cart', () => {
    expect(service).toBeTruthy();
    expect(service.getItems().length).toBe(0);
    expect(service.getItemCount()).toBe(0);
    expect(service.getSubtotal()).toBe(0);
  });

  it('should add item to cart and calculate subtotal', () => {
    service.addToCart(mockProduct, 'Regular', ['Espresso Shot'], '100%', 'Regular Ice');

    const items = service.getItems();
    expect(items.length).toBe(1);
    expect(items[0].product.name).toBe('Spanish Latte');
    expect(items[0].quantity).toBe(1);
    // 150 (base) + 20 (espresso shot) = 170
    expect(service.getSubtotal()).toBe(170);
  });

  it('should increment quantity when identical item is added', () => {
    service.addToCart(mockProduct, 'Regular', ['Espresso Shot'], '100%', 'Regular Ice');
    service.addToCart(mockProduct, 'Regular', ['Espresso Shot'], '100%', 'Regular Ice');

    const items = service.getItems();
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(2);
    expect(service.getItemCount()).toBe(2);
    // (150 + 20) * 2 = 340
    expect(service.getSubtotal()).toBe(340);
  });

  it('should treat items with different customizations as separate lines', () => {
    service.addToCart(mockProduct, 'Regular', [], '100%', 'Regular Ice');
    service.addToCart(mockProduct, 'Large', ['Extra Whip'], '50%', 'Less Ice');

    const items = service.getItems();
    expect(items.length).toBe(2);
    expect(service.getItemCount()).toBe(2);
  });

  it('should update item quantity and remove when quantity reaches 0', () => {
    service.addToCart(mockPastry);
    expect(service.getItemCount()).toBe(1);

    service.updateQuantity(0, 1);
    expect(service.getItemCount()).toBe(2);

    service.updateQuantity(0, -2);
    expect(service.getItemCount()).toBe(0);
    expect(service.getItems().length).toBe(0);
  });

  it('should remove item by index', () => {
    service.addToCart(mockProduct);
    service.addToCart(mockPastry);
    expect(service.getItems().length).toBe(2);

    service.removeItem(0);
    expect(service.getItems().length).toBe(1);
    expect(service.getItems()[0].product.name).toBe('Butter Croissant');
  });

  it('should clear the entire cart', () => {
    service.addToCart(mockProduct);
    service.addToCart(mockPastry);
    expect(service.getItemCount()).toBe(2);

    service.clearCart();
    expect(service.getItems().length).toBe(0);
    expect(service.getItemCount()).toBe(0);
    expect(service.getSubtotal()).toBe(0);
  });

  it('should add custom item directly via addCustomItem', () => {
    service.addCustomItem({
      product: mockProduct,
      quantity: 3,
      size: 'Large',
      addons: ['Pearls', 'Caramel Drizzle'],
      sugarLevel: '75%',
      iceLevel: 'No Ice',
    });

    const items = service.getItems();
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(3);
    // Base 150 + Large surcharge 20 + addons 30 = 200 per unit. 200 * 3 = 600.
    expect(service.getSubtotal()).toBe(600);
  });

  it('should update drink preferences using updateItem', () => {
    service.addToCart(mockProduct, 'Regular', [], '100%', 'Regular Ice');
    expect(service.getItems()[0].sugarLevel).toBe('100%');
    expect(service.getItems()[0].size).toBe('Regular');

    service.updateItem(0, {
      size: 'Large',
      sugarLevel: '50%',
      iceLevel: 'Less Ice',
      addons: ['Espresso Shot'],
    });

    const updated = service.getItems()[0];
    expect(updated.size).toBe('Large');
    expect(updated.sugarLevel).toBe('50%');
    expect(updated.iceLevel).toBe('Less Ice');
    expect(updated.addons).toEqual(['Espresso Shot']);
    expect(service.getSubtotal()).toBe(190); // 150 + 20 size + 20 addon
  });
});
