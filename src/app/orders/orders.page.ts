import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonToolbar,
  IonBadge,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  timeOutline,
  cafeOutline,
  receiptOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  repeatOutline,
  cartOutline,
  arrowForwardOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { CartItem } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { DatabaseService } from '../services/database.service';

interface OrderItemRecord {
  product_id?: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  size?: string;
  addons?: string[];
}

interface OrderRecord {
  id: string;
  created_at: string;
  total: number;
  payment_method: string;
  status: string;
  customer_name: string;
  order_items: OrderItemRecord[];
}

@Component({
  selector: 'app-orders',
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
    IonBadge,
  ],
  template: `
    <ion-header class="ion-no-border brew-header">
      <ion-toolbar class="brew-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button menu="brewluxe-menu" aria-label="Open menu" class="brew-menu-btn"></ion-menu-button>
        </ion-buttons>

        <div class="brew-brand-header" routerLink="/home">
          <img src="assets/images/brewluxe-logo.png" alt="Brewluxe Logo" class="header-logo" />
          <span class="header-brand-name">My Orders</span>
        </div>

        <ion-buttons slot="end">
          <ion-button routerLink="/cart" aria-label="View Cart" class="cart-nav-btn">
            <ion-icon slot="icon-only" name="cart-outline"></ion-icon>
            <ion-badge *ngIf="itemCount > 0" class="nav-cart-badge">{{ itemCount }}</ion-badge>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell">
      <div class="brew-container">

        <div class="orders-page-header">
          <span class="eyebrow">Real-Time Tracking</span>
          <h1>Your Order History</h1>
          <p class="orders-subtext">
            Track your freshly prepared drinks and review past receipts in real time.
          </p>
        </div>

        <!-- Success Banner from PayMongo redirect -->
        <div class="payment-success-banner" *ngIf="paymentSuccess">
          <div class="banner-icon">
            <ion-icon name="checkmark-circle-outline"></ion-icon>
          </div>
          <div class="banner-text">
            <strong>Payment Confirmed via PayMongo!</strong>
            <p>Your order is secured and has been sent to our barista for preparation.</p>
          </div>
        </div>

        <!-- Loading Skeletons -->
        <div class="orders-loading-grid" *ngIf="loading">
          <div class="order-card-skeleton" *ngFor="let n of [1,2]">
            <div class="brew-skeleton sk-head"></div>
            <div class="brew-skeleton sk-tracker"></div>
            <div class="brew-skeleton sk-body"></div>
          </div>
        </div>

        <!-- Error State -->
        <div class="error-banner" *ngIf="error" role="alert">
          <p>{{ error }}</p>
        </div>

        <!-- Empty State -->
        <div class="brew-empty-state" *ngIf="!loading && !error && !orders.length">
          <div class="empty-icon">☕</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders with Brewluxe yet. Browse our menu to treat yourself!</p>
          <ion-button routerLink="/menu" class="brew-btn brew-btn-primary">
            Explore Our Menu
          </ion-button>
        </div>

        <!-- Orders List -->
        <div class="orders-list-wrap" *ngIf="!loading && orders.length">
          <article *ngFor="let order of orders" class="order-receipt-card">

            <!-- Card Header: ID & Status Badge -->
            <div class="order-card-header">
              <div class="order-title-group">
                <span class="order-prefix">Order</span>
                <strong class="order-id">#{{ order.id.slice(0, 8).toUpperCase() }}</strong>
              </div>

              <span
                class="brew-badge order-status-badge"
                [ngClass]="{
                  'badge-pending': order.status === 'Pending',
                  'badge-preparing': order.status === 'Confirmed' || order.status === 'Preparing',
                  'badge-ready': order.status === 'Ready' || order.status === 'Out for delivery',
                  'badge-completed': order.status === 'Completed',
                  'badge-cancelled': order.status === 'Cancelled'
                }"
              >
                {{ order.status }}
              </span>
            </div>

            <!-- 4-Step Visual Progress Tracker (Active Orders) -->
            <div class="order-tracker-box" *ngIf="order.status !== 'Cancelled'">
              <div class="tracker-steps-row">
                <!-- Step 1: Placed -->
                <div class="step-point" [class.is-done]="getStatusStep(order.status) >= 1" [class.is-current]="getStatusStep(order.status) === 1">
                  <div class="step-bubble">1</div>
                  <span class="step-text">Placed</span>
                </div>

                <div class="step-line" [class.is-filled]="getStatusStep(order.status) >= 2"></div>

                <!-- Step 2: Brewing -->
                <div class="step-point" [class.is-done]="getStatusStep(order.status) >= 2" [class.is-current]="getStatusStep(order.status) === 2">
                  <div class="step-bubble">2</div>
                  <span class="step-text">Brewing</span>
                </div>

                <div class="step-line" [class.is-filled]="getStatusStep(order.status) >= 3"></div>

                <!-- Step 3: Ready / On The Way -->
                <div class="step-point" [class.is-done]="getStatusStep(order.status) >= 3" [class.is-current]="getStatusStep(order.status) === 3">
                  <div class="step-bubble">3</div>
                  <span class="step-text">{{ order.status === 'Out for delivery' ? 'On The Way' : 'Ready' }}</span>
                </div>

                <div class="step-line" [class.is-filled]="getStatusStep(order.status) >= 4"></div>

                <!-- Step 4: Completed -->
                <div class="step-point" [class.is-done]="getStatusStep(order.status) >= 4" [class.is-current]="getStatusStep(order.status) === 4">
                  <div class="step-bubble">4</div>
                  <span class="step-text">Completed</span>
                </div>
              </div>
            </div>

            <!-- Order Meta: Date & Payment Method -->
            <div class="order-meta-row">
              <div class="meta-item">
                <ion-icon name="time-outline"></ion-icon>
                <span>{{ order.created_at | date:'medium' }}</span>
              </div>
              <div class="meta-item">
                <ion-icon name="receipt-outline"></ion-icon>
                <span>{{ order.payment_method }}</span>
              </div>
            </div>

            <!-- Items List -->
            <div class="order-items-breakdown">
              <div class="order-item-row" *ngFor="let item of order.order_items">
                <div class="item-name-qty">
                  <strong>{{ item.product_name }}</strong>
                  <span class="qty-tag">× {{ item.quantity }}</span>
                  <small class="item-addons-note" *ngIf="item.addons && item.addons.length">
                    ({{ item.addons.join(', ') }})
                  </small>
                </div>
                <span class="item-price">₱{{ item.unit_price * item.quantity }}</span>
              </div>
            </div>

            <!-- Footer: Total & Actions -->
            <div class="order-card-footer">
              <div class="order-total-display">
                <span class="total-label">Total Paid</span>
                <strong class="total-val">₱{{ order.total }}</strong>
              </div>

              <div class="order-action-buttons">
                <button
                  type="button"
                  class="brew-btn brew-btn-primary order-again-btn"
                  (click)="orderAgain(order)"
                >
                  <ion-icon slot="start" name="repeat-outline"></ion-icon>
                  <span>Order Again</span>
                </button>

                <button
                  type="button"
                  class="cancel-order-btn"
                  *ngIf="order.status === 'Pending'"
                  (click)="cancelOrder(order)"
                >
                  Cancel Order
                </button>
              </div>
            </div>

          </article>
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

    .cart-nav-btn {
      --color: var(--brew-espresso);
      position: relative;
      font-size: 1.35rem;

      .nav-cart-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        min-width: 18px;
        height: 18px;
        font-size: 0.68rem;
        font-weight: 800;
        border-radius: 50%;
        --background: var(--brew-sage);
        --color: #FFFFFF;
      }
    }

    /* Page Intro */
    .orders-page-header {
      padding: 24px 0 16px;

      @media (min-width: 768px) {
        padding: 36px 0 20px;
      }

      h1 {
        margin: 4px 0 8px;
      }

      .orders-subtext {
        margin: 0;
        color: var(--ion-color-medium);
        font-size: 0.95rem;
        line-height: 1.6;
        max-width: 58ch;
      }
    }

    /* Success Banner */
    .payment-success-banner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      background: #E8F5E9;
      border: 1px solid #C8E6C9;
      border-radius: var(--brew-radius-lg);
      margin-bottom: 24px;

      .banner-icon {
        font-size: 2rem;
        color: #2E7D32;
        display: grid;
        place-items: center;
      }

      .banner-text {
        strong {
          display: block;
          font-size: 0.95rem;
          color: #1B5E20;
        }

        p {
          margin: 2px 0 0;
          font-size: 0.85rem;
          color: #2E7D32;
        }
      }
    }

    /* Orders List */
    .orders-list-wrap {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 60px;
      max-width: 820px;
    }

    .order-receipt-card {
      background: #FFFFFF;
      border: 1px solid var(--brew-border-subtle);
      border-radius: var(--brew-radius-xl);
      padding: 24px;
      box-shadow: var(--brew-shadow-xs);
      transition: transform var(--brew-duration) var(--brew-ease), box-shadow var(--brew-duration) var(--brew-ease);

      &:hover {
        box-shadow: var(--brew-shadow-sm);
      }
    }

    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--brew-border-subtle);

      .order-title-group {
        display: flex;
        align-items: baseline;
        gap: 6px;

        .order-prefix {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--ion-color-medium);
          font-weight: 700;
        }

        .order-id {
          font-family: var(--brew-font-serif);
          font-size: 1.25rem;
          color: var(--brew-espresso);
        }
      }
    }

    /* Status Badges */
    .order-status-badge {
      font-size: 0.78rem;
      padding: 5px 12px;

      &.badge-pending {
        background: rgba(196, 120, 60, 0.15);
        color: var(--brew-caramel);
      }

      &.badge-preparing {
        background: rgba(42, 75, 50, 0.12);
        color: var(--brew-sage);
      }

      &.badge-ready {
        background: #E8F5E9;
        color: #2E7D32;
      }

      &.badge-completed {
        background: var(--brew-espresso);
        color: #FFFFFF;
      }

      &.badge-cancelled {
        background: #FDE8E8;
        color: var(--ion-color-danger);
      }
    }

    /* Visual 4-Step Progress Tracker */
    .order-tracker-box {
      margin: 18px 0;
      padding: 16px 14px;
      background: var(--brew-alabaster);
      border-radius: var(--brew-radius-lg);
    }

    .tracker-steps-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .step-point {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #9E8B7F;

      .step-bubble {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #E2D6CA;
        color: #6A5649;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 0.8rem;
        transition: all var(--brew-duration) var(--brew-ease);
      }

      &.is-done {
        color: var(--brew-espresso);
        font-weight: 700;

        .step-bubble {
          background: var(--brew-espresso);
          color: #FFFFFF;
        }
      }

      &.is-current .step-bubble {
        box-shadow: 0 0 0 4px rgba(44, 30, 22, 0.18);
        background: var(--brew-sage);
        color: #FFFFFF;
      }
    }

    .step-line {
      flex: 1;
      height: 3px;
      background: #E2D6CA;
      margin: 0 6px 16px;
      border-radius: 2px;
      transition: background var(--brew-duration) var(--brew-ease);

      &.is-filled {
        background: var(--brew-espresso);
      }
    }

    /* Order Meta */
    .order-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 0.84rem;
      color: var(--ion-color-medium);
      margin: 12px 0 14px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;

        ion-icon {
          font-size: 1rem;
          color: var(--brew-sage);
        }
      }
    }

    /* Items Breakdown */
    .order-items-breakdown {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px 0;
      border-top: 1px dashed var(--brew-border-subtle);
      border-bottom: 1px dashed var(--brew-border-subtle);
    }

    .order-item-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      font-size: 0.9rem;

      .item-name-qty {
        strong {
          color: var(--brew-espresso);
        }

        .qty-tag {
          margin-left: 6px;
          color: var(--ion-color-medium);
          font-weight: 600;
        }

        .item-addons-note {
          display: block;
          font-size: 0.78rem;
          color: var(--brew-caramel);
          margin-top: 2px;
        }
      }

      .item-price {
        font-weight: 700;
        color: var(--brew-espresso);
      }
    }

    /* Footer: Total & Actions */
    .order-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 16px;

      .order-total-display {
        .total-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--ion-color-medium);
          font-weight: 700;
        }

        .total-val {
          font-family: var(--brew-font-sans);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--brew-espresso);
        }
      }

      .order-action-buttons {
        display: flex;
        align-items: center;
        gap: 10px;

        .order-again-btn {
          --background: var(--brew-espresso);
          --color: #FFFFFF;
          font-size: 0.88rem;
          font-weight: 700;
          min-height: 40px;
          padding: 0 16px;
          border-radius: var(--brew-radius-md);
        }

        .cancel-order-btn {
          background: transparent;
          border: 1px solid var(--ion-color-danger);
          color: var(--ion-color-danger);
          padding: 8px 14px;
          border-radius: var(--brew-radius-md);
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--brew-duration) var(--brew-ease);

          &:hover {
            background: #FDE8E8;
          }
        }
      }
    }

    /* Skeleton */
    .order-card-skeleton {
      background: #FFFFFF;
      border: 1px solid var(--brew-border-subtle);
      border-radius: var(--brew-radius-xl);
      padding: 24px;
      margin-bottom: 16px;

      .sk-head {
        height: 24px;
        width: 50%;
        margin-bottom: 16px;
      }

      .sk-tracker {
        height: 50px;
        width: 100%;
        margin-bottom: 16px;
      }

      .sk-body {
        height: 40px;
        width: 80%;
      }
    }

    .error-banner {
      padding: 14px 18px;
      border-radius: var(--brew-radius-md);
      background: #FDEDED;
      border: 1px solid #F5C6CB;
      color: var(--ion-color-danger);
      font-weight: 600;
      margin-bottom: 20px;
    }
  `],
})
export class OrdersPage implements OnInit, OnDestroy {
  orders: OrderRecord[] = [];
  loading = true;
  error = '';
  paymentSuccess = false;
  itemCount = 0;

