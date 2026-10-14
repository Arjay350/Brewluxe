import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonButton,
  IonIcon,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add,
  remove,
  trashOutline,
  arrowForwardOutline,
  arrowBackOutline,
  cafeOutline,
  bagCheckOutline,
  createOutline,
  closeOutline,
  checkmarkCircleOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { CartItem } from '../models/product.model';
import { CartService } from '../services/cart.service';

interface AddonOption {
  name: string;
  price: number;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonButton,
    IonIcon,
  ],
})
export class CartPage implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private cartSub?: Subscription;

  // In-cart editing state
  editingIndex: number | null = null;
  editDraft: {
    size: string;
    sugarLevel: string;
    iceLevel: string;
    addons: string[];
  } | null = null;

  readonly sizeOptions = ['Regular', 'Large'];
  readonly sugarOptions = ['0%', '25%', '50%', '75%', '100%'];
  readonly iceOptions = ['No Ice', 'Less Ice', 'Regular Ice', 'Extra Ice'];
  readonly addonOptions: AddonOption[] = [
    { name: 'Espresso Shot', price: 20 },
    { name: 'Extra Whip', price: 15 },
    { name: 'Pearls', price: 15 },
    { name: 'Caramel Drizzle', price: 15 },
  ];

  constructor(
    private cartService: CartService,
    private alertCtrl: AlertController,
    private router: Router,
  ) {
    addIcons({
      add,
      remove,
      trashOutline,
      arrowForwardOutline,
      arrowBackOutline,
      cafeOutline,
      bagCheckOutline,
      createOutline,
      closeOutline,
      checkmarkCircleOutline,
      sparklesOutline,
    });
  }

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
    this.cartSub = this.cartService.cart$.subscribe((items) => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  get itemsSubtotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  }

  get addons(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + this.cartService.getAddonsPrice(item),
      0,
    );
  }

  get total(): number {
    return this.cartService.getSubtotal();
  }

  get totalQuantity(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateQuantity(index: number, change: number): void {
    this.cartService.updateQuantity(index, change);
  }

  removeItem(index: number): void {
    if (this.editingIndex === index) {
      this.closeEdit();
    }
    this.cartService.removeItem(index);
  }

  // --------------------------------------------------------------------------
  // In-Cart Drink Preference Editor
  // --------------------------------------------------------------------------

  get currentEditingItem(): CartItem | null {
    if (this.editingIndex === null) return null;
    return this.cartItems[this.editingIndex] ?? null;
  }

  get isPastry(): boolean {
    return this.currentEditingItem?.product.category === 'Pastries';
  }

  openEdit(index: number): void {
    const item = this.cartItems[index];
    if (!item) return;

    this.editingIndex = index;
    this.editDraft = {
      size: item.size || 'Regular',
      sugarLevel: item.sugarLevel || '100%',
      iceLevel: item.iceLevel || 'Regular Ice',
      addons: [...(item.addons || [])],
    };
  }

  closeEdit(): void {
    this.editingIndex = null;
    this.editDraft = null;
  }

  selectSize(size: string): void {
    if (this.editDraft) {
      this.editDraft.size = size;
    }
  }

  selectSugar(sugar: string): void {
    if (this.editDraft) {
      this.editDraft.sugarLevel = sugar;
    }
  }

  selectIce(ice: string): void {
    if (this.editDraft) {
      this.editDraft.iceLevel = ice;
    }
  }

  hasAddon(name: string): boolean {
    return this.editDraft?.addons.includes(name) ?? false;
  }

  toggleAddon(name: string): void {
    if (!this.editDraft) return;
    const exists = this.editDraft.addons.indexOf(name);
    if (exists > -1) {
      this.editDraft.addons.splice(exists, 1);
    } else {
      this.editDraft.addons.push(name);
    }
  }

  get draftSinglePrice(): number {
    if (!this.currentEditingItem || !this.editDraft) return 0;
    const base = this.currentEditingItem.product.price;
    const addonsCost = this.editDraft.addons.reduce((sum, a) => {
      const found = this.addonOptions.find((opt) => opt.name === a);
      return sum + (found ? found.price : 0);
    }, 0);
    return base + addonsCost;
  }

  get draftLinePrice(): number {
    const qty = this.currentEditingItem?.quantity ?? 1;
    return this.draftSinglePrice * qty;
  }

  saveEdit(): void {
    if (this.editingIndex === null || !this.editDraft) return;
    this.cartService.updateItem(this.editingIndex, {
      size: this.editDraft.size,
      sugarLevel: this.editDraft.sugarLevel,
      iceLevel: this.editDraft.iceLevel,
      addons: [...this.editDraft.addons],
    });
    this.closeEdit();
  }

  async confirmClearCart(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Clear your cart?',
      message:
        'Are you sure you want to remove all drinks and pastries from your cart?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Clear All',
          role: 'destructive',
          handler: () => {
            this.closeEdit();
            this.cartService.clearCart();
          },
        },
      ],
    });
    await alert.present();
  }

  getItemLinePrice(item: CartItem): number {
    return (
      item.product.price * item.quantity + this.cartService.getAddonsPrice(item)
    );
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}
