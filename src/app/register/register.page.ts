import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  mailOutline,
  mailOpenOutline,
  cafeOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
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
    IonToolbar,
  ],
  template: `
    <ion-header class="ion-no-border brew-header">
      <ion-toolbar class="brew-toolbar">
        <div class="brew-brand-header" routerLink="/home">
          <img src="assets/images/brewluxe-logo.png" alt="Brewluxe Logo" class="header-logo" />
          <span class="header-brand-name">Create Account</span>
        </div>

        <ion-buttons slot="end">
          <ion-button routerLink="/login" class="login-nav-link">
            <span>Sign In</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="brew-page-shell register-page">
      <div class="brew-container">

        <!-- Verification Success Screen -->
        <main class="register-shell poster-card" *ngIf="registrationComplete">
          <div class="poster-icon-wrap">
            <ion-icon name="mail-open-outline" class="poster-icon"></ion-icon>
          </div>
          <div class="brand-badge-center">
            <img src="assets/images/brewluxe-logo.png" alt="Brewluxe Logo" class="register-brand-logo" />
          </div>
          <h1 class="register-title">Verify Your Email</h1>
          <p class="subtitle">Your account has been created! You're almost ready to brew.</p>

          <div class="poster-notice">
            <span class="eyebrow">Authentication Sent</span>
            <div class="email-badge">
              <ion-icon name="mail-outline"></ion-icon>
              <span>{{ registeredEmail }}</span>
            </div>
            <p class="notice-text">
              We sent an email verification link to activate your account. Please check your inbox (and spam folder) and click the link before signing in.
            </p>
          </div>

          <ion-button
            expand="block"
            class="brew-btn brew-btn-primary register-submit-btn"
            [routerLink]="['/login']"
            [queryParams]="{ registered: 'true', email: registeredEmail }"
          >
            <span>Proceed to Sign In</span>
          </ion-button>
          <p class="subtitle resend-hint">Need to change details? <a (click)="resetForm()">Back to registration</a></p>
        </main>

        <!-- Registration Form -->
        <main class="register-shell" *ngIf="!registrationComplete">
          <div class="brand-badge-center">
            <img src="assets/images/brewluxe-logo.png" alt="Brewluxe Logo" class="register-brand-logo" />
          </div>

          <div class="register-header-text">
            <span class="eyebrow">Join the Brewluxe Family</span>
            <h1 class="register-title">Create Your Account</h1>
            <p class="subtitle">Order artisan drinks, track delivery in real time, and save your favorites.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="register-form">
            <!-- Full Name -->
            <div class="brew-field">
              <label>Full Name <span class="required">*</span></label>
              <input
                type="text"
                formControlName="displayName"
                autocomplete="name"
                maxlength="80"
                placeholder="e.g. Maria Santos"
                class="brew-input"
                (input)="onNameInput($event)"
              />
              <small class="field-error" *ngIf="form.controls.displayName.touched && form.controls.displayName.invalid">
                Please enter your full name (2–80 letters only).
              </small>
            </div>

            <!-- Phone Number -->
            <div class="brew-field">
              <label>Philippine Mobile Number <span class="required">*</span></label>
              <input
                type="tel"
                formControlName="phone"
                autocomplete="tel"
                inputmode="tel"
                maxlength="13"
                placeholder="09171234567 or +639171234567"
                class="brew-input"
                (input)="onPhoneInput($event)"
              />
              <small class="field-error" *ngIf="form.controls.phone.touched && form.controls.phone.invalid">
                Enter a valid 11-digit mobile number (e.g. 09XXXXXXXXX).
              </small>
            </div>

            <!-- Email -->
            <div class="brew-field">
              <label>Email Address <span class="required">*</span></label>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                maxlength="100"
                placeholder="you@example.com"
                class="brew-input"
              />
              <small class="field-error" *ngIf="form.controls.email.touched && form.controls.email.invalid">
                Please enter a valid email address.
              </small>
            </div>

            <!-- Password -->
            <div class="brew-field password-field-wrap">
              <label>Password <span class="required">*</span></label>
              <div class="password-input-group">
                <input
                  formControlName="password"
                  [type]="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  maxlength="64"
                  placeholder="At least 8 chars with letter & number"
                  class="brew-input"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
                >
                  <ion-icon [name]="showPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                </button>
              </div>
              <small class="field-error" *ngIf="form.controls.password.touched && form.controls.password.invalid">
                Use at least 8 characters with a letter and a number.
              </small>
            </div>

            <!-- Confirm Password -->
            <div class="brew-field password-field-wrap">
              <label>Confirm Password <span class="required">*</span></label>
              <div class="password-input-group">
                <input
                  formControlName="confirmPassword"
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  maxlength="64"
                  placeholder="Re-enter your password"
                  class="brew-input"
                />
                <button
                  type="button"
                  class="password-toggle-btn"
                  (click)="toggleConfirmPasswordVisibility()"
                  [attr.aria-label]="showConfirmPassword ? 'Hide password' : 'Show password'"
                >
                  <ion-icon [name]="showConfirmPassword ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
                </button>
              </div>
              <small class="field-error" *ngIf="form.controls.confirmPassword.touched && form.controls.confirmPassword.value !== form.controls.password.value">
                Passwords do not match.
              </small>
            </div>

            <!-- Error Banner -->
            <div class="form-error-alert" *ngIf="message" role="alert">
              <p>{{ message }}</p>
            </div>

            <!-- Submit Button -->
            <ion-button
              type="submit"
              expand="block"
              class="brew-btn brew-btn-primary register-submit-btn"
              [disabled]="submitting"
            >
              <span *ngIf="!submitting">Create Account</span>
              <span *ngIf="submitting">Setting up your cup…</span>
            </ion-button>
          </form>

          <div class="register-footer">
            <p>Already have an account? <a routerLink="/login" class="signin-link">Sign In</a></p>
          </div>
        </main>

      </div>
    </ion-content>
  `,
  styles: [`
    /* Header */
    .brew-header {
      background: var(--ion-background-color);
      border-bottom: 1px solid var(--brew-border-subtle);
    }

    .brew-toolbar {
      --background: var(--ion-background-color);
      --color: var(--brew-espresso);
      padding: 4px 8px;
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

    .login-nav-link {
      --color: var(--brew-sage);
      font-weight: 700;
      font-size: 0.92rem;
    }

    .register-page {
      --background: var(--ion-background-color);
    }

    .register-shell {
      max-width: 500px;
      margin: 40px auto 80px;
      background: #FFFFFF;
      border: 1px solid var(--brew-border-subtle);
      border-radius: var(--brew-radius-xl);
      padding: 36px 28px;
      box-shadow: var(--brew-shadow-md);

      @media (min-width: 600px) {
        padding: 44px 36px;
      }
    }

    .brand-badge-center {
      display: flex;
      justify-content: center;
      margin-bottom: 18px;

      .register-brand-logo {
        height: 64px;
        width: auto;
        object-fit: contain;
      }
    }

    .register-header-text {
      text-align: center;
      margin-bottom: 24px;

      .register-title {
        margin: 4px 0 8px;
        font-size: 1.85rem;
      }

      .subtitle {
        margin: 0;
        color: var(--ion-color-medium);
        font-size: 0.92rem;
        line-height: 1.5;
      }
    }

    .register-form {
      display: flex;
      flex-direction: column;
    }

    .required {
      color: var(--ion-color-danger);
    }

    .password-field-wrap {
      position: relative;
    }

    .password-input-group {
      position: relative;
      display: flex;
      align-items: center;

      .brew-input {
        padding-right: 48px;
      }

      .password-toggle-btn {
        position: absolute;
        right: 12px;
        background: transparent;
        border: none;
        color: #8D7668;
        font-size: 1.25rem;
        cursor: pointer;
        display: grid;
        place-items: center;
        padding: 4px;

        &:hover {
          color: var(--brew-espresso);
        }
      }
    }

    .form-error-alert {
      padding: 12px 14px;
      border-radius: var(--brew-radius-md);
      background: #FDE8E8;
      border: 1px solid #F5C6CB;
      color: var(--ion-color-danger);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 16px;

      p {
        margin: 0;
      }
    }

    .register-submit-btn {
      --background: var(--brew-espresso);
      --color: #FFFFFF;
      min-height: 52px;
      font-size: 1.05rem;
      font-weight: 800;
      margin-top: 12px;
    }

    .register-footer {
      text-align: center;
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid var(--brew-border-subtle);

      p {
        margin: 0;
        font-size: 0.9rem;
        color: var(--ion-color-medium);
      }

      .signin-link {
        color: var(--brew-sage);
        font-weight: 700;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    /* Poster Card Styles */
    .poster-card {
      text-align: center;
    }

    .poster-icon-wrap {
      width: 72px;
      height: 72px;
      margin: 0 auto 16px;
      border-radius: 50%;
      background: rgba(42, 75, 50, 0.12);
      display: grid;
      place-items: center;
      font-size: 2.5rem;
      color: var(--brew-sage);
    }

    .poster-notice {
      background: var(--brew-alabaster);
      border: 1px solid var(--brew-border-subtle);
      border-radius: var(--brew-radius-lg);
      padding: 20px;
      margin: 20px 0 24px;
    }

    .email-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      padding: 8px 16px;
      border-radius: var(--brew-radius-pill);
      font-weight: 700;
      color: var(--brew-espresso);
      font-size: 0.95rem;
      border: 1px solid var(--brew-border-subtle);
      margin: 8px 0 12px;
      word-break: break-all;

      ion-icon {
        color: var(--brew-sage);
        font-size: 1.15rem;
      }
    }

    .notice-text {
      margin: 0;
      font-size: 0.88rem;
      color: var(--ion-color-medium);
      line-height: 1.6;
    }

    .resend-hint {
      margin-top: 16px;
      font-size: 0.88rem;
      color: var(--ion-color-medium);

      a {
        color: var(--brew-sage);
        font-weight: 700;
        cursor: pointer;
        text-decoration: underline;
      }
    }
  `],
})
export class RegisterPage {
  submitting = false;
  showPassword = false;
  showConfirmPassword = false;
  registrationComplete = false;
  registeredEmail = '';
  message = '';

