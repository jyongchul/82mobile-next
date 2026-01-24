'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCartStore } from '@/stores/cart';
import BillingForm, { BillingData } from '@/components/checkout/BillingForm';
import PaymentMethods from '@/components/checkout/PaymentMethods';
import OrderSummary from '@/components/cart/OrderSummary';

export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  const router = useRouter();
  const currentLocale = useLocale();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('eximbay');
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push(`/${currentLocale}/cart`);
    return null;
  }

  const handleBillingSubmit = (data: BillingData) => {
    setBillingData(data);
  };

  const handlePlaceOrder = async () => {
    if (!billingData) {
      // Trigger form submit
      document.getElementById('billing-form-submit')?.click();
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Create order in WooCommerce
      // TODO: Initiate payment with Eximbay
      // For now, simulate order creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock order ID
      const orderId = Math.floor(Math.random() * 10000);

      // Clear cart
      clearCart();

      // Redirect to order confirmation
      router.push(`/${currentLocale}/order-complete?orderId=${orderId}`);
    } catch (error) {
      console.error('Order failed:', error);
      setIsProcessing(false);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Form */}
            <BillingForm onSubmit={handleBillingSubmit} />

            {/* Payment Methods */}
            <PaymentMethods onSelect={setPaymentMethod} />

            {/* Terms & Conditions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-5 h-5 text-dancheong-red border-gray-300 rounded focus:ring-dancheong-red"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-dancheong-red hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-dancheong-red hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <OrderSummary showCheckoutButton={false} />

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className={`w-full mt-6 px-6 py-4 rounded-lg font-bold text-white transition-all ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-dancheong-red hover:bg-red-700 transform hover:scale-105'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
