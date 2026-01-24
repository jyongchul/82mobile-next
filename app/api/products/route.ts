import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/woocommerce';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Fetch all products from WooCommerce
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

    // Fetch products from WooCommerce
    const products = await getProducts();

    // Filter by category if specified
    let filteredProducts = products;
    if (category) {
      filteredProducts = products.filter((product: any) =>
        product.categories.some((cat: any) => cat.slug === category)
      );
    }

    // Limit results
    const limitedProducts = filteredProducts.slice(0, limit);

    // Transform WooCommerce data to our format
    const transformedProducts = limitedProducts.map((product: any) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      regularPrice: product.regular_price,
      image: product.images[0]?.src || '/images/products/placeholder.jpg',
      category: product.categories[0]?.name || 'Uncategorized',
      description: product.short_description || product.description,
      // Extract custom attributes (duration, data amount)
      duration: product.attributes.find((attr: any) => attr.name === 'Duration')?.options[0],
      dataAmount: product.attributes.find((attr: any) => attr.name === 'Data')?.options[0],
      // Variations for plan selector
      variations: product.variations || []
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      total: transformedProducts.length
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error.message
      },
      { status: 500 }
    );
  }
}
