import { NextResponse } from 'next/server';
import { addCartItem } from '@/lib/cart-session';
import { handleApiError } from '@/lib/api-error';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * POST /api/cart/add-item
 * Add product to cart
 *
 * Request body: { productId: number, quantity: number, variationId?: number }
 * Response: { success: true, cart: Cart }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, variationId } = body;

    // Validate inputs
    if (!productId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'productId and quantity are required',
          code: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    // Extract cart key from cookies
    const cartKey = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('cart-key='))
      ?.split('=')[1];

    // Add item to cart via CoCart API
    const cart = await addCartItem(productId, quantity, cartKey, variationId);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to add item to cart',
          message: 'CoCart API request failed',
          code: 'CART_API_ERROR'
        },
        { status: 500 }
      );
    }

    // Create success response
    const response = NextResponse.json({
      success: true,
      cart
    });

    // Set cart key cookie (httpOnly: false so client can access for subsequent requests)
    // CRITICAL: Cart key needs to be accessible by client for cart persistence
    if (cart.cart_key) {
      response.cookies.set('cart-key', cart.cart_key, {
        httpOnly: false, // Client needs access to cart key
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      });
    }

    return response;
  } catch (error: any) {
    console.error('[cart/add-item] Add item error:', error);
    return handleApiError(error, 'cart/add-item');
  }
}
