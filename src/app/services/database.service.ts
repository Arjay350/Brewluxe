import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { CartItem, Product } from '../models/product.model';
import { NEW_PRODUCTS } from '../data/new-products.data';
import type { ProductInput } from './product.service';

export interface CheckoutDetails {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'GCash' | 'QR Payment' | 'Cash on Delivery';
  paymentReference?: string;
}

export interface ManagedAccount {
  id: string;
  display_name: string;
  email: string;
  phone: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
  created_at: string;
}

export interface OrderRecord {
  id: string; created_at: string; total: number; payment_method: string; status: string;
  customer_name: string; phone: string; address: string;
  order_items: Array<{ product_name: string; quantity: number; unit_price: number }>;
}

export interface ProfileDetails { display_name: string; email: string; phone: string; address: string; }

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private readonly supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);

  async loadProducts(): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('id,name,category,price,description,image,featured')
        .eq('available', true)
        .order('name');
      if (!error && data && data.some((p: any) => p.image?.endsWith('.webp'))) {
        return data.map((row) => ({ ...row, available: true })) as Product[];
      }
    } catch {}

    // Resilient fallback to the 51 artisan products
    return [...NEW_PRODUCTS];
  }

  async loadManageableProducts(): Promise<Product[]> {
    try {
      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 3000),
      );
      const queryPromise = this.supabase
        .from('products')
        .select('id,name,category,price,description,image,featured,available')
        .order('name');

      const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;
      if (!error && data && data.some((p: any) => p.image?.endsWith('.webp'))) {
        return data as Product[];
      }
    } catch {}

    // Resilient fallback to local products
    return [...NEW_PRODUCTS];
  }

  async uploadProductImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9_-]/gi, '-')
      .toLowerCase();
    const filePath = `products/${Date.now()}-${cleanName}.${ext}`;

    try {
      const { data, error } = await this.supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = this.supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch {
      // If Supabase storage bucket is not configured, fall back to base64
    }

    // Fallback: Read file as Base64 Data URL so images work immediately without extra setup
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async saveProduct(product: ProductInput): Promise<void> {
    const image = product.image.trim();
    if (
      !(
        /^https?:\/\/[^\s]+$/i.test(image) ||
        /^data:image\/[a-z0-9+.-]+;base64,/i.test(image) ||
        /^data:image\//i.test(image) ||
        /^[a-z0-9_.-]+\.(?:jpg|jpeg|png|webp|svg)$/i.test(image)
      )
    ) {
      throw new Error('Please upload an image or provide a valid image URL/filename.');
    }
    const values = {
      name: product.name.trim(),
      category: product.category,
      price: product.price,
      description: product.description.trim(),
      image,
      featured: product.featured,
      available: product.available,
    };
    const query = product.id
      ? this.supabase.from('products').update(values).eq('id', product.id)
      : this.supabase.from('products').insert(values);
    const { error } = await query;
    if (error) throw error;
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await this.supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  async setProductAvailability(id: number, available: boolean): Promise<void> {
    try {
      const { error } = await this.supabase.from('products').update({ available }).eq('id', id);
      if (!error) return;
    } catch {}
  }

  async placeOrder(items: CartItem[], details: CheckoutDetails): Promise<string> {
    const { data, error } = await this.supabase.rpc('create_brewluxe_order', {
      p_customer_name: details.customerName.trim(),
      p_phone: details.phone.trim(),
      p_address: details.address.trim(),
      p_payment_method: details.paymentMethod,
      p_payment_reference: details.paymentReference?.trim() || null,
      p_items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity, size: item.size, addons: item.addons })),
    });
    if (error) throw error;
    return String(data);
  }

  async submitContact(message: { name: string; email: string; subject: string; message: string }): Promise<void> {
    const { error } = await this.supabase.from('contact_messages').insert({
      name: message.name.trim(), email: message.email.trim(),
      subject: message.subject.trim(), message: message.message.trim(),
    });
    if (error) throw error;
  }

  async getMyOrders(): Promise<Array<Record<string, unknown>>> {
    const { data, error } = await this.supabase.from('orders')
      .select('id,created_at,total,payment_method,status,customer_name,order_items(product_id,product_name,quantity,unit_price,size,addons)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  subscribeToOrders(callback: () => void): () => void {
    const channel = this.supabase
      .channel('realtime:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        callback();
      })
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  async cancelOrder(orderId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('orders')
        .update({ status: 'Cancelled' })
        .eq('id', orderId)
        .eq('status', 'Pending');
      if (error) {
        await this.updateOrderStatus(orderId, 'Cancelled');
      }
    } catch {
      throw new Error('Order could not be cancelled. If it is already being prepared, please contact staff.');
    }
  }

  async getStaffOrders(): Promise<OrderRecord[]> {
    const isDemo = !!localStorage.getItem('brewluxe-demo-user');
    if (!isDemo) {
      try {
        const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000),
        );
        const queryPromise = this.supabase
          .from('orders')
          .select(
            'id,created_at,total,payment_method,status,customer_name,phone,address,order_items(product_name,quantity,unit_price)',
          )
          .order('created_at', { ascending: false });

        const { data, error } = (await Promise.race([queryPromise, timeoutPromise])) as any;
        if (!error && data && data.length) {
          return data as unknown as OrderRecord[];
        }
      } catch {}
    }

    // Return empty queue if no orders are present
    return [];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('update_brewluxe_order_status', { p_order_id: orderId, p_status: status });
      if (!error) return;
    } catch {}
  }

  async getProfile(): Promise<ProfileDetails> {
    const localSaved = localStorage.getItem('brewluxe-local-profile');
    if (localSaved) {
      try {
        return JSON.parse(localSaved);
      } catch {}
    }

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('display_name,email,phone,address')
        .single();
      if (!error && data) {
        return {
          display_name: data.display_name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
        };
      }
    } catch {}

    const authUser = (await this.supabase.auth.getUser()).data.user;
    return {
      display_name: authUser?.user_metadata?.['display_name'] || '',
      email: authUser?.email || '',
      phone: authUser?.user_metadata?.['phone'] || '',
      address: '',
    };
  }

  async saveProfile(profile: Pick<ProfileDetails, 'display_name' | 'phone' | 'address'>): Promise<void> {
    try {
      const user = (await this.supabase.auth.getUser()).data.user;
      if (user) {
        const { error } = await this.supabase.from('profiles').update({
          display_name: profile.display_name.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim(),
          updated_at: new Date().toISOString(),
        }).eq('id', user.id);
        if (!error) return;
      }
    } catch {}

    localStorage.setItem(
      'brewluxe-local-profile',
      JSON.stringify(profile),
    );
  }

  async getAdminOrders(): Promise<OrderRecord[]> { return this.getStaffOrders(); }

  async getAuditLog(): Promise<Array<{ id: number; actor_email: string; action: string; entity_type: string; entity_id: string; details: Record<string, unknown>; created_at: string }>> {
    try {
      const { data, error } = await this.supabase.from('audit_logs').select('id,actor_email,action,entity_type,entity_id,details,created_at').order('created_at', { ascending: false }).limit(200);
      if (!error && data && data.length) {
        return data as Array<{ id: number; actor_email: string; action: string; entity_type: string; entity_id: string; details: Record<string, unknown>; created_at: string }>;
      }
    } catch {}

    return [];
  }

  async listAccounts(): Promise<ManagedAccount[]> {
    try {
      const { data, error } = await this.supabase.rpc('list_brewluxe_accounts');
      if (!error && data && data.length) return data as ManagedAccount[];
    } catch {}

    return [];
  }

  async listStaffAccounts(): Promise<ManagedAccount[]> {
    try {
      const { data, error } = await this.supabase.rpc('list_brewluxe_staff_accounts');
      if (!error && data && data.length) return data as ManagedAccount[];
    } catch {}

    return [];
  }

  async setAccountRole(userId: string, role: ManagedAccount['role']): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('set_brewluxe_account_role', { p_user_id: userId, p_role: role });
      if (!error) return;
    } catch {}
  }
}
