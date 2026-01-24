'use client';

import { useState } from 'react';
import { unstable_setRequestLocale } from 'next-intl/server';

const faqs = [
  {
    category: 'eSIM & Physical SIM',
    questions: [
      {
        q: 'What is the difference between eSIM and Physical SIM?',
        a: 'eSIM is a digital SIM card that can be activated instantly via QR code - no physical card needed. Physical SIM requires a physical card to be inserted into your device. eSIM is more convenient for compatible devices, while Physical SIM works with all phones.'
      },
      {
        q: 'How do I know if my phone supports eSIM?',
        a: 'Most newer phones support eSIM including iPhone XS and later, Google Pixel 3 and later, Samsung Galaxy S20 and later. Check your phone settings under "Mobile Data" or "Cellular" - if you see an option to add an eSIM, your device is compatible.'
      },
      {
        q: 'Can I use both eSIM and Physical SIM at the same time?',
        a: 'Yes! Most dual-SIM phones can use one eSIM and one physical SIM simultaneously. This is perfect for keeping your home number active while using our Korean data plan.'
      }
    ]
  },
  {
    category: 'Activation & Setup',
    questions: [
      {
        q: 'When should I activate my SIM card?',
        a: 'For eSIM: Activate anytime before your trip. For Physical SIM: Activate upon arrival in Korea. Both start counting validity from the moment of activation, not purchase.'
      },
      {
        q: 'How do I activate my eSIM?',
        a: 'After purchase, you\'ll receive a QR code via email. Simply scan it with your phone\'s camera, follow the on-screen prompts, and your eSIM will be activated within minutes.'
      },
      {
        q: 'What if I have trouble activating?',
        a: 'Contact our 24/7 support team via phone (010-6424-6530), email, or KakaoTalk. We also have physical stores in Myeongdong and Hongdae for in-person assistance.'
      }
    ]
  },
  {
    category: 'Data & Coverage',
    questions: [
      {
        q: 'Which network do you use?',
        a: 'We use Korea\'s top-tier networks: SK Telecom, KT, and LG U+. All offer excellent 4G LTE and 5G coverage throughout Korea.'
      },
      {
        q: 'What happens if I run out of data?',
        a: 'For limited plans, data will stop when you reach your limit. For unlimited plans, there is no data cap. You can always purchase additional data or upgrade your plan through our website or stores.'
      },
      {
        q: 'Can I use my SIM card outside of Korea?',
        a: 'Our SIM cards are designed for use in Korea only. They will not work in other countries.'
      },
      {
        q: 'Do I get 5G speeds?',
        a: 'Yes! If your device supports 5G and you\'re in a 5G coverage area, you\'ll automatically get 5G speeds at no extra cost.'
      }
    ]
  },
  {
    category: 'Payment & Pricing',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major international credit cards (Visa, Mastercard, UnionPay, JCB, AMEX) via Eximbay payment gateway. We also accept Kakao Pay and Naver Pay.'
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No hidden fees! The price you see is the price you pay. Tax is included in all our prices.'
      },
      {
        q: 'Can I get a refund?',
        a: 'For eSIM: Refunds available before activation. For Physical SIM: Refunds available if unopened. Contact us within 7 days of purchase for refund requests.'
      }
    ]
  },
  {
    category: 'Delivery & Pickup',
    questions: [
      {
        q: 'How do I receive my eSIM?',
        a: 'eSIM QR codes are delivered instantly to your email after purchase. Check your spam folder if you don\'t see it within 5 minutes.'
      },
      {
        q: 'Can I pick up a Physical SIM at the airport?',
        a: 'Currently, we offer pickup at our Myeongdong and Hongdae stores. Airport pickup is coming soon! For now, we recommend eSIM for instant activation.'
      },
      {
        q: 'Do you offer shipping?',
        a: 'For international orders, we primarily offer eSIM (instant delivery). For Physical SIM, please visit our stores or contact us for shipping options.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        q: 'My data is not working. What should I do?',
        a: '1) Make sure you\'ve activated the SIM/eSIM. 2) Enable "Data Roaming" in your phone settings. 3) Restart your phone. 4) Check APN settings (usually automatic). If still not working, contact our support team.'
      },
      {
        q: 'Can I make phone calls?',
        a: 'Our data-only SIM cards are for internet use only. However, you can make calls using apps like WhatsApp, KakaoTalk, or FaceTime over data connection.'
      },
      {
        q: 'Can I use my SIM card in a tablet or mobile hotspot?',
        a: 'Yes! Our SIM cards work in any unlocked device including tablets, mobile hotspots, and portable Wi-Fi routers.'
      }
    ]
  }
];

export default function FaqPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our SIM cards and eSIM plans
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full px-6 py-4 pl-14 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-dancheong-red focus:border-dancheong-red text-lg"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-dancheong-red to-red-700 px-6 py-4">
                <h2 className="font-heading text-2xl font-bold text-white">
                  {category.category}
                </h2>
              </div>

              {/* Questions */}
              <div className="divide-y divide-gray-200">
                {category.questions.map((faq, index) => {
                  const itemId = `${categoryIndex}-${index}`;
                  const isOpen = openItems.includes(itemId);

                  return (
                    <div key={index}>
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-heading font-bold text-lg text-gray-900 pr-8">
                            {faq.q}
                          </h3>
                          <svg
                            className={`w-6 h-6 text-dancheong-red flex-shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 animate-slide-down">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions? */}
        <div className="mt-12 bg-seoul-gradient rounded-2xl p-8 text-center text-white">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl mb-6">
            Our support team is here to help 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-dancheong-red font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="https://pf.kakao.com/_KxmFcn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
            >
              <span className="mr-2">💬</span>
              Chat on KakaoTalk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
