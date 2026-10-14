import { UserRole } from '../auth/auth.service';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  allowedRoles: (UserRole | 'GUEST')[];
  badgeKey?: 'cart';
  action?: 'logout';
  children?: NavItem[];
}

const customer: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', path: '/home', allowedRoles: ['CUSTOMER'] },
  { id: 'menu', label: 'Menu', icon: 'cafe-outline', path: '/menu', allowedRoles: ['CUSTOMER'] },
  { id: 'cart', label: 'Cart', icon: 'cart-outline', path: '/cart', allowedRoles: ['CUSTOMER'], badgeKey: 'cart' },
  { id: 'orders', label: 'My Orders', icon: 'receipt-outline', path: '/orders', allowedRoles: ['CUSTOMER'] },
  { id: 'payment', label: 'Payment & Checkout', icon: 'card-outline', path: '/checkout', allowedRoles: ['CUSTOMER'] },
  { id: 'profile', label: 'Profile', icon: 'person-circle-outline', path: '/profile', allowedRoles: ['CUSTOMER'] },
  {
    id: 'about',
    label: 'About Brewluxe',
    icon: 'information-circle-outline',
    allowedRoles: ['CUSTOMER'],
    children: [
      { id: 'history', label: 'Company History & Team', icon: 'people-outline', path: '/about-us', allowedRoles: ['CUSTOMER'] },
      { id: 'about-products', label: 'About Our Products', icon: 'cafe-outline', path: '/about-products', allowedRoles: ['CUSTOMER'] },
      { id: 'about-app', label: 'About the App', icon: 'phone-portrait-outline', path: '/about-app', allowedRoles: ['CUSTOMER'] },
    ],
  },
  {
    id: 'help',
    label: 'Help & Contact',
    icon: 'help-circle-outline',
    allowedRoles: ['CUSTOMER'],
    children: [
      { id: 'faq', label: 'FAQ & Chatbot', icon: 'help-circle-outline', path: '/faq', allowedRoles: ['CUSTOMER'] },
      { id: 'contact', label: 'Contact Us', icon: 'mail-outline', path: '/contact', allowedRoles: ['CUSTOMER'] },
    ],
  },
];

const staff: NavItem[] = [
  { id: 'queue', label: 'Order Queue', icon: 'receipt-outline', path: '/staff/orders', allowedRoles: ['EMPLOYEE'] },
  { id: 'availability', label: 'Product Availability', icon: 'cube-outline', path: '/employee', allowedRoles: ['EMPLOYEE'] },
  { id: 'profile', label: 'Profile', icon: 'person-circle-outline', path: '/profile', allowedRoles: ['EMPLOYEE'] },
  {
    id: 'about',
    label: 'About Brewluxe',
    icon: 'information-circle-outline',
    allowedRoles: ['EMPLOYEE'],
    children: [
      { id: 'history', label: 'Company History & Team', icon: 'people-outline', path: '/about-us', allowedRoles: ['EMPLOYEE'] },
      { id: 'about-products', label: 'About Our Products', icon: 'cafe-outline', path: '/about-products', allowedRoles: ['EMPLOYEE'] },
      { id: 'about-app', label: 'About the App', icon: 'phone-portrait-outline', path: '/about-app', allowedRoles: ['EMPLOYEE'] },
    ],
  },
];

const admin: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: 'home-outline', path: '/admin', allowedRoles: ['ADMIN', 'SUPER_ADMIN'] },
  { id: 'orders', label: 'Orders Queue', icon: 'receipt-outline', path: '/staff/orders', allowedRoles: ['ADMIN', 'SUPER_ADMIN'] },
  { id: 'products', label: 'Products Catalog', icon: 'cafe-outline', path: '/admin/products', allowedRoles: ['ADMIN', 'SUPER_ADMIN'] },
  { id: 'accounts', label: 'Staff Accounts', icon: 'people-outline', path: '/admin/accounts', allowedRoles: ['ADMIN', 'SUPER_ADMIN'] },
  { id: 'profile', label: 'Profile', icon: 'person-circle-outline', path: '/profile', allowedRoles: ['ADMIN', 'SUPER_ADMIN'] },
];

const superAdmin: NavItem[] = [
  { id: 'overview', label: 'System Overview', icon: 'home-outline', path: '/super-admin/overview', allowedRoles: ['SUPER_ADMIN'] },
  { id: 'accounts', label: 'Accounts & Roles', icon: 'people-outline', path: '/super-admin', allowedRoles: ['SUPER_ADMIN'] },
  { id: 'audit', label: 'Audit Log', icon: 'document-text-outline', path: '/super-admin/audit', allowedRoles: ['SUPER_ADMIN'] },
  { id: 'profile', label: 'Profile', icon: 'person-circle-outline', path: '/profile', allowedRoles: ['SUPER_ADMIN'] },
];

const logout: NavItem = {
  id: 'logout',
  label: 'Log Out',
  icon: 'log-out-outline',
  action: 'logout',
  allowedRoles: ['CUSTOMER', 'EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'],
};

const guest: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home-outline', path: '/home', allowedRoles: ['GUEST'] },
  { id: 'menu', label: 'Menu', icon: 'cafe-outline', path: '/menu', allowedRoles: ['GUEST'] },
  { id: 'history', label: 'Company History & Team', icon: 'people-outline', path: '/about-us', allowedRoles: ['GUEST'] },
  { id: 'about-products', label: 'About Our Products', icon: 'cafe-outline', path: '/about-products', allowedRoles: ['GUEST'] },
  { id: 'about-app', label: 'About the App', icon: 'phone-portrait-outline', path: '/about-app', allowedRoles: ['GUEST'] },
  { id: 'faq', label: 'FAQ & Chatbot', icon: 'help-circle-outline', path: '/faq', allowedRoles: ['GUEST'] },
  { id: 'contact', label: 'Contact Us', icon: 'mail-outline', path: '/contact', allowedRoles: ['GUEST'] },
  { id: 'login', label: 'Log In / Register', icon: 'person-circle-outline', path: '/login', allowedRoles: ['GUEST'] },
];

export const SIDEBAR_CONFIG_BY_ROLE: Record<UserRole | 'GUEST', NavItem[]> = {
  CUSTOMER: [...customer, logout],
  EMPLOYEE: [...staff, logout],
  ADMIN: [...admin, logout],
  SUPER_ADMIN: [...superAdmin, ...admin.filter((item) => ['orders', 'products'].includes(item.id)), logout],
  GUEST: guest,
};

export function getSidebarNavigation(role: UserRole | null | undefined): NavItem[] {
  return role ? SIDEBAR_CONFIG_BY_ROLE[role] : guest;
}
