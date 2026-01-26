'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutFormData, defaultCheckoutValues } from '@/lib/validation/checkout-schema';
import { useCartStore } from '@/stores/cart';
import { useUIStore } from '@/stores/ui';
import { initiatePortOnePayment } from '@/lib/payment/portone';
import { trackBeginCheckout } from '@/lib/analytics';

export default function CartDrawerCheckout() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const closeCart = useUIStore((state) => state.closeCart);
  const [orderError, setOrderError] = useState<string | null>(null);
  const hasTrackedCheckout = useRef(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(total * 0.1); // 10% VAT
  const grandTotal = total + tax;

  // Track begin_checkout event when component mounts
  useEffect(() => {
    if (!hasTrackedCheckout.current && items.length > 0) {
      hasTrackedCheckout.current = true;

      const cartItems = items.map(item => ({
        item_id: item.productId.toString(),
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      trackBeginCheckout(grandTotal, cartItems);
    }
  }, [items, grandTotal]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid }
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur', // Validate on blur for better UX
    reValidateMode: 'onChange', // Re-validate on change after first submission
    defaultValues: defaultCheckoutValues
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setOrderError(null);

    try {
      // Step 1: Create WooCommerce order
      console.log('[Checkout] Creating order...');
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billing: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address1: data.address1 || '',
            city: data.city || '',
            postcode: data.postcode || '',
            country: data.country || 'KR'
          },
          items: items.map(item => ({
            id: item.productId,
            quantity: item.quantity
          })),
          paymentMethod: 'portone'
        })
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const order = await orderResponse.json();
      console.log('[Checkout] Order created:', order.orderId);

      // Step 2: Initiate payment
      console.log('[Checkout] Initiating payment...');
      const paymentResponse = await initiatePortOnePayment({
        orderId: order.orderId,
        amount: grandTotal,
        customerEmail: data.email,
        customerName: `${data.firstName} ${data.lastName}`
      });

      console.log('[Checkout] Payment response:', paymentResponse);

      // Check payment result
      if (paymentResponse?.code === 'FAILURE_TYPE_PG') {
        throw new Error(paymentResponse.message || 'Payment failed');
      }

      // Success: Clear cart and close drawer
      // Actual order status update will come via webhook
      clearCart();
      closeCart();

      // Redirect to order confirmation
      window.location.href = `/order-complete?orderId=${order.orderId}&paymentId=${paymentResponse?.paymentId}`;

    } catch (error: any) {
      console.error('[Checkout] Error:', error);
      setOrderError(error.message || 'Checkout failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Order Summary */}
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

      {/* Error Message */}
      {orderError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-sm text-red-800 font-medium">Payment Error</p>
          <p className="text-sm text-red-700 mt-1">{orderError}</p>
          <button
            onClick={() => setOrderError(null)}
            className="text-sm text-red-600 underline mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Billing Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register('firstName')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              {...register('lastName')}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            {...register('phone')}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+82 10 1234 5678"
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            For order updates and eSIM delivery
          </p>
        </div>

        {/* Optional Address Fields (collapsed by default for eSIM) */}
        <details className="border rounded-lg p-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Shipping Address (Optional)
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                {...register('address1')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent"
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent"
                  placeholder="Seoul"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  {...register('postcode')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-transparent"
                  placeholder="06000"
                />
              </div>
            </div>
          </div>
        </details>

        {/* Submit Button */}
        <div className="pt-4 border-t sticky bottom-0 bg-white">
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="w-full py-4 bg-dancheong-red text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-opacity"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay ₩{grandTotal.toLocaleString()}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
