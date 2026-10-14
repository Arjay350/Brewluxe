import { TestBed } from '@angular/core/testing';
import { ReceiptOrderDetails, ReceiptService } from './receipt.service';

describe('ReceiptService', () => {
  let service: ReceiptService;

  const mockOrder: ReceiptOrderDetails = {
    orderId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    customerName: 'Juan Dela Cruz',
    customerEmail: 'juan@example.com',
    phone: '09171234567',
    address: '123 Katipunan Ave, QC',
    items: [
      {
        product: {
          id: 1,
          name: 'Iced Spanish Latte',
          category: 'Coffee',
          price: 150,
          description: '',
          image: '',
          featured: true,
          available: true,
        },
        quantity: 2,
        size: 'Regular',
        addons: ['Espresso Shot'],
        sugarLevel: '100%',
        iceLevel: 'Normal',
      },
    ],
    subtotal: 300,
    deliveryFee: 50,
    total: 350,
    paymentMethod: 'GCash (via PayMongo)',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReceiptService],
    });
    service = TestBed.inject(ReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should render HTML receipt containing customer and order details', () => {
    const html = service.renderReceiptHtml(mockOrder);
    expect(html).toContain('Juan Dela Cruz');
    expect(html).toContain('Iced Spanish Latte');
    expect(html).toContain('₱350');
    expect(html).toContain('123 Katipunan Ave');
  });

  it('should return simulated email receipt in test mode', async () => {
    const testService = new ReceiptService();
    (testService as unknown as { apiKey: string }).apiKey = 're_test_sample_key';
    const result = await testService.sendOrderReceipt(mockOrder);
    expect(result.success).toBe(true);
    expect(result.isSimulation).toBe(true);
    expect(result.message).toContain('Simulated email receipt');
  });

  it('should dispatch real email when live API key is configured', async () => {
    const testService = new ReceiptService();
    (testService as unknown as { apiKey: string }).apiKey = 're_test_valid_key';
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => ({
      ok: true,
      json: async () => ({ id: 'email_123' }),
    })) as unknown as typeof fetch;

    try {
      const result = await testService.sendOrderReceipt(mockOrder);
      expect(result.success).toBe(true);
      expect(result.isSimulation).toBe(false);
      expect(result.message).toContain('Receipt successfully emailed');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
