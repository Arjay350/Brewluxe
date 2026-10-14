import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  helpCircleOutline,
  searchOutline,
  chatbubbleEllipsesOutline,
  sparklesOutline,
  cafeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
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
          <span class="header-brand-name">FAQ & Help</span>
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

        <div class="faq-hero">
          <span class="eyebrow">Frequently Asked Questions</span>
          <h1>How Can We Help You?</h1>
          <p class="faq-subtext">
            Everything you need to know about ordering your favorite brews, payment options, and café services.
          </p>
        </div>

        <!-- Quick Question Suggestions -->
        <div class="quick-prompts-bar">
          <span class="quick-title">Popular questions:</span>
          <div class="quick-chips">
            <button
              type="button"
              class="quick-chip"
              (click)="pickQuestion('How can I pay?')"
            >
              Payment methods?
            </button>
            <button
              type="button"
              class="quick-chip"
              (click)="pickQuestion('How do I order?')"
            >
              How to order?
            </button>
            <button
              type="button"
              class="quick-chip"
              (click)="pickQuestion('Can I modify my order?')"
            >
              Modify order?
            </button>
            <button
              type="button"
              class="quick-chip"
              (click)="pickQuestion('How to contact café?')"
            >
              Contact café?
            </button>
          </div>
        </div>

        <div class="faq-layout">
          <!-- Accordion Section -->
          <div class="faq-accordion-col">
            <div class="section-badge-row">
              <ion-icon name="help-circle-outline"></ion-icon>
              <span>General Questions</span>
            </div>

            <ion-accordion-group class="brew-accordion-group" expand="inset">
              <ion-accordion *ngFor="let faq of faqs" [value]="faq.q" class="brew-accordion-item">
                <ion-item slot="header" lines="none" class="accordion-header-item">
                  <ion-label class="accordion-question">{{ faq.q }}</ion-label>
                </ion-item>
                <div slot="content" class="accordion-answer">
                  <p>{{ faq.a }}</p>
                </div>
              </ion-accordion>
            </ion-accordion-group>
          </div>

          <!-- Interactive Quick Answers Box -->
          <aside class="faq-assistant-col">
            <div class="assistant-card">
              <div class="assistant-header">
                <div class="assistant-icon">
                  <ion-icon name="chatbubble-ellipses-outline"></ion-icon>
                </div>
                <div>
                  <span class="eyebrow">Instant Helper</span>
                  <h3>Quick Answer Desk</h3>
                </div>
              </div>

              <p class="assistant-intro">
                Type any keyword (e.g. <em>payment, cart, coffee, account</em>) to find instant guidance.
              </p>

              <form (ngSubmit)="ask()" class="assistant-form">
                <div class="brew-field">
                  <div class="search-input-wrapper">
                    <ion-icon name="search-outline" class="input-search-icon"></ion-icon>
                    <input
                      name="question"
                      [(ngModel)]="question"
                      required
                      maxlength="240"
                      placeholder="e.g. How can I pay with GCash?"
                      aria-label="Ask a Brewluxe question"
                      class="brew-input search-input"
                    />
                  </div>
                </div>
                <button type="submit" class="brew-btn brew-btn-primary ask-btn">
                  <span>Ask Assistant</span>
                </button>
              </form>

              <!-- Answer Box -->
              <div class="bot-response" *ngIf="answer" role="status">
                <div class="bot-tag">
                  <ion-icon name="sparkles-outline"></ion-icon>
                  <strong>Brewluxe Response:</strong>
                </div>
                <p>{{ answer }}</p>
              </div>

              <div class="still-need-help">
                <p>Can’t find what you need?</p>
                <a routerLink="/contact" class="brew-btn brew-btn-secondary contact-link-btn">
                  <span>Contact Our Team</span>
                </a>
              </div>

              <p class="disclaimer">
                This FAQ helper matches against preset answers verified for this course project.
              </p>
            </div>
          </aside>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .faq-hero {
      text-align: center;
      max-width: 640px;
      margin: 1.5rem auto 2rem;
      padding: 0 1rem;

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

      .faq-subtext {
        font-size: 1rem;
        color: var(--brew-muted, #7c685b);
        line-height: 1.6;
        margin: 0;
      }
    }

    .quick-prompts-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2.25rem;

      .quick-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--brew-muted, #7c685b);
      }

      .quick-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .quick-chip {
        background: var(--brew-sand, #f0e6dc);
        color: var(--brew-espresso, #2c1e16);
        border: 1px solid var(--brew-border, #ede3da);
        border-radius: 9999px;
        padding: 0.35rem 0.85rem;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--brew-caramel, #c4783c);
          color: #ffffff;
          border-color: var(--brew-caramel, #c4783c);
        }
      }
    }

    .faq-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      margin-bottom: 3rem;

      @media (min-width: 900px) {
        grid-template-columns: 1fr 380px;
        align-items: start;
      }
    }

    .section-badge-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: var(--brew-forest, #2a4b32);
      font-weight: 700;
      font-size: 0.95rem;

      ion-icon {
        font-size: 1.25rem;
      }
    }

    .brew-accordion-group {
      background: transparent;
      padding: 0;
      margin: 0;
      border: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .brew-accordion-item {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-lg, 16px) !important;
      overflow: hidden;
      box-shadow: var(--brew-shadow-sm, 0 2px 8px rgba(44, 30, 22, 0.04));
      transition: box-shadow 0.2s ease;

      &:hover {
        box-shadow: var(--brew-shadow-md, 0 6px 16px rgba(44, 30, 22, 0.08));
      }

      .accordion-header-item {
        --background: var(--brew-surface, #ffffff);
        --padding-start: 1.25rem;
        --padding-end: 1.25rem;
        --padding-top: 1rem;
        --padding-bottom: 1rem;
        --inner-padding-end: 0;

        .accordion-question {
          font-family: var(--brew-font-sans, 'Plus Jakarta Sans', sans-serif);
          font-size: 1rem;
          font-weight: 700;
          color: var(--brew-espresso, #2c1e16);
          margin: 0;
          white-space: normal;
          line-height: 1.4;
        }
      }

      .accordion-answer {
        padding: 0 1.25rem 1.25rem;
        background: var(--brew-surface, #ffffff);

        p {
          margin: 0;
          font-size: 0.925rem;
          color: var(--brew-muted, #7c685b);
          line-height: 1.65;
          border-top: 1px solid var(--brew-border-subtle, #f5efe9);
          padding-top: 0.85rem;
        }
      }
    }

    // Assistant Side Card
    .assistant-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-xl, 24px);
      padding: 1.75rem 1.5rem;
      box-shadow: var(--brew-shadow-md, 0 8px 24px rgba(44, 30, 22, 0.08));
      position: sticky;
      top: calc(var(--brew-header-height, 68px) + 1.5rem);

      .assistant-header {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-bottom: 1rem;

        .assistant-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--brew-sand, #f0e6dc);
          color: var(--brew-espresso, #2c1e16);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          flex-shrink: 0;
        }

        .eyebrow {
          display: block;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--brew-caramel, #c4783c);
        }

        h3 {
          font-family: var(--brew-font-serif, 'Fraunces', serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--brew-espresso, #2c1e16);
          margin: 0;
        }
      }

      .assistant-intro {
        font-size: 0.875rem;
        color: var(--brew-muted, #7c685b);
        line-height: 1.5;
        margin: 0 0 1.25rem;

        em {
          color: var(--brew-espresso, #2c1e16);
          font-style: normal;
          font-weight: 600;
        }
      }

      .assistant-form {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-bottom: 1.25rem;

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;

          .input-search-icon {
            position: absolute;
            left: 0.85rem;
            color: var(--brew-muted, #7c685b);
            font-size: 1.15rem;
            pointer-events: none;
          }

          .search-input {
            padding-left: 2.35rem;
            width: 100%;
          }
        }

        .ask-btn {
          width: 100%;
          height: 46px;
          font-size: 0.95rem;
          font-weight: 700;
        }
      }

      .bot-response {
        background: var(--brew-sand, #f0e6dc);
        border: 1px solid var(--brew-border, #ede3da);
        border-radius: var(--brew-radius-md, 12px);
        padding: 1rem;
        margin-bottom: 1.25rem;
        animation: fadeIn 0.3s ease;

        .bot-tag {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--brew-caramel, #c4783c);
          font-size: 0.825rem;
          margin-bottom: 0.4rem;

          ion-icon {
            font-size: 1rem;
          }
        }

        p {
          font-size: 0.9rem;
          color: var(--brew-espresso, #2c1e16);
          line-height: 1.55;
          margin: 0;
        }
      }

      .still-need-help {
        text-align: center;
        border-top: 1px solid var(--brew-border, #ede3da);
        padding-top: 1.25rem;
        margin-bottom: 1rem;

        p {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--brew-espresso, #2c1e16);
          margin: 0 0 0.65rem;
        }

        .contact-link-btn {
          width: 100%;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          font-size: 0.875rem;
          padding: 0.65rem 1rem;
        }
      }

      .disclaimer {
        font-size: 0.72rem;
        color: var(--brew-muted, #7c685b);
        text-align: center;
        line-height: 1.4;
        margin: 0;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class FaqPage {
  question = '';
  answer = '';
  readonly faqs = [
    { q: 'How do I order?', a: 'Choose items from the menu, add them to your cart, review your quantities, and continue to checkout.' },
    { q: 'How do I add an item to my cart?', a: 'Use Add to Cart on a product card, or open product details to choose size and available customizations.' },
    { q: 'What payment methods are available?', a: 'The course project offers demo selections for GCash, QR Payment, and Cash on Delivery. No payment gateway is connected.' },
    { q: 'Do you accept GCash or QR payments?', a: 'You can select either option for demo order tracking. The app does not process these payments, and a merchant QR code is not configured.' },
    { q: 'What is Cash on Delivery?', a: 'Choose Cash on Delivery to record an order that is paid to the delivery person on arrival.' },
    { q: 'Can I modify an order?', a: 'Contact Brewluxe as soon as possible. The course project does not yet provide an order-editing workflow.' },
    { q: 'How can I check my order?', a: 'Sign in and open My Orders from the side menu to view saved orders and their status.' },
    { q: 'How do I contact Brewluxe?', a: 'Open Contact Us from the side menu and submit the form. Messages are saved to the project database when its SQL setup has been applied.' },
    { q: 'How do I create an account?', a: 'Choose Log In, then Create an account. Enter your name, phone number, email, and a matching password.' },
  ];

  constructor() {
    addIcons({
      helpCircleOutline,
      searchOutline,
      chatbubbleEllipsesOutline,
      sparklesOutline,
      cafeOutline,
    });
  }

  pickQuestion(qText: string): void {
    this.question = qText;
    this.ask();
  }

  ask(): void {
    const text = this.question.toLowerCase();
    if (/pay|gcash|qr|cod|cash/.test(text)) this.answer = 'The demo offers GCash, QR Payment, and Cash on Delivery. Online payments are not processed by this app.';
    else if (/cart|add item|quantity/.test(text)) this.answer = 'Add products from the menu, then adjust quantities in your cart before checkout.';
    else if (/deliver|address|phone/.test(text)) this.answer = 'Enter your delivery name, Philippine phone number, and complete address at checkout.';
    else if (/order|checkout/.test(text)) this.answer = 'Browse the menu, add products to your cart, then proceed to checkout and submit delivery details.';
    else if (/product|coffee|drink|menu/.test(text)) this.answer = 'Brewluxe lists coffee, iced coffee, frappes, pastries, shakes, and non-coffee specialties in the menu.';
    else if (/contact|email/.test(text)) this.answer = 'Use the Contact Us form to leave a message for the project team.';
    else if (/account|register|sign|login/.test(text)) this.answer = 'Create an account with your name, phone, email, and password, or sign in with your email.';
    else this.answer = 'I can help with ordering, products, payments, delivery, your cart, accounts, and contact details. Try asking about one of those topics.';
  }
}
