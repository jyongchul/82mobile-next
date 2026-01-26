'use client';

import { useUIStore } from '@/stores/ui';
import CartDrawer from './CartDrawer';

export default function CartDrawerWrapper() {
  const { isCartOpen, closeCart } = useUIStore();

  return <CartDrawer isOpen={isCartOpen} onClose={closeCart} />;
}
