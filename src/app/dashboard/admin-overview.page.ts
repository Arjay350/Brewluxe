import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cashOutline,
  receiptOutline,
  alertCircleOutline,
  trendingUpOutline,
  timeOutline,
} from 'ionicons/icons';
import { DatabaseService, OrderRecord } from '../services/database.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenuButton,
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
          <span class="header-brand-name">Store Overview</span>
        </div>

        <ion-buttons slot="end">
          <ion-button routerLink="/admin/products" class="explore-menu-link">
            <span>Manage Products</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell">
      <div class="brew-container">

        <div class="overview-header">
          <span class="eyebrow">Café Operations & Metrics</span>
          <h1>Store Performance Overview</h1>
          <p class="overview-subtext">Summary of today’s orders, revenue, and queue activity.</p>
        </div>

        <div *ngIf="message" class="overview-alert" role="status">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span>{{ message }}</span>
        </div>

        <div *ngIf="loading" class="overview-loading">
          <div class="loading-spinner"></div>
          <p>Compiling store analytics…</p>
        </div>

        <div *ngIf="!loading">
          <!-- KPI Stats Grid -->
          <div class="stats-grid">
            <div class="kpi-card">
              <div class="kpi-icon-wrap">
                <ion-icon name="receipt-outline"></ion-icon>
              </div>
              <div class="kpi-content">
                <span class="kpi-label">Orders Today</span>
                <span class="kpi-value">{{ today.length }}</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon-wrap sales-icon">
                <ion-icon name="cash-outline"></ion-icon>
              </div>
              <div class="kpi-content">
                <span class="kpi-label">Completed Sales Today</span>
                <span class="kpi-value">₱{{ sales | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon-wrap attention-icon">
                <ion-icon name="alert-circle-outline"></ion-icon>
              </div>
              <div class="kpi-content">
                <span class="kpi-label">Needs Attention</span>
                <span class="kpi-value">{{ openCount }}</span>
              </div>
            </div>
          </div>

          <!-- Recent Orders Section -->
          <div class="recent-orders-card">
            <div class="card-header">
              <h2>Recent Store Orders</h2>
              <span class="order-count-badge">{{ recent.length }} most recent</span>
            </div>

            <div *ngIf="!recent.length" class="empty-orders-note">
              No orders placed today yet.
            </div>

            <div *ngIf="recent.length" class="orders-table">
              <div class="order-row" *ngFor="let order of recent">
                <div class="order-customer-info">
                  <strong>{{ order.customer_name }}</strong>
                  <span class="order-id">#{{ order.id.slice(0, 8).toUpperCase() }}</span>
                </div>
                <div class="order-badges">
                  <span class="status-pill status-{{ order.status.toLowerCase().replace(' ', '-') }}">
                    {{ order.status }}
                  </span>
                  <span class="order-amount">₱{{ order.total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .overview-header {
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

      .overview-subtext {
        font-size: 0.95rem;
        color: var(--brew-muted, #7c685b);
        margin: 0;
      }
    }

    .overview-alert {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: #fdf2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
      border-radius: var(--brew-radius-md, 12px);
      padding: 0.85rem 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1.5rem;

      ion-icon {
        font-size: 1.35rem;
      }
    }

    .overview-loading {
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

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      margin-bottom: 2rem;

      @media (min-width: 640px) {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .kpi-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-xl, 20px);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      box-shadow: var(--brew-shadow-sm, 0 2px 8px rgba(44, 30, 22, 0.05));

      .kpi-icon-wrap {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: var(--brew-sand, #f0e6dc);
        color: var(--brew-espresso, #2c1e16);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        flex-shrink: 0;

        &.sales-icon {
          background: #e8f5e9;
          color: #1b5e20;
        }

        &.attention-icon {
          background: #fef3c7;
          color: #92400e;
        }
      }

      .kpi-content {
        display: flex;
        flex-direction: column;

        .kpi-label {
          font-size: 0.8rem;
          color: var(--brew-muted, #7c685b);
          font-weight: 600;
        }

        .kpi-value {
          font-family: var(--brew-font-serif, 'Fraunces', serif);
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--brew-espresso, #2c1e16);
          line-height: 1.2;
          margin-top: 0.2rem;
        }
      }
    }

    .recent-orders-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-xl, 20px);
      padding: 1.75rem;
      box-shadow: var(--brew-shadow-sm, 0 2px 8px rgba(44, 30, 22, 0.05));
      margin-bottom: 3rem;

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--brew-border, #ede3da);
        margin-bottom: 1rem;

        h2 {
          font-family: var(--brew-font-serif, 'Fraunces', serif);
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--brew-espresso, #2c1e16);
          margin: 0;
        }

        .order-count-badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--brew-muted, #7c685b);
          background: var(--brew-sand, #f0e6dc);
          padding: 0.25rem 0.65rem;
          border-radius: 9999px;
        }
      }

      .empty-orders-note {
        text-align: center;
        padding: 2rem;
        color: var(--brew-muted, #7c685b);
        font-size: 0.95rem;
      }

      .orders-table {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;

        .order-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem;
          background: var(--brew-surface-sunken, #f8f4ee);
          border-radius: var(--brew-radius-md, 12px);

          .order-customer-info {
            display: flex;
            flex-direction: column;

            strong {
              font-size: 0.95rem;
              color: var(--brew-espresso, #2c1e16);
            }

            .order-id {
              font-size: 0.75rem;
              color: var(--brew-muted, #7c685b);
            }
          }

          .order-badges {
            display: flex;
            align-items: center;
            gap: 1rem;

            .order-amount {
              font-family: var(--brew-font-serif, 'Fraunces', serif);
              font-size: 1.1rem;
              font-weight: 800;
              color: var(--brew-espresso, #2c1e16);
            }
          }
        }
      }
    }

    .status-pill {
      display: inline-block;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
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

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class AdminOverviewPage implements OnInit {
  orders: OrderRecord[] = [];
  loading = true;
  message = '';

  constructor(
    private readonly db: DatabaseService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      cashOutline,
      receiptOutline,
      alertCircleOutline,
      trendingUpOutline,
      timeOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.orders = await this.db.getAdminOrders();
    } catch (e) {
      this.message =
        e instanceof Error
          ? e.message
          : 'Could not load store activity. Apply the Supabase schema updates.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private isToday(value: string): boolean {
    return new Date(value).toDateString() === new Date().toDateString();
  }

  get today(): OrderRecord[] {
    return this.orders.filter(
      (o) => this.isToday(o.created_at) && o.status !== 'Cancelled',
    );
  }

  get sales(): number {
    return this.today
      .filter((o) => o.status === 'Completed')
      .reduce((s, o) => s + Number(o.total), 0);
  }

  get openCount(): number {
    return this.today.filter(
      (o) => !['Completed', 'Cancelled'].includes(o.status),
    ).length;
  }

  get recent(): OrderRecord[] {
    return this.orders.slice(0, 8);
  }
}
