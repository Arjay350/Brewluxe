import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonToolbar,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  shieldOutline,
  shieldCheckmarkOutline,
  personOutline,
  syncOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  lockClosedOutline,
} from 'ionicons/icons';
import { AuthService, UserRole } from '../auth/auth.service';
import { DatabaseService, ManagedAccount } from '../services/database.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonSelect,
    IonSelectOption,
    IonToolbar,
    IonIcon,
  ],
  template: `
    <ion-header class="ion-no-border brew-header">
      <ion-toolbar class="brew-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button menu="brewluxe-menu" aria-label="Open menu" class="brew-menu-btn"></ion-menu-button>
        </ion-buttons>

        <div class="brew-brand-header" routerLink="/home">
          <img src="assets/images/brewluxe-logo.png" alt="Brewluxe Logo" class="header-logo" />
          <span class="header-brand-name">Super Admin</span>
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

        <div class="super-hero">
          <span class="eyebrow">Privileged Security Desk</span>
          <h1>Role Governance</h1>
          <p class="hero-subtext">
            Elevate or restrict account privileges across Customer, Employee, Admin, and Super Admin tiers. Role changes take effect immediately on next authentication.
          </p>
        </div>

        <div *ngIf="message" class="super-alert" [class.alert-error]="failed" role="status">
          <ion-icon [name]="failed ? 'alert-circle-outline' : 'checkmark-circle-outline'"></ion-icon>
          <span>{{ message }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="super-loading">
          <div class="loading-spinner"></div>
          <p>Loading account credentials and privilege records…</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !accounts.length" class="brew-empty-state">
          <div class="empty-icon-wrap">
            <ion-icon name="shield-outline"></ion-icon>
          </div>
          <h3>No Accounts Found</h3>
          <p>No account profiles were returned. Ensure the Supabase schema migrations are active.</p>
        </div>

        <!-- Accounts Grid -->
        <div *ngIf="!loading && accounts.length" class="accounts-grid">
          <article *ngFor="let account of accounts" class="account-card" [class.is-self]="account.id === myUserId">
            <div class="account-identity">
              <div class="user-avatar">
                <ion-icon name="person-outline"></ion-icon>
              </div>
              <div class="user-meta">
                <div class="user-name-row">
                  <h3>{{ account.display_name || 'Customer' }}</h3>
                  <span class="self-tag" *ngIf="account.id === myUserId">
                    <ion-icon name="lock-closed-outline"></ion-icon> You
                  </span>
                </div>
                <span class="user-email">{{ account.email }}</span>
                <span class="user-phone" *ngIf="account.phone">{{ account.phone }}</span>
              </div>
            </div>

            <div class="role-control-row">
              <div class="select-wrap">
                <label>Assigned Privilege</label>
                <ion-select
                  [(ngModel)]="draftRoles[account.id]"
                  [name]="'role-' + account.id"
                  [disabled]="account.id === myUserId"
                  interface="popover"
                  class="role-select"
                >
                  <ion-select-option *ngFor="let role of roles" [value]="role">
                    {{ role.replace('_', ' ') }}
                  </ion-select-option>
                </ion-select>
              </div>

              <button
                type="button"
                class="brew-btn brew-btn-primary save-role-btn"
                [disabled]="savingId === account.id || account.id === myUserId || draftRoles[account.id] === account.role"
                (click)="saveRole(account)"
              >
                {{ savingId === account.id ? 'Updating…' : 'Save Role' }}
              </button>
            </div>
          </article>
        </div>

        <p class="lockout-notice">
          <ion-icon name="lock-closed-outline"></ion-icon>
          <span>Your own account role is protected and locked from modification to prevent accidental lockout.</span>
        </p>

      </div>
    </ion-content>
  `,
  styles: [`
    .super-hero {
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
        max-width: 620px;
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

    .super-alert {
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

    .super-loading {
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

    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
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

      .role-control-row {
        display: flex;
        align-items: flex-end;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid var(--brew-border, #ede3da);

        .select-wrap {
          flex: 1;

          label {
            display: block;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--brew-muted, #7c685b);
            margin-bottom: 0.35rem;
          }

          .role-select {
            background: var(--brew-surface-sunken, #f8f4ee);
            border: 1px solid var(--brew-border, #ede3da);
            border-radius: var(--brew-radius-md, 10px);
            padding: 0.4rem 0.65rem;
            font-size: 0.88rem;
            font-weight: 600;
            color: var(--brew-espresso, #2c1e16);
            --placeholder-color: var(--brew-muted, #7c685b);
          }
        }

        .save-role-btn {
          height: 42px;
          padding: 0 1rem;
          font-size: 0.85rem;
          white-space: nowrap;
        }
      }
    }

    .lockout-notice {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--brew-muted, #7c685b);
      margin-top: 1.5rem;

      ion-icon {
        font-size: 1rem;
        color: var(--brew-caramel, #c4783c);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class SuperAdminDashboardPage implements OnInit {
  readonly roles: UserRole[] = ['CUSTOMER', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'];
  accounts: ManagedAccount[] = [];
  draftRoles: Record<string, UserRole> = {};
  loading = true;
  savingId?: string;
  message = '';
  failed = false;
  readonly myUserId = this.auth.getCurrentUser()?.id ?? '';

  constructor(
    private readonly database: DatabaseService,
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      shieldOutline,
      shieldCheckmarkOutline,
      personOutline,
      syncOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      lockClosedOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.accounts = await this.database.listAccounts();
      this.draftRoles = Object.fromEntries(
        this.accounts.map((account) => [account.id, account.role]),
      );
    } catch {
      this.failed = true;
      this.message =
        'Could not load accounts. Make sure the schema has been applied and this account is a super admin.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async saveRole(account: ManagedAccount): Promise<void> {
    const role = this.draftRoles[account.id];
    if (!role || role === account.role) return;
    this.savingId = account.id;
    this.message = '';
    this.failed = false;
    this.cdr.detectChanges();

    try {
      await this.database.setAccountRole(account.id, role);
      account.role = role;
      this.message = `Updated ${account.email} to ${role.replace('_', ' ')}. They need to sign in again for it to take effect.`;
    } catch (error) {
      this.failed = true;
      this.message = error instanceof Error ? error.message : 'Could not update this role.';
      this.draftRoles[account.id] = account.role;
    } finally {
      this.savingId = undefined;
      this.cdr.detectChanges();
    }
  }
}
