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
  readerOutline,
  syncOutline,
  timeOutline,
  personOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-audit-log',
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
          <span class="header-brand-name">Security Audit Log</span>
        </div>

        <ion-buttons slot="end">
          <button type="button" class="refresh-btn" (click)="refresh()" [disabled]="loading" title="Refresh audit log">
            <ion-icon name="sync-outline" [class.spinning]="loading"></ion-icon>
          </button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell">
      <div class="brew-container">

        <div class="audit-hero">
          <span class="eyebrow">Governance & Security Tracking</span>
          <h1>System Audit Trail</h1>
          <p class="hero-subtext">
            Immutable log of account role changes, privileged logins, and administrative actions performed across Brewluxe.
          </p>
        </div>

        <div *ngIf="message" class="audit-alert" role="status">
          <span>{{ message }}</span>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="audit-loading">
          <div class="loading-spinner"></div>
          <p>Loading security audit events…</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && !rows.length" class="brew-empty-state">
          <div class="empty-icon-wrap">
            <ion-icon name="reader-outline"></ion-icon>
          </div>
          <h3>No Audit Logs Found</h3>
          <p>No audited administrative actions have been recorded yet.</p>
        </div>

        <!-- Audit Event List -->
        <div *ngIf="!loading && rows.length" class="audit-list">
          <article *ngFor="let row of rows" class="audit-card">
            <div class="audit-icon-wrap">
              <ion-icon name="shield-checkmark-outline"></ion-icon>
            </div>

            <div class="audit-content">
              <div class="audit-top">
                <span class="action-badge">{{ row.action }}</span>
                <span class="audit-time">
                  <ion-icon name="time-outline"></ion-icon>
                  <span>{{ row.created_at | date:'medium' }}</span>
                </span>
              </div>

              <div class="audit-actor">
                <ion-icon name="person-outline"></ion-icon>
                <span>Actor: <strong>{{ row.actor_email }}</strong></span>
              </div>

              <div class="audit-target" *ngIf="row.entity_type">
                <span>Target: <code>{{ row.entity_type }} #{{ row.entity_id }}</code></span>
              </div>

              <div class="audit-details" *ngIf="hasDetails(row.details)">
                <pre>{{ row.details | json }}</pre>
              </div>
            </div>
          </article>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .audit-hero {
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

    .audit-alert {
      padding: 0.85rem 1.25rem;
      background: #fdf2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
      border-radius: var(--brew-radius-md, 12px);
      margin-bottom: 1.5rem;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .audit-loading {
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

    .audit-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 3rem;
      max-width: 820px;
    }

    .audit-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-lg, 18px);
      padding: 1.25rem 1.5rem;
      display: flex;
      gap: 1.25rem;
      box-shadow: 0 4px 16px rgba(44, 30, 22, 0.04);

      .audit-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: var(--brew-sand, #f0e6dc);
        color: var(--brew-espresso, #2c1e16);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .audit-content {
        flex: 1;

        .audit-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;

          .action-badge {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 0.2rem 0.65rem;
            border-radius: var(--brew-radius-full, 9999px);
            background: var(--brew-espresso, #2c1e16);
            color: #ffffff;
          }

          .audit-time {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.8rem;
            color: var(--brew-muted, #7c685b);
          }
        }

        .audit-actor {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.88rem;
          color: var(--brew-espresso, #2c1e16);
          margin-bottom: 0.25rem;

          ion-icon {
            color: var(--brew-caramel, #c4783c);
          }
        }

        .audit-target {
          font-size: 0.8rem;
          color: var(--brew-muted, #7c685b);
          margin-bottom: 0.5rem;

          code {
            background: var(--brew-surface-sunken, #f8f4ee);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.78rem;
          }
        }

        .audit-details {
          pre {
            background: var(--brew-surface-sunken, #f8f4ee);
            border: 1px solid var(--brew-border, #ede3da);
            border-radius: 8px;
            padding: 0.65rem 0.85rem;
            font-size: 0.75rem;
            margin: 0;
            overflow-x: auto;
            color: var(--brew-espresso, #2c1e16);
          }
        }
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class AuditLogPage implements OnInit {
  rows: Awaited<ReturnType<DatabaseService['getAuditLog']>> = [];
  loading = true;
  message = '';

  constructor(
    private readonly db: DatabaseService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      readerOutline,
      syncOutline,
      timeOutline,
      personOutline,
      shieldCheckmarkOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.rows = await this.db.getAuditLog();
    } catch (e) {
      this.message =
        e instanceof Error
          ? e.message
          : 'Could not load audit log. Apply the Supabase schema updates.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  hasDetails(details: unknown): boolean {
    if (!details || typeof details !== 'object') return false;
    return Object.keys(details as Record<string, unknown>).length > 0;
  }
}