  readonly form = this.formBuilder.nonNullable.group({
    displayName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80), Validators.pattern(/^[a-zA-Z\sñÑ.-]+$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^(?:\+?63|0)9\d{9}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required, Validators.maxLength(64), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)]],
    confirmPassword: ['', [Validators.required, Validators.maxLength(64)]],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      mailOutline,
      mailOpenOutline,
      cafeOutline,
      checkmarkCircleOutline,
    });
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^a-zA-Z\sñÑ.-]/g, '');
    if (input.value !== filtered) {
      input.value = filtered;
      this.form.controls.displayName.setValue(filtered);
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^\d+]/g, '');
    if (input.value !== filtered) {
      input.value = filtered;
      this.form.controls.phone.setValue(filtered);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  resetForm(): void {
    this.registrationComplete = false;
    this.message = '';
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.message = 'Please check the required fields and enter a password of at least 8 characters with letters & numbers.';
      this.cdr.detectChanges();
      return;
    }
    this.submitting = true;
    this.message = '';
    this.cdr.detectChanges();

    try {
      const { displayName, phone, email, password, confirmPassword } = this.form.getRawValue();
      if (password !== confirmPassword) {
        this.message = 'Passwords do not match.';
        this.cdr.detectChanges();
        return;
      }
      const normalizedName = displayName.trim();
      const normalizedEmail = email.trim().toLowerCase();
      let cleanPhone = phone.trim().replace(/[\s-]/g, '');
      if (cleanPhone.startsWith('+63')) {
        cleanPhone = '0' + cleanPhone.slice(3);
      } else if (cleanPhone.startsWith('63')) {
        cleanPhone = '0' + cleanPhone.slice(2);
      }
      if (normalizedName.length < 2 || !/^09\d{9}$/.test(cleanPhone)) {
        this.message = 'Enter a valid name and 11-digit Philippine mobile number (e.g., 09123456789).';
        this.cdr.detectChanges();
        return;
      }
      this.form.patchValue({ displayName: normalizedName, email: normalizedEmail, phone: cleanPhone });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                'Registration timed out after 15 seconds. Please check your internet connection or try again.',
              ),
            ),
          15000,
        ),
      );

      const signedIn = await Promise.race([
        this.auth.register(normalizedEmail, password, normalizedName, cleanPhone),
        timeoutPromise,
      ]);

      if (!signedIn) {
        this.registeredEmail = normalizedEmail;
        this.registrationComplete = true;
        this.cdr.detectChanges();
        return;
      }

      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
      localStorage.setItem('brewluxe-show-splash', '1');
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('rate_limit')) {
        this.message = 'Supabase email rate limit exceeded. In your Supabase Dashboard under Authentication > Providers > Email, turn off "Confirm email" so new signups activate instantly without sending verification emails.';
      } else {
        this.message = errMsg || 'Could not create your account. Please try again.';
      }
      this.cdr.detectChanges();
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }
}
