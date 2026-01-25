'use client';

import { useQuery } from '@tanstack/react-query';

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: string;
  regularPrice?: string;
  image: string;
  imageFull: string;
  category: string;
  description: string;
  duration?: string;
  dataAmount?: string;
  variations: any[];
}

interface UseProductsOptions {
  category?: string;
  limit?: number;
  imageSize?: 'thumbnail' | 'shop_catalog' | 'full';
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category, limit = 100, imageSize = 'shop_catalog' } = options;

  return useQuery<{ success: boolean; products: Product[]; total: number }>({
    queryKey: ['products', { category, limit, imageSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('limit', limit.toString());
      params.append('imageSize', imageSize);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
