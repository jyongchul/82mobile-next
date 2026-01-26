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

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId
          );

          if (existingItem) {
            // Update quantity if item already exists
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          } else {
            // Add new item
            return {
              items: [...state.items, { ...item, quantity }],
            };
          }
        });

        // Track add to cart event in GA4
        trackAddToCart({
          id: item.productId.toString(),
          name: item.name,
          price: item.price,
          quantity: quantity,
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // localStorage key
    }
  )
);

// Export both names for compatibility
export { useCartStore };
export const useCart = useCartStore;
