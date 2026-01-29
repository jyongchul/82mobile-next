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
    const imageSize = searchParams.get('imageSize') || 'shop_catalog';

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

    // Rewrite WordPress image URLs to use Gabia backend directly
    // (82mobile.com DNS points to Vercel, causing a loop for image optimization)
    const rewriteImageUrl = (url: string) =>
      url.replace(/^https?:\/\/82mobile\.com\/wp-content\/uploads\//,
        'http://adam82mob0105.gabia.io/wp-content/uploads/');

    // Transform WooCommerce data to our format
    const transformedProducts = limitedProducts.map((product: any) => {
      const rawUrl = product.images[0]?.src || '/images/products/placeholder.jpg';
      let imageUrl = rewriteImageUrl(rawUrl);
      const imageFull = rewriteImageUrl(rawUrl);

      // Apply image size transformation
      if (imageUrl !== '/images/products/placeholder.jpg') {
        if (imageSize === 'thumbnail') {
          imageUrl = imageUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '-150x150.$1');
        } else if (imageSize === 'shop_catalog') {
          imageUrl = imageUrl.replace(/\.(jpg|jpeg|png|webp)$/i, '-300x300.$1');
        }
        // 'full' size uses original URL (no transformation)
      }

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        regularPrice: product.regular_price,
        image: imageUrl, // Optimized image
        imageFull: imageFull, // Full resolution image
        category: product.categories[0]?.name || 'Uncategorized',
        description: product.short_description || product.description,
        // Extract custom attributes (duration, data amount)
        duration: product.attributes.find((attr: any) => attr.name === 'Duration')?.options[0],
        dataAmount: product.attributes.find((attr: any) => attr.name === 'Data')?.options[0],
        // Variations for plan selector
        variations: product.variations || []
      };
    });

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
