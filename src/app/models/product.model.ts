export type ProductCategory =
  | 'Coffee'
  | 'Iced Coffee'
  | 'Frappes'
  | 'Pastries'
  | 'Shakes'
  | 'Non-Coffee';

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string;
  featured: boolean;
  available: boolean;
}

export function productImageUrl(image?: string | null): string {
  if (!image) return 'assets/shapes.svg';
  const trimmed = image.trim();
  if (/^(https?:|\/\/|data:image\/|blob:)/i.test(trimmed)) {
    return trimmed;
  }
  return `assets/images/${trimmed}`;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  addons: string[];
  sugarLevel: string;
  iceLevel: string;
}
