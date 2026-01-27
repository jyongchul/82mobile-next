import { NextResponse } from 'next/server';
import { updateCartItem } from '@/lib/cart-session';
import { handleApiError } from '@/lib/api-error';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * PUT /api/cart/update-item
 * Update cart item quantity
 *
 * Request body: { itemKey: string, quantity: number }
 * Response: { success: true, cart: Cart }
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { itemKey, quantity } = body;

    // Validate inputs
    if (!itemKey || quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'itemKey and quantity are required',
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

    // Update item quantity via CoCart API
    const cart = await updateCartItem(itemKey, quantity, cartKey);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update cart item',
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
    console.error('[cart/update-item] Update item error:', error);
    return handleApiError(error, 'cart/update-item');
  }
}
