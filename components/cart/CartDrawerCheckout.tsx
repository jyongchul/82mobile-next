'use client';

import { useCartStore } from '@/stores/cart';

export default function CartDrawerCheckout() {
  const items = useCartStore((state) => state.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(total * 0.1);
  const grandTotal = total + tax;

  return (
    <div className="flex flex-col h-full">
      {/* Order Summary - compact */}
      <div className="p-4 bg-gray-50 rounded-lg mb-4">
        <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>{items.length} item(s)</span>
            <span>₩{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (10%)</span>
            <span>₩{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span className="text-dancheong-red">₩{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Billing Form - simplified for drawer */}
      <form className="flex-1 overflow-y-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            required
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent"
            placeholder="+1 234 567 8900"
          />
        </div>

        {/* Note: Full checkout implementation in Phase 4 */}
        <p className="text-sm text-gray-500 italic">
          Payment processing coming in Phase 4
        </p>
      </form>

      {/* Pay Button - sticky at bottom */}
      <div className="pt-4 border-t">
        <button
          type="submit"
          disabled
          className="w-full py-4 bg-gray-300 text-gray-500 font-bold rounded-lg cursor-not-allowed"
        >
          Pay ₩{grandTotal.toLocaleString()} (Coming Soon)
        </button>
      </div>
    </div>
  );
}
