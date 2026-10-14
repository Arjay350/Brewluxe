import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/product.model';
import { CartService } from './cart.service';

export interface CheckoutSessionResult {
  success: boolean;
  checkoutUrl?: string;
  isSimulation?: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly config = environment.paymongo;

  constructor(private readonly cartService: CartService) {}

  /**
   * Creates a PayMongo Checkout Session for GCash, Maya, QR Ph, or Card.
   * Runs in test mode using sandbox keys from environment.
   */
  async createCheckoutSession(
    orderId: string,
    items: CartItem[],
    customer: { name: string; phone: string; address: string; email?: string },
    deliveryFee = 50,
  ): Promise<CheckoutSessionResult> {
    // If the key is the placeholder, provide a seamless test simulation
    if (!this.config.publicKey || this.config.publicKey === 'pk_test_sample_key') {
      return {
        success: true,
        isSimulation: true,
        message: 'PayMongo Sandbox Simulated: Test payment recorded for Order #' + orderId.slice(0, 8),
      };
    }

    const lineItems = items.map((item) => {
      const unitAddons = this.cartService.getAddonsPrice(item) / item.quantity;
      const unitPriceInCentavos = Math.round((item.product.price + unitAddons) * 100);
      const desc = item.addons.length ? `With ${item.addons.join(', ')}` : undefined;

      return {
        name: `${item.product.name} (${item.size})`,
        amount: unitPriceInCentavos,
        currency: 'PHP',
        quantity: item.quantity,
        description: desc,
      };
    });

    // Add delivery fee as a line item if applicable
    if (deliveryFee > 0) {
      lineItems.push({
        name: 'Delivery Fee',
        amount: Math.round(deliveryFee * 100),
        currency: 'PHP',
        quantity: 1,
        description: 'Standard café delivery',
      });
    }

    const payload = {
      data: {
        attributes: {
          billing: {
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            address: {
              line1: customer.address,
              country: 'PH',
            },
          },
          line_items: lineItems,
          payment_method_types: ['gcash', 'maya', 'card', 'qrph'],
          description: `Brewluxe Order #${orderId.slice(0, 8)}`,
          success_url: `${window.location.origin}/orders?payment=success&order_id=${orderId}`,
          cancel_url: `${window.location.origin}/checkout?payment=cancelled`,
        },
      },
    };

    try {
      const response = await fetch(`${this.config.apiUrl}/checkout_sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(this.config.publicKey + ':')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errMessage = errorData?.errors?.[0]?.detail || 'Could not initiate PayMongo checkout session.';
        throw new Error(errMessage);
      }

      const responseData = await response.json();
      const checkoutUrl = responseData?.data?.attributes?.checkout_url;

      return {
        success: true,
        checkoutUrl,
        isSimulation: false,
      };
    } catch (err) {
      // In local testing, if sandbox connection fails, fallback gracefully with error details
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Payment gateway communication error.',
      };
    }
  }
}
