'use client';

import { useState } from 'react';

interface PaymentMethodsProps {
  onSelect: (method: string) => void;
}

const paymentMethods = [
  {
    id: 'eximbay',
    name: 'International Credit Card',
    description: 'Visa, Mastercard, UnionPay, JCB, AMEX',
    icon: '💳',
    recommended: true
  },
  {
    id: 'kakao',
    name: 'Kakao Pay',
    description: 'Korean mobile payment',
    icon: '💬',
    recommended: false
  },
  {
    id: 'naver',
    name: 'Naver Pay',
    description: 'Korean mobile payment',
    icon: '🟢',
    recommended: false
  }
];

export default function PaymentMethods({ onSelect }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState('eximbay');

  const handleSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    onSelect(methodId);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
        Payment Method
      </h2>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => handleSelect(method.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-dancheong-red bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Radio Button */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-dancheong-red' : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-dancheong-red" />
                  )}
                </div>

                {/* Icon */}
                <div className="text-3xl">{method.icon}</div>

                {/* Method Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-gray-900">
                      {method.name}
                    </span>
                    {method.recommended && (
                      <span className="text-xs bg-jade-green text-white px-2 py-0.5 rounded-full font-bold">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>

                {/* Check Icon */}
                {isSelected && (
                  <svg
                    className="w-6 h-6 text-dancheong-red flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Payment Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Secure Payment</p>
            <p>
              All transactions are encrypted and secure. We never store your credit card information.
            </p>
          </div>
        </div>
      </div>

      {/* Accepted Cards */}
      {selectedMethod === 'eximbay' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">We accept:</p>
          <div className="flex gap-3">
            <div className="px-3 py-2 bg-gray-100 rounded text-xs font-bold text-gray-700">
              VISA
            </div>
            <div className="px-3 py-2 bg-gray-100 rounded text-xs font-bold text-gray-700">
              MASTERCARD
            </div>
            <div className="px-3 py-2 bg-gray-100 rounded text-xs font-bold text-gray-700">
              UNIONPAY
            </div>
            <div className="px-3 py-2 bg-gray-100 rounded text-xs font-bold text-gray-700">
              JCB
            </div>
            <div className="px-3 py-2 bg-gray-100 rounded text-xs font-bold text-gray-700">
              AMEX
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
