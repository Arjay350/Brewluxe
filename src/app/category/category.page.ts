import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonButton,
  IonIcon,
  IonBadge,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, cartOutline, arrowBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { GuestPromptService } from '../services/guest-prompt.service';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
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
    IonBadge,
  ],
})
export class CategoryPage implements OnInit, OnDestroy {
  category: string = 'Coffee';
  products: Product[] = [];
  loading = true;
  itemCount = 0;

  private cartSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private toastCtrl: ToastController,
    private guestPrompt: GuestPromptService,
  ) {
    addIcons({ addOutline, cartOutline, arrowBackOutline, checkmarkCircleOutline });
  }

  async ngOnInit(): Promise<void> {
    this.itemCount = this.cartService.getItemCount();
    this.cartSub = this.cartService.cart$.subscribe(() => {
      this.itemCount = this.cartService.getItemCount();
    });

    this.route.data.subscribe(async (data) => {
      this.loading = true;
      this.category = data['category'] ?? 'Coffee';
      try {
        this.products = await this.productService.getProductsByCategory(this.category);
      } catch {
        this.products = [];
      } finally {
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  async addToCart(product: Product): Promise<void> {
    if (!this.guestPrompt.ensureAuthenticated()) {
      return;
    }
    this.cartService.addToCart(product);

    const toast = await this.toastCtrl.create({
      message: `Added ${product.name} to order!`,
      duration: 2200,
      position: 'bottom',
      color: 'primary',
      icon: 'checkmark-circle-outline',
      buttons: [
        {
          text: 'View Cart',
          handler: () => {
            this.router.navigateByUrl('/cart');
          },
        },
      ],
    });
    await toast.present();
  }

  openProduct(product: Product): void {
    this.router.navigate(['/product-detail', product.id]);
  }
}
