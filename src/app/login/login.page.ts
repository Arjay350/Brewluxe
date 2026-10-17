import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { eyeOutline, eyeOffOutline, mailOpenOutline, mailOutline } from 'ionicons/icons';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    IonButton,
    IonIcon,
  ],
})
export class LoginPage implements OnInit {
  isSubmitting = false;
  showPassword = false;
  registeredNotice = false;
  loginError = '';

  loginForm = this.formBuilder.nonNullable.group({
    identifier: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    addIcons({ eyeOutline, eyeOffOutline, mailOpenOutline, mailOutline });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['registered'] === 'true') {
        this.registeredNotice = true;
      }
      if (params['email']) {
        this.loginForm.patchValue({ identifier: params['email'] });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.loginError = 'Enter a valid email and password.';
      return;
    }

    this.isSubmitting = true;
    this.loginError = '';

    const { identifier, password } = this.loginForm.getRawValue();

    try {
      await this.authService.login(identifier, password);
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.loginError = 'Sign in succeeded, but your profile could not be loaded. Please try again.';
        return;
      }

      if (currentUser.role === 'CUSTOMER') {
        localStorage.setItem('brewluxe-show-splash', '1');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          await this.router.navigateByUrl(returnUrl);
          return;
        }
      }

      await this.router.navigateByUrl(this.authService.getDashboardForRole(currentUser.role));
    } catch (error) {
      this.loginError = error instanceof Error ? error.message : 'Could not sign in. Please try again.';
      this.loginForm.patchValue({ password: '' });
    } finally {
      this.isSubmitting = false;
    }
  }
}
