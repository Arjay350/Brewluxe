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

  it('does not claim to send email without a trusted server endpoint', async () => {
    const result = await service.sendOrderReceipt(mockOrder);
    expect(result.success).toBe(false);
    expect(result.isSimulation).toBe(false);
    expect(result.message).toContain('trusted server endpoint');
  });
});
