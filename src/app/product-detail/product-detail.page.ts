import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  ToastController,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add,
  remove,
  cartOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
  cafeOutline,
  sparklesOutline,
  waterOutline,
  snowOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { GuestPromptService } from '../services/guest-prompt.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    IonIcon,
    IonBadge,
  ],
})
export class ProductDetailPage implements OnInit, OnDestroy {
  product: Product | undefined;
  quantity = 1;
  size = 'Regular';
  sugarLevel = '100%';
  iceLevel = 'Regular Ice';
  selectedAddons: string[] = [];
  loading = true;
  loadError = '';
  itemCount = 0;

  readonly sizeOptions = ['Regular', 'Large'];
  readonly sugarOptions = ['0%', '25%', '50%', '75%', '100%'];
  readonly iceOptions = ['None', 'Less Ice', 'Regular Ice', 'Extra Ice'];
  readonly addonOptions: Array<{ name: string; price: number; icon: string }> = [
    { name: 'Espresso Shot', price: 20, icon: '☕' },
    { name: 'Extra Whip', price: 15, icon: '🍦' },
    { name: 'Pearls', price: 15, icon: '🧋' },
    { name: 'Caramel Drizzle', price: 15, icon: '🍯' },
  ];

  private cartSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private toastController: ToastController,
    private guestPrompt: GuestPromptService,
  ) {
    addIcons({
      add,
      remove,
      cartOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
      cafeOutline,
      sparklesOutline,
      waterOutline,
      snowOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.itemCount = this.cartService.getItemCount();
    this.cartSub = this.cartService.cart$.subscribe(() => {
      this.itemCount = this.cartService.getItemCount();
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Show a recent in-memory result immediately while the service validates it.
    const immediate = this.productService.getCachedProductById(id);
    if (immediate) {
      this.product = immediate;
      this.loading = false;
    }

    try {
      const fresh = await this.productService.getProductById(id);
      if (fresh) {
        this.product = fresh;
      } else {
        this.loadError = 'This product is unavailable or could not be found.';
      }
    } catch {
      this.loadError = 'Could not load this product. Check your connection and try again.';
    } finally {
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  get unitAddonsPrice(): number {
    const addonPrices: Record<string, number> = {
      'Espresso Shot': 20,
      'Extra Whip': 15,
      'Pearls': 15,
      'Caramel Drizzle': 15,
    };
    return this.selectedAddons.reduce((sum, a) => sum + (addonPrices[a] ?? 0), 0);
  }

  get unitPrice(): number {
    if (!this.product) return 0;
    return this.cartService.getItemUnitPrice(this.product, this.size, this.selectedAddons);
  }

  get totalPrice(): number {
    return this.unitPrice * this.quantity;
  }

  setSize(size: string): void {
    this.size = size;
  }

  setSugar(level: string): void {
    this.sugarLevel = level;
  }

  setIce(level: string): void {
    this.iceLevel = level;
  }

  toggleAddon(addonName: string): void {
    const index = this.selectedAddons.indexOf(addonName);
    if (index >= 0) {
      this.selectedAddons.splice(index, 1);
    } else {
      this.selectedAddons.push(addonName);
    }
  }

  isAddonSelected(addonName: string): boolean {
    return this.selectedAddons.includes(addonName);
  }

  addQty(): void {
    this.quantity += 1;
  }

  minusQty(): void {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  async addToCart(): Promise<void> {
    if (!this.product) return;

    if (!this.guestPrompt.ensureAuthenticated()) {
      return;
    }

    const isPastry = this.product.category === 'Pastries';
    const size = isPastry ? 'Standard' : this.size;
    const addons = isPastry ? [] : [...this.selectedAddons];
    const sugar = isPastry ? '' : this.sugarLevel;
    const ice = isPastry ? '' : this.iceLevel;

    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(
        this.product,
        size,
        addons,
        sugar,
        ice,
      );
    }

    const toast = await this.toastController.create({
      message: isPastry
        ? `Added ${this.quantity} × ${this.product.name} to your order!`
        : `Added ${this.quantity} × ${this.product.name} (${this.size}) to your order!`,
      duration: 2600,
      position: 'bottom',
      color: 'primary',
      icon: 'checkmark-circle-outline',
      buttons: [
        {
          text: 'View Cart',
          role: 'info',
          handler: () => {
            this.router.navigate(['/cart']);
          },
        },
      ],
    });

    await toast.present();
  }
}
