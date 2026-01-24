'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

const faqs = [
  {
    question: 'How do I activate my eSIM?',
    answer: 'After purchase, you\'ll receive a QR code via email. Simply scan it with your phone\'s camera, and your eSIM will be activated instantly. Make sure your device supports eSIM functionality.'
  },
  {
    question: 'Can I use the SIM card immediately upon arrival?',
    answer: 'Yes! Physical SIM cards can be picked up at our stores in Myeongdong or Hongdae, and activated immediately. eSIMs can be activated before you even land in Korea.'
  },
  {
    question: 'What happens if I run out of data?',
    answer: 'Don\'t worry! You can top up your data plan anytime through our website or by visiting one of our stores. We also offer unlimited data plans for heavy users.'
  }
];

export default function FaqPreview() {
  const t = useTranslations();
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Got questions? We've got answers
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all"
            >
              {/* Question Button */}
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-heading font-bold text-lg text-gray-900 pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-dancheong-red transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-slide-down">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View All FAQs Button */}
        <div className="text-center">
          <Link
            href={`/${locale}/faq`}
            className="inline-flex items-center text-dancheong-red hover:text-red-700 font-bold transition-colors"
          >
            View All FAQs
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
