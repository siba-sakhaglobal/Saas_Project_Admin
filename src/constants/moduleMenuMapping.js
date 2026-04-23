import {
  Home,
  Edit3,
  Calendar,
  Users,
  Heart,
  Image,
  Settings,
  BarChart3,
  ShoppingBag,
  Shield,
  Briefcase,
  CalendarClock,
  Receipt,
  ShoppingCart,
  Truck,
  Store,
  GalleryHorizontalEnd,
  ArrowLeftRight,
} from 'lucide-react';

export const MODULE_MENU_MAP = {
  dashboard: { name: 'Dashboard', icon: Home, route: 'dashboard', alwaysVisible: true, sortOrder: 0 },
  blog: { name: 'Blog', icon: Edit3, route: 'blog', alwaysVisible: false, sortOrder: 10 },
  events: { name: 'Events', icon: Calendar, route: 'events', alwaysVisible: false, sortOrder: 20 },
  donations: { name: 'Donations', icon: Heart, route: 'donations', alwaysVisible: false, sortOrder: 30 },
  team: { name: 'Team', icon: Users, route: 'team', alwaysVisible: false, sortOrder: 40 },
  media: { name: 'Media', icon: Image, route: 'media', alwaysVisible: true, sortOrder: 50 },
  products: { name: 'Products', icon: ShoppingBag, route: 'products', alwaysVisible: false, sortOrder: 60 },
  service: { name: 'Services', icon: Briefcase, route: 'services', alwaysVisible: false, sortOrder: 65 },
  order: { name: 'Orders', icon: ShoppingCart, route: 'orders', alwaysVisible: false, sortOrder: 67 },
  invoice: { name: 'Invoices', icon: Receipt, route: 'invoices', alwaysVisible: false, sortOrder: 68 },
  appointment: { name: 'Appointments', icon: CalendarClock, route: 'appointments', alwaysVisible: false, sortOrder: 69 },
  shipment: { name: 'Shipments', icon: Truck, route: 'shipments', alwaysVisible: false, sortOrder: 70 },
  vendor: { name: 'Vendors', icon: Store, route: 'vendors', alwaysVisible: false, sortOrder: 71 },
  banner: { name: 'Banners', icon: GalleryHorizontalEnd, route: 'banners', alwaysVisible: false, sortOrder: 72 },
  transaction: { name: 'Transactions', icon: ArrowLeftRight, route: 'transactions', alwaysVisible: false, sortOrder: 73 },
  'end-users': { name: 'User Management', icon: Shield, route: 'users', alwaysVisible: false, sortOrder: 75 },
  analytics: { name: 'Analytics', icon: BarChart3, route: 'analytics', alwaysVisible: false, sortOrder: 80 },
  settings: { name: 'Settings', icon: Settings, route: 'settings', alwaysVisible: true, sortOrder: 100 },
};

export function getMenuItems(enabledModules = []) {
  const enabled = new Set(enabledModules);
  return Object.entries(MODULE_MENU_MAP)
    .filter(([key, item]) => item.alwaysVisible || enabled.has(key))
    .sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
    .map(([key, item]) => ({ key, ...item }));
}
