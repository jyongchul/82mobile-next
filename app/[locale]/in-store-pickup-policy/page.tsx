'use client';

import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function InStorePickupPolicyPage() {
  const t = useTranslations('inStorePickupPolicy');

  const lastUpdated = '2026-01-31';

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
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. {t('section1Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">{t('section1Content')}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. {t('section2Title')}
            </h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>{t('section2Step1')}</li>
              <li>{t('section2Step2')}</li>
              <li>{t('section2Step3')}</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. {t('section3Title')}
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">82Mobile Store</p>
              <p className="text-gray-700">{t('section3Address')}</p>
              <p className="text-gray-700">{t('section3Hours')}</p>
            </div>
          </section>

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

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. {t('section5Title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">{t('section5Content')}</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">82Mobile</p>
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
