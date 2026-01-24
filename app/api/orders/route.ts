import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/woocommerce';

/**
 * POST /api/orders
 * Create a new order in WooCommerce
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, billing, paymentMethod } = body;

    // Validate request
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!billing || !billing.email || !billing.firstName || !billing.lastName) {
      return NextResponse.json(
        { success: false, error: 'Billing information is incomplete' },
        { status: 400 }
      );
    }

    // Prepare line items for WooCommerce
    const lineItems = items.map((item: any) => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    // Create order in WooCommerce
    const orderData = {
      payment_method: paymentMethod || 'eximbay',
      payment_method_title: 'International Credit Card (Eximbay)',
      set_paid: false, // Will be set to true after successful payment
      billing: {
        first_name: billing.firstName,
        last_name: billing.lastName,
        address_1: billing.address1 || '',
        address_2: billing.address2 || '',
        city: billing.city || '',
        state: billing.state || '',
        postcode: billing.postcode || '',
        country: billing.country || 'KR',
        email: billing.email,
        phone: billing.phone || ''
      },
      line_items: lineItems,
      meta_data: [
        {
          key: '_payment_intent',
          value: 'pending'
        }
      ]
    };

    const order = await createOrder(orderData);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create order'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.number,
      total: order.total,
      currency: order.currency,
      status: order.status
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/:id
 * Fetch order details
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // TODO: Fetch order from WooCommerce
    // const order = await getOrder(orderId);

    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        status: 'completed',
        total: '45000',
        currency: 'KRW'
      }
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch order',
        message: error.message
      },
      { status: 500 }
    );
  }
}
