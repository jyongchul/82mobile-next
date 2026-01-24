import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/payment/initiate
 * Initialize Eximbay payment
 *
 * Eximbay Documentation: https://www.eximbay.com/
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, currency, customerEmail, customerName } = body;

    // Validate request
    if (!orderId || !amount || !currency) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment parameters' },
        { status: 400 }
      );
    }

    // Eximbay credentials (from environment variables)
    const EXIMBAY_MID = process.env.EXIMBAY_MID || 'demo_mid';
    const EXIMBAY_SECRET_KEY = process.env.EXIMBAY_SECRET_KEY || 'demo_secret';
    const EXIMBAY_API_URL = process.env.EXIMBAY_API_URL || 'https://api-test.eximbay.com';

    // Generate transaction ID
    const transactionId = `82M${Date.now()}`;

    // Prepare payment parameters
    const paymentParams = {
      mid: EXIMBAY_MID,
      ref: transactionId,
      cur: currency || 'KRW',
      amt: amount.toString(),
      buyer: customerEmail,
      tel: '',
      email: customerEmail,
      displaytype: 'P', // P = Popup, R = Redirect
      ver: '230',
      returnurl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      statusurl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      // Optional fields
      product: '82Mobile SIM Card',
      lang: 'EN', // EN, KR, CN, JP
      charset: 'UTF-8'
    };

    // Generate checksum (hash for security)
    const checksumString = `${EXIMBAY_SECRET_KEY}${paymentParams.ref}${paymentParams.cur}${paymentParams.amt}`;
    const fgkey = crypto
      .createHash('sha256')
      .update(checksumString)
      .digest('hex');

    // Add checksum to params
    const finalParams = {
      ...paymentParams,
      fgkey
    };

    // Return payment initiation data
    return NextResponse.json({
      success: true,
      paymentUrl: `${EXIMBAY_API_URL}/gateway/direct.html`,
      params: finalParams,
      transactionId,
      message: 'Payment initialized successfully'
    });
  } catch (error: any) {
    console.error('Error initializing payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize payment',
        message: error.message
      },
      { status: 500 }
    );
  }
}
