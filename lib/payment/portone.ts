import * as PortOne from '@portone/browser-sdk/v2';

/**
 * Initialize PortOne payment request
 *
 * @param orderId - WooCommerce order ID
 * @param amount - Total amount in KRW (without decimal)
 * @param customerEmail - Customer email for receipt
 * @param customerName - Customer name for payment window
 */
export async function initiatePortOnePayment({
  orderId,
  amount,
  customerEmail,
  customerName
}: {
  orderId: number;
  amount: number;
  customerEmail: string;
  customerName: string;
}) {
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID!;
  const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!;

  if (!storeId || !channelKey) {
    throw new Error('PortOne credentials not configured. Please add NEXT_PUBLIC_PORTONE_STORE_ID and NEXT_PUBLIC_PORTONE_CHANNEL_KEY to .env.local');
  }

  try {
    const response = await PortOne.requestPayment({
      storeId,
      channelKey,
      paymentId: `order_${orderId}_${Date.now()}`, // Unique payment ID
      orderName: `82Mobile Order #${orderId}`,
      totalAmount: amount,
      currency: 'CURRENCY_KRW',
      payMethod: 'CARD', // Credit card only
      customer: {
        email: customerEmail,
        fullName: customerName
      },
      redirectUrl: `${window.location.origin}/order-complete?orderId=${orderId}`,
      // Webhook will be called automatically by PortOne
      noticeUrls: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`]
    });

    return response;
  } catch (error) {
    console.error('[PortOne] Payment initiation error:', error);
    throw error;
  }
}
