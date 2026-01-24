import { unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

export default function AboutPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[400px] bg-seoul-gradient">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="text-white">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              About 82Mobile
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl">
              Your trusted partner for seamless mobile connectivity in Korea
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Our Story */}
        <section className="mb-20">
          <h2 className="font-heading text-4xl font-bold text-gray-900 mb-8 text-center">
            Our Story
          </h2>
          <div className="max-w-3xl mx-auto text-lg text-gray-700 space-y-6 leading-relaxed">
            <p>
              Founded with a simple mission: to keep travelers connected throughout their Korean adventure.
              We understand the challenges international visitors face when arriving in a new country,
              and we're here to make mobile connectivity the easiest part of your journey.
            </p>
            <p>
              What started as a small service center in Myeongdong has grown into a trusted provider
              serving thousands of travelers every year. Our team is passionate about technology,
              customer service, and making Korea accessible to everyone.
            </p>
            <p>
              With physical stores in prime locations and 24/7 multilingual support,
              we're committed to being there whenever you need us.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-20">
          <h2 className="font-heading text-4xl font-bold text-gray-900 mb-12 text-center">
            Why Choose 82Mobile?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏪',
                title: 'Physical Store Locations',
                description: 'Visit our stores in Myeongdong and Hongdae for instant service and support'
              },
              {
                icon: '⚡',
                title: 'Instant Activation',
                description: 'Get connected immediately - eSIM QR codes delivered to your email in seconds'
              },
              {
                icon: '🌏',
                title: 'Multilingual Support',
                description: 'Customer service available in Korean, English, Chinese, and Japanese'
              },
              {
                icon: '📱',
                title: 'Latest Technology',
                description: 'High-speed 5G connectivity on Korea\'s most reliable networks (SK, KT, LG U+)'
              },
              {
                icon: '💳',
                title: 'Easy Payment',
                description: 'Accept all major international credit cards - Visa, Mastercard, UnionPay, JCB'
              },
              {
                icon: '🛡️',
                title: 'Trusted Service',
                description: 'Thousands of satisfied customers from around the world'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Store Locations */}
        <section className="mb-20">
          <h2 className="font-heading text-4xl font-bold text-gray-900 mb-12 text-center">
            Visit Our Stores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Myeongdong Store */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="relative h-64">
                <Image
                  src="/images/stores/myeongdong.jpg"
                  alt="Myeongdong Store"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3">
                  Myeongdong Store
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-dancheong-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    서울특별시 중구 명동길 74, KT Plaza
                  </p>
                  <p className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-dancheong-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    010-6424-6530
                  </p>
                  <p className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-dancheong-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    10:00 AM - 10:00 PM (Daily)
                  </p>
                </div>
              </div>
            </div>

            {/* Hongdae Store */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="relative h-64">
                <Image
                  src="/images/stores/hongdae.jpg"
                  alt="Hongdae Store"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3">
                  Hongdae Store
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-dancheong-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    서울특별시 마포구 양화로 160, Exit 7
                  </p>
                  <p className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-dancheong-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    010-6424-6530
                  </p>
                  <p className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-dancheong-red flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    10:00 AM - 10:00 PM (Daily)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-seoul-gradient rounded-2xl p-12 text-white">
            <h2 className="font-display text-4xl font-bold mb-4">
              Ready to Get Connected?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Browse our plans and get your Korea SIM card or eSIM today
            </p>
            <a
              href="/shop"
              className="inline-flex items-center px-8 py-4 bg-white text-dancheong-red font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              View All Products
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
