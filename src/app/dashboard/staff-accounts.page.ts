import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertController,
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
  personOutline,
  mailOutline,
  callOutline,
  syncOutline,
  peopleOutline,
  searchOutline,
  banOutline,
  trashOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { DatabaseService, ManagedAccount } from '../services/database.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-staff-accounts',
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
          <span class="header-brand-name">Store Accounts</span>
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
          <h1>Accounts Directory</h1>
          <p class="hero-subtext">
            Active team members, baristas, and customer accounts with access to Brewluxe.
          </p>
        </div>

        <div *ngIf="message" class="staff-alert" [class.alert-success]="!failed" role="status">
          <span>{{ message }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="staff-loading">
          <div class="loading-spinner"></div>
          <p>Loading accounts directory…</p>
        </div>

        <div *ngIf="!loading" class="governance-sections">
          <!-- SECTION 1: Staff & Administrators -->
          <section class="governance-group">
            <header class="group-header">
              <div class="group-title-row">
                <h2>Staff &amp; Administrators</h2>
                <span class="count-badge">{{ staffAccounts.length }}</span>
              </div>
              <p class="group-subtext">
                Baristas, shift supervisors, and store managers with active system roles.
              </p>
            </header>

            <div *ngIf="!staffAccounts.length" class="empty-group-notice">
              <p>No staff or administrative accounts found in the database.</p>
            </div>

            <div *ngIf="staffAccounts.length" class="staff-grid">
              <article *ngFor="let account of staffAccounts" class="staff-card">
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
          </section>

          <!-- SECTION 2: Customers -->
          <section class="governance-group">
            <header class="group-header customer-group-header">
              <div class="group-title-row">
                <h2>Customers</h2>
                <span class="count-badge count-badge-muted">{{ customerAccounts.length }} registered</span>
              </div>
              <p class="group-subtext">
                Registered retail customers who place beverage and food orders. You can ban or permanently remove customer accounts.
              </p>

              <!-- Live Customer Search -->
              <div class="customer-search-row">
                <div class="search-input-wrap">
                  <ion-icon name="search-outline" class="search-icon"></ion-icon>
                  <input
                    type="search"
                    [(ngModel)]="customerSearchQuery"
                    (ngModelChange)="onSearchChange()"
                    placeholder="Search by name, email, or phone…"
                    class="customer-search-input"
                  />
                  <button
                    *ngIf="customerSearchQuery"
                    type="button"
                    class="clear-search-btn"
                    (click)="customerSearchQuery = ''; onSearchChange()"
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                </div>
                <span class="search-count" *ngIf="customerSearchQuery">
                  Found {{ filteredCustomers.length }} matching
                </span>
              </div>
            </header>

            <div *ngIf="!customerAccounts.length" class="empty-group-notice">
              <p>No customer accounts are registered yet.</p>
            </div>

            <!-- Customer Grid -->
            <div class="accounts-grid" *ngIf="paginatedCustomers.length">
              <article *ngFor="let account of paginatedCustomers" class="account-card" [class.is-self]="account.id === myUserId">
                <div class="account-identity">
                  <div class="user-avatar" [class.avatar-banned]="account.is_banned">
                    <ion-icon [name]="account.is_banned ? 'ban-outline' : 'person-outline'"></ion-icon>
                  </div>
                  <div class="user-meta">
                    <div class="user-name-row">
                      <h3>{{ account.display_name || 'Customer' }}</h3>
                      <span class="banned-tag" *ngIf="account.is_banned">
                        <ion-icon name="ban-outline"></ion-icon> Banned
                      </span>
                      <span class="self-tag" *ngIf="account.id === myUserId">
                        <ion-icon name="lock-closed-outline"></ion-icon> You
                      </span>
                    </div>
                    <span class="user-email">{{ account.email }}</span>
                    <span class="user-phone" *ngIf="account.phone">{{ account.phone }}</span>
                  </div>
                </div>

                <!-- Account Actions: Ban / Unban & Delete User -->
                <div class="account-actions-row" *ngIf="account.id !== myUserId">
                  <button
                    type="button"
                    class="account-action-btn ban-user-btn"
                    [class.is-banned-state]="account.is_banned"
                    [disabled]="banningId === account.id || deletingId === account.id"
                    (click)="toggleBan(account)"
                  >
                    <ion-icon [name]="account.is_banned ? 'shield-checkmark-outline' : 'ban-outline'"></ion-icon>
                    <span>{{ banningId === account.id ? 'Updating…' : (account.is_banned ? 'Unban User' : 'Ban User') }}</span>
                  </button>

                  <button
                    type="button"
                    class="account-action-btn delete-user-btn"
                    [disabled]="deletingId === account.id || banningId === account.id"
                    (click)="confirmDelete(account)"
                  >
                    <ion-icon name="trash-outline"></ion-icon>
                    <span>{{ deletingId === account.id ? 'Deleting…' : 'Delete User' }}</span>
                  </button>
                </div>
              </article>
            </div>

            <!-- Customer Search Empty State -->
            <div *ngIf="customerAccounts.length > 0 && !filteredCustomers.length" class="empty-group-notice">
              <p>No customers match "{{ customerSearchQuery }}".</p>
            </div>

            <!-- Load More Pagination Control -->
            <div *ngIf="displayedCustomerCount < filteredCustomers.length" class="load-more-row">
              <button
                type="button"
                class="load-more-btn"
                (click)="loadMoreCustomers()"
              >
                Load More Customers ({{ filteredCustomers.length - displayedCustomerCount }} remaining)
              </button>
            </div>
          </section>
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

      &.alert-success {
        background: #edf7ed;
        color: #1e4620;
        border-color: #c8e6c9;
      }
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

    .governance-sections {
      display: flex;
      flex-direction: column;
      gap: 2.75rem;
      margin-bottom: 2rem;
    }

    .governance-group {
      .group-header {
        margin-bottom: 1.25rem;

        .group-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          h2 {
            font-family: var(--brew-font-serif, 'Fraunces', serif);
            font-size: 1.4rem;
            font-weight: 700;
            color: var(--brew-espresso, #2c1e16);
            margin: 0;
          }

          .count-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.2rem 0.65rem;
            border-radius: var(--brew-radius-full, 9999px);
            font-size: 0.8rem;
            font-weight: 700;
            background: var(--brew-sand, #f0e6dc);
            color: var(--brew-espresso, #2c1e16);

            &.count-badge-muted {
              background: #f1ede8;
              color: var(--brew-muted, #7c685b);
            }
          }
        }

        .group-subtext {
          color: var(--brew-muted, #7c685b);
          font-size: 0.9rem;
          margin: 0.35rem 0 0;
        }
      }

      .customer-group-header {
        .customer-search-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          flex-wrap: wrap;

          .search-input-wrap {
            position: relative;
            flex: 1;
            min-width: 260px;
            max-width: 480px;

            .search-icon {
              position: absolute;
              left: 12px;
              top: 50%;
              transform: translateY(-50%);
              font-size: 1.15rem;
              color: var(--brew-muted, #7c685b);
              pointer-events: none;
            }

            .customer-search-input {
              width: 100%;
              padding: 0.65rem 2.25rem 0.65rem 2.4rem;
              border: 1px solid var(--brew-border, #ede3da);
              border-radius: var(--brew-radius-md, 12px);
              background: var(--brew-surface, #ffffff);
              font-size: 0.9rem;
              color: var(--brew-espresso, #2c1e16);
              transition: border-color 0.2s ease, box-shadow 0.2s ease;

              &:focus {
                outline: none;
                border-color: var(--brew-caramel, #c4783c);
                box-shadow: 0 0 0 3px rgba(196, 120, 60, 0.15);
              }
            }

            .clear-search-btn {
              position: absolute;
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              background: none;
              border: none;
              font-size: 1.25rem;
              color: var(--brew-muted, #7c685b);
              cursor: pointer;
              line-height: 1;
              padding: 2px 6px;
            }
          }

          .search-count {
            font-size: 0.85rem;
            color: var(--brew-muted, #7c685b);
            font-weight: 600;
          }
        }
      }

      .empty-group-notice {
        padding: 2rem 1rem;
        background: var(--brew-surface-sunken, #f8f4ee);
        border: 1px dashed var(--brew-border, #ede3da);
        border-radius: var(--brew-radius-md, 12px);
        text-align: center;
        color: var(--brew-muted, #7c685b);
        font-size: 0.9rem;
      }

      .load-more-row {
        text-align: center;
        margin-top: 1.5rem;

        .load-more-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--brew-surface, #ffffff);
          border: 1px solid var(--brew-border, #ede3da);
          color: var(--brew-espresso, #2c1e16);
          padding: 0.75rem 1.75rem;
          border-radius: var(--brew-radius-md, 12px);
          font-weight: 700;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: var(--brew-caramel, #c4783c);
            color: var(--brew-caramel, #c4783c);
          }
        }
      }
    }

    .staff-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
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

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }

    .account-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-lg, 18px);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1.25rem;
      box-shadow: 0 4px 16px rgba(44, 30, 22, 0.05);

      &.is-self {
        border-color: var(--brew-caramel, #c4783c);
        background: #fffdfb;
      }

      .account-identity {
        display: flex;
        gap: 1rem;
        align-items: flex-start;

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--brew-sand, #f0e6dc);
          color: var(--brew-espresso, #2c1e16);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;

          &.avatar-banned {
            background: #fee2e2;
            color: #991b1b;
          }
        }

        .user-meta {
          flex: 1;

          .user-name-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            h3 {
              font-size: 1.1rem;
              font-weight: 700;
              color: var(--brew-espresso, #2c1e16);
              margin: 0;
            }

            .banned-tag {
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
              font-size: 0.7rem;
              font-weight: 700;
              background: #fee2e2;
              color: #991b1b;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }

            .self-tag {
              display: inline-flex;
              align-items: center;
              gap: 0.25rem;
              font-size: 0.7rem;
              font-weight: 700;
              background: var(--brew-sand, #f0e6dc);
              color: var(--brew-espresso, #2c1e16);
              padding: 2px 6px;
              border-radius: 4px;
            }
          }

          .user-email {
            display: block;
            font-size: 0.85rem;
            color: var(--brew-muted, #7c685b);
            margin-top: 0.2rem;
          }

          .user-phone {
            display: block;
            font-size: 0.8rem;
            color: var(--brew-muted, #7c685b);
            margin-top: 0.15rem;
          }
        }
      }

      .account-actions-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding-top: 0.85rem;
        border-top: 1px dashed var(--brew-border, #ede3da);

        .account-action-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          min-height: 38px;
          padding: 0.45rem 0.75rem;
          border-radius: var(--brew-radius-md, 10px);
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;

          &:focus-visible {
            outline: 2px solid var(--brew-caramel, #c4783c);
            outline-offset: 2px;
          }

          &[disabled] {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        .ban-user-btn {
          background: #fef3c7;
          color: #92400e;
          border-color: #fde68a;

          &:hover:not([disabled]) {
            background: #fde68a;
          }

          &.is-banned-state {
            background: #edf7ed;
            color: #1e4620;
            border-color: #c8e6c9;

            &:hover:not([disabled]) {
              background: #dcfce7;
            }
          }
        }

        .delete-user-btn {
          background: #fdf2f2;
          color: #991b1b;
          border-color: #fecaca;

          &:hover:not([disabled]) {
            background: #fee2e2;
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
  failed = false;

  readonly myUserId = this.auth.getCurrentUser()?.id ?? '';
  customerSearchQuery = '';
  customerPageSize = 10;
  displayedCustomerCount = 10;
  banningId?: string;
  deletingId?: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly alertCtrl: AlertController,
  ) {
    addIcons({
      shieldCheckmarkOutline,
      personCircleOutline,
      personOutline,
      mailOutline,
      callOutline,
      syncOutline,
      peopleOutline,
      searchOutline,
      banOutline,
      trashOutline,
      lockClosedOutline,
    });
  }

  get staffAccounts(): ManagedAccount[] {
    return this.accounts.filter((account) => account.role !== 'CUSTOMER');
  }

  get customerAccounts(): ManagedAccount[] {
    return this.accounts.filter((account) => account.role === 'CUSTOMER');
  }

  get filteredCustomers(): ManagedAccount[] {
    const q = this.customerSearchQuery.trim().toLowerCase();
    if (!q) return this.customerAccounts;
    return this.customerAccounts.filter(
      (a) =>
        (a.display_name && a.display_name.toLowerCase().includes(q)) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        (a.phone && a.phone.toLowerCase().includes(q)),
    );
  }

  get paginatedCustomers(): ManagedAccount[] {
    return this.filteredCustomers.slice(0, this.displayedCustomerCount);
  }

  onSearchChange(): void {
    this.displayedCustomerCount = this.customerPageSize;
  }

  loadMoreCustomers(): void {
    this.displayedCustomerCount += this.customerPageSize;
  }

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.message = '';
    this.failed = false;
    this.cdr.detectChanges();

    try {
      const all = await this.db.listAccounts();
      if (all && all.length) {
        this.accounts = all;
      } else {
        this.accounts = await this.db.listStaffAccounts();
      }
    } catch {
      try {
        this.accounts = await this.db.listStaffAccounts();
      } catch (e) {
        this.failed = true;
        this.message =
          e instanceof Error
            ? e.message
            : 'Could not load accounts. Apply the Supabase schema updates.';
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  formatRole(role: string): string {
    return role.replace(/_/g, ' ');
  }

  async toggleBan(account: ManagedAccount): Promise<void> {
    if (account.id === this.myUserId) return;
    const newBannedState = !account.is_banned;
    const actionLabel = newBannedState ? 'Ban' : 'Unban';

    const alert = await this.alertCtrl.create({
      header: `${actionLabel} Customer`,
      subHeader: account.display_name || account.email,
      message: newBannedState
        ? `Are you sure you want to ban this customer? They will be locked out of signing in to Brewluxe immediately.`
        : `Are you sure you want to unban this customer? They will regain access to their account.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: actionLabel,
          role: newBannedState ? 'destructive' : undefined,
          handler: () => {
            void this.performBan(account, newBannedState);
          },
        },
      ],
    });

    await alert.present();
  }

  private async performBan(account: ManagedAccount, banned: boolean): Promise<void> {
    this.banningId = account.id;
    this.message = '';
    this.failed = false;
    this.cdr.detectChanges();

    try {
      await this.db.setAccountBan(account.id, banned);
      account.is_banned = banned;
      this.message = `${account.email} has been ${banned ? 'banned' : 'unbanned'} successfully.`;
    } catch (error) {
      this.failed = true;
      this.message = error instanceof Error ? error.message : `Could not ${banned ? 'ban' : 'unban'} this user.`;
    } finally {
      this.banningId = undefined;
      this.cdr.detectChanges();
    }
  }

  async confirmDelete(account: ManagedAccount): Promise<void> {
    if (account.id === this.myUserId) return;

    const alert = await this.alertCtrl.create({
      header: 'Delete Customer Account',
      subHeader: account.display_name ? `${account.display_name} (${account.email})` : account.email,
      message: 'This action is PERMANENT. It will permanently remove their profile and authentication credentials from the database. Are you sure you want to proceed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Permanently Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteUser(account);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteUser(account: ManagedAccount): Promise<void> {
    this.deletingId = account.id;
    this.message = '';
    this.failed = false;
    this.cdr.detectChanges();

    try {
      await this.db.deleteAccount(account.id);
      this.accounts = this.accounts.filter((a) => a.id !== account.id);
      this.message = `Account for ${account.email} was permanently deleted.`;
    } catch (error) {
      this.failed = true;
      this.message = error instanceof Error ? error.message : 'Could not delete this account.';
    } finally {
      this.deletingId = undefined;
      this.cdr.detectChanges();
    }
  }
}
