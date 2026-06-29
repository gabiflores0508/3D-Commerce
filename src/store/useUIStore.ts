import { create } from 'zustand';

interface UIState {
  cartOpen: boolean;
  mobileMenuOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setMobileMenuOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
}));
