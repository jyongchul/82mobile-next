import { unstable_setRequestLocale } from 'next-intl/server';

export default function ContactPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Reach out to us anytime for support, questions, or feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="font-heading text-3xl font-bold text-gray-900 mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-dancheong-red"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-dancheong-red"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-dancheong-red"
                  placeholder="+82 10-1234-5678"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-dancheong-red"
                >
                  <option>Product Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                  <option>Store Visit</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dancheong-red focus:border-dancheong-red resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-8 py-4 bg-dancheong-red hover:bg-red-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-6">
                Get In Touch
              </h2>
              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-dancheong-red" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">010-6424-6530</p>
                    <p className="text-sm text-gray-500">Available 10:00 AM - 10:00 PM KST</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-secondary-50 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-hanbok-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">adamwoohaha@naver.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                {/* KakaoTalk */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-900 mb-1">KakaoTalk</h3>
                    <a
                      href="https://pf.kakao.com/_KxmFcn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dancheong-red hover:underline"
                    >
                      Chat with us on KakaoTalk
                    </a>
                    <p className="text-sm text-gray-500">Instant messaging support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Locations */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="font-heading text-3xl font-bold text-gray-900 mb-6">
                Visit Our Stores
              </h2>
              <div className="space-y-6">
                {/* Myeongdong */}
                <div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
                    Myeongdong Store
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    서울특별시 중구 명동길 74, KT Plaza
                  </p>
                  <p className="text-gray-500 text-sm">
                    10:00 AM - 10:00 PM (Daily)
                  </p>
                </div>

                {/* Hongdae */}
                <div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 mb-2">
                    Hongdae Store
                  </h3>
                  <p className="text-gray-600 text-sm mb-1">
                    서울특별시 마포구 양화로 160, Exit 7
                  </p>
                  <p className="text-gray-500 text-sm">
                    10:00 AM - 10:00 PM (Daily)
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-dancheong-red to-red-700 rounded-2xl p-8 text-white">
              <h3 className="font-heading text-2xl font-bold mb-3">
                Quick Questions?
              </h3>
              <p className="mb-6">
                Check our FAQ page for instant answers to common questions.
              </p>
              <a
                href="/faq"
                className="inline-flex items-center px-6 py-3 bg-white text-dancheong-red font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                View FAQ
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
