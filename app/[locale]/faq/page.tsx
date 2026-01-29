'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

export default function FaqPage() {
  const t = useTranslations('faq');
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: t('q1'), answer: t('a1') },
    { question: t('q2'), answer: t('a2') },
    { question: t('q3'), answer: t('a3') },
    { question: t('q4'), answer: t('a4') },
    { question: t('q5'), answer: t('a5') },
    { question: t('q6'), answer: t('a6') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-seoul-morning via-white to-seoul-morning/20 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('pageTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pageSubtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all"
            >
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

              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-slide-down">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">
            {t('stillHaveQuestions')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('contactUsText')}
          </p>
          <Link
            href={`/${locale}/#contact`}
            className="inline-flex items-center px-6 py-3 bg-dancheong-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            {t('contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
}
