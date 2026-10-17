import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class GuestPromptService {
  constructor(
    private readonly auth: AuthService,
    private readonly alertCtrl: AlertController,
    private readonly router: Router,
  ) {}

  ensureAuthenticated(returnUrl?: string): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    void this.promptSignIn(returnUrl || this.router.url);
    return false;
  }

  async promptSignIn(returnUrl: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Sign in to order',
      message: 'Create a free Brewluxe account or sign in to customize drinks, save your cart, and place orders.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Create Account',
          handler: () => {
            this.router.navigate(['/register'], { queryParams: { returnUrl } });
          },
        },
        {
          text: 'Sign In',
          handler: () => {
            this.router.navigate(['/login'], { queryParams: { returnUrl } });
          },
        },
      ],
    });
    await alert.present();
  }
}
