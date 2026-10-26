import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  IonSearchbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cartOutline,
  searchOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  optionsOutline,
  arrowForwardOutline,
  sparklesOutline,
  chevronForward,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Product } from '../models/product.model';
import { CartService } from '../services/cart.service';
import { GuestPromptService } from '../services/guest-prompt.service';
import { ProductService } from '../services/product.service';
import { WeatherRecommendation, WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
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
    IonBadge,
    IonSearchbar,
  ],
})
export class MenuPage implements OnInit, OnDestroy {
  selectedCategory = 'All';
  searchQuery = '';
  categories = ['All', 'Coffee', 'Iced Coffee', 'Frappes', 'Pastries', 'Shakes', 'Non-Coffee'];
  products: Product[] = [];
  weather: WeatherRecommendation | null = null;
  productError = '';
  loading = true;
  itemCount = 0;

  private cartSub?: Subscription;
  private routeSub?: Subscription;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private weatherService: WeatherService,
    private guestPrompt: GuestPromptService,
  ) {
    addIcons({
      addOutline,
      cartOutline,
      searchOutline,
      closeCircleOutline,
      checkmarkCircleOutline,
      optionsOutline,
      arrowForwardOutline,
      sparklesOutline,
      chevronForward,
    });
  }

  async ngOnInit(): Promise<void> {
    this.itemCount = this.cartService.getItemCount();
    this.cartSub = this.cartService.cart$.subscribe(() => {
      this.itemCount = this.cartService.getItemCount();
    });

    this.routeSub = this.route.queryParams.subscribe((params) => {
      if (params['category'] && this.categories.includes(params['category'])) {
        this.selectedCategory = params['category'];
      }
    });

    // Fetch weather asynchronously in background without blocking product rendering
    this.weatherService
      .getWeatherRecommendation()
      .then((weather) => {
        this.weather = weather;
      })
      .catch(() => {
        // Graceful fallback if weather fails to load
      });

    try {
      this.products = await this.productService.loadProducts();
    } catch {
      this.productError = 'Products could not be loaded. Please check your connection and try again.';
    } finally {
      this.loading = false;
    }
  }

  filterByWeather(): void {
    if (this.weather) {
      this.selectedCategory = this.weather.recommendedCategory;
      this.searchQuery = '';
    }
  }

  ngOnDestroy(): void {
    this.cartSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  get visibleProducts(): Product[] {
    let list =
      this.selectedCategory === 'All'
        ? this.products
        : this.products.filter((product) => product.category === this.selectedCategory);

    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query),
      );
    }
    return list;
  }

  getCategoryCount(category: string): number {
    if (category === 'All') return this.products.length;
    return this.products.filter((p) => p.category === category).length;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  resetFilters(): void {
    this.selectedCategory = 'All';
    this.searchQuery = '';
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
    this.router.navigate(['/product-detail', product.id], { state: { product } });
  }
}
