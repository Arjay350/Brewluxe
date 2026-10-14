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
  shieldCheckmarkOutline,
  personCircleOutline,
  mailOutline,
  callOutline,
  syncOutline,
  peopleOutline,
} from 'ionicons/icons';
import { DatabaseService, ManagedAccount } from '../services/database.service';

@Component({
  selector: 'app-staff-accounts',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
          <span class="header-brand-name">Staff Accounts</span>
        </div>

        <ion-buttons slot="end">
          <button type="button" class="refresh-btn" (click)="refresh()" [disabled]="loading" title="Refresh accounts">
            <ion-icon name="sync-outline" [class.spinning]="loading"></ion-icon>
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell">
      <div class="brew-container">

        <div class="staff-hero">
          <span class="eyebrow">Store Management & Team Access</span>
          <h1>Staff Directory</h1>
          <p class="hero-subtext">
            Active team members, baristas, and administrators with operational access to Brewluxe.
          </p>
        </div>

        <div *ngIf="message" class="staff-alert" role="status">
          <span>{{ message }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="staff-loading">
          <div class="loading-spinner"></div>
          <p>Loading staff directory…</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !accounts.length" class="brew-empty-state">
          <div class="empty-icon-wrap">
            <ion-icon name="people-outline"></ion-icon>
          </div>
          <h3>No Staff Accounts Found</h3>
          <p>No team members are currently assigned staff roles in Supabase.</p>
        </div>

        <!-- Staff List Grid -->
        <div *ngIf="!loading && accounts.length" class="staff-grid">
          <article *ngFor="let account of accounts" class="staff-card">
            <div class="card-avatar">
              <ion-icon name="person-circle-outline"></ion-icon>
            </div>

            <div class="card-body">
              <div class="card-top-row">
                <h3 class="staff-name">{{ account.display_name || 'Staff Member' }}</h3>
                <span class="role-badge" [attr.data-role]="account.role">
                  {{ formatRole(account.role) }}
                </span>
              </div>

              <div class="contact-details">
                <span class="detail-line">
                  <ion-icon name="mail-outline"></ion-icon>
                  <span>{{ account.email }}</span>
                </span>
                <span class="detail-line" *ngIf="account.phone">
                  <ion-icon name="call-outline"></ion-icon>
                  <span>{{ account.phone }}</span>
                </span>
              </div>
            </div>
          </article>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .staff-hero {
      margin-bottom: 2rem;

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
      }
    }

    .refresh-btn {
      background: none;
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-md, 12px);
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--brew-espresso, #2c1e16);

      ion-icon {
        font-size: 1.25rem;

        &.spinning {
          animation: spin 0.8s linear infinite;
        }
      }
    }

    .staff-alert {
      padding: 0.85rem 1.25rem;
      background: #fdf2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
      border-radius: var(--brew-radius-md, 12px);
      margin-bottom: 1.5rem;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .staff-loading {
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

    .staff-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3rem;
    }

    .staff-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-lg, 18px);
      padding: 1.5rem;
      display: flex;
      gap: 1.25rem;
      box-shadow: 0 4px 16px rgba(44, 30, 22, 0.05);

      .card-avatar {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: var(--brew-sand, #f0e6dc);
        color: var(--brew-espresso, #2c1e16);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        flex-shrink: 0;
      }

      .card-body {
        flex: 1;

        .card-top-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.65rem;
          flex-wrap: wrap;

          .staff-name {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--brew-espresso, #2c1e16);
            margin: 0;
          }

          .role-badge {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            padding: 0.2rem 0.65rem;
            border-radius: var(--brew-radius-full, 9999px);
            background: var(--brew-sand, #f0e6dc);
            color: var(--brew-espresso, #2c1e16);

            &[data-role="SUPER_ADMIN"] {
              background: #fef3c7;
              color: #92400e;
            }
            &[data-role="ADMIN"] {
              background: #e0e7ff;
              color: #3730a3;
            }
            &[data-role="EMPLOYEE"] {
              background: #edf7ed;
              color: #1e4620;
            }
          }
        }

        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          .detail-line {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-size: 0.85rem;
            color: var(--brew-muted, #7c685b);

            ion-icon {
              font-size: 1rem;
              color: var(--brew-caramel, #c4783c);
            }
          }
        }
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class StaffAccountsPage implements OnInit {
  accounts: ManagedAccount[] = [];
  loading = true;
  message = '';

  constructor(
    private readonly db: DatabaseService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      shieldCheckmarkOutline,
      personCircleOutline,
      mailOutline,
      callOutline,
      syncOutline,
      peopleOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.accounts = await this.db.listStaffAccounts();
    } catch (e) {
      this.message =
        e instanceof Error
          ? e.message
          : 'Could not load staff accounts. Apply the Supabase schema updates.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatRole(role: string): string {
    return role.replace(/_/g, ' ');
  }
}
