import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  personCircleOutline,
  mailOutline,
  callOutline,
  locationOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  saveOutline,
} from 'ionicons/icons';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
          <span class="header-brand-name">My Profile</span>
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

        <div class="profile-layout">
          <!-- Profile Card -->
          <div class="profile-card">
            
            <div class="profile-header-banner">
              <div class="profile-avatar">
                <ion-icon name="person-circle-outline"></ion-icon>
              </div>
              <div class="profile-titles">
                <span class="eyebrow">Customer Account</span>
                <h1>{{ form.controls.display_name.value || 'Brewluxe Guest' }}</h1>
                <p class="profile-email">{{ form.controls.email.value || 'Signed in customer' }}</p>
              </div>
            </div>

            <!-- Status Feedback Alert -->
            <div
              *ngIf="message"
              class="status-alert"
              [class.status-success]="isSuccess"
              [class.status-error]="!isSuccess"
              role="status"
            >
              <ion-icon [name]="isSuccess ? 'checkmark-circle-outline' : 'alert-circle-outline'"></ion-icon>
              <span>{{ message }}</span>
            </div>

            <!-- Loading Indicator -->
            <div *ngIf="loading" class="profile-loading">
              <div class="loading-spinner"></div>
              <p>Loading your profile details…</p>
            </div>

            <!-- Form -->
            <form *ngIf="!loading" [formGroup]="form" (ngSubmit)="save()" class="profile-form">
              
              <div class="brew-field">
                <label>Display Name <b>*</b></label>
                <div class="input-with-icon">
                  <ion-icon name="person-circle-outline" class="field-icon"></ion-icon>
                  <input
                    type="text"
                    formControlName="display_name"
                    autocomplete="name"
                    placeholder="Enter your full name"
                    class="brew-input field-input"
                  />
                </div>
                <small class="field-error" *ngIf="form.controls.display_name.touched && form.controls.display_name.invalid">
                  Name must be between 2 and 100 characters.
                </small>
              </div>

              <div class="brew-field">
                <label>Email Address</label>
                <div class="input-with-icon">
                  <ion-icon name="mail-outline" class="field-icon"></ion-icon>
                  <input
                    type="email"
                    formControlName="email"
                    readonly
                    class="brew-input field-input readonly-input"
                    title="Email is bound to your account login"
                  />
                </div>
                <small class="field-hint">Your login email cannot be changed here.</small>
              </div>

              <div class="brew-field">
                <label>Philippine Mobile Number</label>
                <div class="input-with-icon">
                  <ion-icon name="call-outline" class="field-icon"></ion-icon>
                  <input
                    type="tel"
                    formControlName="phone"
                    inputmode="tel"
                    placeholder="e.g. 0912 345 6789"
                    class="brew-input field-input"
                  />
                </div>
              </div>

              <div class="brew-field">
                <label>Default Delivery Address</label>
                <div class="input-with-icon">
                  <ion-icon name="location-outline" class="field-icon"></ion-icon>
                  <input
                    type="text"
                    formControlName="address"
                    autocomplete="street-address"
                    placeholder="e.g. Unit 4B, 123 Katipunan Ave, Quezon City"
                    class="brew-input field-input"
                  />
                </div>
                <small class="field-hint">Auto-fills your delivery details at checkout.</small>
              </div>

              <ion-button
                type="submit"
                expand="block"
                class="brew-btn brew-btn-primary save-btn"
                [disabled]="loading || saving"
              >
                <ion-icon name="save-outline" slot="start" *ngIf="!saving"></ion-icon>
                <span *ngIf="!saving">Save Profile</span>
                <span *ngIf="saving">Saving Changes…</span>
              </ion-button>

            </form>

          </div>
        </div>

      </div>
    </ion-content>
  `,
  styles: [`
    .profile-layout {
      max-width: 620px;
      margin: 1.5rem auto 3rem;
      padding: 0 1rem;
    }

    .profile-card {
      background: var(--brew-surface, #ffffff);
      border: 1px solid var(--brew-border, #ede3da);
      border-radius: var(--brew-radius-xl, 24px);
      padding: 2.25rem 2rem;
      box-shadow: var(--brew-shadow-md, 0 8px 24px rgba(44, 30, 22, 0.08));

      @media (max-width: 600px) {
        padding: 1.5rem 1.25rem;
      }
    }

    .profile-header-banner {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding-bottom: 1.75rem;
      border-bottom: 1px solid var(--brew-border, #ede3da);
      margin-bottom: 1.5rem;

      .profile-avatar {
        width: 68px;
        height: 68px;
        border-radius: 20px;
        background: var(--brew-sand, #f0e6dc);
        color: var(--brew-espresso, #2c1e16);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.75rem;
        flex-shrink: 0;
      }

      .eyebrow {
        display: block;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--brew-caramel, #c4783c);
        margin-bottom: 0.2rem;
      }

      h1 {
        font-family: var(--brew-font-serif, 'Fraunces', serif);
        font-size: clamp(1.35rem, 3vw, 1.75rem);
        font-weight: 800;
        color: var(--brew-espresso, #2c1e16);
        margin: 0 0 0.25rem;
        line-height: 1.2;
      }

      .profile-email {
        font-size: 0.875rem;
        color: var(--brew-muted, #7c685b);
        margin: 0;
      }
    }

    .status-alert {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.85rem 1rem;
      border-radius: var(--brew-radius-md, 12px);
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1.5rem;

      ion-icon {
        font-size: 1.35rem;
        flex-shrink: 0;
      }

      &.status-success {
        background: #edf7ed;
        color: #1e4620;
        border: 1px solid #c8e6c9;
      }

      &.status-error {
        background: #fdf2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }
    }

    .profile-loading {
      text-align: center;
      padding: 2.5rem 1rem;
      color: var(--brew-muted, #7c685b);

      .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--brew-border, #ede3da);
        border-top-color: var(--brew-espresso, #2c1e16);
        border-radius: 50%;
        margin: 0 auto 0.75rem;
        animation: spin 0.8s linear infinite;
      }
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .input-with-icon {
        position: relative;
        display: flex;
        align-items: center;

        .field-icon {
          position: absolute;
          left: 0.9rem;
          color: var(--brew-muted, #7c685b);
          font-size: 1.25rem;
          pointer-events: none;
        }

        .field-input {
          padding-left: 2.5rem;
          width: 100%;
        }

        .readonly-input {
          background: var(--brew-surface-sunken, #f8f4ee);
          color: var(--brew-muted, #7c685b);
          cursor: not-allowed;
        }
      }

      .field-hint {
        display: block;
        font-size: 0.75rem;
        color: var(--brew-muted, #7c685b);
        margin-top: 0.35rem;
      }

      .field-error {
        display: block;
        font-size: 0.75rem;
        color: #dc2626;
        margin-top: 0.35rem;
        font-weight: 600;
      }

      .save-btn {
        margin-top: 0.75rem;
        height: 52px;
        font-size: 1rem;
        font-weight: 700;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class ProfilePage implements OnInit {
  loading = true;
  saving = false;
  message = '';
  isSuccess = false;

  readonly form = this.fb.nonNullable.group({
    display_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: [''],
    phone: [''],
    address: [''],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly db: DatabaseService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      personCircleOutline,
      mailOutline,
      callOutline,
      locationOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      saveOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.form.patchValue(await this.db.getProfile());
    } catch (e) {
      this.isSuccess = false;
      this.message = e instanceof Error ? e.message : 'Could not load your profile.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.message = '';
    this.cdr.detectChanges();
    try {
      const v = this.form.getRawValue();
      await this.db.saveProfile({
        display_name: v.display_name,
        phone: v.phone,
        address: v.address,
      });
      this.isSuccess = true;
      this.message = 'Profile successfully updated!';
    } catch (e) {
      this.isSuccess = false;
      this.message = e instanceof Error ? e.message : 'Could not save profile.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
