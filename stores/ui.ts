import { create } from 'zustand';

type CartView = 'cart' | 'checkout';

interface UIStore {
  // Drawer open/close
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Drawer view (cart items vs checkout form)
  cartView: CartView;
  setCartView: (view: CartView) => void;

  // Helper: open drawer and show specific view
  openCartToCheckout: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCartOpen: false,
  openCart: () => set({ isCartOpen: true, cartView: 'cart' }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  cartView: 'cart',
  setCartView: (view) => set({ cartView: view }),

  openCartToCheckout: () => set({ isCartOpen: true, cartView: 'checkout' }),
}));
