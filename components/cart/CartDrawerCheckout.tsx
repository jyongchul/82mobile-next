'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutFormData, defaultCheckoutValues } from '@/lib/validation/checkout-schema';
import { useCartStore } from '@/stores/cart';

export default function CartDrawerCheckout() {
  const items = useCartStore((state) => state.items);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(total * 0.1); // 10% VAT
  const grandTotal = total + tax;

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
    console.log('Form submitted:', data);
    // TODO Phase 4 Plan 02: Create WooCommerce order
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