  private unsubscribeRealtime?: () => void;
  private cartSub?: Subscription;

  constructor(
    private readonly database: DatabaseService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cartService: CartService,
    private readonly toastCtrl: ToastController,
  ) {
    addIcons({
      timeOutline,
      cafeOutline,
      receiptOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      repeatOutline,
      cartOutline,
      arrowForwardOutline,
      sparklesOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.itemCount = this.cartService.getItemCount();
    this.cartSub = this.cartService.cart$.subscribe(() => {
      this.itemCount = this.cartService.getItemCount();
    });

    this.paymentSuccess =
      this.route.snapshot.queryParams['payment'] === 'success';
    await this.loadOrders();

    // Real-time listener for order status changes in Supabase
    this.unsubscribeRealtime = this.database.subscribeToOrders(() => {
      this.loadOrders(false);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeRealtime?.();
    this.cartSub?.unsubscribe();
  }

  async loadOrders(showSpinner = true): Promise<void> {
    if (showSpinner) this.loading = true;
    try {
      this.orders =
        ((await this.database.getMyOrders()) as unknown as OrderRecord[]) || [];
    } catch {
      this.error =
        'Could not load orders. Please verify your connection or Supabase status.';
    } finally {
      if (showSpinner) this.loading = false;
    }
  }

  getStatusStep(status: string): number {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Confirmed':
      case 'Preparing':
        return 2;
      case 'Ready':
      case 'Out for delivery':
        return 3;
      case 'Completed':
        return 4;
      default:
        return 0;
    }
  }

  async orderAgain(order: OrderRecord): Promise<void> {
    for (const item of order.order_items) {
      const cartItem: CartItem = {
        product: {
          id: item.product_id ?? Math.floor(Math.random() * 100000),
          name: item.product_name,
          category: 'Coffee',
          price: item.unit_price,
          description: '',
          image: '',
          featured: false,
          available: true,
        },
        quantity: item.quantity,
        size: item.size || 'Regular',
        addons: item.addons || [],
        sugarLevel: '100%',
        iceLevel: 'Regular Ice',
      };
      this.cartService.addCustomItem(cartItem);
    }

    const toast = await this.toastCtrl.create({
      message: `Added items from Order #${order.id.slice(0, 8).toUpperCase()} to your cart!`,
      duration: 2500,
      position: 'bottom',
      color: 'primary',
      icon: 'checkmark-circle-outline',
      buttons: [
        {
          text: 'View Cart',
          handler: () => {
            this.router.navigateByUrl('/cart');
          },
        },
      ],
    });
    await toast.present();
    await this.router.navigateByUrl('/cart');
  }

  async cancelOrder(order: OrderRecord): Promise<void> {
    try {
      await this.database.cancelOrder(order.id);
      order.status = 'Cancelled';
      const toast = await this.toastCtrl.create({
        message: `Order #${order.id.slice(0, 8).toUpperCase()} was cancelled.`,
        duration: 3000,
        position: 'bottom',
        color: 'warning',
      });
      await toast.present();
    } catch (err) {
      const toast = await this.toastCtrl.create({
        message: err instanceof Error ? err.message : 'Could not cancel order.',
        duration: 4000,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present();
    }
  }
}
