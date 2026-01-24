import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/woocommerce';

/**
 * Test endpoint to verify WooCommerce API integration
 * Access at: http://localhost:3000/api/test
 */
export async function GET() {
  try {
    console.log('🧪 Testing WooCommerce API connection...');

    // Fetch first 5 products
    const products = await getProducts(1, 5);

    console.log(`✅ Successfully fetched ${products.length} products`);

    return NextResponse.json({
      success: true,
      message: 'WooCommerce API integration working!',
      count: products.length,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        slug: p.slug,
      }))
    });
  } catch (error) {
    console.error('❌ Error testing WooCommerce API:', error);

    return NextResponse.json({
      success: false,
      error: String(error),
      message: 'Failed to connect to WooCommerce API. Check your credentials in .env.local'
    }, { status: 500 });
  }
}
