import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackAddToCart } from '@/lib/analytics';

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
  attributes?: Record<string, string>;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

function computeDerived(items: CartItem[]) {
  return {
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId
          );

          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          } else {
            newItems = [...state.items, { ...item, quantity }];
          }

          return { items: newItems, ...computeDerived(newItems) };
        });

        trackAddToCart({
          id: item.productId.toString(),
          name: item.name,
          price: item.price,
          quantity: quantity,
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.productId !== productId);
          return { items: newItems, ...computeDerived(newItems) };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );
          return { items: newItems, ...computeDerived(newItems) };
        });
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const derived = computeDerived(state.items);
          state.total = derived.total;
          state.itemCount = derived.itemCount;
        }
      },
    }
  )
);

// Export both names for compatibility
export { useCartStore };
export const useCart = useCartStore;
