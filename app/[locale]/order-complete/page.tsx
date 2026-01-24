'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function OrderCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLocale = useLocale();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      router.push(`/${currentLocale}`);
    }
  }, [orderId, router, currentLocale]);

  if (!orderId) return null;

  // Mock eSIM QR code - in production, this would come from WooCommerce order
  const esimQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LPA:1$sm-dp.example.com$ACTIVATION-CODE-${orderId}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-jade-green rounded-full mb-4 animate-scale-in">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Order Complete! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="font-heading text-2xl font-bold text-gray-900">
                #{orderId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-medium text-gray-900">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* eSIM QR Code */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-8 text-center mb-6">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
              Your eSIM QR Code
            </h2>
            <p className="text-gray-600 mb-6">
              Scan this QR code with your phone's camera to activate your eSIM
            </p>

            <div className="bg-white inline-block p-6 rounded-xl shadow-lg mb-4">
              <img
                src={esimQrCode}
                alt="eSIM QR Code"
                width={300}
                height={300}
                className="max-w-full h-auto"
              />
            </div>

            <button
              onClick={() => window.open(esimQrCode, '_blank')}
              className="inline-flex items-center px-6 py-3 bg-hanbok-blue hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code
            </button>
          </div>

          {/* Activation Instructions */}
          <div className="space-y-4">
            <h3 className="font-heading text-xl font-bold text-gray-900">
              How to Activate Your eSIM
            </h3>

            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-dancheong-red text-white rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-900">Open Settings</p>
                  <p className="text-sm text-gray-600">
                    Go to Settings → Cellular/Mobile Data → Add eSIM
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-dancheong-red text-white rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-900">Scan QR Code</p>
                  <p className="text-sm text-gray-600">
                    Use your camera to scan the QR code above
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-dancheong-red text-white rounded-full flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-900">Activate</p>
                  <p className="text-sm text-gray-600">
                    Follow the on-screen instructions to complete activation
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div>
              <p className="font-medium text-blue-900 mb-1">
                Confirmation Email Sent
              </p>
              <p className="text-sm text-blue-700">
                We've sent a confirmation email with your order details and QR code. Check your inbox!
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${currentLocale}/shop`}
            className="flex-1 text-center px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:border-dancheong-red hover:text-dancheong-red transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href={`/${currentLocale}`}
            className="flex-1 text-center px-6 py-3 bg-dancheong-red hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105"
          >
            Back to Home
          </Link>
        </div>

        {/* Support */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Need help?{' '}
            <Link href={`/${currentLocale}/contact`} className="text-dancheong-red hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
