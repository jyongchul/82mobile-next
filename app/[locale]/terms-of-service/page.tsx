import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'termsOfService' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default function TermsOfServicePage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('termsOfService');

  const lastUpdated = '2026-01-28';

  return (
    <div className="min-h-screen bg-gradient-to-br from-seoul-morning via-white to-seoul-morning/20 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="font-heading text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-gray-600">
            {t('lastUpdated')}: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 prose prose-lg max-w-none">
          {/* Section 1: Acceptance */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. {t('section1Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('section1Content')}
            </p>
          </section>

          {/* Section 2: Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. {t('section2Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('section2Content')}
            </p>
          </section>

          {/* Section 3: Orders and Payment */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. {t('section3Title')}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>{t('section3Item1')}</li>
              <li>{t('section3Item2')}</li>
              <li>{t('section3Item3')}</li>
              <li>{t('section3Item4')}</li>
            </ul>
          </section>

          {/* Section 4: User Obligations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. {t('section4Title')}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>{t('section4Item1')}</li>
              <li>{t('section4Item2')}</li>
              <li>{t('section4Item3')}</li>
            </ul>
          </section>

          {/* Section 5: Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. {t('section5Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('section5Content')}
            </p>
          </section>

          {/* Section 6: Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. {t('section6Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('section6Content')}
            </p>
          </section>

          {/* Section 7: Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. {t('section7Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('section7Content')}
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">82Mobile</p>
              <p className="text-gray-700">Email: adamwoohaha@naver.com</p>
              <p className="text-gray-700">Phone: +82 10-6424-6530</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
