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
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  searchOutline,
  syncOutline,
  receiptOutline,
  alertCircleOutline,
  cubeOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { AuthService } from '../auth/auth.service';
import { Product, productImageUrl } from '../models/product.model';
import { ProductService, PRODUCT_CATEGORIES } from '../services/product.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonToggle,
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
          <span class="header-brand-name">Inventory & Stock</span>
        </div>

        <ion-buttons slot="end">
          <ion-button routerLink="/staff/orders" class="queue-nav-btn">
            <ion-icon name="receipt-outline" slot="start"></ion-icon>
            <span>Kitchen Queue</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell">
      <div class="brew-container">

        <!-- Page Header -->
        <div class="inventory-hero">
          <div class="hero-left">
            <span class="eyebrow">Café Operations & Kitchen Desk</span>
            <h1>Product Availability</h1>
            <p class="hero-subtext">
              Toggle menu items between <strong>In Stock</strong> and <strong>Sold Out</strong>. Changes reflect immediately across all customer ordering menus.
            </p>
          </div>

          <!-- Quick Stats Cards -->
          <div class="stats-pills">
            <div class="stat-pill">
              <span class="stat-num">{{ products.length }}</span>
              <span class="stat-label">Total Items</span>
            </div>
            <div class="stat-pill in-stock">
              <span class="stat-num">{{ inStockCount }}</span>
              <span class="stat-label">In Stock</span>
            </div>
            <div class="stat-pill sold-out">
              <span class="stat-num">{{ soldOutCount }}</span>
              <span class="stat-label">Sold Out</span>
            </div>
          </div>
        </div>

        <!-- Alert Notification -->
        <div *ngIf="message" class="inventory-alert" [class.alert-error]="failed" role="status">
          <ion-icon [name]="failed ? 'alert-circle-outline' : 'checkmark-circle-outline'"></ion-icon>
          <span>{{ message }}</span>
        </div>

        <!-- Filters & Search Bar -->
        <div class="controls-bar">
          <div class="search-wrap">
            <ion-icon name="search-outline" class="search-icon"></ion-icon>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search drinks or pastries..."
              class="brew-input search-input"
            />
            <button
              *ngIf="searchQuery"
              (click)="searchQuery = ''"
              class="clear-btn"
              type="button"
              aria-label="Clear search"
            >
              ×
            </button>
          </div>

          <div class="stock-toggle-filter">
            <button
              type="button"
              class="filter-pill"
              [class.active]="stockFilter === 'all'"
              (click)="stockFilter = 'all'"
            >
              All Items
            </button>
            <button
              type="button"
              class="filter-pill"
              [class.active]="stockFilter === 'sold-out'"
              (click)="stockFilter = 'sold-out'"
            >
              Sold Out Only ({{ soldOutCount }})
            </button>
          </div>
        </div>

        <!-- Category Filter Chips -->
        <div class="category-chips-scroller">
          <button
            type="button"
            class="cat-chip"
            [class.active]="selectedCategory === 'All'"
            (click)="selectedCategory = 'All'"
          >
            All Categories
          </button>
          <button
            *ngFor="let cat of categories"
            type="button"
            class="cat-chip"
            [class.active]="selectedCategory === cat"
            (click)="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="inventory-loading">
          <div class="loading-spinner"></div>
          <p>Syncing product inventory…</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !filteredProducts.length" class="brew-empty-state">
          <div class="empty-icon-wrap">
            <ion-icon name="cube-outline"></ion-icon>
          </div>
          <h3>No Items Match Your Filter</h3>
          <p>Try resetting the search keyword or selecting "All Categories".</p>
          <button type="button" class="brew-btn brew-btn-secondary" (click)="resetFilters()">
            Reset Filters
          </button>
        </div>

        <!-- Product Cards Grid -->
        <div *ngIf="!loading && filteredProducts.length" class="products-grid">
          <article
            *ngFor="let product of filteredProducts"
            class="product-item-card"
            [class.is-sold-out]="!product.available"
          >
            <div class="product-thumb-wrap">
              <img
                [src]="getImage(product.image)"
                [alt]="product.name"
                class="product-thumb"
                (error)="handleImageError($event)"
              />
              <span class="category-tag">{{ product.category }}</span>
            </div>

            <div class="product-info-col">
              <div class="title-row">
                <h3 class="product-name">{{ product.name }}</h3>
                <span class="product-price">₱{{ product.price.toFixed(2) }}</span>
              </div>
              <p class="product-desc">{{ product.description }}</p>

              <div class="availability-row">
                <div class="status-indicator">
                  <span
                    class="status-pill"
                    [class.status-available]="product.available"
                    [class.status-unavailable]="!product.available"
                  >
                    <ion-icon
                      [name]="product.available ? 'checkmark-circle-outline' : 'close-circle-outline'"
                    ></ion-icon>
                    <span>{{ product.available ? 'In Stock' : 'Sold Out' }}</span>
                  </span>
                </div>

                <div class="toggle-wrap">
                  <span class="toggle-label">{{ product.available ? 'Available' : 'Unavailable' }}</span>
                  <ion-toggle
                    [checked]="product.available"
                    [disabled]="pendingId === product.id"
                    (ionChange)="changeAvailability(product, $event.detail.checked)"
                    aria-label="Toggle product availability"
                    class="brew-toggle"
                  ></ion-toggle>
                </div>
              </div>
            </div>
          </article>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .inventory-hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;

      .hero-left {
        flex: 1;
        min-width: 280px;

        .eyebrow {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--brew-caramel, #c4783c);
          margin-bottom: 0.35rem;
        }

        h1 {
          font-family: var(--brew-font-serif, 'Fraunces', serif);
          font-size: clamp(1.6rem, 3.5vw, 2.25rem);
          font-weight: 800;
          color: var(--brew-espresso, #2c1e16);
          margin: 0 0 0.5rem;
          line-height: 1.15;
        }

        .hero-subtext {
          color: var(--brew-muted, #7c685b);
          font-size: 0.95rem;
          max-width: 580px;
          margin: 0;
          line-height: 1.5;

          strong {
            color: var(--brew-espresso, #2c1e16);
          }
        }
      }

      .stats-pills {
        display: flex;
        gap: 0.75rem;
        align-items: center;

        .stat-pill {
          background: var(--brew-surface, #ffffff);
          border: 1px solid var(--brew-border, #ede3da);
          border-radius: var(--brew-radius-lg, 16px);
          padding: 0.85rem 1.25rem;
          text-align: center;
          min-width: 90px;
          box-shadow: 0 2px 8px rgba(44, 30, 22, 0.04);

          .stat-num {
            display: block;
            font-family: var(--brew-font-serif, 'Fraunces', serif);
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--brew-espresso, #2c1e16);
            line-height: 1.1;
          }

          .stat-label {
            font-size: 0.72rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--brew-muted, #7c685b);
          }

          &.in-stock .stat-num {
            color: #1e4620;
          }

          &.sold-out .stat-num {
            color: #991b1b;
          }
        }
      }
    }

    .inventory-alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.25rem;
      border-radius: var(--brew-radius-md, 12px);
      background: #edf7ed;
      color: #1e4620;
      border: 1px solid #c8e6c9;
      font-weight: 600;
      font-size: 0.92rem;
      margin-bottom: 1.5rem;

      ion-icon {
        font-size: 1.35rem;
        flex-shrink: 0;
      }

      &.alert-error {
        background: #fdf2f2;
        color: #991b1b;
        border-color: #fecaca;
      }
    }

    .controls-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;

      .search-wrap {
        position: relative;
        flex: 1;
        min-width: 260px;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--brew-muted, #7c685b);
          font-size: 1.2rem;
          pointer-events: none;
        }

        .search-input {
          padding-left: 2.75rem;
          padding-right: 2.25rem;
          width: 100%;
          height: 46px;
          border-radius: var(--brew-radius-full, 9999px);
          background: var(--brew-surface, #ffffff);
        }

        .clear-btn {
          position: absolute;
          right: 0.85rem;
          background: none;
          border: none;
          font-size: 1.4rem;
          color: var(--brew-muted, #7c685b);
          cursor: pointer;
          line-height: 1;
        }
      }

      .stock-toggle-filter {
        display: flex;
        gap: 0.5rem;

        .filter-pill {
          background: var(--brew-surface, #ffffff);
          border: 1px solid var(--brew-border, #ede3da);
          border-radius: var(--brew-radius-full, 9999px);
          padding: 0.55rem 1rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--brew-muted, #7c685b);
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: var(--brew-caramel, #c4783c);
            color: var(--brew-espresso, #2c1e16);
          }

          &.active {
            background: var(--brew-espresso, #2c1e16);
            color: #ffffff;
            border-color: var(--brew-espresso, #2c1e16);
          }
        }
      }
    }

    .category-chips-scroller {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      margin-bottom: 1.75rem;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      .cat-chip {
        white-space: nowrap;
        background: var(--brew-surface, #ffffff);
        border: 1px solid var(--brew-border, #ede3da);
        border-radius: var(--brew-radius-full, 9999px);
        padding: 0.45rem 1rem;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--brew-muted, #7c685b);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--brew-caramel, #c4783c);
          color: var(--brew-espresso, #2c1e16);
        }

        &.active {
          background: var(--brew-caramel, #c4783c);
          color: #ffffff;
          border-color: var(--brew-caramel, #c4783c);
        }
      }
    }

    .inventory-loading {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--brew-muted, #7c685b);

      .loading-spinner {
        width: 36px;
        height: 36px;
        border: 3px solid var(--brew-border, #ede3da);
        border-top-color: var(--brew-espresso, #2c1e16);
        border-radius: 50%;
        margin: 0 auto 1rem;
        animation: spin 0.8s linear infinite;
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3rem;
    }

    .product-item-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-lg, 18px);
      padding: 1.25rem;
      display: flex;
      gap: 1.15rem;
      box-shadow: 0 4px 16px rgba(44, 30, 22, 0.05);
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(44, 30, 22, 0.09);
      }

      &.is-sold-out {
        opacity: 0.78;
        background: var(--brew-surface-sunken, #f8f4ee);
        border-color: #ebdcd0;

        .product-thumb {
          filter: grayscale(40%);
        }
      }

      .product-thumb-wrap {
        position: relative;
        width: 88px;
        height: 88px;
        border-radius: var(--brew-radius-md, 14px);
        overflow: hidden;
        flex-shrink: 0;
        background: var(--brew-sand, #f0e6dc);

        .product-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .category-tag {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(44, 30, 22, 0.75);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          text-align: center;
          padding: 2px 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
      }

      .product-info-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .title-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.25rem;

          .product-name {
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--brew-espresso, #2c1e16);
            margin: 0;
            line-height: 1.25;
          }

          .product-price {
            font-weight: 700;
            color: var(--brew-caramel, #c4783c);
            font-size: 0.95rem;
            white-space: nowrap;
          }
        }

        .product-desc {
          font-size: 0.78rem;
          color: var(--brew-muted, #7c685b);
          margin: 0 0 0.85rem;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .availability-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--brew-border, #ede3da);

          .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.25rem 0.65rem;
            border-radius: var(--brew-radius-full, 9999px);
            font-size: 0.75rem;
            font-weight: 700;

            &.status-available {
              background: #edf7ed;
              color: #1e4620;
            }

            &.status-unavailable {
              background: #fdf2f2;
              color: #991b1b;
            }

            ion-icon {
              font-size: 0.9rem;
            }
          }

          .toggle-wrap {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .toggle-label {
              font-size: 0.75rem;
              font-weight: 600;
              color: var(--brew-muted, #7c685b);
            }

            ion-toggle.brew-toggle {
              --background: #d4c7bd;
              --background-checked: var(--brew-caramel, #c4783c);
              --handle-background: #ffffff;
              --handle-background-checked: #ffffff;
            }
          }
        }
      }
    }

    .queue-nav-btn {
      --color: var(--brew-espresso, #2c1e16);
      font-weight: 700;
      font-size: 0.85rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class EmployeeDashboardPage implements OnInit {
  products: Product[] = [];
  loading = true;
  pendingId?: number;
  message = '';
  failed = false;

  searchQuery = '';
  selectedCategory = 'All';
  stockFilter: 'all' | 'sold-out' = 'all';

  readonly categories = PRODUCT_CATEGORIES;

  constructor(
    private readonly productsApi: ProductService,
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      checkmarkCircleOutline,
      closeCircleOutline,
      searchOutline,
      syncOutline,
      receiptOutline,
      alertCircleOutline,
      cubeOutline,
      sparklesOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.products = await this.productsApi.loadManageableProducts();
    } catch {
      this.failed = true;
      this.message = 'Could not load inventory catalog.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  get inStockCount(): number {
    return this.products.filter((p) => p.available).length;
  }

  get soldOutCount(): number {
    return this.products.filter((p) => !p.available).length;
  }

  get filteredProducts(): Product[] {
    let list = this.products;

    if (this.selectedCategory !== 'All') {
      list = list.filter((p) => p.category === this.selectedCategory);
    }

    if (this.stockFilter === 'sold-out') {
      list = list.filter((p) => !p.available);
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }

    return list;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.stockFilter = 'all';
  }

  getImage(img: string): string {
    return productImageUrl(img);
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/shapes.svg';
  }

  async changeAvailability(product: Product, available: boolean): Promise<void> {
    // Instant optimistic update
    const previous = product.available;
    product.available = available;
    this.pendingId = product.id;
    this.message = '';
    this.cdr.detectChanges();

    try {
      await this.productsApi.setProductAvailability(product.id, available);
      this.failed = false;
      this.message = `${product.name} is now marked as ${available ? 'In Stock' : 'Sold Out'}.`;
    } catch {
      product.available = previous;
      this.failed = true;
      this.message = 'Could not update availability. Please try again.';
    } finally {
      this.pendingId = undefined;
      this.cdr.detectChanges();
    }
  }

  logout(): void {
    void this.auth.logout().finally(() => window.location.assign('/login'));
  }
}
