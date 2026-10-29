import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase.client';
import { CartItem, Product } from '../models/product.model';
import type { ProductInput } from './product.service';
import { AuthService } from '../auth/auth.service';

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
  is_banned?: boolean;
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
  private readonly supabase: SupabaseClient = supabase;

  constructor(private readonly auth: AuthService) {}

  async loadProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id,name,category,price,description,image,featured,available')
      .eq('available', true)
      .order('name');
    if (error) throw error;
    return (data ?? []).map((row) => ({ ...row, available: true })) as Product[];
  }

  async loadManageableProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id,name,category,price,description,image,featured,available')
      .order('name');
    if (error) throw error;
    return (data ?? []) as Product[];
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id,name,category,price,description,image,featured,available')
      .eq('id', id)
      .eq('available', true)
      .maybeSingle();
    if (error) throw error;
    return data as Product | null ?? undefined;
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
    const { error } = await this.supabase.from('products').update({ available }).eq('id', id);
    if (error) throw error;
  }

  async placeOrder(items: CartItem[], details: CheckoutDetails): Promise<string> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const { data, error } = await this.supabase.rpc('create_brewluxe_order', {
      p_customer_name: details.customerName.trim(),
      p_phone: details.phone.trim(),
      p_address: details.address.trim(),
      p_payment_method: details.paymentMethod,
      p_payment_reference: details.paymentReference?.trim() || null,
      p_items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size || 'Regular',
        addons: item.addons || [],
      })),
      }).abortSignal(controller.signal);
      if (error) {
        if (controller.signal.aborted) {
          throw new Error('Order saving timed out. Check My Orders before submitting again; the save may still have completed.');
        }
        throw error;
      }
      return String(data);
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('Order saving timed out. Check My Orders before submitting again; the save may still have completed.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async submitContact(message: { name: string; email: string; subject: string; message: string }): Promise<void> {
    const { error } = await this.supabase.from('contact_messages').insert({
      name: message.name.trim(), email: message.email.trim(),
      subject: message.subject.trim(), message: message.message.trim(),
    });
    if (error) throw error;
  }

  async getMyOrders(): Promise<Array<Record<string, unknown>>> {
    const slowMessage = 'Order history took too long to load. Check your connection and retry.';
    const controller = new AbortController();
    let timeout: number | undefined;

    // One hard deadline for the WHOLE load (session lookup + query). Aborting the
    // request alone cannot free a stalled auth lock, so the race below is what
    // guarantees the page leaves its loading skeleton and shows an error + retry.
    const deadline = new Promise<never>((_, reject) => {
      timeout = window.setTimeout(() => {
        controller.abort();
        reject(new Error(slowMessage));
      }, 15000);
    });

    const load = async (): Promise<Array<Record<string, unknown>>> => {
      // Ask the shared client for the live session first; the cached profile user
      // can still be null for a moment right after sign-in or a page refresh.
      const { data: sessionData } = await this.supabase.auth.getSession();
      const userId = sessionData.session?.user.id ?? this.auth.getCurrentUser()?.id;
      if (!userId) return [];

      const { data, error } = await this.supabase.from('orders')
        .select('id,created_at,total,payment_method,status,customer_name,order_items(product_id,product_name,quantity,unit_price,size,addons)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .abortSignal(controller.signal);
      if (error) {
        if (controller.signal.aborted) throw new Error(slowMessage);
        console.error('[Brewluxe] Order history query failed:', error);
        throw error;
      }
      return data ?? [];
    };

    try {
      return await Promise.race([load(), deadline]);
    } finally {
      window.clearTimeout(timeout);
    }
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
    const { error } = await this.supabase.rpc('cancel_brewluxe_customer_order', { p_order_id: orderId });
    if (error) throw error;
  }

  async getStaffOrders(): Promise<OrderRecord[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('id,created_at,total,payment_method,status,customer_name,phone,address,order_items(product_name,quantity,unit_price)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as OrderRecord[];
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const { error } = await this.supabase.rpc('update_brewluxe_order_status', { p_order_id: orderId, p_status: status });
    if (error) throw error;
  }

  async getProfile(): Promise<ProfileDetails> {
    const { data: authData, error: authError } = await this.supabase.auth.getUser();
    if (authError) throw authError;
    const authUser = authData.user;
    if (!authUser) throw new Error('Please sign in to view your profile.');
    const { data, error } = await this.supabase
      .from('profiles')
      .select('display_name,email,phone,address')
      .eq('id', authUser.id)
      .single();
    if (error) throw error;
    return {
      display_name: data.display_name ?? '',
      email: data.email ?? authUser.email ?? '',
      phone: data.phone ?? '',
      address: data.address ?? '',
    };
  }

  async saveProfile(profile: Pick<ProfileDetails, 'display_name' | 'phone' | 'address'>): Promise<void> {
    const { data: authData, error: authError } = await this.supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error('Please sign in to update your profile.');
    const { error } = await this.supabase.from('profiles').update({
      display_name: profile.display_name.trim(),
      phone: profile.phone.trim(),
      address: profile.address.trim(),
      updated_at: new Date().toISOString(),
    }).eq('id', authData.user.id);
    if (error) throw error;
  }

  async getAdminOrders(): Promise<OrderRecord[]> { return this.getStaffOrders(); }

  async getAuditLog(): Promise<Array<{ id: number; actor_email: string; action: string; entity_type: string; entity_id: string; details: Record<string, unknown>; created_at: string }>> {
    const { data, error } = await this.supabase.from('audit_logs').select('id,actor_email,action,entity_type,entity_id,details,created_at').order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    return (data ?? []) as Array<{ id: number; actor_email: string; action: string; entity_type: string; entity_id: string; details: Record<string, unknown>; created_at: string }>;
  }

  async listAccounts(): Promise<ManagedAccount[]> {
    const { data, error } = await this.supabase.rpc('list_brewluxe_accounts');
    if (error) throw error;
    return (data ?? []) as ManagedAccount[];
  }

  async listStaffAccounts(): Promise<ManagedAccount[]> {
    const { data, error } = await this.supabase.rpc('list_brewluxe_staff_accounts');
    if (error) throw error;
    return (data ?? []) as ManagedAccount[];
  }

  async setAccountRole(userId: string, role: ManagedAccount['role']): Promise<void> {
    const { error } = await this.supabase.rpc('set_brewluxe_account_role', { p_user_id: userId, p_role: role });
    if (error) throw error;
  }

  async setAccountBan(userId: string, banned: boolean): Promise<void> {
    const { error } = await this.supabase.rpc('set_brewluxe_account_ban', { p_user_id: userId, p_banned: banned });
    if (error) {
      if (error.code === 'PGRST202' || error.message?.includes('not find the function')) {
        throw new Error('Please run supabase/fixes/005_account_ban_and_delete.sql in your Supabase SQL Editor to install the ban function.');
      }
      throw error;
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    const { error } = await this.supabase.rpc('delete_brewluxe_account', { p_user_id: userId });
    if (error) {
      if (error.code === 'PGRST202' || error.message?.includes('not find the function')) {
        throw new Error('Please run supabase/fixes/005_account_ban_and_delete.sql in your Supabase SQL Editor to install the delete function.');
      }
      throw error;
    }
  }
}
