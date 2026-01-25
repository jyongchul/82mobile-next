'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/shop/ProductCard';
import ProductFilter from '@/components/shop/ProductFilter';

export default function ProductsSection() {
  const { data, isLoading, error } = useProducts();
  const [filters, setFilters] = useState({
    duration: [] as string[],
    dataAmount: [] as string[],
    type: [] as string[],
    sortBy: 'newest' as 'price-asc' | 'price-desc' | 'newest'
  });

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    let filtered = [...data.products];

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter((product) => {
        const isEsim = product.name.toLowerCase().includes('esim');
        if (filters.type.includes('eSIM') && isEsim) return true;
        if (filters.type.includes('Physical') && !isEsim) return true;
        return false;
      });
    }

    // Duration filter
    if (filters.duration.length > 0) {
      filtered = filtered.filter((product) =>
        product.duration && filters.duration.includes(product.duration)
      );
    }

    // Data amount filter
    if (filters.dataAmount.length > 0) {
      filtered = filtered.filter((product) =>
        product.dataAmount && filters.dataAmount.includes(product.dataAmount)
      );
    }

    // Sorting
    if (filters.sortBy === 'price-asc') {
      filtered.sort((a, b) => parseFloat(a.price.replace(/,/g, '')) - parseFloat(b.price.replace(/,/g, '')));
    } else if (filters.sortBy === 'price-desc') {
      filtered.sort((a, b) => parseFloat(b.price.replace(/,/g, '')) - parseFloat(a.price.replace(/,/g, '')));
    }

    return filtered;
  }, [data?.products, filters]);

  return (
    <section
      id="products"
      className="py-20 bg-gray-50 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Browse Our Plans
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your Korean adventure
          </p>
        </div>

        {/* Filter */}
        <ProductFilter
          onFilterChange={setFilters}
          productsCount={filteredProducts.length}
          totalCount={data?.products.length || 0}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load products</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-dancheong-red text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                {...product}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="text-center mt-8 text-gray-600">
            Showing {filteredProducts.length} of {data?.products.length || 0} products
          </div>
        )}
      </div>
    </section>
  );
}
