import { Routes } from '@angular/router';
import { authGuard, loginGuard, roleGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
    canActivate: [loginGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then((m) => m.RegisterPage),
    canActivate: [loginGuard],
  },
  {
    path: 'admin',
    loadComponent: () => import('./dashboard/admin-overview.page').then((m) => m.AdminOverviewPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./dashboard/admin-dashboard.page').then((m) => m.AdminDashboardPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
  },
  {
    path: 'admin/accounts',
    loadComponent: () => import('./dashboard/staff-accounts.page').then((m) => m.StaffAccountsPage),
    canActivate: [authGuard, roleGuard],
    data: { role: ['ADMIN', 'SUPER_ADMIN'] },
  },
  {
    path: 'super-admin',
    loadComponent: () => import('./dashboard/super-admin-dashboard.page').then((m) => m.SuperAdminDashboardPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'SUPER_ADMIN' },
  },
  {
    path: 'employee',
    loadComponent: () => import('./dashboard/employee-dashboard.page').then((m) => m.EmployeeDashboardPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'EMPLOYEE' },
  },
  {
    path: 'customer',
    redirectTo: '/profile',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    loadComponent: () => import('./dashboard/profile.page').then((m) => m.ProfilePage),
    canActivate: [authGuard, roleGuard],
    data: { role: ['CUSTOMER', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'] },
  },
  {
    path: 'staff/orders',
    loadComponent: () => import('./orders/staff-orders.page').then((m) => m.StaffOrdersPage),
    canActivate: [authGuard, roleGuard],
    data: { role: ['EMPLOYEE', 'ADMIN'] },
  },
  {
    path: 'super-admin/overview',
    loadComponent: () => import('./dashboard/admin-overview.page').then((m) => m.AdminOverviewPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'SUPER_ADMIN' },
  },
  {
    path: 'super-admin/audit',
    loadComponent: () => import('./dashboard/audit-log.page').then((m) => m.AuditLogPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'SUPER_ADMIN' },
  },
  {
    path: 'customer-home',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'menu',
    loadComponent: () => import('./menu/menu.page').then((m) => m.MenuPage),
  },
  {
    path: 'coffee',
    loadComponent: () => import('./category/category.page').then((m) => m.CategoryPage),
    data: { category: 'Coffee' },
  },
  {
    path: 'iced-coffee',
    loadComponent: () => import('./category/category.page').then((m) => m.CategoryPage),
    data: { category: 'Iced Coffee' },
  },
  {
    path: 'non-coffee',
    loadComponent: () => import('./category/category.page').then((m) => m.CategoryPage),
    data: { category: 'Non-Coffee' },
  },
  {
    path: 'milk-tea',
    loadComponent: () => import('./category/category.page').then((m) => m.CategoryPage),
    data: { category: 'Milk Tea' },
  },
  {
    path: 'frappes',
    loadComponent: () => import('./category/category.page').then((m) => m.CategoryPage),
    data: { category: 'Frappes' },
  },
  {
    path: 'shakes',
    loadComponent: () => import('./category/category.page').then((m) => m.CategoryPage),
    data: { category: 'Shakes' },
  },
  {
    path: 'pastries',
    loadComponent: () => import('./category/category.page').then((m) => m.CategoryPage),
    data: { category: 'Pastries' },
  },
  {
    path: 'category/:category',
    redirectTo: (route) => `/menu?category=${route.params['category']}`,
  },
  {
    path: 'product-detail/:id',
    loadComponent: () => import('./product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.page').then((m) => m.CartPage),
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    loadComponent: () => import('./checkout/checkout.page').then((m) => m.CheckoutPage),
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/orders.page').then((m) => m.OrdersPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'CUSTOMER' },
  },
  {
    path: 'about-products',
    loadComponent: () => import('./info/info.page').then((m) => m.InfoPage),
    data: { page: 'products' },
  },
  {
    path: 'about-app',
    loadComponent: () => import('./info/info.page').then((m) => m.InfoPage),
    data: { page: 'app' },
  },
  {
    path: 'developers',
    loadComponent: () => import('./about-us/about-us.page').then((m) => m.AboutUsPage),
  },
  {
    path: 'faq',
    loadComponent: () => import('./faq/faq.page').then((m) => m.FaqPage),
  },
  {
    path: 'about-us',
    loadComponent: () => import('./about-us/about-us.page').then((m) => m.AboutUsPage),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.page').then((m) => m.ContactPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
