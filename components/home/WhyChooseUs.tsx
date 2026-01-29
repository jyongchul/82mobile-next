'use client';

import { useTranslations } from 'next-intl';

export default function WhyChooseUs() {
  const t = useTranslations();

  const features = [
    {
      icon: '🚀',
      title: t('whyChooseUs.fastActivationTitle'),
      description: t('whyChooseUs.fastActivationDesc'),
    },
    {
      icon: '💰',
      title: t('whyChooseUs.bestPricesTitle'),
      description: t('whyChooseUs.bestPricesDesc'),
    },
    {
      icon: '🛡️',
      title: t('whyChooseUs.reliableNetworkTitle'),
      description: t('whyChooseUs.reliableNetworkDesc'),
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('sections.whyChooseTitle')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('sections.whyChooseSubtitle')}
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
              <div className="text-6xl mb-6">{feature.icon}</div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
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
