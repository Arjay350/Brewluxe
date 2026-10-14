import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabasePublishableKey,
  );
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) void this.loadAuthUser(session.user);
      else this.currentUserSubject.next(null);
    });
  }

  async initialize(): Promise<void> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      this.currentUserSubject.next(null);
      return;
    }
    if (data.session?.user) await this.loadAuthUser(data.session.user);
    else this.currentUserSubject.next(null);
  }

  async login(email: string, password: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    // Standard Supabase login for real registered accounts
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) throw error;
    if (data.user) await this.loadAuthUser(data.user);
  }

  async register(
    email: string,
    password: string,
    displayName: string,
    phone: string,
  ): Promise<boolean> {
    const { data, error } = await this.supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          phone: phone.trim(),
          role: 'CUSTOMER',
        },
      },
    });
    if (error) throw error;
    if (data.session && data.user) await this.loadAuthUser(data.user);
    return !!data.session;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('brewluxe-demo-user');
    const { error } = await this.supabase.auth.signOut();
    if (error) await this.supabase.auth.signOut({ scope: 'local' });
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getCurrentRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getDashboardForRole(role: UserRole): string {
    if (role === 'SUPER_ADMIN') return '/super-admin/overview';
    if (role === 'ADMIN') return '/admin';
    if (role === 'EMPLOYEE') return '/staff/orders';
    return '/home';
  }

  private async loadAuthUser(user: User): Promise<void> {
    const metadata = user.user_metadata ?? {};
    const { data } = await this.supabase
      .from('profiles')
      .select('role,phone,display_name')
      .eq('id', user.id)
      .maybeSingle();

    const profileRole = data?.['role'];
    const userModel: AuthUser = {
      id: user.id,
      username:
        (metadata['username'] as string) ||
        user.email?.split('@')[0] ||
        'customer',
      email: user.email ?? '',
      phone:
        (data?.['phone'] as string) || (metadata['phone'] as string) || '',
      role:
        profileRole === 'SUPER_ADMIN' ||
        profileRole === 'ADMIN' ||
        profileRole === 'EMPLOYEE'
          ? profileRole
          : 'CUSTOMER',
      displayName:
        (data?.['display_name'] as string) ||
        (metadata['display_name'] as string) ||
        user.email?.split('@')[0] ||
        'Customer',
    };
    this.currentUserSubject.next(userModel);
  }
}
