import { NextResponse } from 'next/server';
import { getCart } from '@/lib/cart-session';
import { handleApiError } from '@/lib/api-error';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * GET /api/cart
 * Retrieve current cart for session
 *
 * Response: { success: true, cart: Cart }
 */
export async function GET(request: Request) {
  try {
    // Extract cart key from cookies
    const cartKey = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('cart-key='))
      ?.split('=')[1];

    // Fetch cart from CoCart API
    const cart = await getCart(cartKey);

    if (!cart) {
      // Return empty cart if session doesn't exist
      return NextResponse.json({
        success: true,
        cart: {
          cart_key: '',
          items: [],
          item_count: 0,
          totals: {
            subtotal: '0',
            total: '0',
            currency: 'KRW',
            currency_symbol: '₩'
          },
          needs_shipping: false,
          needs_payment: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      cart
    });
  } catch (error: any) {
    console.error('[cart] Get cart error:', error);
    return handleApiError(error, 'cart');
  }
}
