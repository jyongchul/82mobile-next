import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/payment/webhook
 * Handle Eximbay payment callback
 *
 * This endpoint receives payment results from Eximbay after transaction completion
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    console.log('Payment webhook received:', {
      ref,
      rescode,
      resmsg,
      amt
    });

    // Verify checksum for security
    const EXIMBAY_SECRET_KEY = process.env.EXIMBAY_SECRET_KEY || 'demo_secret';
    const checksumString = `${EXIMBAY_SECRET_KEY}${ref}${cur}${amt}`;
    const expectedFgkey = crypto
      .createHash('sha256')
      .update(checksumString)
      .digest('hex');

    if (fgkey !== expectedFgkey) {
      console.error('Checksum mismatch! Possible fraud attempt.');
      return NextResponse.json(
        { success: false, error: 'Invalid checksum' },
        { status: 400 }
      );
    }

    // Check if payment was successful
    const isSuccess = rescode === '0000';

    if (isSuccess) {
      // Payment successful - update order in WooCommerce
      console.log('Payment successful:', {
        transactionId: ref,
        eximbayTransactionId: transid,
        authCode: authcode,
        amount: amt
      });

      // TODO: Update WooCommerce order status
      // await updateOrderStatus(orderId, 'completed');

      // TODO: Send eSIM QR code email if applicable
      // await sendEsimQrCode(orderId);

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: ref,
        status: 'completed'
      });
    } else {
      // Payment failed
      console.error('Payment failed:', {
        transactionId: ref,
        errorCode: rescode,
        errorMessage: resmsg
      });

      // TODO: Update WooCommerce order status to 'failed'
      // await updateOrderStatus(orderId, 'failed');

      return NextResponse.json({
        success: false,
        message: resmsg || 'Payment failed',
        errorCode: rescode,
        transactionId: ref
      });
    }
  } catch (error: any) {
    console.error('Error processing payment webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process payment webhook',
        message: error.message
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
