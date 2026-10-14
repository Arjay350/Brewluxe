import { TestBed } from '@angular/core/testing';
import { PaymentService } from './payment.service';
import { CartService } from './cart.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaymentService, CartService],
    });
    service = TestBed.inject(PaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return simulated checkout result when using sandbox placeholder key', async () => {
    const result = await service.createCheckoutSession(
      'TEST-ORDER-1234',
      [
        {
          product: {
            id: 1,
            name: 'Spanish Latte',
            price: 150,
            category: 'Coffee',
            description: 'Rich espresso',
            image: 'latte.jpg',
            available: true,
            featured: true,
          },
          quantity: 2,
          size: 'Regular',
          addons: ['Espresso Shot'],
          sugarLevel: '100%',
          iceLevel: 'Normal',
        },
      ],
      {
        name: 'Test Customer',
        phone: '09171234567',
        address: '123 Aurora Blvd, QC',
      },
      50,
    );

    expect(result.success).toBe(true);
    expect(result.isSimulation).toBe(true);
    expect(result.message).toContain('TEST-ORD');
  });
});
