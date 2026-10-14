import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CartItem } from '../models/product.model';

export interface EmailReceiptResult {
  success: boolean;
  isSimulation: boolean;
  message: string;
}

export interface ReceiptOrderDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
}

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private readonly apiKey = (environment as Record<string, unknown>)['resendApiKey'] as string || 're_test_sample_key';

  async sendOrderReceipt(order: ReceiptOrderDetails): Promise<EmailReceiptResult> {
    const htmlReceipt = this.renderReceiptHtml(order);

    // If sandbox placeholder or unconfigured, simulate email dispatch safely
    if (!this.apiKey || this.apiKey === 're_test_sample_key') {
      return {
        success: true,
        isSimulation: true,
        message: `Simulated email receipt for Order #${order.orderId.slice(0, 8)} sent to ${order.customerEmail}`,
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          from: 'Brewluxe Café <onboarding@resend.dev>',
          to: [order.customerEmail],
          subject: `Brewluxe Receipt - Order #${order.orderId.slice(0, 8)}`,
          html: htmlReceipt,
        }),
      });

      if (!response.ok) {
        throw new Error('Resend API call failed');
      }

      return {
        success: true,
        isSimulation: false,
        message: `Receipt successfully emailed to ${order.customerEmail}`,
      };
    } catch (err) {
      return {
        success: false,
        isSimulation: false,
        message: err instanceof Error ? err.message : 'Could not dispatch email receipt.',
      };
    }
  }

  renderReceiptHtml(order: ReceiptOrderDetails): string {
    const itemRows = order.items
      .map(
        (i) =>
          `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>${i.product.name}</strong> (${i.size})<br>
              <small style="color: #666;">${i.addons.length ? 'Add-ons: ' + i.addons.join(', ') : 'No extras'}</small>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">₱${i.product.price * i.quantity}</td>
          </tr>`
      )
      .join('');

    return `
      <div style="font-family: sans-serif; max-width: 550px; margin: auto; padding: 24px; border: 1px solid #e2d2c1; border-radius: 16px; background: #fffaf5;">
        <h2 style="color: #2f241b; margin-top: 0;">☕ Brewluxe Order Receipt</h2>
        <p style="color: #6a5649;">Thank you for your order, <strong>${order.customerName}</strong>!</p>
        <p style="font-size: 0.9em; color: #888;">Order ID: #${order.orderId.slice(0, 8)} · ${order.paymentMethod}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="text-align: left; color: #6a5649; border-bottom: 2px solid #e2d2c1;">
              <th style="padding-bottom: 8px;">Item</th>
              <th style="padding-bottom: 8px; text-align: center;">Qty</th>
              <th style="padding-bottom: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 12px; font-size: 0.95em;">
          <p style="margin: 4px 0;">Subtotal: <strong>₱${order.subtotal}</strong></p>
          <p style="margin: 4px 0;">Delivery Fee: <strong>₱${order.deliveryFee}</strong></p>
          <h3 style="margin: 8px 0; color: #2f241b;">Total: ₱${order.total}</h3>
        </div>
        <hr style="border: none; border-top: 1px solid #e2d2c1; margin: 20px 0;">
        <p style="font-size: 0.85em; color: #6a5649; line-height: 1.5;">
          <strong>Delivering to:</strong> ${order.address}<br>
          <strong>Contact:</strong> ${order.phone}
        </p>
        <p style="font-size: 0.8em; color: #999; text-align: center; margin-top: 24px;">Brewluxe Café · Good Drinks. Better Days.</p>
      </div>
    `;
  }
}
