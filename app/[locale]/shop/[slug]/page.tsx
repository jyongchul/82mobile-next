'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import PlanSelector from '@/components/shop/PlanSelector';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const slug = params.slug as string;

  const addItem = useCartStore((state) => state.addItem);

  // State for product data
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product data from WooCommerce
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();

        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setError(data.error || 'Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Update selected plan when product loads
  useEffect(() => {
    if (product?.plans) {
      const defaultPlan = product.plans.find((p: any) => p.recommended) || product.plans[0];
      setSelectedPlan(defaultPlan);
    }
  }, [product]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-dancheong-red mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{error || 'Product not found'}</h1>
          <Link
            href={`/${locale}/shop`}
            className="text-dancheong-red hover:underline"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedPlan || !product) return;

    setIsAdding(true);

    addItem({
      productId: product.id,
      name: `${product.name} - ${selectedPlan.duration}`,
      slug: product.slug,
      price: typeof selectedPlan.price === 'string' ? parseFloat(selectedPlan.price) : selectedPlan.price,
      image: product.image
    }, quantity);

    setTimeout(() => {
      setIsAdding(false);
      router.push(`/${locale}/cart`);
    }, 800);
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href={`/${locale}`} className="hover:text-dancheong-red">
            Home
          </Link>
          <span>/</span>
          <Link href={`/${locale}/shop`} className="hover:text-dancheong-red">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Additional Images (placeholder for now) */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity"
                >
                  <Image
                    src={product.image}
                    alt={`${product.name} ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <span className="inline-block px-3 py-1 bg-secondary-50 text-hanbok-blue rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Features */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-4">
                What's Included
              </h3>
              <ul className="space-y-3">
                {product.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-6 h-6 text-jade-green flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Plan Selector */}
            <PlanSelector
              plans={product.plans}
              onSelectPlan={setSelectedPlan}
            />

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <label className="font-heading font-bold text-gray-900">
                Quantity:
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-2 font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 px-8 py-4 bg-hanbok-blue hover:bg-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 px-8 py-4 bg-dancheong-red hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-xs text-gray-600">Secure Payment</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📱</div>
                <p className="text-xs text-gray-600">Instant Delivery</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎧</div>
                <p className="text-xs text-gray-600">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
