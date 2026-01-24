'use client';

import { useTranslations } from 'next-intl';

/**
 * Why Choose Us Section - Highlights key selling points
 *
 * TODO: Define the 3 core value propositions that differentiate 82Mobile
 * from competitors. Consider:
 * - What problems do tourists face with mobile connectivity?
 * - What makes 82Mobile's solution better?
 * - What do customers value most? (price, convenience, reliability, support?)
 */

interface Feature {
  icon: string;  // Emoji or icon identifier
  title: string;
  description: string;
}

export default function WhyChooseUs() {
  const t = useTranslations();

  // TODO: Replace with your actual value propositions
  // Example features - you should customize these based on your business strengths
  const features: Feature[] = [
    {
      icon: '🚀',
      title: 'Fast Activation',
      description: 'Get connected within minutes of landing in Korea. No waiting, no hassle.'
    },
    {
      icon: '💰',
      title: 'Best Prices',
      description: 'Competitive rates with flexible plans. Pay only for what you need.'
    },
    {
      icon: '🛡️',
      title: 'Reliable Network',
      description: 'Premium LTE/5G coverage on Korea\'s best networks (SK Telecom, KT, LG U+).'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose 82Mobile?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The smart choice for staying connected during your Korean adventure
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="text-6xl mb-6">{feature.icon}</div>

              {/* Title */}
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
