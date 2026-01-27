import { NextResponse } from 'next/server';
import { removeCartItem } from '@/lib/cart-session';
import { handleApiError } from '@/lib/api-error';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/cart/remove-item
 * Remove item from cart
 *
 * Request body: { itemKey: string }
 * Response: { success: true, cart: Cart }
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { itemKey } = body;

    // Validate inputs
    if (!itemKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: 'itemKey is required',
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

    // Remove item from cart via CoCart API
    const cart = await removeCartItem(itemKey, cartKey);

    if (!cart) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to remove item from cart',
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
    console.error('[cart/remove-item] Remove item error:', error);
    return handleApiError(error, 'cart/remove-item');
  }
}
