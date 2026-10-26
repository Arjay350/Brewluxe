import { Injectable } from '@angular/core';
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
  async sendOrderReceipt(order: ReceiptOrderDetails): Promise<EmailReceiptResult> {
    void order;
    return {
      success: false,
      isSimulation: false,
      message: 'Email receipt delivery is unavailable until a trusted server endpoint is configured.',
    };
  }

  renderReceiptHtml(order: ReceiptOrderDetails): string {
    const itemRows = order.items
      .map((i) => {
        const sizeSurcharge = (i.size ?? 'Regular') === 'Large' ? 20 : 0;
        const addonTotal = i.addons.reduce((sum, addon) => sum + ({
          'Espresso Shot': 20,
          'Extra Whip': 15,
          'Pearls': 15,
          'Caramel Drizzle': 15,
        }[addon] ?? 0), 0);
        const unitTotal = i.product.price + sizeSurcharge + addonTotal;

        return `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>${i.product.name}</strong> (${i.size || 'Regular'})<br>
              <small style="color: #666;">${i.addons.length ? 'Add-ons: ' + i.addons.join(', ') : 'No extras'}</small>
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${i.quantity}</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">₱${unitTotal * i.quantity}</td>
          </tr>`;
      })
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
