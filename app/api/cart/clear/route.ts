import { NextResponse } from 'next/server';
import { clearCart } from '@/lib/cart-session';
import { handleApiError } from '@/lib/api-error';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * POST /api/cart/clear
 * Clear all items from cart
 *
 * Response: { success: true, cart: Cart }
 */
export async function POST(request: Request) {
  try {
    // Extract cart key from cookies
    const cartKey = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('cart-key='))
      ?.split('=')[1];

    // Clear cart via CoCart API
    const cart = await clearCart(cartKey);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to clear cart',
          message: 'CoCart API request failed',
          code: 'CART_API_ERROR'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cart
    });
  } catch (error: any) {
    console.error('[cart/clear] Clear cart error:', error);
    return handleApiError(error, 'cart/clear');
  }
}
