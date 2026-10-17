import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonSearchbar,
  IonBadge,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bag,
  cafe,
  chevronForward,
  leaf,
  people,
  sparkles,
  star,
  storefront,
  cartOutline,
  timeOutline,
  locationOutline,
  callOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  searchOutline,
  addOutline,
  heartOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { WeatherRecommendation, WeatherService } from '../services/weather.service';
import { GuestPromptService } from '../services/guest-prompt.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonBadge,
  ],
})
export class HomePage implements OnInit, OnDestroy {
  allProducts: Product[] = [];
  featuredProducts: Product[] = [];
  search = '';
  productError = '';
  loading = true;
  itemCount = 0;
  categories = ['Coffee', 'Iced Coffee', 'Frappes', 'Pastries', 'Shakes', 'Non-Coffee'];
  weather: WeatherRecommendation | null = null;

  private cartSub?: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private weatherService: WeatherService,
    private toastCtrl: ToastController,
    private router: Router,
    private guestPrompt: GuestPromptService,
  ) {
    addIcons({
      bag,
      cafe,
      chevronForward,
      leaf,
      people,
      sparkles,
      star,
      storefront,
      cartOutline,
      timeOutline,
      locationOutline,
      callOutline,
      arrowForwardOutline,
      checkmarkCircleOutline,
      searchOutline,
      addOutline,
      heartOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.itemCount = this.cartService.getItemCount();
    this.cartSub = this.cartService.cart$.subscribe(() => {
      this.itemCount = this.cartService.getItemCount();
    });

    try {
      this.allProducts = await this.productService.loadProducts();
      this.featuredProducts = this.allProducts.filter((product) => product.featured).slice(0, 8);
    } catch {
      this.productError = 'Products could not be loaded. Please check your connection and try again.';
    } finally {
      this.loading = false;
    }

    try {
      this.weather = await this.weatherService.getWeatherRecommendation();
    } catch {
      // Graceful fallback if weather fails to load
    }
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
  }

  filterByWeather(): void {
    if (this.weather) {
      this.router.navigate(['/menu'], {
        queryParams: { category: this.weather.recommendedCategory },
      });
    }
  }

  get visibleProducts(): Product[] {
    const query = this.search.trim().toLowerCase();
    return (
      query
        ? this.allProducts.filter((product) =>
            `${product.name} ${product.category} ${product.description}`
              .toLowerCase()
              .includes(query),
          )
        : this.featuredProducts
    ).slice(0, 8);
  }

  async addToCart(product: Product): Promise<void> {
    if (!this.guestPrompt.ensureAuthenticated()) {
      return;
    }
    this.cartService.addToCart(product);

    const toast = await this.toastCtrl.create({
      message: `Added ${product.name} to your order!`,
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
