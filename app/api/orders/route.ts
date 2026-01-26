import { NextResponse } from 'next/server';
import { createOrder, getOrder } from '@/lib/woocommerce';

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
      customer_id: 0, // Guest checkout
      payment_method: paymentMethod || 'portone',
      payment_method_title: paymentMethod === 'portone'
        ? 'Credit Card (PortOne)'
        : 'International Credit Card (Eximbay)',
      set_paid: false, // Will be set to true after successful payment
      status: 'pending', // Explicitly set pending until payment completes
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
        },
        {
          key: '_order_source',
          value: '82mobile-next'
        },
        {
          key: '_created_via_api',
          value: 'true'
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
 * GET /api/orders?id={orderId}
 * Fetch order details from WooCommerce
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

    // Fetch order from WooCommerce
    const order = await getOrder(parseInt(orderId));

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform order data for frontend
    const transformedOrder = {
      id: order.id,
      number: order.number,
      status: order.status,
      total: order.total,
      currency: order.currency,
      createdAt: order.date_created || new Date().toISOString(),
      billing: {
        firstName: order.billing.first_name,
        lastName: order.billing.last_name,
        email: order.billing.email,
        phone: order.billing.phone,
        address: order.billing.address_1,
        city: order.billing.city,
        postcode: order.billing.postcode,
        country: order.billing.country
      },
      lineItems: order.line_items.map((item: any) => ({
        id: item.id,
        name: item.name,
        productId: item.product_id,
        quantity: item.quantity,
        total: item.total
      })),
      // Extract eSIM QR code from order metadata (if exists)
      esimQrCode: order.meta_data?.find((meta: any) => meta.key === '_esim_qr_code')?.value,
      esimActivationCode: order.meta_data?.find((meta: any) => meta.key === '_esim_activation_code')?.value
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder
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
