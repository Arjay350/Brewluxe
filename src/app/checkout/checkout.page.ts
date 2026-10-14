import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonRadio,
  IonRadioGroup,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  cardOutline,
  cashOutline,
  qrCodeOutline,
  walletOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
  arrowBackOutline,
  cafeOutline,
  receiptOutline,
  shieldCheckmarkOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../auth/auth.service';
import { CartItem } from '../models/product.model';
import { AddressService, AddressSuggestion } from '../services/address.service';
import { CartService } from '../services/cart.service';
import { DatabaseService } from '../services/database.service';
import { PaymentService } from '../services/payment.service';
import { ReceiptService } from '../services/receipt.service';

interface ConfirmedOrder {
  orderId: string;
  name: string;
  address: string;
  phone: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  paymentMethod: string;
  email: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonRadio,
    IonRadioGroup,
    IonToolbar,
  ],
  template: `
    <ion-header class="ion-no-border brew-header">
      <ion-toolbar class="brew-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button menu="brewluxe-menu" aria-label="Open menu" class="brew-menu-btn"></ion-menu-button>
        </ion-buttons>

        <div class="brew-brand-header" routerLink="/cart">
          <img src="assets/images/brewluxe-logo.png" alt="Brewluxe Logo" class="header-logo" />
          <span class="header-brand-name">Checkout</span>
        </div>

        <ion-buttons slot="end">
          <ion-button routerLink="/cart" class="back-cart-link">
            <span>Back to Cart</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell">
      <div class="brew-container">

        <!-- 1. Celebratory Order Confirmation Screen (Shown upon successful order) -->
        <section class="confirmation-screen" *ngIf="confirmedOrder">
          <div class="confirmation-card">
            <div class="success-icon-wrap">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
            </div>
            <span class="eyebrow">Order Placed Successfully!</span>
            <h1 class="confirmation-title">Thank You, {{ confirmedOrder.name }}!</h1>
            <p class="confirmation-subtext">
              Your Brewluxe order is now being prepared with fresh ingredients. A confirmation receipt has been dispatched to <strong>{{ confirmedOrder.email }}</strong>.
            </p>

            <div class="order-receipt-box">
              <div class="receipt-header">
                <div>
                  <span class="receipt-label">Order Reference</span>
                  <strong class="receipt-id">#{{ confirmedOrder.orderId.slice(0, 8).toUpperCase() }}</strong>
                </div>
                <span class="brew-badge brew-badge-sage">{{ confirmedOrder.paymentMethod }}</span>
              </div>

              <div class="receipt-details">
                <div class="receipt-row">
                  <span>Delivery Address</span>
                  <strong>{{ confirmedOrder.address }}</strong>
                </div>
                <div class="receipt-row">
                  <span>Contact Number</span>
                  <strong>{{ confirmedOrder.phone }}</strong>
                </div>
                <div class="receipt-row">
                  <span>Subtotal</span>
                  <strong>₱{{ confirmedOrder.subtotal }}</strong>
                </div>
                <div class="receipt-row">
                  <span>Delivery Fee</span>
                  <strong>₱{{ confirmedOrder.deliveryFee }}</strong>
                </div>
                <div class="receipt-row total-row">
                  <span>Total Amount Paid / Due</span>
                  <strong>₱{{ confirmedOrder.total }}</strong>
                </div>
              </div>
            </div>

            <div class="confirmation-actions">
              <ion-button routerLink="/orders" class="brew-btn brew-btn-primary track-btn">
                <ion-icon slot="start" name="receipt-outline"></ion-icon>
                <span>Track in My Orders</span>
              </ion-button>
              <ion-button routerLink="/menu" fill="outline" class="brew-btn brew-btn-outline">
                Order More Drinks
              </ion-button>
            </div>
          </div>
        </section>

        <!-- 2. Active Checkout Layout -->
        <div class="checkout-layout" *ngIf="!confirmedOrder && items.length">

          <!-- Left Column: Delivery & Payment Details Form -->
          <section class="checkout-form-panel">
            <div class="panel-header">
              <span class="eyebrow">Step 1 of 2</span>
              <h2>Delivery Information</h2>
              <p class="panel-desc">Where should our barista deliver your order?</p>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit()" class="checkout-form">
              <!-- Name Field -->
              <div class="brew-field">
                <label>Recipient Full Name <b>*</b></label>
                <input
                  type="text"
                  formControlName="name"
                  autocomplete="name"
                  placeholder="e.g. Juan dela Cruz"
                  class="brew-input"
                />
                <small class="field-error" *ngIf="form.controls.name.touched && form.controls.name.invalid">
                  Please enter your name (at least 2 characters).
                </small>
              </div>

              <!-- Phone Field -->
              <div class="brew-field">
                <label>Philippine Mobile Number <b>*</b></label>
                <input
                  type="tel"
                  formControlName="phone"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="09171234567 or +639171234567"
                  class="brew-input"
                />
                <small class="field-error" *ngIf="form.controls.phone.touched && form.controls.phone.invalid">
                  Please enter a valid Philippine mobile number (e.g. 09XXXXXXXXX).
                </small>
              </div>

              <!-- Address Field with Nominatim Autocomplete -->
              <div class="brew-field address-field-wrap">
                <label>Delivery Address & Landmark <b>*</b></label>
                <textarea
                  rows="3"
                  formControlName="address"
                  autocomplete="street-address"
                  (input)="onAddressInput($any($event.target).value)"
                  placeholder="Street name, barangay, building, or nearest campus landmark…"
                  class="brew-input address-textarea"
                ></textarea>

                <!-- Address Autocomplete Suggestions Dropdown -->
                <div class="address-suggestions-box" *ngIf="suggestions.length">
                  <div
                    class="suggestion-row"
                    *ngFor="let s of suggestions"
                    (click)="selectSuggestion(s)"
                    tabindex="0"
                  >
                    <ion-icon name="location-outline" class="suggestion-icon"></ion-icon>
                    <div class="suggestion-text">
                      <strong>{{ s.displayName }}</strong>
                    </div>
                  </div>
                </div>

                <small class="field-error" *ngIf="form.controls.address.touched && form.controls.address.invalid">
                  Please provide a detailed delivery address (at least 8 characters).
                </small>
              </div>

              <!-- Payment Method Section -->
              <div class="payment-method-section">
                <div class="panel-header">
                  <span class="eyebrow">Step 2 of 2</span>
                  <h2>Select Payment Method</h2>
                  <p class="panel-desc">Choose how you would like to complete your order.</p>
                </div>

                <ion-radio-group formControlName="paymentMethod" class="payment-options-grid">
                  <!-- Option 1: GCash -->
                  <div
                    class="payment-option-card"
                    [class.is-selected]="paymentMethod === 'GCash'"
                    (click)="form.controls.paymentMethod.setValue('GCash')"
                  >
                    <div class="payment-card-left">
                      <div class="payment-logo gcash-logo">GCash</div>
                      <div class="payment-meta">
                        <strong>GCash E-Wallet</strong>
                        <span>Fast & secure via PayMongo</span>
                      </div>
                    </div>
                    <ion-radio value="GCash" slot="end" aria-label="GCash via PayMongo"></ion-radio>
                  </div>

                  <!-- Option 2: Maya / QR Ph / Card -->
                  <div
                    class="payment-option-card"
                    [class.is-selected]="paymentMethod === 'QR Payment'"
                    (click)="form.controls.paymentMethod.setValue('QR Payment')"
                  >
                    <div class="payment-card-left">
                      <div class="payment-logo maya-logo">Maya / QR</div>
                      <div class="payment-meta">
                        <strong>Maya, QR Ph & Cards</strong>
                        <span>Visa, Mastercard & QR via PayMongo</span>
                      </div>
                    </div>
                    <ion-radio value="QR Payment" slot="end" aria-label="Maya, QR Ph, or Card via PayMongo"></ion-radio>
                  </div>

                  <!-- Option 3: Cash on Delivery -->
                  <div
                    class="payment-option-card"
                    [class.is-selected]="paymentMethod === 'Cash on Delivery'"
                    (click)="form.controls.paymentMethod.setValue('Cash on Delivery')"
                  >
                    <div class="payment-card-left">
                      <div class="payment-logo cod-logo">COD</div>
                      <div class="payment-meta">
                        <strong>Cash on Delivery</strong>
                        <span>Pay directly upon arrival</span>
                      </div>
                    </div>
                    <ion-radio value="Cash on Delivery" slot="end" aria-label="Cash on Delivery"></ion-radio>
                  </div>
                </ion-radio-group>

                <!-- Sandbox / Security Note -->
                <div class="payment-info-box" *ngIf="paymentMethod !== 'Cash on Delivery'">
                  <div class="info-badge">
                    <ion-icon name="shield-checkmark-outline"></ion-icon>
                    <span>PayMongo Sandbox Active</span>
                  </div>
                  <p>
                    Test Mode: Your order is protected by 256-bit encryption. No real banking charges will be deducted.
                  </p>
                </div>

                <div class="payment-info-box cod-info" *ngIf="paymentMethod === 'Cash on Delivery'">
                  <div class="info-badge">
                    <ion-icon name="cash-outline"></ion-icon>
                    <span>Cash on Hand</span>
                  </div>
                  <p>
                    Please have the exact amount of <strong>₱{{ total }}</strong> ready for the delivery rider.
                  </p>
                </div>
              </div>

              <!-- Status Notice / Error -->
              <div class="checkout-notice-box" *ngIf="message" [class.is-error]="failed" role="alert">
                <ion-icon [name]="failed ? 'close-circle-outline' : 'checkmark-circle-outline'"></ion-icon>
                <span>{{ message }}</span>
              </div>

              <!-- Submit Button -->
              <ion-button
                expand="block"
                type="submit"
                class="brew-btn brew-btn-primary place-order-btn"
                [disabled]="submitting"
              >
                <span *ngIf="!submitting">
                  {{ paymentMethod === 'Cash on Delivery' ? 'Confirm & Place Order • ₱' + total : 'Proceed to PayMongo Checkout • ₱' + total }}
                </span>
                <span *ngIf="submitting">Brewing your order…</span>
              </ion-button>
            </form>
          </section>

          <!-- Right Column: Order Summary Breakdown -->
          <aside class="checkout-summary-panel">
            <div class="summary-card">
              <h2 class="summary-title">Order Summary</h2>

              <div class="checkout-items-list">
                <div class="checkout-item-line" *ngFor="let item of items">
                  <div class="checkout-item-info">
                    <strong>{{ item.product.name }}</strong>
                    <span class="item-specs">{{ item.size }} • {{ item.sugarLevel }} sugar • {{ item.quantity }}x</span>
                    <small class="item-addons-text" *ngIf="item.addons && item.addons.length">
                      + {{ item.addons.join(', ') }}
                    </small>
                  </div>
                  <span class="item-line-total">
                    ₱{{ item.product.price * item.quantity + cart.getAddonsPrice(item) }}
                  </span>
                </div>
              </div>

              <div class="summary-calculation">
                <div class="calc-row">
                  <span>Items Subtotal</span>
                  <strong>₱{{ subtotal }}</strong>
                </div>

                <div class="calc-row">
                  <div class="delivery-row-left">
                    <span>Delivery Fee</span>
                    <small>Calculated by distance</small>
                  </div>
                  <strong>₱{{ deliveryFee }}</strong>
                </div>

                <div class="calc-row total-calc-row">
                  <div>
                    <span class="grand-total-label">Grand Total</span>
                    <small>All taxes & fees included</small>
                  </div>
                  <strong class="grand-total-price">₱{{ total }}</strong>
                </div>
              </div>

              <div class="trust-notice">
                <ion-icon name="shield-checkmark-outline"></ion-icon>
                <span>Safe checkout • Freshly prepared at TIP QC</span>
              </div>
            </div>
          </aside>

        </div>

        <!-- 3. Empty Cart State (If visited with 0 items) -->
        <div class="brew-empty-state" *ngIf="!confirmedOrder && !items.length">
          <div class="empty-icon">☕</div>
          <h3>Your cart is empty</h3>
          <p>Please select your coffee, tea, or pastries from our menu before checking out.</p>
          <ion-button routerLink="/menu" class="brew-btn brew-btn-primary">
            Browse Menu
          </ion-button>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    /* Top Navigation */
    .brew-header {
      background: var(--ion-background-color);
      border-bottom: 1px solid var(--brew-border-subtle);
    }

    .brew-toolbar {
      --background: var(--ion-background-color);
      --color: var(--brew-espresso);
      padding: 4px 8px;
    }

    .brew-menu-btn {
      --color: var(--brew-espresso);
    }

    .brew-brand-header {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;

      .header-logo {
        height: 38px;
        width: auto;
        border-radius: 8px;
      }

      .header-brand-name {
        font-family: var(--brew-font-serif);
        font-size: 1.45rem;
        font-weight: 700;
        color: var(--brew-espresso);
        letter-spacing: -0.02em;
      }
    }

    .back-cart-link {
      --color: var(--brew-sage);
      font-weight: 700;
      font-size: 0.92rem;
    }

    /* Checkout Layout */
    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 28px;
      padding: 24px 0 60px;

      @media (min-width: 900px) {
        grid-template-columns: 1.35fr 0.85fr;
        gap: 40px;
        align-items: start;
      }
    }

    /* Form Panel */
    .checkout-form-panel {
      background: #FFFFFF;
      border: 1px solid var(--brew-border-subtle);
      border-radius: var(--brew-radius-xl);
      padding: 24px;
      box-shadow: var(--brew-shadow-sm);

      @media (min-width: 600px) {
        padding: 32px;
      }
    }

    .panel-header {
      margin-bottom: 20px;

      h2 {
        margin: 4px 0 4px;
        font-size: 1.5rem;
      }

      .panel-desc {
        margin: 0;
        color: var(--ion-color-medium);
        font-size: 0.92rem;
      }
    }

    .checkout-form {
      display: flex;
      flex-direction: column;
    }

    /* Address Field & Autocomplete */
    .address-field-wrap {
      position: relative;
    }

    .address-textarea {
      resize: vertical;
      min-height: 80px;
      line-height: 1.5;
    }

    .address-suggestions-box {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 50;
      background: #FFFFFF;
      border: 1.5px solid var(--brew-espresso);
      border-radius: var(--brew-radius-md);
      box-shadow: var(--brew-shadow-lg);
      max-height: 220px;
      overflow-y: auto;
      margin-top: 4px;
    }

    .suggestion-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--brew-border-subtle);
      cursor: pointer;
      font-size: 0.86rem;
      color: var(--brew-espresso);
      transition: background var(--brew-duration) var(--brew-ease);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--brew-alabaster);
      }

      .suggestion-icon {
        color: var(--brew-sage);
        font-size: 1.2rem;
        flex-shrink: 0;
      }
    }

    /* Payment Options */
    .payment-method-section {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--brew-border-subtle);
    }

    .payment-options-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .payment-option-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      border-radius: var(--brew-radius-md);
      border: 1.5px solid var(--brew-border-subtle);
      background: #FFFFFF;
      cursor: pointer;
      transition: all var(--brew-duration) var(--brew-ease);

      &:hover {
        border-color: var(--brew-border-strong);
        background: var(--brew-alabaster);
      }

      &.is-selected {
        border-color: var(--brew-espresso);
        background: rgba(44, 30, 22, 0.04);
        box-shadow: 0 4px 12px rgba(44, 30, 22, 0.08);
      }

      .payment-card-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .payment-logo {
        padding: 6px 10px;
        border-radius: 8px;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .gcash-logo {
        background: #007DFE;
        color: #FFFFFF;
      }

      .maya-logo {
        background: #25C478;
        color: #FFFFFF;
      }

      .cod-logo {
        background: var(--brew-espresso);
        color: #FFFFFF;
      }

      .payment-meta {
        strong {
          display: block;
          font-size: 0.95rem;
          color: var(--brew-espresso);
        }

        span {
          font-size: 0.8rem;
          color: var(--ion-color-medium);
        }
      }
    }

    .payment-info-box {
      padding: 14px 16px;
      border-radius: var(--brew-radius-md);
      background: #F4FAF5;
      border-left: 4px solid var(--brew-sage);
      font-size: 0.86rem;
      color: #245230;
      margin-bottom: 20px;

      .info-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      p {
        margin: 0;
        line-height: 1.5;
      }

      &.cod-info {
        background: #FAF6F2;
        border-left-color: var(--brew-caramel);
        color: #63432B;
      }
    }

    .checkout-notice-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-radius: var(--brew-radius-md);
      background: #F4FAF5;
      color: var(--brew-sage);
      font-size: 0.92rem;
      font-weight: 600;
      margin-bottom: 16px;

      &.is-error {
        background: #FDE8E8;
        color: var(--ion-color-danger);
      }
    }

    .place-order-btn {
      --background: var(--brew-espresso);
      --color: #FFFFFF;
      min-height: 54px;
      font-size: 1.05rem;
      font-weight: 800;
      margin-top: 8px;
    }

    /* Right Column Summary */
    .checkout-summary-panel {
      @media (min-width: 900px) {
        position: sticky;
        top: 24px;
      }
    }

    .summary-card {
      background: #FFFFFF;
      border: 1px solid var(--brew-border-subtle);
      border-radius: var(--brew-radius-xl);
      padding: 24px;
      box-shadow: var(--brew-shadow-sm);

      .summary-title {
        margin: 0 0 16px;
        font-size: 1.35rem;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--brew-border-subtle);
      }
    }

    .checkout-items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .checkout-item-line {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding-bottom: 10px;
      border-bottom: 1px dashed var(--brew-border-subtle);

      &:last-child {
        border-bottom: none;
      }

      .checkout-item-info {
        strong {
          display: block;
          font-size: 0.95rem;
          color: var(--brew-espresso);
        }

        .item-specs {
          display: block;
          font-size: 0.8rem;
          color: var(--ion-color-medium);
          margin-top: 2px;
        }

        .item-addons-text {
          display: block;
          font-size: 0.78rem;
          color: var(--brew-caramel);
          font-weight: 600;
        }
      }

      .item-line-total {
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--brew-espresso);
      }
    }

    .summary-calculation {
      border-top: 2px dashed var(--brew-alabaster);
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.92rem;
      color: var(--ion-color-medium);

      strong {
        color: var(--brew-espresso);
        font-weight: 700;
      }

      .delivery-row-left {
        display: flex;
        flex-direction: column;

        small {
          font-size: 0.75rem;
          color: var(--brew-sage);
        }
      }

      &.total-calc-row {
        margin-top: 8px;
        padding-top: 12px;
        border-top: 1px solid var(--brew-border-subtle);

        .grand-total-label {
          display: block;
          font-family: var(--brew-font-serif);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--brew-espresso);
        }

        small {
          display: block;
          font-size: 0.72rem;
          color: var(--ion-color-medium);
        }

        .grand-total-price {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--brew-espresso);
        }
      }
    }

    .trust-notice {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 20px;
      padding-top: 14px;
      border-top: 1px solid var(--brew-border-subtle);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--ion-color-medium);

      ion-icon {
        color: var(--brew-sage);
        font-size: 1.05rem;
      }
    }

    /* Confirmation Screen */
    .confirmation-screen {
      padding: 40px 0 80px;
      display: flex;
      justify-content: center;
    }

    .confirmation-card {
      width: 100%;
      max-width: 620px;
      background: #FFFFFF;
      border: 1px solid var(--brew-border-subtle);
      border-radius: var(--brew-radius-xl);
      padding: 36px 28px;
      box-shadow: var(--brew-shadow-md);
      text-align: center;
    }

    .success-icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(42, 75, 50, 0.12);
      color: var(--brew-sage);
      display: grid;
      place-items: center;
      font-size: 3rem;
      margin: 0 auto 16px;
    }

    .confirmation-title {
      margin: 8px 0 12px;
      font-size: clamp(1.8rem, 4vw, 2.4rem);
    }

    .confirmation-subtext {
      color: var(--ion-color-medium);
      font-size: 0.98rem;
      line-height: 1.6;
      margin: 0 0 28px;
    }

    .order-receipt-box {
      background: var(--brew-alabaster);
      border: 1px solid var(--brew-border-subtle);
      border-radius: var(--brew-radius-lg);
      padding: 20px;
      margin-bottom: 28px;
      text-align: left;
    }

    .receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(44, 30, 22, 0.08);
      margin-bottom: 14px;

      .receipt-label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--ion-color-medium);
        font-weight: 700;
      }

      .receipt-id {
        font-family: var(--brew-font-sans);
        font-size: 1.2rem;
        color: var(--brew-espresso);
      }
    }

    .receipt-details {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--ion-color-medium);

      strong {
        color: var(--brew-espresso);
        text-align: right;
        max-width: 65%;
      }

      &.total-row {
        margin-top: 6px;
        padding-top: 10px;
        border-top: 1px dashed rgba(44, 30, 22, 0.15);
        font-size: 1.05rem;

        strong {
          font-size: 1.25rem;
          color: var(--brew-espresso);
        }
      }
    }

    .confirmation-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;

      @media (min-width: 480px) {
        flex-direction: row;
        justify-content: center;
      }

      .track-btn {
        min-width: 200px;
      }
    }
  `],
})
export class CheckoutPage implements OnInit {
  items: CartItem[] = [];
  deliveryFee = 50;
  submitting = false;
  failed = false;
  message = '';
  suggestions: AddressSuggestion[] = [];
  confirmedOrder: ConfirmedOrder | null = null;

