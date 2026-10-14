import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonApp,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonRouterOutlet,
  IonToolbar,
  IonContent,
  MenuController,
  IonBadge,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cafeOutline,
  cartOutline,
  homeOutline,
  informationCircleOutline,
  leafOutline,
  peopleOutline,
  pizzaOutline,
  snowOutline,
  sparklesOutline,
  waterOutline,
  logOutOutline,
  personCircleOutline,
  receiptOutline,
  phonePortraitOutline,
  helpCircleOutline,
  settingsOutline,
  cubeOutline,
  documentTextOutline,
  businessOutline,
  shieldCheckmarkOutline,
  optionsOutline,
  chevronDownOutline,
  chevronForwardOutline,
  cardOutline,
  mailOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService, AuthUser } from './auth/auth.service';
import { CartService } from './services/cart.service';
import { getSidebarNavigation, NavItem } from './config/sidebar.config';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    IonApp,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonRouterOutlet,
    IonIcon,
    IonBadge,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  static readonly SPLASH_KEY = 'brewluxe-show-splash';

  showSplash = true;
  itemCount = 0;
  currentUser: AuthUser | null = null;
  menuItems: NavItem[] = [];
  expandedItems: Set<string> = new Set<string>();

  private authSub?: Subscription;
  private cartSub?: Subscription;

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private cartService: CartService,
    private authService: AuthService,
  ) {
    addIcons({
      homeOutline,
      cafeOutline,
      leafOutline,
      waterOutline,
      snowOutline,
      sparklesOutline,
      pizzaOutline,
      cartOutline,
      peopleOutline,
      informationCircleOutline,
      logOutOutline,
      personCircleOutline,
      receiptOutline,
      phonePortraitOutline,
      helpCircleOutline,
      settingsOutline,
      cubeOutline,
      documentTextOutline,
      businessOutline,
      shieldCheckmarkOutline,
      optionsOutline,
      chevronDownOutline,
      chevronForwardOutline,
      cardOutline,
      mailOutline,
    });
  }

  ngOnInit(): void {
    this.itemCount = this.cartService.getItemCount();
    this.currentUser = this.authService.getCurrentUser();
    this.updateNavigation(this.currentUser);

    this.cartSub = this.cartService.cart$.subscribe(() => {
      this.itemCount = this.cartService.getItemCount();
    });

    this.authSub = this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.updateNavigation(user);
    });

    this.startSplashIfNeeded();
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  updateNavigation(user: AuthUser | null): void {
    this.menuItems = getSidebarNavigation(user?.role ?? null);
    // Expand top-level accordion items by default if desired, or reset
    this.expandedItems.clear();
  }

  getUserInitials(): string {
    if (!this.currentUser?.displayName) return '';
    const parts = this.currentUser.displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  toggleExpand(itemId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  handleItemClick(item: NavItem): void {
    if (item.action === 'logout') {
      void this.logout();
      return;
    }

    if (item.children && item.children.length > 0) {
      this.toggleExpand(item.id);
      return;
    }

    if (item.path) {
      this.navigateTo(item.path);
    }
  }

  navigateTo(path: string): void {
    this.menuCtrl.close().finally(() => {
      this.router.navigateByUrl(path);
    });
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch {
      /* Clear local view even if remote sign-out fails */
    }
    localStorage.removeItem(AppComponent.SPLASH_KEY);
    this.menuCtrl.close();
    this.router.navigateByUrl('/login');
  }

  triggerSplash(): void {
    localStorage.setItem(AppComponent.SPLASH_KEY, '1');
    this.showSplash = true;
    this.startSplashIfNeeded();
  }

  private startSplashIfNeeded(): void {
    const firstVisit = !localStorage.getItem('brewluxe-splash-seen');
    const shouldShowSplash = localStorage.getItem(AppComponent.SPLASH_KEY) === '1' || firstVisit;
    if (!shouldShowSplash) {
      this.showSplash = false;
      return;
    }

    this.showSplash = true;
    localStorage.setItem('brewluxe-splash-seen', '1');
    window.setTimeout(() => {
      this.showSplash = false;
      localStorage.removeItem(AppComponent.SPLASH_KEY);
    }, 1400);
  }
}

