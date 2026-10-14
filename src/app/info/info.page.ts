import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  cafeOutline,
  bookOutline,
  schoolOutline,
  arrowForwardOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-info',
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
          <span class="header-brand-name">{{ title }}</span>
        </div>

        <ion-buttons slot="end">
          <ion-button routerLink="/menu" class="explore-menu-link">
            <span>Browse Menu</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell">
      <div class="brew-container">

        <!-- App Information View -->
        <main class="info-shell" *ngIf="page === 'app'; else productAbout">
          <div class="info-hero">
            <span class="eyebrow">Academic Capstone Project</span>
            <h1>About the Brewluxe Application</h1>
            <p class="hero-subtext">
              Crafted by 3rd-year Information Technology students at the Technological Institute of the Philippines (TIP) Quezon City.
            </p>
          </div>

          <div class="info-card-panel">
            <div class="story-badge">
              <ion-icon name="school-outline"></ion-icon>
              <span>Course Project Background</span>
            </div>
            <h2>Purpose & Concept</h2>
            <p>
              Brewluxe is designed as an end-to-end food and beverage digital ordering system. It demonstrates real-world application architecture using Angular standalone components, Ionic cross-platform UI, Supabase cloud database management, and client-side reactive state management.
            </p>

            <div class="workflow-steps-box">
              <h3>How Ordering Works</h3>
              <ol class="workflow-list">
                <li>
                  <strong>Browse & Customise:</strong> Explore the full menu of handcrafted espresso drinks, tea, and bakery items. Adjust cup size, sweetness %, ice level, and gourmet add-ons in real time.
                </li>
                <li>
                  <strong>Review Cart:</strong> Inspect line items, customized recipe breakdown, real-time totals, and item steppers.
                </li>
                <li>
                  <strong>Checkout & Delivery:</strong> Enter delivery recipient details with Nominatim address lookup, select payment methods (GCash, Maya/QR Ph, Cash on Delivery), and receive your order tracking code.
                </li>
              </ol>
            </div>

            <div class="demo-notice-box">
              <ion-icon name="sparkles-outline"></ion-icon>
              <p>
                <strong>Academic Demo:</strong> Payment options simulate realistic customer flow for capstone presentation purposes. No monetary transactions are processed.
              </p>
            </div>

            <div class="actions-row">
              <a routerLink="/menu" class="brew-btn brew-btn-primary">
                <span>Browse Our Menu</span>
                <ion-icon name="arrowForwardOutline"></ion-icon>
              </a>
              <a routerLink="/about-us" class="brew-btn brew-btn-secondary">
                <span>Meet the Team</span>
              </a>
            </div>
          </div>
        </main>

        <!-- Product Guide View -->
        <ng-template #productAbout>
          <main class="info-shell">
            <div class="info-hero">
              <span class="eyebrow">Artisanal Menu Guide</span>
              <h1>Craftsmanship in Every Cup</h1>
              <p class="hero-subtext">
                Every beverage is brewed from responsibly sourced Philippine highlands beans and premium ingredients.
              </p>
            </div>

            <div class="category-cards-grid">
              <div *ngFor="let group of categories" class="category-info-card">
                <div class="cat-card-header">
                  <ion-icon name="cafe-outline"></ion-icon>
                  <h2>{{ group }}</h2>
                </div>

                <ul class="products-sublist">
                  <li *ngFor="let product of productsIn(group)">
                    <span class="product-name">{{ product.name }}</span>
                    <span class="product-desc">{{ product.description }}</span>
                  </li>
                  <li *ngIf="!productsIn(group).length" class="empty-cat-note">
                    Items currently being freshly roasted.
                  </li>
                </ul>
              </div>
            </div>

            <div class="guide-footer-cta">
              <a routerLink="/menu" class="brew-btn brew-btn-primary">
                <span>Order from Menu</span>
              </a>
            </div>
          </main>
        </ng-template>

      </div>
    </ion-content>
  `,
  styles: [`
    .info-shell {
      max-width: 820px;
      margin: 1.5rem auto 3.5rem;
      padding: 0 1rem;
    }

    .info-hero {
      text-align: center;
      margin-bottom: 2.25rem;

      .eyebrow {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: var(--brew-caramel, #c4783c);
        margin-bottom: 0.5rem;
      }

      h1 {
        font-family: var(--brew-font-serif, 'Fraunces', serif);
        font-size: clamp(2rem, 4vw, 2.75rem);
        font-weight: 800;
        color: var(--brew-espresso, #2c1e16);
        line-height: 1.15;
        margin: 0 0 0.85rem;
      }

      .hero-subtext {
        font-size: 1rem;
        color: var(--brew-muted, #7c685b);
        line-height: 1.6;
        margin: 0;
      }
    }

    .info-card-panel {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-xl, 24px);
      padding: 2.25rem 2rem;
      box-shadow: var(--brew-shadow-md, 0 8px 24px rgba(44, 30, 22, 0.08));

      @media (max-width: 600px) {
        padding: 1.5rem 1.25rem;
      }

      .story-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: var(--brew-sand, #f0e6dc);
        color: var(--brew-espresso, #2c1e16);
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        font-size: 0.8rem;
        font-weight: 700;
        margin-bottom: 1.25rem;
      }

      h2 {
        font-family: var(--brew-font-serif, 'Fraunces', serif);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--brew-espresso, #2c1e16);
        margin: 0 0 0.85rem;
      }

      p {
        font-size: 0.95rem;
        color: var(--brew-muted, #7c685b);
        line-height: 1.7;
        margin: 0 0 1.5rem;
      }
    }

    .workflow-steps-box {
      background: var(--brew-surface-sunken, #f8f4ee);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-lg, 16px);
      padding: 1.5rem;
      margin-bottom: 1.5rem;

      h3 {
        font-family: var(--brew-font-serif, 'Fraunces', serif);
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--brew-espresso, #2c1e16);
        margin: 0 0 1rem;
      }

      .workflow-list {
        margin: 0;
        padding-left: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;

        li {
          font-size: 0.9rem;
          color: var(--brew-muted, #7c685b);
          line-height: 1.6;

          strong {
            color: var(--brew-espresso, #2c1e16);
          }
        }
      }
    }

    .demo-notice-box {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: var(--brew-radius-md, 12px);
      padding: 1rem 1.15rem;
      margin-bottom: 2rem;

      ion-icon {
        font-size: 1.35rem;
        color: #2563eb;
        flex-shrink: 0;
        margin-top: 0.1rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #1e3a8a;
        line-height: 1.55;

        strong {
          color: #1d4ed8;
        }
      }
    }

    .actions-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;

      a {
        text-decoration: none;
      }
    }

    // Category Cards Grid for Products Guide
    .category-cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      margin-bottom: 2.5rem;

      @media (min-width: 640px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .category-info-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-xl, 20px);
      padding: 1.5rem;
      box-shadow: var(--brew-shadow-sm, 0 2px 8px rgba(44, 30, 22, 0.04));

      .cat-card-header {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--brew-border, #ede3da);
        margin-bottom: 1rem;

        ion-icon {
          font-size: 1.35rem;
          color: var(--brew-forest, #2a4b32);
        }

        h2 {
          font-family: var(--brew-font-serif, 'Fraunces', serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--brew-espresso, #2c1e16);
          margin: 0;
        }
      }

      .products-sublist {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;

        li {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;

          .product-name {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--brew-espresso, #2c1e16);
          }

          .product-desc {
            font-size: 0.825rem;
            color: var(--brew-muted, #7c685b);
            line-height: 1.45;
          }

          &.empty-cat-note {
            font-size: 0.85rem;
            color: var(--brew-muted, #7c685b);
            font-style: italic;
          }
        }
      }
    }

    .guide-footer-cta {
      text-align: center;

      a {
        text-decoration: none;
        padding: 0.85rem 2.5rem;
      }
    }
  `],
})
export class InfoPage implements OnInit {
  page = 'app';
  products: Product[] = [];
  readonly categories = ['Coffee', 'Iced Coffee', 'Frappes', 'Pastries', 'Shakes', 'Non-Coffee'];

  get title(): string {
    return this.page === 'app' ? 'About Brewluxe' : 'About Our Products';
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly catalog: ProductService,
  ) {
    addIcons({
      cafeOutline,
      bookOutline,
      schoolOutline,
      arrowForwardOutline,
      sparklesOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.page = this.route.snapshot.data['page'] ?? 'app';
    try {
      this.products = await this.catalog.loadProducts();
    } catch {
      this.products = [];
    }
  }

  productsIn(category: string): Product[] {
    return this.products.filter((product) => product.category === category);
  }
}
