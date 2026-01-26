import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { updateOrderStatus } from '@/lib/woocommerce';

/**
 * POST /api/payment/webhook
 * Handle payment callbacks from PortOne or Eximbay
 *
 * This endpoint receives payment results after transaction completion
 * and updates WooCommerce order status accordingly
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Detect payment provider based on request structure
    const isPortOne = body.imp_uid !== undefined || body.merchant_uid !== undefined;
    const isEximbay = body.ref !== undefined && body.rescode !== undefined;

    console.log('[Payment Webhook] Received callback:', {
      provider: isPortOne ? 'PortOne' : isEximbay ? 'Eximbay' : 'Unknown',
      body: JSON.stringify(body, null, 2)
    });

    // Handle PortOne callback
    if (isPortOne) {
      const { imp_uid, merchant_uid, status } = body;

      console.log('[Payment Webhook] PortOne payment:', { imp_uid, merchant_uid, status });

      // TODO: Verify webhook signature (PortOne provides verification method)
      // const signature = request.headers.get('portone-signature');
      // if (!verifySignature(signature, body)) {
      //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      // }

      // Extract order ID from merchant_uid (format: order_12345_timestamp)
      const orderIdMatch = merchant_uid?.match(/order_(\d+)_/);
      if (!orderIdMatch) {
        console.error('[Payment Webhook] Invalid merchant_uid format:', merchant_uid);
        return NextResponse.json({ error: 'Invalid merchant_uid' }, { status: 400 });
      }

      const orderId = parseInt(orderIdMatch[1]);

      // Update WooCommerce order status based on payment status
      let newStatus = 'pending';
      if (status === 'paid' || status === 'ready') {
        newStatus = 'processing'; // Payment successful, order being processed
      } else if (status === 'failed' || status === 'cancelled') {
        newStatus = 'failed'; // Payment failed
      }

      // Update order status in WooCommerce
      try {
        await updateOrderStatus(orderId, newStatus);
        console.log(`[Payment Webhook] Updated order ${orderId} to ${newStatus}`);
      } catch (updateError: any) {
        console.error('[Payment Webhook] Failed to update order:', updateError);
      }

      return NextResponse.json({
        success: true,
        orderId,
        status: newStatus
      });
    }

    // Handle Eximbay callback
    if (isEximbay) {
      const {
        ref, // Transaction ID
        rescode, // Result code (0000 = success)
        resmsg, // Result message
        cur, // Currency
        amt, // Amount
        authcode, // Authorization code
        transid, // Eximbay transaction ID
        fgkey // Checksum from Eximbay
      } = body;

      console.log('[Payment Webhook] Eximbay payment:', {
        ref,
        rescode,
        resmsg,
        amt
      });

      // Verify checksum for security
      const EXIMBAY_SECRET_KEY = process.env.EXIMBAY_SECRET_KEY;
      if (EXIMBAY_SECRET_KEY && EXIMBAY_SECRET_KEY !== 'PLACEHOLDER_SECRET_KEY') {
        const checksumString = `${EXIMBAY_SECRET_KEY}${ref}${cur}${amt}`;
        const expectedFgkey = crypto
          .createHash('sha256')
          .update(checksumString)
          .digest('hex');

        if (fgkey !== expectedFgkey) {
          console.error('[Payment Webhook] Checksum mismatch! Possible fraud attempt.');
          return NextResponse.json(
            { success: false, error: 'Invalid checksum' },
            { status: 400 }
          );
        }
      }

      // Check if payment was successful
      const isSuccess = rescode === '0000';

      // Extract order ID from ref if it contains order information
      // This depends on how you structure the ref when calling Eximbay
      const orderIdMatch = ref?.match(/order_(\d+)/);
      const orderId = orderIdMatch ? parseInt(orderIdMatch[1]) : null;

      if (isSuccess) {
        console.log('[Payment Webhook] Eximbay payment successful:', {
          transactionId: ref,
          eximbayTransactionId: transid,
          authCode: authcode,
          amount: amt
        });

        // Update order status if we have order ID
        if (orderId) {
          try {
            await updateOrderStatus(orderId, 'processing');
            console.log(`[Payment Webhook] Updated order ${orderId} to processing`);
          } catch (updateError: any) {
            console.error('[Payment Webhook] Failed to update order:', updateError);
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Payment processed successfully',
          transactionId: ref,
          status: 'completed'
        });
      } else {
        console.error('[Payment Webhook] Eximbay payment failed:', {
          transactionId: ref,
          errorCode: rescode,
          errorMessage: resmsg
        });

        // Update order status to failed if we have order ID
        if (orderId) {
          try {
            await updateOrderStatus(orderId, 'failed');
            console.log(`[Payment Webhook] Updated order ${orderId} to failed`);
          } catch (updateError: any) {
            console.error('[Payment Webhook] Failed to update order:', updateError);
          }
        }

        return NextResponse.json({
          success: false,
          message: resmsg || 'Payment failed',
          errorCode: rescode,
          transactionId: ref
        });
      }
    }

    // Unknown payment provider
    console.error('[Payment Webhook] Unknown payment provider format:', body);
    return NextResponse.json(
      { error: 'Unknown payment provider' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('[Payment Webhook] Error processing webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process payment webhook',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/webhook
 * Handle Eximbay redirect callback (for browser redirects)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rescode = searchParams.get('rescode');
    const ref = searchParams.get('ref');

    const isSuccess = rescode === '0000';
    const redirectUrl = isSuccess
      ? `/order-complete?ref=${ref}`
      : `/checkout?error=payment_failed&ref=${ref}`;

    // Redirect user to appropriate page
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error: any) {
    console.error('Error handling payment redirect:', error);
    return NextResponse.redirect(new URL('/checkout?error=unknown', request.url));
  }
}
