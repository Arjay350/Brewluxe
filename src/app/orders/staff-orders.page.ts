import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  receiptOutline,
  personOutline,
  locationOutline,
  timeOutline,
  syncOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { getNextOrderStatuses, isOrderClosed } from '../models/order-status.model';
import { DatabaseService, OrderRecord } from '../services/database.service';

@Component({
  selector: 'app-staff-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonSelect,
    IonSelectOption,
    IonToolbar,
  ],
  template: `
    <ion-header class="ion-no-border brew-header">
      <ion-toolbar class="brew-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button menu="brewluxe-menu" aria-label="Open menu" class="brew-menu-btn"></ion-menu-button>
        </ion-buttons>

        <div class="brew-brand-header" routerLink="/home">
          <img src="assets/images/brewluxe-logo.png" alt="Brewluxe Logo" class="header-logo" />
          <span class="header-brand-name">Barista Order Queue</span>
        </div>

        <ion-buttons slot="end">
          <button type="button" class="refresh-queue-btn" (click)="refresh()" [disabled]="loading" title="Refresh queue">
            <ion-icon name="sync-outline" [class.spinning]="loading"></ion-icon>
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell">
      <div class="brew-container">

        <div class="queue-header">
          <div>
            <span class="eyebrow">Café Operations & Barista Desk</span>
            <h1>Live Order Queue</h1>
            <p class="queue-subtext">Update orders in real time as they transition through preparation and delivery.</p>
          </div>
        </div>

        <!-- Alert Notification -->
        <div *ngIf="message" class="queue-alert" role="status">
          <ion-icon name="checkmark-circle-outline"></ion-icon>
          <span>{{ message }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="queue-loading">
          <div class="loading-spinner"></div>
          <p>Syncing kitchen order queue…</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !orders.length" class="brew-empty-state">
          <div class="empty-icon-wrap">
            <ion-icon name="receipt-outline"></ion-icon>
          </div>
          <h3>No Orders in Queue</h3>
          <p>All orders have been prepared or fulfilled. Relax, or prepare fresh beans!</p>
        </div>

        <!-- Orders List -->
        <div *ngIf="!loading && orders.length" class="orders-queue-grid">
          <article *ngFor="let order of orders" class="queue-order-card" [class.closed-order]="isClosed(order)">
            
            <div class="order-top-bar">
              <div class="order-ref-block">
                <span class="ref-label">Order Ref</span>
                <span class="ref-code">#{{ order.id.slice(0, 8).toUpperCase() }}</span>
              </div>
              <span class="status-pill status-{{ order.status.toLowerCase().replace(' ', '-') }}">
                {{ order.status }}
              </span>
            </div>

            <div class="customer-info-strip">
              <div class="info-line">
                <ion-icon name="person-outline"></ion-icon>
                <strong>{{ order.customer_name }}</strong>
                <span class="phone-tag">{{ order.phone }}</span>
              </div>
              <div class="info-line" *ngIf="order.address">
                <ion-icon name="location-outline"></ion-icon>
                <span>{{ order.address }}</span>
              </div>
            </div>

            <!-- Items List -->
            <div class="order-items-table">
              <div *ngFor="let line of order.order_items" class="order-line-row">
                <span class="item-name">{{ line.product_name }}</span>
                <span class="item-qty">× {{ line.quantity }}</span>
                <span class="item-price">₱{{ line.unit_price * line.quantity }}</span>
              </div>
            </div>

            <!-- Meta & Total -->
            <div class="order-meta-footer">
              <div class="meta-time-pay">
                <span class="meta-time"><ion-icon name="time-outline"></ion-icon> {{ order.created_at | date:'shortTime' }}</span>
                <span class="meta-pay">{{ order.payment_method }}</span>
              </div>
              <div class="meta-total">
                <span class="total-label">Total</span>
                <span class="total-amount">₱{{ order.total }}</span>
              </div>
            </div>

            <!-- Status Transition Controls -->
            <div class="status-action-row" *ngIf="!isClosed(order)">
              <div class="select-wrapper">
                <label>Next Status:</label>
                <ion-select
                  [(ngModel)]="draft[order.id]"
                  [disabled]="pending === order.id"
                  interface="popover"
                  class="status-select"
                >
                  <ion-select-option *ngFor="let status of nextStatuses(order)" [value]="status">
                    {{ status }}
                  </ion-select-option>
                </ion-select>
              </div>

              <button
                type="button"
                class="brew-btn brew-btn-primary save-status-btn"
                [disabled]="pending === order.id || !draft[order.id] || draft[order.id] === order.status"
                (click)="save(order)"
              >
                {{ pending === order.id ? 'Updating…' : 'Update Status' }}
              </button>
            </div>

          </article>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .queue-header {
      margin: 1.5rem 0 2rem;

      .eyebrow {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--brew-caramel, #c4783c);
        margin-bottom: 0.35rem;
      }

      h1 {
        font-family: var(--brew-font-serif, 'Fraunces', serif);
        font-size: clamp(1.85rem, 3.5vw, 2.5rem);
        font-weight: 800;
        color: var(--brew-espresso, #2c1e16);
        margin: 0 0 0.5rem;
      }

      .queue-subtext {
        font-size: 0.95rem;
        color: var(--brew-muted, #7c685b);
        margin: 0;
      }
    }

    .refresh-queue-btn {
      background: var(--brew-sand, #f0e6dc);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--brew-espresso, #2c1e16);
      font-size: 1.25rem;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--brew-caramel, #c4783c);
        color: #ffffff;
      }

      .spinning {
        animation: spin 0.8s linear infinite;
      }
    }

    .queue-alert {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #edf7ed;
      color: #1e4620;
      border: 1px solid #c8e6c9;
      border-radius: var(--brew-radius-md, 12px);
      padding: 0.85rem 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1.5rem;

      ion-icon {
        font-size: 1.35rem;
        color: var(--brew-forest, #2a4b32);
      }
    }

    .queue-loading {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--brew-muted, #7c685b);

      .loading-spinner {
        width: 36px;
        height: 36px;
        border: 3px solid var(--brew-border, #ede3da);
        border-top-color: var(--brew-espresso, #2c1e16);
        border-radius: 50%;
        margin: 0 auto 0.75rem;
        animation: spin 0.8s linear infinite;
      }
    }

    .orders-queue-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      margin-bottom: 3rem;

      @media (min-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (min-width: 1200px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .queue-order-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-xl, 20px);
      padding: 1.35rem;
      box-shadow: var(--brew-shadow-sm, 0 2px 8px rgba(44, 30, 22, 0.05));
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        box-shadow: var(--brew-shadow-md, 0 6px 18px rgba(44, 30, 22, 0.08));
      }

      &.closed-order {
        opacity: 0.65;
        background: var(--brew-surface-sunken, #f8f4ee);
      }

      .order-top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--brew-border-subtle, #f5efe9);

        .order-ref-block {
          display: flex;
          flex-direction: column;

          .ref-label {
            font-size: 0.68rem;
            text-transform: uppercase;
            font-weight: 700;
            color: var(--brew-muted, #7c685b);
            letter-spacing: 0.08em;
          }

          .ref-code {
            font-family: var(--brew-font-serif, 'Fraunces', serif);
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--brew-espresso, #2c1e16);
          }
        }
      }

      .status-pill {
        display: inline-block;
        padding: 0.3rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        background: var(--brew-sand, #f0e6dc);
        color: var(--brew-espresso, #2c1e16);

        &.status-pending { background: #fef3c7; color: #92400e; }
        &.status-confirmed { background: #dbeafe; color: #1e40af; }
        &.status-preparing { background: #e0e7ff; color: #3730a3; }
        &.status-ready { background: #d1fae5; color: #065f46; }
        &.status-out-for-delivery { background: #fef9c3; color: #854d0e; }
        &.status-completed { background: #dcfce7; color: #15803d; }
        &.status-cancelled { background: #fee2e2; color: #991b1b; }
      }

      .customer-info-strip {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.875rem;

        .info-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--brew-espresso, #2c1e16);

          ion-icon {
            font-size: 1.1rem;
            color: var(--brew-caramel, #c4783c);
            flex-shrink: 0;
          }

          .phone-tag {
            color: var(--brew-muted, #7c685b);
            font-size: 0.8rem;
          }
        }
      }

      .order-items-table {
        background: var(--brew-surface-sunken, #f8f4ee);
        border: 1px solid var(--brew-border-subtle, #f5efe9);
        border-radius: var(--brew-radius-md, 12px);
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;

        .order-line-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;

          .item-name {
            font-weight: 600;
            color: var(--brew-espresso, #2c1e16);
            flex: 1;
          }

          .item-qty {
            color: var(--brew-muted, #7c685b);
            margin: 0 0.5rem;
          }

          .item-price {
            font-weight: 700;
            color: var(--brew-espresso, #2c1e16);
          }
        }
      }

      .order-meta-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.8rem;
        color: var(--brew-muted, #7c685b);
        padding-top: 0.5rem;

        .meta-time-pay {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;

          .meta-time {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .meta-pay {
            font-weight: 600;
            color: var(--brew-espresso, #2c1e16);
          }
        }

        .meta-total {
          text-align: right;

          .total-label {
            display: block;
            font-size: 0.68rem;
            text-transform: uppercase;
          }

          .total-amount {
            font-family: var(--brew-font-serif, 'Fraunces', serif);
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--brew-forest, #2a4b32);
          }
        }
      }

      .status-action-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--brew-border-subtle, #f5efe9);

        .select-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;

          label {
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--brew-muted, #7c685b);
            text-transform: uppercase;
          }

          .status-select {
            --background: var(--brew-surface-sunken, #f8f4ee);
            --border-radius: var(--brew-radius-md, 10px);
            --padding-start: 0.6rem;
            --padding-end: 0.6rem;
            --padding-top: 0.4rem;
            --padding-bottom: 0.4rem;
            border: 1px solid var(--brew-border, #ede3da);
            font-size: 0.85rem;
            font-weight: 600;
            min-height: 38px;
          }
        }

        .save-status-btn {
          height: 38px;
          margin-top: 1rem;
          font-size: 0.85rem;
          padding: 0 1rem;
        }
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class StaffOrdersPage implements OnInit {
  orders: OrderRecord[] = [];
  draft: Record<string, string> = {};
  loading = true;
  pending = '';
  message = '';

  constructor(
    private readonly db: DatabaseService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      receiptOutline,
      personOutline,
      locationOutline,
      timeOutline,
      syncOutline,
      checkmarkCircleOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.orders = await this.db.getStaffOrders();
      this.orders.forEach((o) => (this.draft[o.id] = o.status));
    } catch (e) {
      this.message =
        e instanceof Error
          ? e.message
          : 'Could not load order queue. Apply the Supabase schema updates.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  isClosed(o: OrderRecord): boolean {
    return isOrderClosed(o.status);
  }

  nextStatuses(o: OrderRecord): string[] {
    return getNextOrderStatuses(o.status);
  }

  async save(o: OrderRecord): Promise<void> {
    const status = this.draft[o.id];
    if (!status || status === o.status) return;
    this.pending = o.id;
    this.message = '';
    try {
      await this.db.updateOrderStatus(o.id, status);
      o.status = status;
      this.message = `Order #${o.id.slice(0, 8).toUpperCase()} updated to ${status}.`;
    } catch (e) {
      this.message = e instanceof Error ? e.message : 'Could not update order status.';
      this.draft[o.id] = o.status;
    } finally {
      this.pending = '';
    }
  }
}
