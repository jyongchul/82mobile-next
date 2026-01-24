/**
 * Eximbay Payment Gateway Integration
 *
 * Documentation: https://www.eximbay.com/
 *
 * Required Environment Variables:
 * - EXIMBAY_MID: Merchant ID
 * - EXIMBAY_SECRET_KEY: API Secret Key
 * - EXIMBAY_API_URL: API endpoint (test or production)
 */

import crypto from 'crypto';

interface EximbayPaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  productName?: string;
  language?: 'EN' | 'KR' | 'CN' | 'JP';
}

interface EximbayResponse {
  success: boolean;
  paymentUrl?: string;
  params?: Record<string, string>;
  transactionId?: string;
  error?: string;
}

/**
 * Initialize Eximbay payment
 */
export async function initiateEximbayPayment(
  params: EximbayPaymentParams
): Promise<EximbayResponse> {
  try {
    const response = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Payment initiation failed');
    }

    return data;
  } catch (error: any) {
    console.error('Error initiating Eximbay payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate Eximbay checksum (hash for security)
 */
export function generateChecksum(
  secretKey: string,
  transactionId: string,
  currency: string,
  amount: string
): string {
  const checksumString = `${secretKey}${transactionId}${currency}${amount}`;
  return crypto
    .createHash('sha256')
    .update(checksumString)
    .digest('hex');
}

/**
 * Verify Eximbay callback checksum
 */
export function verifyChecksum(
  secretKey: string,
  transactionId: string,
  currency: string,
  amount: string,
  receivedChecksum: string
): boolean {
  const expectedChecksum = generateChecksum(secretKey, transactionId, currency, amount);
  return expectedChecksum === receivedChecksum;
}

/**
 * Open Eximbay payment popup
 */
export function openEximbayPayment(paymentUrl: string, params: Record<string, string>) {
  // Create form dynamically
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;
  form.target = 'eximbay_payment';

  // Add all parameters as hidden inputs
  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  // Append form to body and submit
  document.body.appendChild(form);

  // Open popup window
  const popup = window.open(
    '',
    'eximbay_payment',
    'width=600,height=800,scrollbars=yes,resizable=yes'
  );

  if (!popup) {
    alert('Please allow popups to complete payment');
    return false;
  }

  form.submit();
  document.body.removeChild(form);

  return true;
}

/**
 * Supported currencies
 */
export const SUPPORTED_CURRENCIES = {
  KRW: 'Korean Won',
  USD: 'US Dollar',
  CNY: 'Chinese Yuan',
  JPY: 'Japanese Yen',
  EUR: 'Euro',
  GBP: 'British Pound'
} as const;

/**
 * Result codes
 */
export const EXIMBAY_RESULT_CODES = {
  '0000': 'Success',
  '9001': 'Transaction failed',
  '9002': 'Invalid parameters',
  '9003': 'Invalid checksum',
  '9999': 'System error'
} as const;

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
