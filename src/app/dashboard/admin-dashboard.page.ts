import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cloudUploadOutline,
  imageOutline,
  trashOutline,
  checkmarkCircleOutline,
  linkOutline,
  refreshOutline,
  createOutline,
} from 'ionicons/icons';
import { AuthService } from '../auth/auth.service';
import { Product, ProductCategory, productImageUrl } from '../models/product.model';
import { ProductInput, ProductService, PRODUCT_CATEGORIES } from '../services/product.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-menu-button slot="start" menu="brewluxe-menu"></ion-menu-button>
        <ion-title>Admin · Products</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding admin-page">
      <main class="admin-shell">
        <p class="eyebrow">Catalog management</p>
        <h1>Manage products</h1>
        <p>Add products to Supabase, upload images, update details or pricing, feature items on Home, and delete items from the live menu.</p>
        <p class="notice" role="status" *ngIf="message" [class.error]="hasError">{{ message }}</p>

        <section class="panel editor">
          <h2>{{ editingId ? 'Edit product' : 'Add a product' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <ion-item>
              <ion-label position="stacked">Product name <span class="required">*</span></ion-label>
              <ion-input formControlName="name" maxlength="100" placeholder="e.g. Spanish Latte"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Category <span class="required">*</span></ion-label>
              <ion-select formControlName="category">
                <ion-select-option *ngFor="let category of categories" [value]="category">{{ category }}</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Price (₱) <span class="required">*</span></ion-label>
              <ion-input type="number" min="0.01" step="0.01" formControlName="price" placeholder="e.g. 140.00"></ion-input>
            </ion-item>

            <ion-item>
              <ion-label>Feature on Home</ion-label>
              <ion-select formControlName="featured">
                <ion-select-option [value]="true">Yes</ion-select-option>
                <ion-select-option [value]="false">No</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item class="full-width">
              <ion-label position="stacked">Description <span class="required">*</span></ion-label>
              <ion-textarea formControlName="description" rows="3" maxlength="600" placeholder="Briefly describe taste, roast, or ingredients..."></ion-textarea>
            </ion-item>

            <!-- Image Upload & Preview Section -->
            <div class="image-uploader-section full-width">
              <label class="section-label">Product Image <span class="required">*</span></label>

              <input
                #fileInput
                type="file"
                accept="image/png, image/jpeg, image/webp, image/jpg"
                (change)="onFileSelected($event)"
                style="display: none;"
              />

              <!-- Live Image Preview Card -->
              <div class="image-preview-box" *ngIf="currentImageValue">
                <img [src]="imageUrl(currentImageValue)" [alt]="form.get('name')?.value || 'Preview'" (error)="useImageFallback($event)" />
                <div class="preview-actions">
                  <span class="preview-tag">
                    <ion-icon name="checkmark-circle-outline"></ion-icon>
                    Image Ready
                  </span>
                  <div class="button-group">
                    <ion-button type="button" size="small" fill="outline" (click)="triggerFileInput()" [disabled]="uploadingImage">
                      <ion-icon slot="start" name="refresh-outline"></ion-icon>
                      Replace Image
                    </ion-button>
                    <ion-button type="button" size="small" color="danger" fill="outline" (click)="clearImage()" [disabled]="uploadingImage">
                      <ion-icon slot="start" name="trash-outline"></ion-icon>
                      Remove
                    </ion-button>
                  </div>
                </div>
              </div>

              <!-- Upload Dropzone when no image is selected -->
              <div
                class="upload-dropzone"
                *ngIf="!currentImageValue"
                (click)="triggerFileInput()"
                [class.is-uploading]="uploadingImage"
              >
                <div class="dropzone-content" *ngIf="!uploadingImage">
                  <div class="upload-icon-circle">
                    <ion-icon name="cloud-upload-outline"></ion-icon>
                  </div>
                  <strong>Click to upload product image</strong>
                  <span>Supports PNG, JPG, JPEG, WEBP</span>
                </div>
                <div class="dropzone-content uploading" *ngIf="uploadingImage">
                  <ion-spinner name="crescent"></ion-spinner>
                  <strong>Processing & saving image…</strong>
                </div>
              </div>

              <!-- Manual URL / filename input toggle -->
              <div class="manual-url-wrap">
                <button type="button" class="toggle-link-btn" (click)="showManualInput = !showManualInput">
                  <ion-icon name="link-outline"></ion-icon>
                  {{ showManualInput ? 'Hide manual image URL' : 'Or paste an image URL / existing filename' }}
                </button>
                <ion-item *ngIf="showManualInput" class="manual-input-item">
                  <ion-label position="stacked">Image URL or filename</ion-label>
                  <ion-input formControlName="image" placeholder="https://... or americano.jpg"></ion-input>
                </ion-item>
              </div>
            </div>

            <div class="actions">
              <ion-button type="submit" [disabled]="saving || uploadingImage">
                {{ saving ? 'Saving…' : (editingId ? 'Update product' : 'Add product') }}
              </ion-button>
              <ion-button type="button" fill="outline" *ngIf="editingId" (click)="resetForm()">
                Cancel edit
              </ion-button>
            </div>
          </form>
        </section>

        <section class="catalog">
          <h2>Current catalog <span>({{ products.length }})</span></h2>
          <p *ngIf="loading">Loading products…</p>
          <p *ngIf="!loading && !products.length">No products yet. Add one above.</p>
          <article class="product-row" *ngFor="let product of products">
            <img [src]="imageUrl(product.image)" [alt]="product.name" (error)="useImageFallback($event)" />
            <div class="product-meta">
              <strong>{{ product.name }}</strong>
              <span>{{ product.category }} · ₱{{ product.price }}</span>
              <small>{{ product.available ? 'Available' : 'Hidden from customers' }}{{ product.featured ? ' · Featured' : '' }}</small>
            </div>
            <div class="row-actions">
              <ion-button
                size="small"
                fill="outline"
                class="catalog-btn catalog-edit-btn"
                (click)="edit(product)"
                aria-label="Edit product"
              >
                <ion-icon slot="start" name="create-outline"></ion-icon>
                Edit
              </ion-button>
              <ion-button
                size="small"
                color="danger"
                fill="outline"
                class="catalog-btn catalog-delete-btn"
                (click)="remove(product)"
                aria-label="Delete product"
              >
                <ion-icon slot="start" name="trash-outline"></ion-icon>
                Delete
              </ion-button>
            </div>
          </article>
        </section>
      </main>
    </ion-content>
  `,
  styles: [`
    .admin-page {
      --background: #f7f1ea;
    }
    .admin-shell {
      max-width: 1000px;
      margin: 1rem auto;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #765a46;
      font-weight: 700;
    }
    h1 {
      color: #30241d;
      font-size: clamp(2rem, 5vw, 3rem);
    }
    .panel, .product-row {
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 10px 24px #30241d10;
    }
    .editor {
      padding: 1.5rem;
      margin: 1rem 0 2rem;
    }
    .editor form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.8rem;
    }
    .editor ion-item {
      --background: #faf7f3;
      border-radius: 12px;
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .section-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #65564b;
      margin-bottom: 0.4rem;
    }
    .required {
      color: #dc2626;
      font-weight: 700;
      margin-left: 2px;
    }
    .image-uploader-section {
      background: #faf7f3;
      border-radius: 16px;
      padding: 1rem;
      border: 1px solid rgba(48, 36, 29, 0.08);
    }
    .upload-dropzone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      border: 2px dashed rgba(48, 36, 29, 0.25);
      border-radius: 14px;
      background: #fff;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .upload-dropzone:hover {
      border-color: #30241d;
      background: #fdfbf9;
    }
    .upload-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: rgba(48, 36, 29, 0.08);
      display: grid;
      place-items: center;
      margin-bottom: 0.6rem;
      font-size: 1.6rem;
      color: #30241d;
    }
    .dropzone-content strong {
      display: block;
      color: #30241d;
      font-size: 0.95rem;
      margin-bottom: 0.2rem;
    }
    .dropzone-content span {
      font-size: 0.78rem;
      color: #837265;
    }
    .image-preview-box {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      padding: 1rem;
      background: #fff;
      border-radius: 14px;
      border: 1px solid rgba(48, 36, 29, 0.12);
    }
    .image-preview-box img {
      width: 90px;
      height: 90px;
      object-fit: cover;
      border-radius: 12px;
      background: #f0eae1;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    .preview-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .preview-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #2e663a;
    }
    .button-group {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .manual-url-wrap {
      margin-top: 0.6rem;
    }
    .toggle-link-btn {
      background: none;
      border: none;
      color: #65564b;
      font-size: 0.82rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0;
      text-decoration: underline;
    }
    .manual-input-item {
      margin-top: 0.4rem;
      --background: #fff;
    }
    .actions {
      grid-column: 1 / -1;
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 0.6rem;
    }
    ion-button:not([fill="outline"]) {
      --background: var(--brew-espresso, #30241d);
      --color: #ffffff;
      --border-radius: 12px;
    }
    ion-button[fill="outline"] {
      --background: transparent;
      --border-radius: 12px;
      --border-color: var(--brew-caramel, #c4783c);
      --color: var(--brew-espresso, #2c1e16);
    }
    .catalog h2 span {
      font-size: 0.9rem;
      color: #78685d;
    }
    .product-row {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.7rem;
      margin: 0.6rem 0;
    }
    .product-row img {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 12px;
      background: #eee;
    }
    .product-meta {
      display: grid;
      gap: 0.2rem;
      flex: 1;
    }
    .product-meta span, .product-meta small {
      color: #65564b;
    }
    .row-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;

      .catalog-btn {
        min-height: 44px;
        min-width: 44px;
        font-weight: 700;
        font-size: 0.85rem;
        letter-spacing: 0.02em;

        &:focus-visible {
          outline: 2px solid var(--brew-caramel, #c4783c);
          outline-offset: 2px;
        }
      }

      .catalog-edit-btn {
        --color: var(--brew-espresso, #2c1e16);
        --border-color: var(--brew-caramel, #c4783c);
        --background: #ffffff;
        --background-hover: var(--brew-surface-sunken, #f8f4ee);
        --border-width: 1.5px;

        ion-icon {
          font-size: 1rem;
          color: var(--brew-caramel, #c4783c);
        }
      }

      .catalog-delete-btn {
        --border-width: 1.5px;
        min-height: 44px;
        min-width: 44px;

        ion-icon {
          font-size: 1rem;
        }
      }
    }
    .notice {
      padding: 0.8rem;
      border-radius: 12px;
      background: #edf5ec;
    }
    .error {
      color: #a3251c;
      background: #fff0ee;
    }
    @media (max-width: 600px) {
      .editor form {
        grid-template-columns: 1fr;
      }
      .actions {
        grid-column: auto;
      }
      .product-row {
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .row-actions {
        margin-left: 72px;
      }
      .image-preview-box {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
})
export class AdminDashboardPage implements OnInit {
  @ViewChild('fileInput') fileInputRef?: ElementRef<HTMLInputElement>;

  readonly categories = PRODUCT_CATEGORIES;
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    category: ['Coffee' as ProductCategory, Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    description: ['', [Validators.required, Validators.maxLength(600)]],
    image: ['', [Validators.required]],
    featured: [false, Validators.required],
  });

  products: Product[] = [];
  loading = true;
  saving = false;
  uploadingImage = false;
  showManualInput = false;
  editingId?: number;
  message = '';
  hasError = false;

  get currentImageValue(): string {
    return this.form.get('image')?.value || '';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly productsApi: ProductService,
    private readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    addIcons({
      cloudUploadOutline,
      imageOutline,
      trashOutline,
      checkmarkCircleOutline,
      linkOutline,
      refreshOutline,
      createOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.cdr.detectChanges();
    try {
      this.products = await this.productsApi.loadManageableProducts();
      this.hasError = false;
    } catch {
      this.message = 'Could not load the Supabase catalog. Apply the database setup and check your admin role.';
      this.hasError = true;
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  triggerFileInput(): void {
    this.fileInputRef?.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting the same file fires change event
    target.value = '';

    if (!file.type.startsWith('image/')) {
      this.message = 'Please select a valid image file (PNG, JPG, JPEG, WEBP).';
      this.hasError = true;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.message = 'The selected image is larger than 5MB. Please choose a smaller file.';
      this.hasError = true;
      return;
    }

    this.uploadingImage = true;
    this.message = '';

    try {
      const uploadedUrl = await this.productsApi.uploadProductImage(file);
      this.form.patchValue({ image: uploadedUrl });
      this.hasError = false;
      this.message = 'Image attached successfully.';
    } catch (error) {
      this.hasError = true;
      this.message = error instanceof Error ? error.message : 'Could not upload the selected image.';
    } finally {
      this.uploadingImage = false;
      this.cdr.detectChanges();
    }
  }

  clearImage(): void {
    this.form.patchValue({ image: '' });
  }

  edit(product: Product): void {
    this.editingId = product.id;
    this.form.setValue({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      image: product.image,
      featured: product.featured,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.editingId = undefined;
    this.form.reset({
      name: '',
      category: 'Coffee',
      price: 0,
      description: '',
      image: '',
      featured: false,
    });
    this.showManualInput = false;
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.hasError = true;
      this.message = 'Please fill out all required fields and provide a product image.';
      return;
    }

    this.saving = true;
    this.message = '';
    this.cdr.detectChanges();

    try {
      const values = this.form.getRawValue();
      const product: ProductInput = {
        ...values,
        ...(this.editingId ? { id: this.editingId } : {}),
        price: Number(values.price),
        available: true,
      };

      await this.productsApi.saveProduct(product);
      this.message = this.editingId ? 'Product updated.' : 'Product added to the live menu.';
      this.hasError = false;
      this.resetForm();
      await this.refresh();
    } catch (error) {
      this.message = error instanceof Error ? error.message : 'Could not save this product.';
      this.hasError = true;
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  async remove(product: Product): Promise<void> {
    if (!window.confirm(`Delete ${product.name} from the catalog?`)) return;
    try {
      await this.productsApi.deleteProduct(product.id);
      this.message = `${product.name} was deleted.`;
      this.hasError = false;
      await this.refresh();
    } catch (error) {
      this.message = error instanceof Error ? error.message : 'Could not delete this product.';
      this.hasError = true;
    } finally {
      this.cdr.detectChanges();
    }
  }

  useImageFallback(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/shapes.svg';
  }

  imageUrl(image: string): string {
    return productImageUrl(image);
  }

  logout(): void {
    void this.auth.logout().finally(() => window.location.assign('/login'));
  }
}

