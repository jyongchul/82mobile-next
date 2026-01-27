import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'refundPolicy' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function RefundPolicyPage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'refundPolicy' });

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
          {/* Section 1: General Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. {t('section1Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('section1Content')}
            </p>
          </section>

          {/* Section 2: Refund Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. {t('section2Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t('section2Intro')}
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('section2EligibleTitle')}
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>{t('section2Eligible1')}</li>
              <li>{t('section2Eligible2')}</li>
              <li>{t('section2Eligible3')}</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('section2NotEligibleTitle')}
            </h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>{t('section2NotEligible1')}</li>
              <li>{t('section2NotEligible2')}</li>
              <li>{t('section2NotEligible3')}</li>
            </ul>
          </section>

          {/* Section 3: Refund Process */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. {t('section3Title')}
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>{t('section3Step1')}</li>
              <li>{t('section3Step2')}</li>
              <li>{t('section3Step3')}</li>
              <li>{t('section3Step4')}</li>
            </ol>
          </section>

          {/* Section 4: Refund Timeline */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. {t('section4Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('section4Content')}
            </p>
          </section>

          {/* Section 5: Partial Refunds */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. {t('section5Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('section5Content')}
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. {t('section6Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('section6Content')}
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">82Mobile Customer Support</p>
              <p className="text-gray-700">Email: adamwoohaha@naver.com</p>
              <p className="text-gray-700">Phone: +82 10-6424-6530</p>
              <p className="text-gray-700">KakaoTalk: http://pf.kakao.com/_GXxjPxj</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