  private addressSearchTimer?: ReturnType<typeof setTimeout>;

  readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100)],
    ],
    phone: [
      '',
      [Validators.required, Validators.pattern(/^(?:\+?63|0)9\d{9}$/)],
    ],
    address: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(500)],
    ],
    paymentMethod: [
      'GCash' as 'GCash' | 'QR Payment' | 'Cash on Delivery',
      Validators.required,
    ],
  });

  constructor(
    private readonly fb: FormBuilder,
    readonly cart: CartService,
    private readonly db: DatabaseService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly paymentService: PaymentService,
    private readonly addressService: AddressService,
    private readonly receiptService: ReceiptService,
  ) {
    addIcons({
      locationOutline,
      cardOutline,
      cashOutline,
      qrCodeOutline,
      walletOutline,
      checkmarkCircleOutline,
      arrowForwardOutline,
      arrowBackOutline,
      cafeOutline,
      receiptOutline,
      shieldCheckmarkOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.items = this.cart.getItems();
    const user = this.auth.getCurrentUser();
    this.form.patchValue({
      name: user?.displayName ?? '',
      phone: user?.phone ?? '',
    });

    try {
      const profile = await this.db.getProfile();
      this.form.patchValue({
        name: profile.display_name || user?.displayName || '',
        phone: profile.phone || user?.phone || '',
        address: profile.address || '',
      });
    } catch {
      // Checkout remains available when an existing account has no readable profile row.
    }

    const paymentParam = this.route.snapshot.queryParams['payment'];
    if (paymentParam === 'cancelled') {
      this.message =
        'Your previous PayMongo checkout session was cancelled. You can change details and try again.';
      this.failed = false;
    }
  }

  onAddressInput(val?: string | number | null): void {
    if (this.addressSearchTimer) clearTimeout(this.addressSearchTimer);
    const query = String(val ?? '').trim();
    if (query.length < 3) {
      this.suggestions = [];
      return;
    }
    this.addressSearchTimer = setTimeout(async () => {
      this.suggestions = await this.addressService.searchAddress(query);
    }, 350);
  }

  selectSuggestion(s: AddressSuggestion): void {
    this.form.patchValue({ address: s.displayName });
    this.suggestions = [];
    this.deliveryFee = this.addressService.calculateDeliveryFee(s.lat, s.lon);
  }

  get paymentMethod(): string {
    return this.form.controls.paymentMethod.value;
  }

  get subtotal(): number {
    return this.items.reduce(
      (sum, item) =>
        sum + item.product.price * item.quantity + this.cart.getAddonsPrice(item),
      0,
    );
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }

  async submit(): Promise<void> {
    if (this.form.invalid || !this.items.length) {
      this.form.markAllAsTouched();
      this.message = 'Please fill out all required fields before placing order.';
      this.failed = true;
      return;
    }
    if (!this.auth.isLoggedIn()) {
      this.message = 'Please log in to complete your order.';
      this.failed = true;
      await this.router.navigateByUrl('/login');
      return;
    }

    this.submitting = true;
    this.message = '';
    this.failed = false;

    try {
      const value = this.form.getRawValue();
      const user = this.auth.getCurrentUser();
      const email = user?.email || '';

      if (value.paymentMethod === 'Cash on Delivery') {
        const orderId = await this.db.placeOrder(this.items, {
          customerName: value.name,
          phone: value.phone,
          address: value.address,
          paymentMethod: 'Cash on Delivery',
          paymentReference: 'COD',
        });

        // Dispatch receipt via Resend API (simulation mode in sandbox)
        this.receiptService
          .sendOrderReceipt({
            orderId,
            customerName: value.name,
            customerEmail: email,
            phone: value.phone,
            address: value.address,
            items: [...this.items],
            subtotal: this.subtotal,
            deliveryFee: this.deliveryFee,
            total: this.total,
            paymentMethod: 'Cash on Delivery',
          })
          .catch(() => {});

        this.confirmedOrder = {
          orderId,
          name: value.name,
          address: value.address,
          phone: value.phone,
          total: this.total,
          subtotal: this.subtotal,
          deliveryFee: this.deliveryFee,
          paymentMethod: 'Cash on Delivery',
          email,
        };

        this.cart.clearCart();
        this.items = [];
        return;
      }

      // Online payment via PayMongo Sandbox
      const tempRef =
        'PM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const sessionResult = await this.paymentService.createCheckoutSession(
        tempRef,
        this.items,
        {
          name: value.name,
          phone: value.phone,
          address: value.address,
          email: user?.email,
        },
        this.deliveryFee,
      );

      if (!sessionResult.success) {
        throw new Error(
          sessionResult.message || 'Could not initiate PayMongo payment session.',
        );
      }

      const orderId = await this.db.placeOrder(this.items, {
        customerName: value.name,
        phone: value.phone,
        address: value.address,
        paymentMethod: value.paymentMethod,
        paymentReference: tempRef,
      });

      // Dispatch receipt via Resend API
      this.receiptService
        .sendOrderReceipt({
          orderId,
          customerName: value.name,
          customerEmail: email,
          phone: value.phone,
          address: value.address,
          items: [...this.items],
          subtotal: this.subtotal,
          deliveryFee: this.deliveryFee,
          total: this.total,
          paymentMethod: value.paymentMethod,
        })
        .catch(() => {});

      if (sessionResult.checkoutUrl) {
        this.cart.clearCart();
        this.items = [];
        // Redirect to PayMongo hosted checkout
        window.location.href = sessionResult.checkoutUrl;
      } else {
        // Sandbox simulated checkout
        this.confirmedOrder = {
          orderId,
          name: value.name,
          address: value.address,
          phone: value.phone,
          total: this.total,
          subtotal: this.subtotal,
          deliveryFee: this.deliveryFee,
          paymentMethod: value.paymentMethod,
          email,
        };
        this.cart.clearCart();
        this.items = [];
      }
    } catch (error) {
      this.message =
        error instanceof Error
          ? error.message
          : 'We could not save your order. Please try again.';
      this.failed = true;
    } finally {
      this.submitting = false;
    }
  }
}
