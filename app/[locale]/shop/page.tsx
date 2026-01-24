'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ProductCard from '@/components/shop/ProductCard';
import ProductFilter from '@/components/shop/ProductFilter';

export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  regularPrice?: string;
  image: string;
  duration?: string;
  dataAmount?: string;
  badge?: string;
}

// Mock products - will be replaced with WooCommerce API
const mockProducts: Product[] = [
  {
    id: 1,
    slug: 'korea-esim-unlimited-30days',
    name: 'Korea eSIM Unlimited 30 Days',
    price: '45,000',
    regularPrice: '55,000',
    image: '/images/products/esim-unlimited.jpg',
    duration: '30 Days',
    dataAmount: 'Unlimited',
    badge: 'Most Popular'
  },
  {
    id: 2,
    slug: 'korea-esim-standard-10days',
    name: 'Korea eSIM Standard 10 Days',
    price: '25,000',
    image: '/images/products/esim-standard.jpg',
    duration: '10 Days',
    dataAmount: '10GB',
    badge: 'Best Value'
  },
  {
    id: 3,
    slug: 'korea-physical-sim-unlimited',
    name: 'Physical SIM Unlimited 30 Days',
    price: '35,000',
    image: '/images/products/sim-korea-unlimited.jpg',
    duration: '30 Days',
    dataAmount: 'Unlimited'
  },
  {
    id: 4,
    slug: 'korea-esim-5days',
    name: 'Korea eSIM 5 Days',
    price: '15,000',
    image: '/images/products/esim-standard.jpg',
    duration: '5 Days',
    dataAmount: '5GB'
  },
  {
    id: 5,
    slug: 'korea-physical-sim-20days',
    name: 'Physical SIM 20 Days',
    price: '30,000',
    image: '/images/products/sim-korea-standard.jpg',
    duration: '20 Days',
    dataAmount: '20GB'
  },
  {
    id: 6,
    slug: 'korea-esim-3days',
    name: 'Korea eSIM 3 Days',
    price: '12,000',
    image: '/images/products/esim-standard.jpg',
    duration: '3 Days',
    dataAmount: '3GB'
  }
];

export default function ShopPage() {
  const t = useTranslations();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (filters: {
    duration: string[];
    dataAmount: string[];
    sortBy: 'price-asc' | 'price-desc' | 'newest';
  }) => {
    let filtered = [...products];

    // Apply duration filter
    if (filters.duration.length > 0) {
      filtered = filtered.filter((product) =>
        product.duration && filters.duration.includes(product.duration)
      );
    }

    // Apply data amount filter
    if (filters.dataAmount.length > 0) {
      filtered = filtered.filter((product) =>
        product.dataAmount && filters.dataAmount.includes(product.dataAmount)
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/,/g, ''));
          const priceB = parseFloat(b.price.replace(/,/g, ''));
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/,/g, ''));
          const priceB = parseFloat(b.price.replace(/,/g, ''));
          return priceB - priceA;
        });
        break;
      case 'newest':
        // Already in newest order (mock data)
        break;
    }

    setFilteredProducts(filtered);
  };

  // TODO: Fetch real products from WooCommerce
  useEffect(() => {
    // Example: Fetch from WooCommerce API
    // const fetchProducts = async () => {
    //   setIsLoading(true);
    //   try {
    //     const response = await fetch('/api/products');
    //     const data = await response.json();
    //     setProducts(data);
    //     setFilteredProducts(data);
    //   } catch (error) {
    //     console.error('Failed to fetch products:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Our Products
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect SIM card or eSIM plan for your Korean adventure
          </p>
        </div>

        {/* Filters */}
        <ProductFilter onFilterChange={handleFilterChange} />

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
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
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-24 h-24 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 21a9 9 0 110-18 9 9 0 010 18z"
              />
            </svg>
            <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters to see more results
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Results count */}
            <div className="mt-8 text-center text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </>
        )}
      </div>
    </div>
  );
}
