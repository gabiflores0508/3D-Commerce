import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Banner, Category, Order, OrderStatus, Product, StoreSettings } from '@/types';
import { seedProducts } from '@/data/products';
import { seedCategories } from '@/data/categories';
import { seedBanners } from '@/data/banners';
import { seedOrders } from '@/data/orders';
import { seedStoreSettings } from '@/data/storeSettings';

interface AdminDataState {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  orders: Order[];
  settings: StoreSettings;
  // Products
  addProduct: (p: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  // Categories
  addCategory: (c: Category) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  // Banners
  addBanner: (b: Banner) => void;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  removeBanner: (id: string) => void;
  // Orders
  addOrder: (o: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  // Settings
  updateSettings: (patch: Partial<StoreSettings>) => void;
  // Reset
  resetAll: () => void;
}

const initial = {
  products: seedProducts,
  categories: seedCategories,
  banners: seedBanners,
  orders: seedOrders,
  settings: seedStoreSettings,
};

export const useAdminDataStore = create<AdminDataState>()(
  persist(
    (set, get) => ({
      ...initial,
      addProduct: (p) => set({ products: [p, ...get().products] }),
      updateProduct: (id, patch) =>
        set({ products: get().products.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
      removeProduct: (id) => set({ products: get().products.filter((p) => p.id !== id) }),

      addCategory: (c) => set({ categories: [...get().categories, c] }),
      updateCategory: (id, patch) =>
        set({ categories: get().categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
      removeCategory: (id) => set({ categories: get().categories.filter((c) => c.id !== id) }),

      addBanner: (b) => set({ banners: [...get().banners, b] }),
      updateBanner: (id, patch) =>
        set({ banners: get().banners.map((b) => (b.id === id ? { ...b, ...patch } : b)) }),
      removeBanner: (id) => set({ banners: get().banners.filter((b) => b.id !== id) }),

      addOrder: (o) => set({ orders: [o, ...get().orders] }),
      updateOrderStatus: (id, status) =>
        set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) }),

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      resetAll: () => set({ ...initial }),
    }),
    { name: '3dc-admin-data' },
  ),
);
